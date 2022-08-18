// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "../libraries/SmolsLibrary.sol";

interface ISmols{
    function privilegedMint(address _to, uint256 _tokenId) external;
}