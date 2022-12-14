// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "../libraries/SmolsLibrary.sol";

interface ISmolsState{
    function getSmol(uint256 tokenId) external view returns(Smol memory);
}