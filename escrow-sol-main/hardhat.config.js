require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
const privateKey = process.env.PRIVATE_KEY || "";
const berePrivateKey = process.env.BERESHEET_PRIVATE_KEY || "";


task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});


/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.15",
  defaultNetwork: "hardhat",
  networks: {
    // hardhat: {
    //   gas: 2100000,
    //   gasPrice: 8000000000
    // },
    goerli: {
      url: `https://eth-goerli.alchemyapi.io/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts: [`0x${privateKey}`],
    },
    beresheet: {
      url: `https://beresheet-evm.jelliedowl.net`,
      chainId: 2022,
      accounts: [berePrivateKey],
    },
  }
}