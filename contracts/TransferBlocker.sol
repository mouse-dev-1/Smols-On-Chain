// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

/*

TransferBlocker.sol
Written by: mousedev.eth

Blocks transfer of tokens based on set requirements
*/

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/ISchool.sol";
import "hardhat/console.sol";

contract TransferBlocker is Ownable {
    address public schoolAddress;

    function isTransferrable(address _collectionAddress, uint256 _tokenId)
        public
        view
        returns (bool)
    {
        if (ISchool(schoolAddress).totalStatsJoinedWithinCollection(_collectionAddress, _tokenId) > 0) return false;
        return true;
    }


    function setSchoolAddress(address _schoolAddress) public onlyOwner {
        schoolAddress = _schoolAddress;
    }
}
