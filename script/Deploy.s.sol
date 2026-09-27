// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {StacksClubVault} from "../contracts/StacksClubVault.sol";

interface Vm {
    function envAddress(string calldata name) external returns (address value);
    function chainId() external view returns (uint256);
    function startBroadcast(address signer) external;
    function stopBroadcast() external;
}

contract Deploy {
    Vm private constant vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));

    event DeploymentPlan(address indexed owner, address indexed treasury, uint256 indexed chainId);

    function run() external returns (StacksClubVault vault) {
        if (vm.chainId() != 56) revert("BSC mainnet chain ID 56 required");
        address owner = vm.envAddress("DEPLOYER_ADDRESS");
        address treasury = vm.envAddress("STACKSCLUB_TREASURY_ADDRESS");
        if (owner == address(0) || treasury == address(0)) revert("deployer and treasury addresses required");
        emit DeploymentPlan(owner, treasury, vm.chainId());
        vm.startBroadcast(owner);
        vault = new StacksClubVault(owner, treasury);
        vm.stopBroadcast();
    }
}
