// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

/*

OldSmols.sol

Written by: mousedev.eth

*/

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract OldSmols is ERC721, Ownable {
    uint256 public totalSupply;

    constructor() ERC721("OldSmols", "OSMOL") {}

    function mint(uint256 _tokenId) public {
        _mint(msg.sender, _tokenId);
        totalSupply++;
    }

    function mintQuantity(uint256 _quantity) public {
        for (uint256 i = 0; i < _quantity; i++) {
            _mint(msg.sender, totalSupply);
            totalSupply++;
        }
    }
}
