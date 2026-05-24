# HamzaCoin (HMZ)

A beginner-friendly **ERC20 token** project built with **Hardhat** and **OpenZeppelin**. The whole point is to learn how real crypto tokens work — by building one, deploying it to a local blockchain, and sending it between accounts.

| | |
|---|---|
| **Name** | HamzaCoin |
| **Symbol** | HMZ |
| **Total supply** | 50,000 HMZ (fixed — no more can ever be minted) |
| **Decimals** | 18 (standard, same as ETH) |
| **Standard** | ERC20 (EIP-20) |

---

## What is an ERC20 token?

ERC20 is the **standard interface** for fungible tokens on Ethereum and every Ethereum-compatible chain (Polygon, Arbitrum, Optimism, BNB Chain, etc.).

**Fungible** means every token is identical to every other token, the way every $1 bill is worth the same. (Compare to NFTs, where each token is unique.)

When a contract follows the ERC20 standard, any wallet (MetaMask, Trust Wallet, etc.) or exchange knows how to display it, transfer it, and let users approve other contracts to spend it. Famous ERC20 tokens include **USDC**, **DAI**, **UNI**, and **LINK**.

The standard interface includes:

| Function | What it does |
|---|---|
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

```
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

```
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

```
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

## Try this yourself

- Change the transfer amount in `scripts/transfer.js` from 100 to a number of your choice
- Add a **third recipient** by reading `signers[2]` in transfer.js and sending them tokens too
- Try sending **more tokens than you have** — the transaction will fail with `ERC20InsufficientBalance` (this is OpenZeppelin protecting you)
- Restart `npx hardhat node` and notice all balances reset — the local chain is ephemeral

---

## Common errors

| Error | Fix |
|---|---|
| `CONTRACT_ADDRESS env var is not set` | Run `$env:CONTRACT_ADDRESS="..."` (PowerShell) or `export CONTRACT_ADDRESS=...` (bash) first |
| `could not detect network` / `ECONNREFUSED 127.0.0.1:8545` | The local node isn't running. Open a terminal and run `npx hardhat node` |
| `nonce too high` | You restarted `npx hardhat node` but your wallet still remembers old transactions. Restart the node and re-deploy |
| `HH404: File @openzeppelin/contracts/... not found` | You forgot `npm install` |
| Compile error mentioning Solidity version | Check that `hardhat.config.js` says `solidity: "0.8.20"` |

---

## Project layout

```
crypto_class/
├── contracts/
│   └── HamzaCoin.sol          # the ERC20 smart contract
├── scripts/
│   ├── deploy.js              # deploy the contract
│   ├── transfer.js            # send 100 HMZ between two accounts
│   └── check-balance.js       # read any account's HMZ balance
├── hardhat.config.js          # Hardhat compiler + network config
├── package.json               # npm dependencies and scripts
├── .gitignore
└── README.md                  # this file
```

---

## What to learn next

1. **Write tests** — add a `test/` folder and write Chai assertions against your contract
2. **Deploy to a testnet** — try [Sepolia](https://sepolia.dev) (real public testnet, free fake ETH from a faucet)
3. **Hook it up to MetaMask** — import a Hardhat private key and watch your HMZ appear in your wallet
4. **Add metadata** — give your token a logo and description (ERC-712 / TokenLists)
5. **Explore ERC-721 (NFTs)** — same OpenZeppelin pattern, different standard

Have fun. Don't deploy to mainnet without learning a LOT more first — real money is on the line there.
