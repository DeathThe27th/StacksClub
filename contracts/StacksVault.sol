// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {SafeERC20, IERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract StacksVault is ReentrancyGuard, Pausable, AccessControl {
    using SafeERC20 for IERC20;
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    struct Balance { address asset; uint256 rawAmount; }
    mapping(address => bool) public allowedAsset;
    mapping(uint256 => Balance[]) private positionBalances;
    mapping(uint256 => bool) public accountedPosition;
    error AssetNotAllowed(address asset); error InvalidAmount(); error PositionAlreadyAccounted(); error InsufficientPositionBalance();
    event PositionDeposited(uint256 indexed positionId, address indexed owner, address[] assets, uint256[] amounts);
    event PositionRedeemed(uint256 indexed positionId, address indexed recipient, address[] assets, uint256[] amounts);

    constructor(address admin) { _grantRole(DEFAULT_ADMIN_ROLE, admin); }
    function setAssetPermission(address asset, bool allowed) external onlyRole(DEFAULT_ADMIN_ROLE) { allowedAsset[asset] = allowed; }
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) { _pause(); }
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) { _unpause(); }

    function depositPosition(uint256 positionId, address owner, address[] calldata assets, uint256[] calldata amounts) external onlyRole(OPERATOR_ROLE) whenNotPaused nonReentrant {
        if (accountedPosition[positionId] || assets.length != amounts.length || assets.length == 0) revert PositionAlreadyAccounted();
        for (uint256 i; i < assets.length; i++) { if (!allowedAsset[assets[i]]) revert AssetNotAllowed(assets[i]); if (amounts[i] == 0) revert InvalidAmount(); IERC20(assets[i]).safeTransferFrom(msg.sender, address(this), amounts[i]); positionBalances[positionId].push(Balance(assets[i], amounts[i])); }
        accountedPosition[positionId] = true;
        emit PositionDeposited(positionId, owner, assets, amounts);
    }

    function redeem(uint256 positionId, address recipient, uint256[] calldata amounts) external onlyRole(OPERATOR_ROLE) whenNotPaused nonReentrant {
        Balance[] storage balances = positionBalances[positionId];
        if (balances.length != amounts.length) revert InsufficientPositionBalance();
        address[] memory assets = new address[](balances.length);
        for (uint256 i; i < balances.length; i++) { if (amounts[i] > balances[i].rawAmount) revert InsufficientPositionBalance(); balances[i].rawAmount -= amounts[i]; assets[i] = balances[i].asset; if (amounts[i] > 0) IERC20(balances[i].asset).safeTransfer(recipient, amounts[i]); }
        emit PositionRedeemed(positionId, recipient, assets, amounts);
    }

    function getPositionBalances(uint256 positionId) external view returns (Balance[] memory) { return positionBalances[positionId]; }
}
