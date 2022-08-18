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

before(async function () {
  OldSmols = await deployContract("OldSmols");
  Smols = await deployContract("Smols");
  SmolsExchanger = await deployContract("SmolsExchanger");
  SmolsInitialState = await deployContract("SmolsInitialState");
  SmolsRenderer = await deployContract("SmolsRenderer");
  SmolsState = await deployContract("SmolsState");
  SmolsTraitStorage = await deployContract("SmolsTraitStorage");

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
});

describe("Tests", async function () {
  it("On chains 1000 smols", async function () {
    //OldSmols
    await OldSmols.mintQuantity(1000);
    await OldSmols.setApprovalForAll(SmolsExchanger.address, true);

    for (var i = 0; i < 1000; i++) {
      await SmolsExchanger.onChainMySmolPlease(
        i,
        allSmols[i].background,
        allSmols[i].body,
        allSmols[i].clothes,
        allSmols[i].mouth,
        allSmols[i].glasses,
        allSmols[i].hat,
        allSmols[i].gender,
        allSmols[i].headSize,
        proofs[i]
      );
    }

    var html = `<html>`;
    for (var i = 0; i < 1000; i++) {
      const thisURI = await Smols.tokenURI(i);
      console.log(Buffer.from(
        JSON.parse(
          Buffer.from(
            thisURI.split("data:application/json;base64,")[1],
            "base64"
          ).toString("ascii")
        ).image.split("data:image/svg+xml;base64,")[1],
        "base64"
      ).toString("ascii"), i)
      html = `${html} ${Buffer.from(
        JSON.parse(
          Buffer.from(
            thisURI.split("data:application/json;base64,")[1],
            "base64"
          ).toString("ascii")
        ).image.split("data:image/svg+xml;base64,")[1],
        "base64"
      ).toString("ascii")}`;
    }

    fs.writeFileSync(
      path.join(__dirname, "../data/outputs/all.html"),
      `${html}<style>svg{height: 150;width: 150;}</style></html>`
    );
  });
});
