// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "../libraries/SmolsLibrary.sol";

interface ISmolsInitialState{
    function getSmol(uint256 tokenId) external view returns(Smol memory);
    function setSmol(uint256 tokenId, Smol memory) external;
}