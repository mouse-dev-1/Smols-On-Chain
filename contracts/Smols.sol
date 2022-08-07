// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

/*

Smols.sol

Written by: mousedev.eth

*/

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/ISmolsRenderer.sol";
import "./libraries/SmolsLibrary.sol";

contract Smols is ERC721, Ownable {
    address smolsRendererAddress;

    constructor() ERC721("Smol", "SMOL") {}

    function setSmolsRendererAddress(address _smolsRendererAddress)
        public
        onlyOwner
    {
        smolsRendererAddress = _smolsRendererAddress;
    }

    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        return ISmolsRenderer(smolsRendererAddress).tokenURI(tokenId);
    }

    function mint(uint256 _tokenId) public {
        _mint(msg.sender, _tokenId);
    }
}
