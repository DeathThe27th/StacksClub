// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

contract StackPosition is ERC721, AccessControl {
    bytes32 public constant VAULT_ROLE = keccak256("VAULT_ROLE");
    uint256 public nextTokenId = 1;
    error TransfersDisabled();

    constructor(address admin) ERC721("StacksClub Position", "SCP") { _grantRole(DEFAULT_ADMIN_ROLE, admin); }
    function mint(address to) external onlyRole(VAULT_ROLE) returns (uint256 tokenId) { tokenId = nextTokenId++; _safeMint(to, tokenId); }
    function burn(uint256 tokenId) external onlyRole(VAULT_ROLE) { _burn(tokenId); }
    function transferFrom(address, address, uint256) public pure override { revert TransfersDisabled(); }
    function safeTransferFrom(address, address, uint256) public pure override { revert TransfersDisabled(); }
    function safeTransferFrom(address, address, uint256, bytes memory) public pure override { revert TransfersDisabled(); }
}
