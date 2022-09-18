// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

/*

Smols.sol

Written by: mousedev.eth

*/

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/ITransferBlocker.sol";
import "./interfaces/ISmolsRenderer.sol";
import "./libraries/SmolsLibrary.sol";
import "hardhat/console.sol";
contract Smols is ERC721, Ownable {
    mapping(address => bool) public privilegedMinters;

    address transferBlocker;
    address smolsRendererAddress;
    uint256 public totalSupply;

    constructor() ERC721("Smols", "SMOLS") {}

    function setSmolsRendererAddress(address _smolsRendererAddress)
        public
        onlyOwner
    {
        smolsRendererAddress = _smolsRendererAddress;
    }
    
    function setTransferBlockerAddress(address _transferBlocker) public onlyOwner {
        transferBlocker = _transferBlocker;
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
        require(msg.sender == owner() || privilegedMinters[msg.sender], "Not a privileged minter!");
        _mint(_to, _tokenId);
        totalSupply++;
    }


    function _beforeTokenTransfer(
        address from,
        address,
        uint256 tokenId
    ) internal virtual override {
        //This means its being minted.
        if(from == address(0)) return;
        if(transferBlocker == address(0)) return;

        require(
            ITransferBlocker(transferBlocker).isTransferrable(
                address(this),
                tokenId
            ),
            "Token Not Currently Transferrable"
        );
    }
}
