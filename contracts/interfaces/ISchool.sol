// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

struct TokenDetails {
    uint128 statAccrued;
    uint64 timestampJoined;
    bool joined;
}

struct StatDetails {
    uint256 globalStatAccrued;
    uint128 emissionRate;
    uint128 totalStat;
    bool exists;
}

interface ISchool {
    function tokenDetails(
        address _collectionAddress,
        uint64 _statId,
        uint256 _tokenId
    ) external view returns (TokenDetails memory);

    function statDetails(address _collectionAddress, uint64 _statId)
        external view
        returns (StatDetails memory);

    function isTokenJoined(address _collectionAddress, uint64 _statId, uint256 _tokenId)  external view returns(bool);
    function totalStatsJoinedWithinCollection(address _collectionAddress, uint256 _tokenId) external view returns(uint256);
}
