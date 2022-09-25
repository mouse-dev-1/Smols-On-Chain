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
  SmolsRenderer = await deployContract("SmolsRenderer");
  await Promise.delay(3500);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
