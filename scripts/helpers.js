const Promise = require("bluebird");

function sliceIntoChunks(arr, chunkSize) {
  const res = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    const chunk = arr.slice(i, i + chunkSize);
    res.push(chunk);
  }
  return res;
}

const unpack = (str) => {
  var bytes = [];
  for (var i = 0; i < str.length; i++) {
    var char = str.charCodeAt(i);
    bytes.push(char & 0xff);
  }
  return ethers.utils.hexlify(bytes);
};

module.exports.uploadTraits = async (allTraits, SmolsTraitStorage) => {

  const singleTraitTraits = allTraits.filter(a => a.traits.length == 1);
  const multipleTraitTraits = allTraits.filter(a => a.traits.length > 1);

  const chunks1 = sliceIntoChunks(singleTraitTraits, 20);
  const chunks2 = sliceIntoChunks(multipleTraitTraits, 3);

  const chunks = [...chunks1, ...chunks2];

  await Promise.each(chunks, async (chunk, chunkIndex) => {
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
          gender: trait.gender == "male" ? 1 : 2,
          traitId: traitGroup.traitId,
          traitName: unpack(trait.traitName),
          traitType: unpack(trait.traitType),
          pngImage: unpack(trait.pngImage),
        });
      });
    });

    console.log(`Uploading trait grouping ${chunkIndex} of length ${chunk.length}`);

    await SmolsTraitStorage.setTraits(
      traitGroupings._traitIds,
      traitGroupings._dependencyLevels,
      traitGroupings._traits
    );

    await Promise.delay(3500);
  });
};
