// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {StacksClubVault} from "../contracts/StacksClubVault.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface Vm {
    function prank(address sender) external;
    function expectRevert(bytes calldata revertData) external;
}

contract MockToken is IERC20 {
    mapping(address => uint256) public override balanceOf;
    mapping(address => mapping(address => uint256)) public override allowance;
    uint256 public override totalSupply;

    function mint(address to, uint256 amount) external {
        totalSupply += amount;
        balanceOf[to] += amount;
    }

    function approve(address spender, uint256 amount) external override returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transfer(address to, uint256 amount) external override returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external override returns (bool) {
        uint256 approved = allowance[from][msg.sender];
        require(approved >= amount, "allowance");
        allowance[from][msg.sender] = approved - amount;
        _transfer(from, to, amount);
        return true;
    }

    function _transfer(address from, address to, uint256 amount) private {
        require(balanceOf[from] >= amount, "balance");
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        emit Transfer(from, to, amount);
    }
}

contract StacksClubVaultTest {
    Vm private constant vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));
    address private constant TREASURY = address(0xFEE);
    address private constant CREATOR = address(0xCAFE);
    address private constant USER = address(0xBEEF);

    StacksClubVault private vault;
    MockToken private assetA;
    MockToken private assetB;

    function setUp() public {
        vault = new StacksClubVault(address(this), TREASURY);
        assetA = new MockToken();
        assetB = new MockToken();
        vault.setAssetPermission(address(assetA), true);
        vault.setAssetPermission(address(assetB), true);
    }

    function testPositionAccountingAndFullRedemptionSweepDust() public {
        uint256 stackId = _createStack([uint16(5000), uint16(5000)]);
        assetA.mint(USER, 1001);
        assetB.mint(USER, 2003);
        vm.prank(USER);
        assetA.approve(address(vault), 1001);
        vm.prank(USER);
        assetB.approve(address(vault), 2003);

        uint256[] memory amounts = new uint256[](2);
        amounts[0] = 1001;
        amounts[1] = 2003;
        vm.prank(USER);
        uint256 positionId = vault.depositPosition(stackId, amounts);

        require(assetA.balanceOf(address(vault)) >= vault.totalLiability(address(assetA)), "asset A liability exceeded");
        require(assetB.balanceOf(address(vault)) >= vault.totalLiability(address(assetB)), "asset B liability exceeded");

        vm.prank(USER);
        vault.redeem(positionId, 3333, USER);
        require(assetA.balanceOf(USER) == 333, "partial A must round down");
        require(assetB.balanceOf(USER) == 667, "partial B must round down");

        vm.prank(USER);
        vault.redeem(positionId, 10_000, USER);
        require(assetA.balanceOf(address(vault)) == 0, "A dust must be swept");
        require(assetB.balanceOf(address(vault)) == 0, "B dust must be swept");
        require(vault.totalLiability(address(assetA)) == 0, "A liability remains");
        require(vault.totalLiability(address(assetB)) == 0, "B liability remains");
        require(vault.positionsOf(USER).length == 0, "redeemed position remains indexed");
    }

    function testStackWeightsMustTotalTenThousand() public {
        address[] memory assets = new address[](2);
        assets[0] = address(assetA);
        assets[1] = address(assetB);
        uint16[] memory weights = new uint16[](2);
        weights[0] = 5000;
        weights[1] = 4999;
        vm.expectRevert(abi.encodeWithSelector(StacksClubVault.InvalidWeights.selector));
        vault.createStack("invalid", "ipfs://metadata", assets, weights);
    }

    function _createStack(uint16[2] memory weightPair) private returns (uint256) {
        address[] memory assets = new address[](2);
        assets[0] = address(assetA);
        assets[1] = address(assetB);
        uint16[] memory weights = new uint16[](2);
        weights[0] = weightPair[0];
        weights[1] = weightPair[1];
        vm.prank(CREATOR);
        return vault.createStack("first-stack", "ipfs://metadata", assets, weights);
    }
}
