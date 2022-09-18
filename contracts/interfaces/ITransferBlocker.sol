// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;


interface ITransferBlocker {
    function isTransferrable(address _collectionAddress, uint256 _tokenId) external view returns(bool);
}
