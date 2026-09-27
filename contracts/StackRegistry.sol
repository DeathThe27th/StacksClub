// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract StackRegistry is Ownable {
    uint16 public constant BPS = 10_000;
    struct Component { address asset; uint16 weightBps; bytes32 provider; }
    struct Stack { address creator; string slug; string name; string ticker; string description; string imageUri; bytes32 recipeHash; }

    mapping(address => bool) public allowedAsset;
    mapping(uint256 => Stack) public stacks;
    mapping(uint256 => Component[]) private components;
    uint256 public nextStackId = 1;

    error InvalidComponentCount(); error InvalidWeights(); error AssetNotAllowed(address asset); error EmptyName();
    event AssetPermissionSet(address indexed asset, bool allowed);
    event StackCreated(uint256 indexed stackId, address indexed creator, bytes32 indexed recipeHash);

    constructor(address initialOwner) Ownable(initialOwner) {}

    function setAssetPermission(address asset, bool allowed) external onlyOwner { allowedAsset[asset] = allowed; emit AssetPermissionSet(asset, allowed); }

    function createStack(string calldata slug, string calldata name, string calldata ticker, string calldata description, string calldata imageUri, Component[] calldata recipe) external returns (uint256 stackId) {
        if (bytes(name).length == 0) revert EmptyName();
        if (recipe.length < 2 || recipe.length > 5) revert InvalidComponentCount();
        uint256 total;
        bytes32 recipeHash = keccak256(abi.encode(recipe));
        for (uint256 i; i < recipe.length; i++) {
            if (!allowedAsset[recipe[i].asset]) revert AssetNotAllowed(recipe[i].asset);
            if (recipe[i].weightBps == 0) revert InvalidWeights();
            total += recipe[i].weightBps;
        }
        if (total != BPS) revert InvalidWeights();
        stackId = nextStackId++;
        stacks[stackId] = Stack(msg.sender, slug, name, ticker, description, imageUri, recipeHash);
        for (uint256 i; i < recipe.length; i++) components[stackId].push(recipe[i]);
        emit StackCreated(stackId, msg.sender, recipeHash);
    }

    function getComponents(uint256 stackId) external view returns (Component[] memory) { return components[stackId]; }
}
