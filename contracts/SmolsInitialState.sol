// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

/*

SmolsInitialState.sol

Written by: mousedev.eth

*/

import "@openzeppelin/contracts/access/Ownable.sol";
import "./libraries/SmolsLibrary.sol";

contract SmolsInitialState is Ownable {
    mapping(address => bool) public allowedSetters;
    mapping(uint256 => Smol) internal smolToTraits;

    function getSmol(uint256 _tokenId) public view returns (Smol memory) {
        return smolToTraits[_tokenId];
    }

    function setSmol(uint256 _tokenId, Smol memory _smol) public {
        require(
            allowedSetters[msg.sender] || msg.sender == owner(),
            "Not an allowed setter!"
        );
        smolToTraits[_tokenId] = _smol;
    }

    function setSmols(uint256[] memory _tokenIds, Smol[] memory _smols) public {
        require(
            allowedSetters[msg.sender] || msg.sender == owner(),
            "Not an allowed setter!"
        );

        for (uint256 i = 0; i < _tokenIds.length; i++) {
            smolToTraits[_tokenIds[i]] = _smols[i];
        }
    }

    function setAllowedSetter(address _setter, bool _allowed) public onlyOwner {
        allowedSetters[_setter] = _allowed;
    }
}
