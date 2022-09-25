const { ethers, waffle } = require("hardhat");
const { expect } = require("chai");
const Promise = require("bluebird");
const fs = require("fs");
const path = require("path");

const deployContract = async (name) =>
  (await ethers.getContractFactory(name)).deploy();

var signers;
var ownerAddress;
var user1Address;
var owner;
var user1;

const getTimestamp = async () => {
  
  const blockNumBefore = await ethers.provider.getBlockNumber();
  const blockBefore = await ethers.provider.getBlock(blockNumBefore);

  //Timestamp for token 1 leavingg;
   return blockBefore.timestamp;

}



const iqEmissionRate = 115740740000000;

before(async function () {
  signers = await ethers.getSigners();
  owner = signers[0];
  user1 = signers[1];
  ownerAddress = owner.address;
  user1Address = user1.address;

  Smols = await deployContract("Smols");
  School = await deployContract("School");
  TransferBlocker = await deployContract("TransferBlocker");

  await Smols.setTransferBlockerAddress(TransferBlocker.address);
  await TransferBlocker.setSchoolAddress(School.address);

  //Create IQ Stat
  await School.setStatDetails(Smols.address, 0, {
    globalStatAccrued: 0,
    emissionRate: iqEmissionRate,
    exists: 1,
    joinable: 1,
  });

  //Mint token Ids 0,1,2,3
  await Smols.privilegedMint(ownerAddress, 0);
  await Smols.privilegedMint(ownerAddress, 1);
  await Smols.privilegedMint(ownerAddress, 2);
  await Smols.privilegedMint(ownerAddress, 3);
});

describe("Tests", async function () {
  it("Ensures smols are transferrable", async function () {
    expect(await Smols.balanceOf(ownerAddress)).to.equal(4);
    expect(await Smols.balanceOf(user1Address)).to.equal(0);

    await Smols.transferFrom(ownerAddress, user1Address, 0);

    expect(await Smols.balanceOf(ownerAddress)).to.equal(3);
    expect(await Smols.balanceOf(user1Address)).to.equal(1);
  });

  it("Joins school for 3 tokens on stat 0", async function () {
    await School.connect(user1).joinStat(Smols.address, 0, 0);
    await School.joinStat(Smols.address, 0, 1);

    //Timestamp for token 1 joining;
    timestampJoined = await getTimestamp();
  });

  it("Ensures smol are not transferrable when joined", async function () {
    expect(await Smols.balanceOf(ownerAddress)).to.equal(3);
    expect(await Smols.balanceOf(user1Address)).to.equal(1);

    await expect(
      Smols.connect(user1).transferFrom(user1Address, ownerAddress, 0)
    ).to.be.revertedWith("Token Not Currently Transferrable");

    expect(await Smols.balanceOf(ownerAddress)).to.equal(3);
    expect(await Smols.balanceOf(user1Address)).to.equal(1);
  });

  it("Claims stat owed", async function () {
    expect(await School.totalStatsJoinedWithinCollection(Smols.address, 1)).to.equal(1);

    await School.leaveStat(Smols.address, 0, 1);

    //Timestamp for token 1 leaving;
    timestampLeft = await getTimestamp();

    const secondsPassed = timestampLeft - timestampJoined;
    const expectedEmissions = secondsPassed * iqEmissionRate;

    const tokenDetails = await School.tokenDetails(Smols.address, 0, 1);
    const statDetails = await School.statDetails(Smols.address, 0);

    //Ensure they are given this much emission in storage.
    expect(tokenDetails.statAccrued).to.equal(expectedEmissions);
    //Ensure the timestamp was cleared
    expect(tokenDetails.timestampJoined).to.equal(0);
    //Ensure they are marked as not joined
    expect(tokenDetails.joined).to.equal(false);

    //Ensure global stat accrued is correct
    expect(statDetails.globalStatAccrued).to.equal(expectedEmissions);
    //Ensure iq emissions is correct
    expect(statDetails.emissionRate).to.equal(iqEmissionRate);
    //Ensure this stat exists
    expect(statDetails.exists).to.equal(true);
    //And is joinable
    expect(statDetails.joinable).to.equal(true);

    //Expect them to be in 0 total stats
    expect(await School.totalStatsJoinedWithinCollection(Smols.address, 1)).to.equal(0);

    //Transfer this smol to user1
    await Smols.transferFrom(ownerAddress, user1Address, 1);
  });
});
