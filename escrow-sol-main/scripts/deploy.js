// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  // const ESCROW_OWNER = escrowOwner;
  // const [escrowOwner, seller, buyer, externalWallet] = await hre.ethers.getSigners();

  const Factory = await hre.ethers.getContractFactory("Factory");
  const factory = await Factory.deploy();

  await factory.deployed();
  console.log("Contract address:", factory.address);

  saveFrontendFiles(factory);
}

// the magical code that links your contract to the frontend
function saveFrontendFiles(contract) {
  const fs = require("fs");
  const contractsDir = __dirname + "/../frontend/src/abis";

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    contractsDir + "/contract-address.json",
    JSON.stringify({ Factory: contract.address }, undefined, 2)
  );

  const FactoryArtifact = hre.artifacts.readArtifactSync("Factory");

  fs.writeFileSync(
    contractsDir + "/Factory.json",
    JSON.stringify(FactoryArtifact, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });