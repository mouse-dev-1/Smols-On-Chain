const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");
const fs = require("fs");
const path = require("path");
const ethers = require("ethers");

module.exports.generateMerkleTree = (smols) => {
  const hashesOfSmols = smols.map((smol) => {
    return keccak256(
      ethers.utils.solidityPack(
        [
          "uint256",
          "uint16",
          "uint16",
          "uint16",
          "uint16",
          "uint16",
          "uint16",
          "uint16",
          "uint8"
        ],
        [
          smol.tokenId,
          smol.background,
          smol.body,
          smol.clothes,
          smol.mouth,
          smol.glasses,
          smol.hat,
          smol.hair,
          smol.gender
        ]
      )
    );
  });

  const merkleTree = new MerkleTree(hashesOfSmols, keccak256, { sort: true });

  const root = merkleTree.getHexRoot();

  const proofs = hashesOfSmols.map((hash) => merkleTree.getHexProof(hash));

  fs.writeFileSync(
    path.join(__dirname, "../data/merkleTree.json"),
    JSON.stringify({ root, proofs }, undefined, 4)
  );
  return {merkleTree, proofs, root};
};
