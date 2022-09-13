// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

/*

SmolsExchanger.sol

Written by: mousedev.eth

*/

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/ISmolsInitialState.sol";
import "./libraries/SmolsLibrary.sol";
import "./interfaces/ISmols.sol";
import "hardhat/console.sol";

contract SmolsExchanger is Ownable {
    bytes32 public merkleRoot;

    address public oldSmolsAddress;
    address public smolsAddress;

    address public smolsInitialStateAddress;

    function onChainMySmolPlease(
        uint256 _smolId,
        uint16 background,
        uint16 body,
        uint16 clothes,
        uint16 mouth,
        uint16 glasses,
        uint16 hat,
        uint16 hair,
        uint8 gender,
        bytes32[] memory proof
    ) public {
        require(IERC721(oldSmolsAddress).ownerOf(_smolId) == msg.sender, "You; don't own this token!");
        require(merkleRoot != 0x0, "Merkle Root unset!");


        //Verify smol data
        require(
            MerkleProof.verify(
                proof,
                merkleRoot,
                keccak256(
                    abi.encodePacked(
                        _smolId,
                        background,
                        body,
                        clothes,
                        mouth,
                        glasses,
                        hat,
                        hair,
                        gender
                    )
                )
            ),
            "Invalid smols data."
        );

        //Burn the old smol
        IERC721(oldSmolsAddress).transferFrom(msg.sender, 0x000000000000000000000000000000000000dEaD,_smolId);

        //Mint the new smol
        ISmols(smolsAddress).privilegedMint(msg.sender, _smolId);

        //Set the smol data
        ISmolsInitialState(smolsInitialStateAddress).setSmol(_smolId, Smol(
            background,
            body,
            clothes,
            mouth,
            glasses,
            hat,
            hair,
            0,
            gender,
            0
        ));
    }

    function setAddresses(
        address _smolsInitialStateAddress,
        address _oldSmolsAddress,
        address _smolsAddress
        ) public onlyOwner {
        smolsInitialStateAddress = _smolsInitialStateAddress;
        oldSmolsAddress = _oldSmolsAddress;
        smolsAddress = _smolsAddress;
    }

    function setMerkleRoot(bytes32 _merkleRoot) public onlyOwner {
        merkleRoot = _merkleRoot;
    }
}
