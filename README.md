# HamzaCoin (HMZ)

A beginner-friendly **ERC20 token** project built with **Hardhat** and **OpenZeppelin**. The whole point is to learn how real crypto tokens work — by building one, deploying it to a local blockchain, and sending it between accounts.

![Solidity](https://img.shields.io/badge/Solidity-0.8.20-363636?logo=solidity&logoColor=white)
![Hardhat](https://img.shields.io/badge/Hardhat-2.22-f7dc6f?logo=hardhat&logoColor=black)
![OpenZeppelin](https://img.shields.io/badge/OpenZeppelin-v5-4e5ee4?logo=openzeppelin&logoColor=white)
![Network](https://img.shields.io/badge/Network-Sepolia_Testnet-7c3aed)
![Ethers.js](https://img.shields.io/badge/Ethers.js-v6-2535a0)

| Property | Value |
| --- | --- |
| **Name** | HamzaCoin |
| **Symbol** | HMZ |
| **Total supply** | 50,000 HMZ (fixed — no more can ever be minted) |
| **Decimals** | 18 (standard, same as ETH) |
| **Standard** | ERC20 (EIP-20) |

---

## Live on Sepolia

HamzaCoin is deployed and live on the Sepolia public testnet. You can interact with it right now — no local setup needed.

| Property | Value |
| --- | --- |
| **Contract address** | `0x619F30ec004442cdc3BE060FC927A3688054e6c3` |
| **Network** | Sepolia Testnet (chain ID 11155111) |
| **Total supply** | 50,000 HMZ |
| **Etherscan** | [View on Sepolia Etherscan](https://sepolia.etherscan.io/address/0x619F30ec004442cdc3BE060FC927A3688054e6c3) |

Every transaction, every balance, every transfer is publicly verifiable on the block explorer above. That's the whole point of a blockchain — nothing is hidden.

To add HMZ to MetaMask: **Import Token** → paste the contract address → symbol `HMZ`, decimals `18`.

---

## Frontend dApp

There's a React + TypeScript + Web3 dApp that connects to this contract:

**[github.com/tahabakri/hamzacoin-website](https://github.com/tahabakri/hamzacoin-website)**

It lets you connect your MetaMask wallet, check your HMZ balance, and send tokens — all from a browser, talking directly to the Sepolia contract above.

---

## What is an ERC20 token?

ERC20 is the **standard interface** for fungible tokens on Ethereum and every Ethereum-compatible chain (Polygon, Arbitrum, Optimism, BNB Chain, etc.).

**Fungible** means every token is identical to every other token, the way every $1 bill is worth the same. (Compare to NFTs, where each token is unique.)

When a contract follows the ERC20 standard, any wallet (MetaMask, Trust Wallet, etc.) or exchange knows how to display it, transfer it, and let users approve other contracts to spend it. Famous ERC20 tokens include **USDC**, **DAI**, **UNI**, and **LINK**.

The standard interface includes:

| Function | What it does |
| --- | --- |
| `balanceOf(address)` | How many tokens `address` owns |
| `transfer(to, amount)` | Send `amount` tokens from you to `to` |
| `approve(spender, amount)` | Allow `spender` to move up to `amount` of your tokens |
| `transferFrom(from, to, amount)` | Move pre-approved tokens on someone's behalf |
| `totalSupply()` | Total tokens that exist |

## What is Hardhat?

[Hardhat](https://hardhat.org) is a developer toolkit for Ethereum. It gives you:

- A **local in-memory blockchain** that boots in 1 second
- **20 pre-funded test accounts** with fake ETH for gas
- A **compiler** for Solidity (`.sol`) files
- A **task runner** for deploy and interaction scripts
- A **testing framework** if you want to write automated tests

You write Solidity, hit a command, and Hardhat handles compilation and deployment.

---

## Prerequisites

- **Node.js 18 or newer** ([download](https://nodejs.org))
- **npm** (comes bundled with Node)

Check you have them:

```powershell
node --version
npm --version
```

---

## Setup

From this folder:

```powershell
npm install
```

This downloads Hardhat, OpenZeppelin, ethers, and everything else into a `node_modules/` folder. Expect it to take 30-60 seconds.

---

## Step 1 — Compile the contract

```powershell
npx hardhat compile
```

You should see:

```text
Compiled 1 Solidity file successfully
```

If you get errors, check `contracts/HamzaCoin.sol` for typos.

---

## Step 2 — Start your local blockchain

Open a new terminal window and run:

```powershell
npx hardhat node
```

Hardhat will print 20 fake accounts and their private keys, then sit there listening on `http://127.0.0.1:8545`. **Leave this terminal running** — it's your blockchain.

---

## Step 3 — Deploy the contract

Open a **second terminal** (keep the node running in the first one) and run:

```powershell
npx hardhat run scripts/deploy.js --network localhost
```

You'll see something like:

```text
Deploying contracts with account: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
HamzaCoin deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
Deployer balance: 50000.0 HMZ
```

**Copy the contract address** — you'll need it in the next step.

---

## Step 4 — Send tokens to another account

First, store the contract address in an environment variable so the script can find it:

**PowerShell** (Windows):

```powershell
$env:CONTRACT_ADDRESS="0x5FbDB2315678afecb367f032d93F642f64180aa3"
```

**bash / macOS / Linux**:

```bash
export CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
```

Then run the transfer:

```powershell
npx hardhat run scripts/transfer.js --network localhost
```

Expected output:

```text
Before transfer:
  Sender    (0xf39F...): 50000.0 HMZ
  Recipient (0x7099...): 0.0 HMZ

Transferring 100 HMZ from sender -> recipient...
Transaction mined in block 2
Tx hash: 0xabc...

After transfer:
  Sender    : 49900.0 HMZ  (was 50000.0)
  Recipient : 100.0 HMZ    (was 0.0)
```

The tokens are now on the local blockchain. **You just sent your first ERC20 transfer.**

---

## Step 5 — Verify balances

Anytime you want to check what an account holds, run:

```powershell
npx hardhat run scripts/check-balance.js --network localhost
```

By default it prints balances for the first two Hardhat accounts. To check a specific address:

**PowerShell:**

```powershell
$env:ADDRESS="0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
npx hardhat run scripts/check-balance.js --network localhost
```

**bash:**

```bash
ADDRESS=0x70997970C51812dc3A010C7d01b50e0d17dc79C8 \
  npx hardhat run scripts/check-balance.js --network localhost
```

---

## Deploying to Sepolia (real public testnet)

Once you've got the local flow working, deploying to Sepolia is only a few extra steps. Sepolia is a public Ethereum testnet — transactions are real and permanent, but the ETH is worthless fake money you get from a faucet.

### 1. Get a free Alchemy RPC URL

Alchemy gives you a free API endpoint to talk to Sepolia without running your own node.

1. Go to [dashboard.alchemy.com](https://dashboard.alchemy.com) and create a free account
2. Click **Create App** → choose **Ethereum** and **Sepolia** as the network
3. Open the app → **View Key** → copy the **HTTPS** URL — it looks like:
   `https://eth-sepolia.g.alchemy.com/v2/your_api_key_here`

### 2. Get your wallet's private key

1. Open MetaMask → click your account name → **Account Details** → **Export Private Key**
2. Enter your MetaMask password to reveal it
3. Copy it — it's a 64-character hex string

> Use a wallet you created just for testing. Never use a wallet that holds real money.

### 3. Get free Sepolia ETH

You need a tiny amount of SepoliaETH to pay gas fees.

- [faucet.alchemy.com](https://www.alchemy.com/faucets/ethereum-sepolia) — paste your wallet address, claim free ETH
- [sepoliafaucet.com](https://sepoliafaucet.com) — backup option

### 4. Create your `.env` file

Create a file called `.env` in the project root (it's already in `.gitignore` so it won't be committed):

```env
PRIVATE_KEY=your_64_character_private_key_no_0x_prefix
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your_api_key_here
```

### 5. Deploy

```powershell
npx hardhat run scripts/deploy.js --network sepolia
```

You'll get a contract address back. Paste it into [sepolia.etherscan.io](https://sepolia.etherscan.io) and you'll see your contract live on a real public blockchain.

---

## Try this yourself

- Change the transfer amount in `scripts/transfer.js` from 100 to a number of your choice
- Add a **third recipient** by reading `signers[2]` in transfer.js and sending them tokens too
- Try sending **more tokens than you have** — the transaction will fail with `ERC20InsufficientBalance` (this is OpenZeppelin protecting you)
- Restart `npx hardhat node` and notice all balances reset — the local chain is ephemeral

---

## Common errors

| Error | Fix |
| --- | --- |
| `CONTRACT_ADDRESS env var is not set` | Run `$env:CONTRACT_ADDRESS="..."` (PowerShell) or `export CONTRACT_ADDRESS=...` (bash) first |
| `could not detect network` / `ECONNREFUSED 127.0.0.1:8545` | The local node isn't running. Open a terminal and run `npx hardhat node` |
| `nonce too high` | You restarted `npx hardhat node` but your wallet still remembers old transactions. Restart the node and re-deploy |
| `HH404: File @openzeppelin/contracts/... not found` | You forgot `npm install` |
| Compile error mentioning Solidity version | Check that `hardhat.config.js` says `solidity: "0.8.20"` |
| `insufficient funds` on Sepolia | Your wallet needs SepoliaETH for gas — grab some from [faucet.alchemy.com](https://www.alchemy.com/faucets/ethereum-sepolia) |

---

## Project layout

```text
crypto_class/
├── contracts/
│   └── HamzaCoin.sol          # the ERC20 smart contract
├── scripts/
│   ├── deploy.js              # deploy to local or Sepolia (--network flag)
│   ├── transfer.js            # send 100 HMZ between two accounts
│   └── check-balance.js       # read any account's HMZ balance
├── hardhat.config.js          # Hardhat compiler + network config
├── package.json               # npm dependencies and scripts
├── .env                       # your private key + RPC URL (gitignored — never commit this)
├── .gitignore
└── README.md                  # this file
```

---

## What to learn next

1. **Write tests** — add a `test/` folder and write Chai assertions against your contract
2. **Verify on Etherscan** — use `npx hardhat verify` to publish your source code publicly
3. **Hook it up to MetaMask** — import a Hardhat private key and watch your HMZ appear in your wallet
4. **Build a frontend** — check out the [hamzacoin-website](https://github.com/tahabakri/hamzacoin-website) dApp for an example
5. **Explore ERC-721 (NFTs)** — same OpenZeppelin pattern, different standard

Have fun. Don't deploy to mainnet without learning a LOT more first — real money is on the line there.
