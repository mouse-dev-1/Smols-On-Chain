// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

/*

SmolsTraitStorage.sol

Written by: mousedev.eth

*/

import "@openzeppelin/contracts/access/Ownable.sol";
import "./libraries/SmolsLibrary.sol";

contract SmolsTraitStorage is Ownable {
    mapping(uint256 => mapping(uint256 => Trait)) public traits;

    function setTrait(
        uint256 _traitId,
        uint256 _dependencyLevel,
        Trait memory _trait
    ) public onlyOwner {
        traits[_traitId][_dependencyLevel] = _trait;
    }

    function setTraits(
        uint256[] memory _traitIds,
        uint256[] memory _dependencyLevels,
        Trait[] memory _traits
    ) public onlyOwner {
        for (uint256 i = 0; i < _traits.length; i++) {
            traits[_traitIds[i]][_dependencyLevels[i]] = _traits[i];
        }
    }

    /*
        Function to a single trait, returns whole struct
    */

    function getTrait(uint256 _traitId, uint256 _dependencyLevel)
        public
        view
        returns (Trait memory)
    {
        return traits[_traitId][_dependencyLevel];
    }

    /*
        Function to a single trait type
    */

    function getTraitType(uint256 _traitId, uint256 _dependencyLevel)
        public
        view
        returns (bytes memory)
    {
        return traits[_traitId][_dependencyLevel].traitType;
    }

    /*
        Function to a single trait name
    */

    function getTraitName(uint256 _traitId, uint256 _dependencyLevel)
        public
        view
        returns (bytes memory)
    {
        return traits[_traitId][_dependencyLevel].traitName;
    }

    /*
        Function to a single trait image, returns just two byte vars
    */

    function getTraitImage(uint256 _traitId, uint256 _dependencyLevel)
        public
        view
        returns (bytes memory)
    {
        return traits[_traitId][_dependencyLevel].pngImage;
    }
}
