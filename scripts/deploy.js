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
  {
    const contract = await(await ethers.getContractFactory(name)).deploy();
    console.log(`Deployed: ${name} at ${contract.address}`);
    return contract;
  }

async function main() {
  OldSmols = await deployContract("OldSmols");
  await Promise.delay(3500);
  Smols = await deployContract("Smols");
  await Promise.delay(3500);
  SmolsExchanger = await deployContract("SmolsExchanger");
  await Promise.delay(3500);
  SmolsInitialState = await deployContract("SmolsInitialState");
  await Promise.delay(3500);
  SmolsRenderer = await deployContract("SmolsRenderer");
  await Promise.delay(3500);
  SmolsState = await deployContract("SmolsState");
  await Promise.delay(3500);
  SmolsTraitStorage = await deployContract("SmolsTraitStorage");
  await Promise.delay(3500);

  School = await deployContract("School");
  await Promise.delay(3500);
  TransferBlocker = await deployContract("TransferBlocker");
  await Promise.delay(3500);

  await Smols.setTransferBlockerAddress(TransferBlocker.address);
  await Promise.delay(3500);
  await TransferBlocker.setSchoolAddress(School.address);
  await Promise.delay(3500);

  const iqEmissionRate = 115740740000000;
  //Create IQ Stat
  await School.setStatDetails(Smols.address, 0, {
    globalStatAccrued: 0,
    emissionRate: iqEmissionRate,
    exists: 1,
    joinable: 1,
  });
  await Promise.delay(3500);


  //Smols
  await Smols.setSmolsRendererAddress(SmolsRenderer.address);
  await Promise.delay(3500);
  await Smols.setPrivilegedMinter(SmolsExchanger.address, true);
  await Promise.delay(3500);

  //Smols Exchanger
  await SmolsExchanger.setAddresses(
    SmolsInitialState.address,
    OldSmols.address,
    Smols.address
  );
  await Promise.delay(3500);

  merkleData = generateMerkleTree(allSmols);

  merkleTree = merkleData.merkleTree;
  proofs = merkleData.proofs;
  root = merkleData.root;

  await SmolsExchanger.setMerkleRoot(root);
  await Promise.delay(3500);

  //Smols Initial State
  await SmolsInitialState.setAllowedSetter(SmolsExchanger.address, true);
  await Promise.delay(3500);

  //Smols Renderer
  await SmolsRenderer.setAddresses(
    SmolsState.address,
    SmolsInitialState.address,
    SmolsTraitStorage.address
  );
  await Promise.delay(3500);

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
