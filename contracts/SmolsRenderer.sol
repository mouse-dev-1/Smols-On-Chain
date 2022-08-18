// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;
/*

SmolsRenderer.sol

Written by: mousedev.eth

*/

import "./interfaces/ISmolsInitialState.sol";
import "./interfaces/ISmolsState.sol";
import "./interfaces/ISmolsTraitStorage.sol";

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./libraries/SmolsLibrary.sol";

contract SmolsRenderer is Ownable {
    address public smolsStateAddress;
    address public smolsInitialStateAddress;
    address public smolsTraitStorageAddress;

    string public collectionDescription;
    string public namePrefix;

    function getSmol(uint256 _tokenId) public view returns (Smol memory) {
        Smol memory _smolInitialState = ISmolsInitialState(
            smolsInitialStateAddress
        ).getSmol(_tokenId);
        Smol memory _smolState = ISmolsState(smolsStateAddress).getSmol(
            _tokenId
        );
        Smol memory _returnSmol = _smolInitialState;

        if (_smolState.background > 0)
            _returnSmol.background = _smolState.background;
        if (_smolState.body > 0) _returnSmol.body = _smolState.body;
        if (_smolState.clothes > 0) _returnSmol.clothes = _smolState.clothes;
        if (_smolState.glasses > 0) _returnSmol.glasses = _smolState.glasses;
        if (_smolState.hat > 0) _returnSmol.hat = _smolState.hat;
        if (_smolState.mouth > 0) _returnSmol.mouth = _smolState.mouth;
        if (_smolState.skin > 0) _returnSmol.skin = _smolState.skin;

        return _returnSmol;
    }

    function setCollectionData(
        string memory _collectionDescription,
        string memory _namePrefix
    ) public onlyOwner {
        if (bytes(_collectionDescription).length > 0)
            collectionDescription = _collectionDescription;
        if (bytes(_namePrefix).length > 0) namePrefix = _namePrefix;
    }

    function setAddresses(
        address _smolsStateAddress,
        address _smolsInitialStateAddress,
        address _smolsTraitStorageAddress
    ) public onlyOwner {
        if (_smolsStateAddress != address(0x0))
            smolsStateAddress = _smolsStateAddress;
        if (_smolsInitialStateAddress != address(0x0))
            smolsInitialStateAddress = _smolsInitialStateAddress;
        if (_smolsTraitStorageAddress != address(0x0))
            smolsTraitStorageAddress = _smolsTraitStorageAddress;
    }

    function generatePNGForSVG(bytes memory pngImage)
        internal
        pure
        returns (bytes memory)
    {
        return
            abi.encodePacked(
                '<image xmlns="http://www.w3.org/2000/svg" x="0" y="0" width="350" height="350" image-rendering="pixelated" preserveAspectRatio="xMidYMid" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="',
                pngImage,
                '" />'
            );
    }

    function generatePNGFromTraitId(uint256 _traitId, uint256 _dependencyLevel)
        internal
        view
        returns (bytes memory)
    {
        return
            generatePNGForSVG(
                ISmolsTraitStorage(smolsTraitStorageAddress).getTraitImage(
                    _traitId,
                    _dependencyLevel
                )
            );
    }

    function generateSVG(Smol memory _smol) public view returns (bytes memory) {
        if (_smol.skin > 0) {
            return
                abi.encodePacked(
                    '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" id="smol" width="100%" height="100%" version="1.1" viewBox="0 0 350 350">',
                    generatePNGFromTraitId(_smol.background, 0),
                    generatePNGFromTraitId(_smol.body, 0),
                    generatePNGFromTraitId(_smol.glasses, 0),
                    generatePNGFromTraitId(_smol.skin, 0),
                    "<style>#smol{shape-rendering: crispedges; image-rendering: -webkit-crisp-edges; image-rendering: -moz-crisp-edges; image-rendering: crisp-edges; image-rendering: pixelated; -ms-interpolation-mode: nearest-neighbor;}</style></svg>"
                );
        }
        return
            abi.encodePacked(
                '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" id="smol" width="100%" height="100%" version="1.1" viewBox="0 0 350 350">',
                generatePNGFromTraitId(_smol.background, 0),
                generatePNGFromTraitId(_smol.body, _smol.headSize),
                generatePNGFromTraitId(_smol.clothes, 0),
                generatePNGFromTraitId(_smol.glasses, 0),
                generatePNGFromTraitId(_smol.hat, _smol.headSize),
                generatePNGFromTraitId(_smol.mouth, 0),
                "<style>#smol{shape-rendering: crispedges; image-rendering: -webkit-crisp-edges; image-rendering: -moz-crisp-edges; image-rendering: crisp-edges; image-rendering: pixelated; -ms-interpolation-mode: nearest-neighbor;}</style></svg>"
            );
    }

    function generateMetadataString(
        bytes memory traitType,
        bytes memory traitName
    ) public pure returns (bytes memory) {
        return
            abi.encodePacked(
                '{"trait_type":"',
                traitType,
                '","value":"',
                traitName,
                '"}'
            );
    }

    function generateMetadata(Smol memory _smol)
        public
        view
        returns (bytes memory)
    {
        return
            abi.encodePacked(
                "[",
                //Load the background
                generateMetadataString(
                    ISmolsTraitStorage(smolsTraitStorageAddress).getTraitType(
                        _smol.background,
                        0
                    ),
                    ISmolsTraitStorage(smolsTraitStorageAddress).getTraitName(
                        _smol.background,
                        0
                    )
                ),
                ",",
                //Load the Body
                generateMetadataString(
                    ISmolsTraitStorage(smolsTraitStorageAddress).getTraitType(
                        _smol.body,
                        _smol.headSize
                    ),
                    ISmolsTraitStorage(smolsTraitStorageAddress).getTraitName(
                        _smol.body,
                        _smol.headSize
                    )
                ),
                ",",
                //Load the Clothes
                generateMetadataString(
                    ISmolsTraitStorage(smolsTraitStorageAddress).getTraitType(
                        _smol.clothes,
                        0
                    ),
                    ISmolsTraitStorage(smolsTraitStorageAddress).getTraitName(
                        _smol.clothes,
                        0
                    )
                ),
                ",",
                //Load the Glasses
                generateMetadataString(
                    ISmolsTraitStorage(smolsTraitStorageAddress).getTraitType(
                        _smol.glasses,
                        0
                    ),
                    ISmolsTraitStorage(smolsTraitStorageAddress).getTraitName(
                        _smol.glasses,
                        0
                    )
                ),
                ",",
                //Load the Hat
                generateMetadataString(
                    ISmolsTraitStorage(smolsTraitStorageAddress).getTraitType(
                        _smol.hat,
                        _smol.headSize
                    ),
                    ISmolsTraitStorage(smolsTraitStorageAddress).getTraitName(
                        _smol.hat,
                        _smol.headSize
                    )
                ),
                ",",
                //Load the Mouth
                generateMetadataString(
                    ISmolsTraitStorage(smolsTraitStorageAddress).getTraitType(
                        _smol.mouth,
                        0
                    ),
                    ISmolsTraitStorage(smolsTraitStorageAddress).getTraitName(
                        _smol.mouth,
                        0
                    )
                ),
                "]"
            );
    }

    function tokenURI(uint256 _tokenId) public view returns (string memory) {
        Smol memory _smol = getSmol(_tokenId);

        return
            string(
                abi.encodePacked(
                    "data:application/json;base64,",
                    SmolsLibrary.encode(
                        abi.encodePacked(
                            '{"description": "',
                            collectionDescription,
                            '","image": "data:image/svg+xml;base64,',
                            SmolsLibrary.encode(generateSVG(_smol)),
                            '","name": "',
                            namePrefix,
                            SmolsLibrary.toString(_tokenId),
                            '","attributes":',
                            generateMetadata(_smol),
                            "}"
                        )
                    )
                )
            );
    }
}
