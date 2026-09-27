// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {StackRegistry} from "../contracts/StackRegistry.sol";
import {StackPosition} from "../contracts/StackPosition.sol";
import {StacksVault} from "../contracts/StacksVault.sol";

contract Deploy is Script {
    function run() external returns (StackRegistry registry, StackPosition position, StacksVault vault) {
        address deployer = vm.envAddress("DEPLOYER_ADDRESS");
        vm.startBroadcast();
        registry = new StackRegistry(deployer);
        position = new StackPosition(deployer);
        vault = new StacksVault(deployer);
        vm.stopBroadcast();
    }
}
