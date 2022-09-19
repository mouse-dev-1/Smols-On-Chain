const { ethers, waffle } = require("hardhat");
const { expect } = require("chai");
const Promise = require("bluebird");
const allTraits = require("../data/traits.json");
const allSmols = require("../data/smolsToTraitId.json");
const { unpack, uploadTraits } = require("../scripts/helpers");
const { generateMerkleTree } = require("../scripts/generateMerkleTree");
const fs = require("fs");
const path = require("path");

var proofs;
var root;

const deployContract = async (name) =>
  (await ethers.getContractFactory(name)).deploy();

async function main() {
  OldSmols = await deployContract("OldSmols");
  Smols = await deployContract("Smols");
  SmolsExchanger = await deployContract("SmolsExchanger");
  SmolsInitialState = await deployContract("SmolsInitialState");
  SmolsRenderer = await deployContract("SmolsRenderer");
  SmolsState = await deployContract("SmolsState");
  SmolsTraitStorage = await deployContract("SmolsTraitStorage");

  School = await deployContract("School");
  TransferBlocker = await deployContract("TransferBlocker");

  await Smols.setTransferBlockerAddress(TransferBlocker.address);
  await TransferBlocker.setSchoolAddress(School.address);

  const iqEmissionRate = 115740740000000;
  //Create IQ Stat
  await School.setStatDetails(Smols.address, 0, {
    globalStatAccrued: 0,
    emissionRate: iqEmissionRate,
    exists: 1,
    joinable: 1,
  });

  merkleData = generateMerkleTree(allSmols);

  merkleTree = merkleData.merkleTree;
  proofs = merkleData.proofs;
  root = merkleData.root;

  //Smols
  await Smols.setSmolsRendererAddress(SmolsRenderer.address);
  await Smols.setPrivilegedMinter(SmolsExchanger.address, true);

  //Smols Exchanger
  await SmolsExchanger.setAddresses(
    SmolsInitialState.address,
    OldSmols.address,
    Smols.address
  );

  await SmolsExchanger.setMerkleRoot(root);

  //Smols Initial State
  await SmolsInitialState.setAllowedSetter(SmolsExchanger.address, true);

  //Smols Renderer
  await SmolsRenderer.setAddresses(
    SmolsState.address,
    SmolsInitialState.address,
    SmolsTraitStorage.address
  );

  //Smols Trait Storage
  await uploadTraits(allTraits, SmolsTraitStorage);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
