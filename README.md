# Decentralized Crowdfunding Platform

This project is a decentralized crowdfunding application built on the Ethereum blockchain using smart contracts. It allows creators to define campaigns with milestone-based funding goals, and lets contributors vote on milestone completion before funds are released. The system aims to improve transparency, accountability, and user trust compared to traditional Web2 crowdfunding platforms by alllowing contributors to exercise more control over how their funds are used after they are donated.

## Features

- Campaign creation with title, funding goal, and milestone breakdown
- ETH contributions through MetaMask
- Milestone-based voting for fractional fund release
- Refunds for contributors if campaign goals are not met
- Fully on-chain logic for transparency and immutability

## Tech Stack

- **Smart Contracts:** Solidity, Hardhat, Hardhat Ignition
- **Frontend:** React (Vite), TypeScript, Ethers.js
- **Wallet Integration:** MetaMask
- **Development Network:** Hardhat local node

---

# How to Run it Yourself!

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [MetaMask](https://metamask.io/)
- [Git](https://git-scm.com/)
- [WSL 2](https://learn.microsoft.com/en-us/windows/wsl/about/)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

### 2. Initialize your Hardhat environment
```bash
npm install --save-dev hardhat
npm hardhat
```

### 3. Start a local Hardhat node and import accounts into MetaMask
```bash
# Terminal 1
npx hardhat node
```
It should print a list of test accounts and their private keys in the console. Copy one of the addresses and head over to the MetaMask extension. 
Click on your Account dropdown box at the top of the window, hit "Add Account...", import an account with "Private Key" and paste the private key you just copied.

You may have to add your localhost network to MetaMask for the accounts to properly connect to your local blockchain. Click the network tab at the top left, and add a custom network. Name the network "Localhost", set the RPC Link to "127.0.0.1:8545", set the Chain ID to "31337", and set the Currency Symbol to "ETH".

### 4. Deploy the CampaignFactory Contract
At this point, you will want to open a second terminal, since the first one is busy running the blockchain.
```bash
# Terminal 2
npx hardhat ignition deploy ignition/modules/CampaignFactory.ts
```
Copy the deployment address from the console once ignition has completed deployment.

### 5. Configure and run the frontend
Navigate to the App.tsx file at ```frontend/src/App.tsx``` and paste the deployment address at line 8.
Then, in the same terminal
```bash
# Terminal 2
cd frontend
npm run dev
```
The VITE app should begin to run and let you know what port to connect to and access the app! Open a browser and go to "http://localhost:xxxx" as displayed in the terminal.

### 6. Connect your MetaMask wallet and explore!
Once you access the webpage, you should be prompted to connect your MetaMask wallet. Select the account(s) you linked in Step 3. Now you should have full access to the project's functionality!

### 7. Reset the chain state
If you want to reset the app and clear the current campaigns, just hit Ctrl+C in the first terminal to shut down the hardhat node then reopen it with 
```bash
npm hardhat node
```
Then follow Steps 4-7 again. It is useful to have 3 terminals if you are continuously resetting the blockchain, so that you don't have to keep shutting down the React app.
