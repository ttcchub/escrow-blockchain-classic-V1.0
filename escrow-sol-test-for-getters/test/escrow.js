const { expect } = require('chai');
const { ethers } = require('hardhat');
const hre = require("hardhat");
const { escrowJson } = require('./escrowJson');

describe('Factory', function () {

  it('should initiate the factory contract and create a single new Escrow contract', async function () {
		[factoryOwner, escrowOwner] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory('Factory');
    factory = await Factory.connect(factoryOwner).deploy();
    await factory.deployed();
    await factory.connect(escrowOwner).createContract();
    const allEscrowContracts = await factory.getAllContracts();
    expect(allEscrowContracts.length).to.equal(1);

    // await escrow.connect(buyer).depositToEscrow({value: ethers.utils.parseEther('10')});
	});

});


describe('Escrow', function () {

  beforeEach(async () => {
    [factoryOwner, escrowOwner, seller, buyer, externalWallet] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory('Factory');
    factory = await Factory.connect(factoryOwner).deploy();
    await factory.deployed();
    escrowContractInstants = await factory.connect(escrowOwner).createContract();
    const allEscrowContracts = await factory.getAllContracts();
    escrow = new ethers.Contract(allEscrowContracts[0], escrowJson, escrowOwner);
    await escrow.deployed();
    await escrow.connect(escrowOwner).initEscrow(seller.address, buyer.address, 10, 100000000);
  });

  it('should initialize a new escrow and return escrowID as 1', async function() {
    escrowID = await escrow.getEscrowID();
    expect(escrowID).to.equal(1);
	});

  it('should give 10 eth of a deposit from the buyer', async function() {
    await escrow.connect(buyer).depositToEscrow({value: ethers.utils.parseEther('10')});
    escrowBalance = await ethers.provider.getBalance(escrow.address);
    expect(escrowBalance.toString()).to.equal(ethers.utils.parseEther('10'));
	});

  it('should allow the buyer and the seller to approve escrow and escrow complete with 0 balance', async function() {
    await escrow.connect(buyer).depositToEscrow({value: ethers.utils.parseEther('10')});
    await escrow.connect(seller).approveEscrow()
    await escrow.connect(buyer).approveEscrow()
    state = await escrow.checkEscrowStatus();
    expect(state).to.equal(4); // escrowComplete
    escrowBalance = await ethers.provider.getBalance(escrow.address);
    expect(escrowBalance).to.equal(0);
	});

  it('should allow the buyer and seller to cancel the escrow', async function() {
    await escrow.connect(buyer).depositToEscrow({value: ethers.utils.parseEther('10')});
    await escrow.connect(seller).cancelEscrow();
    await escrow.connect(buyer).cancelEscrow();
    state = await escrow.checkEscrowStatus();
    expect(state).to.equal(5); // escrowCancelled
    escrowBalance = await ethers.provider.getBalance(escrow.address);
    expect(escrowBalance).to.equal(0);
	});

  it('should NOT allow the escrow owner to end the escrow before its approved or cancelled', async function() {
    await escrow.connect(buyer).depositToEscrow({value: ethers.utils.parseEther('10')});
    endEscrow = escrow.connect(escrowOwner).endEscrow();
    await expect(endEscrow).to.revertedWith('not approved or cancelled');
    state = await escrow.checkEscrowStatus();
    expect(state).to.equal(2); // buyerDeposited
	});

  it('only escrow owner should be able to end the escrow', async function() {
    await escrow.connect(buyer).depositToEscrow({value: ethers.utils.parseEther('10')});
    await escrow.connect(seller).cancelEscrow();
    await escrow.connect(buyer).cancelEscrow();
    endEscrow = escrow.connect(externalWallet).endEscrow();
    await expect(endEscrow).to.revertedWith('only escrow owner');
	});

  it('only buyer can deposit to escrow', async function() {
    tx = externalWallet.sendTransaction({
      to: escrow.address,  
      value: ethers.utils.parseEther('1')
    });
    await expect(tx).to.revertedWith('only buyer');

    await buyer.sendTransaction({
      to: escrow.address,  
      value: ethers.utils.parseEther('10')
    });
    escrowBalance = await ethers.provider.getBalance(escrow.address);
    expect(escrowBalance).to.equal(ethers.utils.parseEther('10'));
    // const test = window.ethereum;
    // console.log(test,"test");
  });

});
