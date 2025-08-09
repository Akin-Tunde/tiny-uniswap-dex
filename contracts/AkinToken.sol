// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// A simple ERC20 token for our DEX
contract AkinToken is ERC20, Ownable {
    constructor() ERC20("Akin Token", "AKT") Ownable(msg.sender) {}

    // Only the contract owner can create new tokens
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}