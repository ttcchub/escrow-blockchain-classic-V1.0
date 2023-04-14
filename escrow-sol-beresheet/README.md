# escrow DAPP

Built using npm 8.1.0 node v16.13.0

1. The frontend is built using `create-react-app`
   To start the frontend run

```shell
cd frontend, npm install, npm start
```

2. Start a [local node](https://hardhat.org/getting-started/#connecting-a-wallet-or-dapp-to-hardhat-network)
   Hardhat is a blockchain development toolkit used to compile your solidity files, run tests and run a local blockchain node. Open a new terminal and start the node.

```shell
npm install, npx hardhat node
```

3. Open a new terminal and deploy the smart contract in the `localhost` network

```shell
npx hardhat run --network localhost scripts/deploy.js
```

run tests

```shell
npx hardhat test test/escrow.js
```

### Helpful hardhat commands

to deploy locally

```shell
npx hardhat run --network localhost scripts/deploy.js
```

example hardhat commands

```shell
npx hardhat help
npx hardhat test
GAS_REPORT=true npx hardhat test
npx hardhat node
npx hardhat run scripts/deploy.js
```
