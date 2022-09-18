// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

/*

School.sol

Written by: mousedev.eth

*/
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

contract School is Ownable {
    struct TokenDetails {
        uint128 statAccrued;
        uint64 timestampJoined;
        bool joined;
    }

    struct StatDetails {
        uint128 globalStatAccrued;
        uint128 emissionRate;
        bool exists;
        bool joinable;
    }

    mapping(address => bool) public allowedAdjuster;

    //Each tokens details within a stat within a collection.
    //Collection address to statId to tokenId to token details.
    mapping(address => mapping(uint256 => mapping(uint256 => TokenDetails)))
        public tokenDetails;

    //A record of how many stats this token is in at once.
    mapping(address => mapping(uint256 => uint256))
        public totalStatsJoinedWithinCollection;

    //Each stat details within a collection.
    //Collection address to statId to stat details.
    mapping(address => mapping(uint256 => StatDetails)) public statDetails;

    /**
     * @dev Joins a stat with a tokenId.
     * @param _collectionAddress collection address token belongs to
     * @param _statId statId to join
     * @param _tokenId token to join stat with
     */
    function joinStat(
        address _collectionAddress,
        uint64 _statId,
        uint256 _tokenId
    ) public {
        //Require they are the owner of this token
        require(
            msg.sender == IERC721(_collectionAddress).ownerOf(_tokenId),
            "You don't own this token!"
        );
        //Require this stat exists.
        require(
            statDetails[_collectionAddress][_statId].exists,
            "Stat does not exist!"
        );
        //Require stat is joinable.
        require(
            statDetails[_collectionAddress][_statId].joinable,
            "Stat not currently joinable!"
        );
        //Require they are not currently in this stat.
        require(
            tokenDetails[_collectionAddress][_statId][_tokenId].joined == false,
            "Token already joined this stat!"
        );

        //Set the timestamp and joined vars.
        tokenDetails[_collectionAddress][_statId][_tokenId] = TokenDetails(
            tokenDetails[_collectionAddress][_statId][_tokenId].statAccrued,
            uint64(block.timestamp),
            true
        );

        //Increment their total stats joined by one
        totalStatsJoinedWithinCollection[_collectionAddress][_tokenId]++;
    }

    /**
     * @dev Gets pending emissions on stat.
     * @param _collectionAddress collection address token belongs to
     * @param _statId statId to get
     * @param _tokenId token to get stat with
     */
    function getPendingStatEmissions(
        address _collectionAddress,
        uint64 _statId,
        uint256 _tokenId
    ) public view returns(uint128){
        //Require this stat exists.
        require(
            statDetails[_collectionAddress][_statId].exists,
            "Stat does not exist!"
        );

        //Create an in memory struct of the token details.
        TokenDetails memory _thisTokenDetails = tokenDetails[
            _collectionAddress
        ][_statId][_tokenId];

        //Require is it locked in order to leave.
        require(_thisTokenDetails.joined, "Token not in this stat!");

        //Get how many seconds passed this joining.
        uint128 timeElapsed = uint128(block.timestamp) -
            _thisTokenDetails.timestampJoined;

        //Multiply that by emission rate to get total stat accrued.
        uint128 statAccrued = statDetails[_collectionAddress][_statId]
            .emissionRate * timeElapsed;

        return statAccrued;
    }

    /**
     * @dev Claims pending emissions on stat.
     * @param _collectionAddress collection address token belongs to
     * @param _statId statId to claim
     * @param _tokenId token to claim stat with
     */
    function claimPendingStatEmissions(
        address _collectionAddress,
        uint64 _statId,
        uint256 _tokenId
    ) public {
        //Require they are the owner of this.
        require(
            msg.sender == IERC721(_collectionAddress).ownerOf(_tokenId),
            "You don't own this token!"
        );
        //Require this stat exists.
        require(
            statDetails[_collectionAddress][_statId].exists,
            "Stat does not exist!"
        );

        //Create an in memory struct of the token details.
        TokenDetails memory _thisTokenDetails = tokenDetails[
            _collectionAddress
        ][_statId][_tokenId];

        //Require is it locked in order to leave.
        require(_thisTokenDetails.joined, "Token not in this stat!");

        //Get how many seconds passed this joining.
        uint128 timeElapsed = uint128(block.timestamp) -
            _thisTokenDetails.timestampJoined;

        //Multiply that by emission rate to get total stat accrued.
        uint128 statAccrued = statDetails[_collectionAddress][_statId]
            .emissionRate * timeElapsed;

        //Set statAccrued and clear timestamp and joined vars.
        tokenDetails[_collectionAddress][_statId][_tokenId] = TokenDetails(
            _thisTokenDetails.statAccrued + statAccrued,
            uint64(block.timestamp),
            true
        );

        //Add this much stat to global accrual of this stat.
        statDetails[_collectionAddress][_statId]
            .globalStatAccrued += statAccrued;
    }

    /**
     * @dev Leaves a stat with a tokenId.
     * @param _collectionAddress collection address token belongs to
     * @param _statId statId to leave
     * @param _tokenId token to leave stat with
     */
    function leaveStat(
        address _collectionAddress,
        uint64 _statId,
        uint256 _tokenId
    ) public {
        //Require they are the owner of this.
        require(
            msg.sender == IERC721(_collectionAddress).ownerOf(_tokenId),
            "You don't own this token!"
        );
        //Require this stat exists.
        require(
            statDetails[_collectionAddress][_statId].exists,
            "Stat does not exist!"
        );

        //Create an in memory struct of the token details.
        TokenDetails memory _thisTokenDetails = tokenDetails[
            _collectionAddress
        ][_statId][_tokenId];

        //Require is it locked in order to leave.
        require(_thisTokenDetails.joined, "Token not in this stat!");

        //Get how many seconds passed this joining.
        uint128 timeElapsed = uint128(block.timestamp) -
            _thisTokenDetails.timestampJoined;

        //Multiply that by emission rate to get total stat accrued.
        uint128 statAccrued = statDetails[_collectionAddress][_statId]
            .emissionRate * timeElapsed;

        //Set statAccrued and clear timestamp and joined vars.
        tokenDetails[_collectionAddress][_statId][_tokenId] = TokenDetails(
            _thisTokenDetails.statAccrued + statAccrued,
            0,
            false
        );

        //Add this much stat to global accrual of this stat.
        statDetails[_collectionAddress][_statId]
            .globalStatAccrued += statAccrued;

        //Decrement their total stats joined by one
        totalStatsJoinedWithinCollection[_collectionAddress][_tokenId]--;
    }

    /**
     * @dev Sets an allowed adjuster.
     * @param _adjuster address to set
     * @param _allowed whether this address is allowed
     */
    function setAllowedAdjuster(address _adjuster, bool _allowed)
        public
        onlyOwner
    {
        allowedAdjuster[_adjuster] = _allowed;
    }

    /**
     * @dev Removes stats from a token.
     * @param _collectionAddress Address this token belongs to.
     * @param _statId StatId to adjust.
     * @param _tokenId TokenId to remove stats from.
     * @param _amountOfStatToRemove amount of stat to remove.
     */
    function removeStatAsAllowedAdjuster(
        address _collectionAddress,
        uint64 _statId,
        uint256 _tokenId,
        uint128 _amountOfStatToRemove
    ) public {
        require(
            allowedAdjuster[msg.sender],
            "You are not an allowed adjuster!"
        );
        tokenDetails[_collectionAddress][_statId][_tokenId]
            .statAccrued -= _amountOfStatToRemove;

        statDetails[_collectionAddress][_statId]
            .globalStatAccrued -= _amountOfStatToRemove;
    }

    /**
     * @dev Add stats to a token.
     * @param _collectionAddress Address this token belongs to.
     * @param _statId StatId to adjust.
     * @param _tokenId TokenId to add stats to.
     * @param _amountOfStatToAdd amount of stat to add.
     */
    function addStatAsAllowedAdjuster(
        address _collectionAddress,
        uint64 _statId,
        uint256 _tokenId,
        uint128 _amountOfStatToAdd
    ) public {
        require(
            allowedAdjuster[msg.sender],
            "You are not an allowed adjuster!"
        );
        tokenDetails[_collectionAddress][_statId][_tokenId]
            .statAccrued += _amountOfStatToAdd;

        statDetails[_collectionAddress][_statId]
            .globalStatAccrued += _amountOfStatToAdd;
    }

    /**
     * @dev Creates a stat for a collection.
     * @param _collectionAddress Address to add stat for.
     * @param _statId StatID of stat.
     * @param _statDetails Stat details.
     */
    function setStatDetails(
        address _collectionAddress,
        uint64 _statId,
        StatDetails memory _statDetails
    ) public onlyOwner {
        require(
            !statDetails[_collectionAddress][_statId].exists,
            "Stat already initialized"
        );
        statDetails[_collectionAddress][_statId] = _statDetails;
        //Ensure exists is true.
        statDetails[_collectionAddress][_statId].exists = true;
    }

    /**
     * @dev Adjusts a stat for a collection.
     * @param _collectionAddress Address to adjust stat for.
     * @param _statId StatID of stat.
     * @param _statDetails Stat details.
     */
    function adjustStatDetails(
        address _collectionAddress,
        uint64 _statId,
        StatDetails memory _statDetails
    ) public onlyOwner {
        require(
            statDetails[_collectionAddress][_statId].exists,
            "Stat doesn't exist!"
        );
        statDetails[_collectionAddress][_statId] = _statDetails;
    }
}
