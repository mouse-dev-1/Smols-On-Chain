const { ethers, waffle } = require("hardhat");
const allTraits = require("../data/traits.json");
const Promise = require("bluebird");

function unpack(str) {
  var bytes = [];
  for (var i = 0; i < str.length; i++) {
    var char = str.charCodeAt(i);
    bytes.push(char & 0xff);
  }
  return ethers.utils.hexlify(bytes);
}

const uploadTraits = async (SmolsTraitStorage) => {
  await Promise.each(allTraits, async (traits) => {
    await Promise.each(traits.traits, async (trait, index) => {
      await SmolsTraitStorage.setTrait(traits.traitId, index, {
        traitId: traits.traitId,
        traitName: unpack(trait.traitName),
        traitType: unpack(trait.traitType),
        pngImage: unpack(trait.pngImage),
      });
      await Promise.delay(4500);
    });
  });
};

async function main() {
  const [owner] = await ethers.getSigners();

  Smols = await (await ethers.getContractFactory("Smols")).deploy();
  SmolsInitialState = await (
    await ethers.getContractFactory("SmolsInitialState")
  ).deploy();
  SmolsRenderer = await (
    await ethers.getContractFactory("SmolsRenderer")
  ).deploy();
  SmolsState = await (await ethers.getContractFactory("SmolsState")).deploy();
  SmolsTraitStorage = await (
    await ethers.getContractFactory("SmolsTraitStorage")
  ).deploy();

  //Smols
  await Smols.setSmolsRendererAddress(SmolsRenderer.address);

  await Promise.delay(4500);

  //Smols Initial State
  await SmolsInitialState.setAllowedSetter(Smols.address, true);
  await Promise.delay(4500);
  await SmolsInitialState.setAllowedSetter(owner.address, true);
  await Promise.delay(4500);

  await SmolsInitialState.setSmol(0, {
    background: 2,
    body: 9,
    clothes: 30,
    glasses: 18,
    hat: 20,
    mouth: 25,
    skin: 0,
    iq: 3,
    gender: 1,
  });
  await Promise.delay(4500);

  await SmolsInitialState.setSmol(1, {
    background: 7,
    body: 11,
    clothes: 14,
    glasses: 19,
    hat: 24,
    mouth: 27,
    skin: 0,
    iq: 0,
    gender: 1,
  });
  await Promise.delay(4500);

  //Smols Renderer
  await SmolsRenderer.setAddresses(
    SmolsState.address,
    SmolsInitialState.address,
    SmolsTraitStorage.address
  )
  await Promise.delay(4500);

  //Smols State
  await SmolsState.setAllowedSetter(Smols.address, true);
  await Promise.delay(4500);

  //Smols Trait Storage
  await uploadTraits(SmolsTraitStorage);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
