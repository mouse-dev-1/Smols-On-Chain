const allSmols = require("../data/smolsToTraitId.json");
const { generateMerkleTree } = require("../scripts/generateMerkleTree");

var proofs;
var root;

const getData = async (tokenId) => {
  merkleData = generateMerkleTree(allSmols);

  merkleTree = merkleData.merkleTree;
  proofs = merkleData.proofs;
  root = merkleData.root;

  console.log(
    tokenId,
    allSmols[tokenId].background,
    allSmols[tokenId].body,
    allSmols[tokenId].clothes,
    allSmols[tokenId].mouth,
    allSmols[tokenId].glasses,
    allSmols[tokenId].hat,
    allSmols[tokenId].hair,
    allSmols[tokenId].gender,
    "["+proofs[tokenId].join(",")+"]"
  );
};

getData(234)
getData(8976)