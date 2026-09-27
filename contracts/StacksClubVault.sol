// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/// @notice Immutable Stack recipes and non-transferable, individually accounted positions.
/// @dev Trade routing stays in the user's wallet. This contract only collects disclosed fees
///      and holds exact token quantities deposited by the position owner.
contract StacksClubVault is ERC721, Ownable, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    uint16 public constant BPS = 10_000;
    uint16 public constant FEE_BPS = 100;
    uint16 public constant CREATOR_FEE_SHARE_BPS = 2_500;
    uint8 public constant MIN_COMPONENTS = 2;
    uint8 public constant MAX_COMPONENTS = 5;

    struct Component {
        address asset;
        uint16 weightBps;
    }

    struct StackData {
        address creator;
        string metadataURI;
        bytes32 slugHash;
    }

    address public treasury;
    uint256 public nextStackId = 1;
    uint256 public nextPositionId = 1;

    mapping(address asset => bool) public allowedAsset;
    mapping(address token => bool) public allowedSettlementToken;
    mapping(uint256 stackId => StackData) private stackData;
    mapping(uint256 stackId => Component[]) private stackComponents;
    mapping(bytes32 slugHash => bool) public slugTaken;
    mapping(uint256 positionId => uint256 stackId) public positionStack;
    mapping(uint256 positionId => mapping(address asset => uint256 amount)) public positionBalance;
    mapping(address asset => uint256 amount) public totalLiability;
    mapping(address account => uint256[]) private ownedPositions;
    mapping(uint256 positionId => uint256 index) private ownedPositionIndex;

    error ZeroAddress();
    error EmptyMetadata();
    error InvalidComponentCount();
    error InvalidWeights();
    error DuplicateAsset(address asset);
    error AssetNotAllowed(address asset);
    error SettlementTokenNotAllowed(address token);
    error InvalidAmount();
    error WrongValue();
    error InvalidShareBps();
    error NotPositionOwner();
    error InvalidPosition();
    error TransferDisabled();
    error FeeTooSmall();
    error UnsupportedTransferBehavior(address token);

    event TreasuryUpdated(address indexed previousTreasury, address indexed newTreasury);
    event AssetPermissionSet(address indexed asset, bool allowed);
    event SettlementTokenPermissionSet(address indexed token, bool allowed);
    event StackCreated(uint256 indexed stackId, address indexed creator, bytes32 indexed slugHash, string metadataURI);
    event BuyFeeCollected(uint256 indexed stackId, address indexed payer, address indexed token, uint256 grossAmount, uint256 feeAmount, uint256 creatorAmount);
    event SellFeeCollected(address indexed payer, address indexed token, uint256 grossAmount, uint256 feeAmount);
    event PositionDeposited(uint256 indexed positionId, uint256 indexed stackId, address indexed owner, address[] assets, uint256[] amounts);
    event PositionRedeemed(uint256 indexed positionId, address indexed owner, address indexed recipient, uint16 sharesBps, address[] assets, uint256[] amounts);

    constructor(address initialOwner, address initialTreasury)
        ERC721("StacksClub Position", "SCP")
        Ownable(initialOwner)
    {
        if (initialOwner == address(0) || initialTreasury == address(0)) revert ZeroAddress();
        treasury = initialTreasury;
    }

    function setTreasury(address newTreasury) external onlyOwner {
        if (newTreasury == address(0)) revert ZeroAddress();
        emit TreasuryUpdated(treasury, newTreasury);
        treasury = newTreasury;
    }

    function setAssetPermission(address asset, bool allowed) external onlyOwner {
        if (asset == address(0)) revert ZeroAddress();
        allowedAsset[asset] = allowed;
        emit AssetPermissionSet(asset, allowed);
    }

    function setSettlementTokenPermission(address token, bool allowed) external onlyOwner {
        if (token == address(0)) revert ZeroAddress();
        allowedSettlementToken[token] = allowed;
        emit SettlementTokenPermissionSet(token, allowed);
    }

    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }

    function createStack(
        string calldata slug,
        string calldata metadataURI,
        address[] calldata assets,
        uint16[] calldata weightsBps
    ) external whenNotPaused returns (uint256 stackId) {
        uint256 count = assets.length;
        if (count < MIN_COMPONENTS || count > MAX_COMPONENTS || weightsBps.length != count) revert InvalidComponentCount();
        if (bytes(slug).length == 0 || bytes(metadataURI).length == 0) revert EmptyMetadata();
        bytes32 slugHash = keccak256(bytes(slug));
        if (slugTaken[slugHash]) revert EmptyMetadata();

        uint256 totalWeight;
        for (uint256 i; i < count; ++i) {
            address asset = assets[i];
            if (!allowedAsset[asset]) revert AssetNotAllowed(asset);
            if (weightsBps[i] == 0) revert InvalidWeights();
            totalWeight += weightsBps[i];
            for (uint256 j; j < i; ++j) if (assets[j] == asset) revert DuplicateAsset(asset);
        }
        if (totalWeight != BPS) revert InvalidWeights();

        stackId = nextStackId++;
        slugTaken[slugHash] = true;
        stackData[stackId] = StackData(msg.sender, metadataURI, slugHash);
        for (uint256 i; i < count; ++i) stackComponents[stackId].push(Component(assets[i], weightsBps[i]));
        emit StackCreated(stackId, msg.sender, slugHash, metadataURI);
    }

    /// @notice Collect 1% of a gross ERC-20 purchase amount; Stack fees split 25/75.
    function collectBuyFee(uint256 stackId, address token, uint256 grossAmount)
        external
        whenNotPaused
        nonReentrant
        returns (uint256 feeAmount)
    {
        if (!allowedSettlementToken[token]) revert SettlementTokenNotAllowed(token);
        feeAmount = _fee(grossAmount);
        address creator;
        if (stackId != 0) {
            creator = stackData[stackId].creator;
            if (creator == address(0)) revert InvalidPosition();
        }
        _collectTokenFee(token, feeAmount, creator, stackId, grossAmount, false);
    }

    /// @notice Native BNB fee variant. `msg.value` must equal exactly 1% of gross input.
    function collectNativeBuyFee(uint256 stackId, uint256 grossAmount)
        external
        payable
        whenNotPaused
        nonReentrant
        returns (uint256 feeAmount)
    {
        feeAmount = _fee(grossAmount);
        if (msg.value != feeAmount) revert WrongValue();
        address creator;
        if (stackId != 0) {
            creator = stackData[stackId].creator;
            if (creator == address(0)) revert InvalidPosition();
        }
        uint256 creatorAmount = stackId == 0 ? 0 : feeAmount * CREATOR_FEE_SHARE_BPS / BPS;
        _payNative(treasury, feeAmount - creatorAmount);
        if (creatorAmount > 0) _payNative(creator, creatorAmount);
        emit BuyFeeCollected(stackId, msg.sender, address(0), grossAmount, feeAmount, creatorAmount);
    }

    function collectSellFee(address token, uint256 grossAmount)
        external
        nonReentrant
        returns (uint256 feeAmount)
    {
        if (!allowedSettlementToken[token]) revert SettlementTokenNotAllowed(token);
        feeAmount = _fee(grossAmount);
        IERC20(token).safeTransferFrom(msg.sender, treasury, feeAmount);
        emit SellFeeCollected(msg.sender, token, grossAmount, feeAmount);
    }

    function collectNativeSellFee(uint256 grossAmount) external payable nonReentrant returns (uint256 feeAmount) {
        feeAmount = _fee(grossAmount);
        if (msg.value != feeAmount) revert WrongValue();
        _payNative(treasury, feeAmount);
        emit SellFeeCollected(msg.sender, address(0), grossAmount, feeAmount);
    }

    function depositPosition(uint256 stackId, uint256[] calldata amounts)
        external
        whenNotPaused
        nonReentrant
        returns (uint256 positionId)
    {
        Component[] storage recipe = stackComponents[stackId];
        uint256 count = recipe.length;
        if (count < MIN_COMPONENTS || amounts.length != count) revert InvalidComponentCount();

        address[] memory assets = new address[](count);
        uint256[] memory received = new uint256[](count);
        positionId = nextPositionId++;
        positionStack[positionId] = stackId;

        for (uint256 i; i < count; ++i) {
            address asset = recipe[i].asset;
            uint256 amount = amounts[i];
            if (!allowedAsset[asset]) revert AssetNotAllowed(asset);
            if (amount == 0) revert InvalidAmount();
            uint256 beforeBalance = IERC20(asset).balanceOf(address(this));
            IERC20(asset).safeTransferFrom(msg.sender, address(this), amount);
            uint256 actualReceived = IERC20(asset).balanceOf(address(this)) - beforeBalance;
            if (actualReceived != amount) revert UnsupportedTransferBehavior(asset);
            positionBalance[positionId][asset] = amount;
            totalLiability[asset] += amount;
            assets[i] = asset;
            received[i] = amount;
        }

        _recordPosition(msg.sender, positionId);
        _safeMint(msg.sender, positionId);
        emit PositionDeposited(positionId, stackId, msg.sender, assets, received);
    }

    /// @notice Withdraw a proportional slice; full redemption sweeps exact remaining dust.
    function redeem(uint256 positionId, uint16 sharesBps, address recipient)
        external
        nonReentrant
        returns (address[] memory assets, uint256[] memory amounts)
    {
        if (ownerOf(positionId) != msg.sender) revert NotPositionOwner();
        if (recipient != msg.sender || recipient == address(0)) revert NotPositionOwner();
        if (sharesBps == 0 || sharesBps > BPS) revert InvalidShareBps();

        Component[] storage recipe = stackComponents[positionStack[positionId]];
        uint256 count = recipe.length;
        assets = new address[](count);
        amounts = new uint256[](count);
        bool empty = true;

        // Update all liabilities before calling any external token contract.
        for (uint256 i; i < count; ++i) {
            address asset = recipe[i].asset;
            uint256 balance = positionBalance[positionId][asset];
            uint256 amount = sharesBps == BPS ? balance : balance * sharesBps / BPS;
            positionBalance[positionId][asset] = balance - amount;
            totalLiability[asset] -= amount;
            assets[i] = asset;
            amounts[i] = amount;
            if (balance - amount != 0) empty = false;
        }

        for (uint256 i; i < count; ++i) if (amounts[i] > 0) IERC20(assets[i]).safeTransfer(recipient, amounts[i]);
        if (empty) {
            _forgetPosition(msg.sender, positionId);
            _burn(positionId);
            delete positionStack[positionId];
        }
        emit PositionRedeemed(positionId, msg.sender, recipient, sharesBps, assets, amounts);
    }

    function getStack(uint256 stackId) external view returns (StackData memory data, Component[] memory components) {
        data = stackData[stackId];
        components = stackComponents[stackId];
    }

    function positionSummary(uint256 positionId)
        external
        view
        returns (address positionOwner, uint256 stackId, address[] memory assets, uint256[] memory amounts)
    {
        positionOwner = ownerOf(positionId);
        stackId = positionStack[positionId];
        Component[] storage recipe = stackComponents[stackId];
        assets = new address[](recipe.length);
        amounts = new uint256[](recipe.length);
        for (uint256 i; i < recipe.length; ++i) {
            assets[i] = recipe[i].asset;
            amounts[i] = positionBalance[positionId][recipe[i].asset];
        }
    }

    function positionsOf(address account) external view returns (uint256[] memory) {
        return ownedPositions[account];
    }

    function _recordPosition(address account, uint256 positionId) private {
        ownedPositionIndex[positionId] = ownedPositions[account].length;
        ownedPositions[account].push(positionId);
    }

    function _forgetPosition(address account, uint256 positionId) private {
        uint256 index = ownedPositionIndex[positionId];
        uint256 lastIndex = ownedPositions[account].length - 1;
        if (index != lastIndex) {
            uint256 lastId = ownedPositions[account][lastIndex];
            ownedPositions[account][index] = lastId;
            ownedPositionIndex[lastId] = index;
        }
        ownedPositions[account].pop();
        delete ownedPositionIndex[positionId];
    }

    function _collectTokenFee(address token, uint256 feeAmount, address creator, uint256 stackId, uint256 grossAmount, bool sell) private {
        uint256 creatorAmount = creator == address(0) || sell ? 0 : feeAmount * CREATOR_FEE_SHARE_BPS / BPS;
        IERC20(token).safeTransferFrom(msg.sender, treasury, feeAmount - creatorAmount);
        if (creatorAmount > 0) IERC20(token).safeTransferFrom(msg.sender, creator, creatorAmount);
        if (sell) emit SellFeeCollected(msg.sender, token, grossAmount, feeAmount);
        else emit BuyFeeCollected(stackId, msg.sender, token, grossAmount, feeAmount, creatorAmount);
    }

    function _fee(uint256 grossAmount) private pure returns (uint256 feeAmount) {
        if (grossAmount == 0) revert InvalidAmount();
        feeAmount = grossAmount * FEE_BPS / BPS;
        if (feeAmount == 0) revert FeeTooSmall();
    }

    function _payNative(address recipient, uint256 amount) private {
        (bool success,) = payable(recipient).call{value: amount}("");
        if (!success) revert WrongValue();
    }

    function _update(address to, uint256 tokenId, address auth)
        internal
        override
        returns (address from)
    {
        from = super._update(to, tokenId, auth);
        if (from != address(0) && to != address(0)) revert TransferDisabled();
    }
}
