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
    mapping(address => bool) public privilegedMinters;

    address smolsRendererAddress;
    uint256 public totalSupply;

    constructor() ERC721("Smols", "SMOLS") {}

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

    function setPrivilegedMinter(address _minter, bool _privileged)
        public
        onlyOwner
    {
        privilegedMinters[_minter] = _privileged;
    }

    function privilegedMint(address _to, uint256 _tokenId) public {
        require(privilegedMinters[msg.sender], "Not a privileged minter!");
        _mint(_to, _tokenId);
        totalSupply++;
    }
}
