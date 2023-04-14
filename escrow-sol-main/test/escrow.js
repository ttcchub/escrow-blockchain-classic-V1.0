const { expect } = require('chai');
const { ethers } = require('hardhat');
const escrowJson = require('../artifacts/contracts/Escrow.sol/Escrow.json')

const parseEth = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe('Factory', function () {

  it('should initiate the factory contract and create a single new Escrow contract', async function () {
		[factoryOwner, escrowOwner] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory('Factory');
    factory = await Factory.connect(factoryOwner).deploy();
    await factory.deployed();
    await factory.connect(escrowOwner).createContract();
    const allEscrowContracts = await factory.getAllContracts();
    expect(allEscrowContracts.length).to.equal(1);
	});

});

describe('Escrow', function () {

  describe('Escrow Initialization Failures', function () {

    beforeEach(async () => {
      [factoryOwner, escrowOwner, seller, buyer, externalWallet] = await ethers.getSigners();
      const Factory = await ethers.getContractFactory('Factory');
      factory = await Factory.connect(factoryOwner).deploy();
      await factory.deployed();
      await factory.connect(escrowOwner).createContract();
      await factory.connect(escrowOwner).createContract();
      const allEscrowContracts = await factory.getAllContracts();
      escrow1 = new ethers.Contract(allEscrowContracts[0], escrowJson['abi'], escrowOwner);
      escrow2 = new ethers.Contract(allEscrowContracts[1], escrowJson['abi'], escrowOwner);
      await escrow1.deployed();
      await escrow2.deployed();
    });

    it('escrow owner can NOT be the buyer or the seller', async function() {
      ownerIsSeller = escrow1.connect(escrowOwner).initEscrow(escrowOwner.address, buyer.address, 20, 1000);
      ownerIsBuyer = escrow1.connect(escrowOwner).initEscrow(seller.address, escrowOwner.address, 20, 1000);
      await expect(ownerIsSeller).to.be.revertedWith('escrow owner can not be buyer or seller');
      await expect(ownerIsBuyer).to.be.revertedWith('escrow owner can not be buyer or seller');
    });

    it('escrow owner can NOT be the buyer or the seller', async function() {
      ownerIsSeller = escrow1.connect(escrowOwner).initEscrow(escrowOwner.address, buyer.address, 20, 1000);
      ownerIsBuyer = escrow1.connect(escrowOwner).initEscrow(seller.address, escrowOwner.address, 20, 1000);
      await expect(ownerIsSeller).to.be.revertedWith('escrow owner can not be buyer or seller');
      await expect(ownerIsBuyer).to.be.revertedWith('escrow owner can not be buyer or seller');
    });

    it('fee percent can NOT be less than 0 or greater than 100', async function() {
      highFee = escrow1.connect(escrowOwner).initEscrow(seller.address, buyer.address, 101, 1000);
      await expect(highFee).to.be.revertedWith('fee percent cannot be less than 0 or greater than 100');
    });

    it('block number can not be lower or equal to the current block number', async function() {
      currentBlockNumber = await escrow1.getBlockNumber();
      initCurrentBlock = escrow1.connect(escrowOwner).initEscrow(seller.address, buyer.address, 20, currentBlockNumber);
      await expect(initCurrentBlock).to.be.revertedWith('choose a higher block number');
    });

    it('buyer and seller addresses can not be smart contracts', async function() {
      contractSeller = escrow1.connect(escrowOwner).initEscrow(escrow2.address, buyer.address, 20, 1000);
      contractBuyer = escrow1.connect(escrowOwner).initEscrow(seller.address, escrow2.address, 20, 1000);
      await expect(contractSeller).to.be.revertedWith('can not be contract addresses');
      await expect(contractBuyer).to.be.revertedWith('can not be contract addresses');
    });
  
  });

  describe('Escrow Success', function () {

    beforeEach(async () => {
      [factoryOwner, escrowOwner, seller, buyer, externalWallet] = await ethers.getSigners();
      const Factory = await ethers.getContractFactory('Factory');
      factory = await Factory.connect(factoryOwner).deploy();
      await factory.deployed();
      await factory.connect(escrowOwner).createContract();
      await factory.connect(escrowOwner).createContract();
      const allEscrowContracts = await factory.getAllContracts();
      escrow1 = new ethers.Contract(allEscrowContracts[0], escrowJson['abi'], escrowOwner);
      escrow2 = new ethers.Contract(allEscrowContracts[1], escrowJson['abi'], escrowOwner);
      await escrow1.deployed();
      await escrow2.deployed();
      await escrow1.connect(escrowOwner).initEscrow(seller.address, buyer.address, 20, 1000);
    });

    it('should initialize a new escrow1 with an escrowID of 0 and escrow2 uninitialized with escrowID of 1 ', async function() {
      escrowID = await escrow1.getEscrowID();
      expect(escrowID).to.equal(0);
      escrowID = await escrow2.getEscrowID();
      expect(escrowID).to.equal(1);
    });

    it('should give 10 eth of a deposit from the buyer', async function() {
      await escrow1.connect(buyer).depositToEscrow({value: parseEth(10)});
      escrowBalance = await ethers.provider.getBalance(escrow1.address);
      expect(escrowBalance.toString()).to.equal(parseEth(10));
    });

    it('should allow the buyer and the seller to approve escrow and escrow complete with 0 balance and escrow owner receives fee', async function() {
      await escrow1.connect(buyer).depositToEscrow({value: parseEth(10)});
      await escrow1.connect(seller).approveEscrow()
      await escrow1.connect(buyer).approveEscrow()
      state = await escrow1.checkEscrowStatus();
      expect(state).to.equal(4); // escrowComplete
      escrowBalance = await ethers.provider.getBalance(escrow1.address);
      ownerBalance = await ethers.provider.getBalance(escrowOwner.address);
      startBalance = await ethers.provider.getBalance(externalWallet.address);
      expect(escrowBalance).to.equal(0);
      // expect(ownerBalance).to.equal('10001982511686300534616'); // amount may vary
      expect(Number(ownerBalance)).to.be.above(Number(startBalance))
    });

    it('should allow the buyer and seller to cancel the escrow', async function() {
      await escrow1.connect(buyer).depositToEscrow({value: parseEth(10)});
      await escrow1.connect(seller).cancelEscrow();
      await escrow1.connect(buyer).cancelEscrow();
      state = await escrow1.checkEscrowStatus();
      expect(state).to.equal(5); // escrowCancelled
      escrowBalance = await ethers.provider.getBalance(escrow1.address);
      expect(escrowBalance).to.equal(0);
    });

  });

  describe('Escrow Failures', function () {

    beforeEach(async () => {
      [factoryOwner, escrowOwner, seller, buyer, externalWallet] = await ethers.getSigners();
      const Factory = await ethers.getContractFactory('Factory');
      factory = await Factory.connect(factoryOwner).deploy();
      await factory.deployed();
      await factory.connect(escrowOwner).createContract();
      await factory.connect(escrowOwner).createContract();
      const allEscrowContracts = await factory.getAllContracts();
      escrow1 = new ethers.Contract(allEscrowContracts[0], escrowJson['abi'], escrowOwner);
      escrow2 = new ethers.Contract(allEscrowContracts[1], escrowJson['abi'], escrowOwner);
      await escrow1.deployed();
      await escrow2.deployed();
      await escrow1.connect(escrowOwner).initEscrow(seller.address, buyer.address, 20, 1000);
      currentBlockNumber = await escrow1.getBlockNumber();
      await escrow2.connect(escrowOwner).initEscrow(seller.address, buyer.address, 20, Number(currentBlockNumber) + 3);
      await escrow2.connect(buyer).depositToEscrow({value: parseEth(10)});
    });
    
    it('only buyer can deposit to escrow', async function() {
      tx = externalWallet.sendTransaction({
        to: escrow1.address,  
        value: ethers.utils.parseEther('1')
      });
      await expect(tx).to.be.revertedWith('only buyer');

      await buyer.sendTransaction({
        to: escrow1.address,  
        value: parseEth(10)
      });
      escrowBalance = await ethers.provider.getBalance(escrow1.address);
      expect(escrowBalance).to.equal(parseEth(10));
    });

    it('external wallet should NOT be able to approve escrow', async function() {
      await escrow1.connect(buyer).depositToEscrow({value: parseEth(10)});
      await escrow1.connect(seller).approveEscrow()
      code = await escrow1.address.code;
      console.log
      state = await escrow1.checkEscrowStatus();
      expect(state).to.equal(2); // buyer deposited
      externalApprove = escrow1.connect(externalWallet).approveEscrow()
      await expect(externalApprove).to.be.revertedWith('only buyer or seller');
    });

    it('should NOT allow the escrow owner to end the escrow before its approved or cancelled', async function() {
      await escrow1.connect(buyer).depositToEscrow({value: parseEth(10)});
      endEscrow = escrow1.connect(externalWallet).endEscrow();
      await expect(endEscrow).to.be.revertedWith('not approved or cancelled');
      state = await escrow1.checkEscrowStatus();
      expect(state).to.equal(2); // buyerDeposited
    });

    it('only escrow owner should be able to end the escrow', async function() {
      await escrow1.connect(buyer).depositToEscrow({value: parseEth(10)});
      await escrow1.connect(seller).cancelEscrow();
      await escrow1.connect(buyer).cancelEscrow();
      endEscrow = escrow1.connect(externalWallet).endEscrow();
      await expect(endEscrow).to.be.revertedWith('only escrow owner');
    });

    it('should NOT be able to cancel escrow if the escrow is expired', async function() {
      buyerCancel = escrow2.connect(seller).cancelEscrow();
      sellerCancel = escrow2.connect(buyer).cancelEscrow();
      await expect(buyerCancel).to.be.revertedWith('escrow time has ended');
      await expect(sellerCancel).to.be.revertedWith('escrow time has ended');
    });

    it('ending the escrow destroys the escrow', async function() {
      await escrow1.connect(buyer).depositToEscrow({value: parseEth(10)});
      await escrow1.connect(seller).cancelEscrow();
      await escrow1.connect(buyer).cancelEscrow();
      await escrow1.connect(escrowOwner).endEscrow();
      esrowID = escrow1.getEscrowID()
      await expect(esrowID).to.be.reverted;
    });

  });  

});
