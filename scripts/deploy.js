const { ethers, waffle } = require("hardhat");
const allTraits = require("../data/traits.json");
const allSmols = require("../data/smolsToTraitId.json");
const Promise = require("bluebird");

function sliceIntoChunks(arr, chunkSize) {
  const res = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    const chunk = arr.slice(i, i + chunkSize);
    res.push(chunk);
  }
  return res;
}

function unpack(str) {
  var bytes = [];
  for (var i = 0; i < str.length; i++) {
    var char = str.charCodeAt(i);
    bytes.push(char & 0xff);
  }
  return ethers.utils.hexlify(bytes);
}

const uploadSmols = async (SmolsInitialState) => {
  const chunks = sliceIntoChunks(allSmols, 100);
  var runningTotal = 0;

  await Promise.each(chunks, async (chunk) => {
    const tokenIds = chunk.map((a) => a.tokenId);
    const smolsToUpload = chunk.map((a) => {
      delete a.tokenId;
      return a;
    });

    await SmolsInitialState.setSmols(tokenIds, smolsToUpload);
    runningTotal = runningTotal + smolsToUpload.length;
    console.log(
      `Uploaded ${tokenIds.length} more smols. ${runningTotal} total.`
    );
    await Promise.delay(3500);
  });
};

const uploadTraits = async (SmolsTraitStorage) => {
  const chunks = sliceIntoChunks(allTraits, 6);

  await Promise.each(chunks, async (chunk) => {
    const traitGroupings = {
      _traitIds: [],
      _dependencyLevels: [],
      _traits: [],
    };
    chunk.forEach((traitGroup) => {
      traitGroup.traits.forEach((trait, index) => {

        traitGroupings._traitIds.push(traitGroup.traitId);
        traitGroupings._dependencyLevels.push(index);
        traitGroupings._traits.push({
          gender: trait.gender,
          traitId: traitGroup.traitId,
          traitName: unpack(trait.traitName),
          traitType: unpack(trait.traitType),
          pngImage: unpack(trait.pngImage),
        });
      });
    });

    console.log("Uploading trait grouping");

    await SmolsTraitStorage.setTraits(
      traitGroupings._traitIds,
      traitGroupings._dependencyLevels,
      traitGroupings._traits
    );

    await Promise.delay(3500);
  });

  /*
  await Promise.each(allTraits, async (traits) => {
    await Promise.each(traits.traits, async (trait, index) => {
      await SmolsTraitStorage.setTrait(traits.traitId, index, {
        gender: trait.gender,
        traitId: traits.traitId,
        traitName: unpack(trait.traitName),
        traitType: unpack(trait.traitType),
        pngImage: unpack(trait.pngImage),
      });
      console.log(`Uploaded trait ${traits.traitId}`);
      await Promise.delay(3500);
    });
  });
  */
};

async function main() {
  const [owner] = await ethers.getSigners();

  Smols = await (await ethers.getContractFactory("Smols")).deploy();
  await Promise.delay(3500);
  SmolsInitialState = await (
    await ethers.getContractFactory("SmolsInitialState")
  ).deploy();
  await Promise.delay(3500);
  SmolsRenderer = await (
    await ethers.getContractFactory("SmolsRenderer")
  ).deploy();
  await Promise.delay(3500);
  SmolsState = await (await ethers.getContractFactory("SmolsState")).deploy();
  SmolsTraitStorage = await (
    await ethers.getContractFactory("SmolsTraitStorage")
  ).deploy();
  await Promise.delay(3500);

  //Smols
  await Smols.setSmolsRendererAddress(SmolsRenderer.address);

  await Promise.delay(3500);

  //Smols Initial State
  await SmolsInitialState.setAllowedSetter(Smols.address, true);
  await Promise.delay(3500);
  await SmolsInitialState.setAllowedSetter(owner.address, true);
  await Promise.delay(3500);

  //Smols Renderer
  await SmolsRenderer.setAddresses(
    SmolsState.address,
    SmolsInitialState.address,
    SmolsTraitStorage.address
  );
  await Promise.delay(3500);

  //Smols State
  await SmolsState.setAllowedSetter(Smols.address, true);
  await Promise.delay(3500);

  //Smols Trait Storage
  await uploadTraits(SmolsTraitStorage);

  //Upload smols
  await uploadSmols(SmolsInitialState);

  //const tokenURI = await Smols.tokenURI(23);
  //console.log(tokenURI);

  //await Smols.mintQuantity(350000);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 3500;
});
