# HamzaCoin Smart Contracts

> Solidity + Hardhat half of a three-piece learning project: an ERC20 token (`HamzaCoin`) and a signature-gated faucet (`HamzaFaucet`) live on Ethereum Sepolia testnet.

![Solidity](https://img.shields.io/badge/Solidity-0.8.24-363636?logo=solidity&logoColor=white)
![Hardhat](https://img.shields.io/badge/Hardhat-2.22-f7dc6f?logo=hardhat&logoColor=black)
![OpenZeppelin](https://img.shields.io/badge/OpenZeppelin-v5-4e5ee4?logo=openzeppelin&logoColor=white)
![Network](https://img.shields.io/badge/Network-Sepolia_Testnet-7c3aed)
![Ethers.js](https://img.shields.io/badge/Ethers.js-v6-2535a0)
![License](https://img.shields.io/badge/License-MIT-green)

This repo is one of three. The others are at [hamzacoin-website](https://github.com/tahabakri/hamzacoin-website) (frontend + backend). All three are independent but work together when you run them end-to-end.

---

## What this is

Two smart contracts written in Solidity for Ethereum:

1. **`HamzaCoin`** — a standard ERC20 token (50,000 fixed supply, symbol `HMZ`, 18 decimals).
2. **`HamzaFaucet`** — a contract that pays out HMZ to users who submit a valid signed quiz score. Uses EIP-712 typed-data signatures so a backend server can certify scores off-chain and the contract checks the signature on-chain before paying.

Both are deployed on Sepolia (Ethereum's free public test network), built with Hardhat, and inherit from audited OpenZeppelin contracts.

---

## What you'll have when you're done

Follow this guide and you will have:

- Both contracts compiled and deployed to Sepolia under your own wallet
- A funded faucet that can pay out HMZ to anyone who presents a valid signature
- The backend (in the companion repo) running locally and signing scores with a wallet you control
- The frontend (in the companion repo) talking to your contracts in your browser
- Enough knowledge to fork this repo, rename the token, and ship your own coin

---

## Live demo

| Property | Value |
| --- | --- |
| **HamzaCoin (ERC20)** | `0x619F30ec004442cdc3BE060FC927A3688054e6c3` |
| **HamzaFaucet** | Deployed per-developer — your own copy after Step 2 |
| **Network** | Sepolia Testnet (chain ID `11155111`) |
| **Etherscan** | [sepolia.etherscan.io/address/0x619F30ec004442cdc3BE060FC927A3688054e6c3](https://sepolia.etherscan.io/address/0x619F30ec004442cdc3BE060FC927A3688054e6c3) |
| **Frontend + backend repo** | [github.com/tahabakri/hamzacoin-website](https://github.com/tahabakri/hamzacoin-website) |

Every HamzaCoin transfer, every claim, every balance is publicly visible on Sepolia Etherscan. That's the whole point of a blockchain — nothing is hidden.

To add HMZ to MetaMask: **Import Token** → paste the contract address → symbol `HMZ`, decimals `18`.

---

## Tech stack

| Layer | Tool | Version |
| --- | --- | --- |
| Language | Solidity | 0.8.24 |
| Toolchain | Hardhat | 2.22 |
| Audited base | OpenZeppelin Contracts | v5.0.2 |
| EVM target | Cancun | (Sepolia is on Cancun since March 2024) |
| Local JS | ethers.js | v6 (bundled with Hardhat toolbox) |

OpenZeppelin's `EIP712.sol` requires Solidity 0.8.24, so `hardhat.config.js` pins the compiler to 0.8.24 and the EVM to `cancun`. `HamzaCoin.sol` declares `pragma ^0.8.20` which is forward-compatible.

---

## Project architecture

```
┌─────────────────────────┐   wikipedia api   ┌─────────────────┐
│  hamzacoin-react        │ ────────────────▶ │  en.wikipedia   │
│  React + Vite + ethers  │ ◀──── article ──── │  (no key)       │
└────────┬────────────────┘                   └─────────────────┘
         │ POST /api/generate-quiz
         │ POST /api/verify-and-sign
         ▼
┌─────────────────────────┐    groq llama 3.3 ┌─────────────────┐
│  hamzacoin-backend      │ ────────────────▶ │   Groq API      │
│  Express + EIP-712      │ ◀──── 5 mcqs ──── │                 │
└────────┬────────────────┘                   └─────────────────┘
         │ signs (user, score, articleHash)
         ▼
┌─────────────────────────┐                   ┌─────────────────┐
│  user's MetaMask        │ ─── claimReward ─▶│ HamzaFaucet     │
│                         │                   │  (Sepolia)      │
└─────────────────────────┘                   └────────┬────────┘
                                                       │ transfer
                                                       ▼
                                               ┌─────────────────┐
                                               │ HamzaCoin ERC20 │
                                               │  (Sepolia)      │
                                               └─────────────────┘
```

This repo provides the two boxes on the right: the faucet and the token.

---

## How it actually works

1. **You connect MetaMask.** The frontend asks MetaMask for your wallet address and switches you to Sepolia.
2. **You pick a Wikipedia article.** Random, featured, or search.
3. **The backend asks Groq to make 5 questions.** It sends the article text to Groq's API and gets a JSON response with 5 multiple-choice questions. The backend keeps the correct answers private.
4. **You answer the questions.** One option per question, no time limit.
5. **The backend grades and signs.** It checks your answers against the cached correct ones, computes your score (0–5), and signs an EIP-712 message: "user X scored Y on article Z".
6. **You submit the signature to the smart contract.** Your wallet sends `claimReward(score, articleHash, signature)` to the faucet on Sepolia.
7. **The contract verifies and pays out.** `HamzaFaucet` recomputes the message hash, runs `ECDSA.recover` on the signature, and checks the recovered address equals the trusted signer. If yes, it marks the claim as used and transfers `score × 1 HMZ` from its balance to your wallet.
8. **Confetti fires.** The frontend listens for the transaction confirmation and celebrates.

---

## Prerequisites

| Tool | Why | How to install / check |
| --- | --- | --- |
| Node.js 18+ | Runs Hardhat | [nodejs.org](https://nodejs.org) → install LTS. Check: `node --version` |
| Git | Clone the repos | [git-scm.com](https://git-scm.com) → install. Check: `git --version` |
| MetaMask | Wallet that holds your test ETH | Browser extension from [metamask.io](https://metamask.io) |
| Sepolia ETH | Pays gas on the test network | Free from [faucet.alchemy.com](https://www.alchemy.com/faucets/ethereum-sepolia). You need about 0.05 SepoliaETH total to deploy both contracts. |
| Alchemy account (or Infura) | Free RPC endpoint to talk to Sepolia | [dashboard.alchemy.com](https://dashboard.alchemy.com) → Create App → Ethereum → Sepolia → copy HTTPS URL |
| VS Code (recommended) | Solidity + JS editor with extensions | [code.visualstudio.com](https://code.visualstudio.com) + the "Solidity" extension by Juan Blanco |

> Use a brand-new MetaMask account that has never held real money. Even on testnet, getting in the habit of separating dev keys from mainnet keys is the most important security lesson you can build.

---

## Step-by-step setup

This is a three-piece project. If you're starting from this repo, you still need to set up the other two. The full flow is below.

### Step 1: Clone all the repos

```bash
# in any working folder (e.g. C:/Users/you/dev/)
git clone https://github.com/tahabakri/crypto_class.git
git clone https://github.com/tahabakri/hamzacoin-website.git
```

After this you should have two folders side by side:

```text
your-dev-folder/
├── crypto_class/                  ← you are here
└── hamzacoin-website/
    ├── hamzacoin-react/           ← frontend
    └── hamzacoin-backend/         ← backend
```

### Step 2: Set up the contracts (this repo)

```bash
# in crypto_class/
npm install
```

Create your `.env` file from the template:

```bash
# in crypto_class/
cp .env.example .env       # macOS / Linux
copy .env.example .env     # Windows
```

Open `.env` and fill in:

| Variable | What it is | Where to get it |
| --- | --- | --- |
| `PRIVATE_KEY` | The 64-character hex private key of the wallet that will deploy contracts and own the faucet. | MetaMask → click your account name → **Account Details** → **Export Private Key**. Use a wallet with no real money on it. |
| `SEPOLIA_RPC_URL` | URL of an RPC node that can read/write Sepolia for you. | [dashboard.alchemy.com](https://dashboard.alchemy.com) → Create App → Ethereum → Sepolia → **View Key** → copy the HTTPS URL. |

Compile both contracts:

```bash
# in crypto_class/
npx hardhat compile
```

Expected output: `Compiled 20 Solidity files successfully (evm target: cancun).` (The high count is because OpenZeppelin pulls in many dependency files.)

Deploy `HamzaCoin` (the ERC20 token). **Skip this** if you want to reuse the existing live HamzaCoin at `0x619F30ec004442cdc3BE060FC927A3688054e6c3`:

```bash
# in crypto_class/
npx hardhat run scripts/deploy.js --network sepolia
```

Save the printed address. That's *your* HamzaCoin contract.

Now add two more values to `.env` for the faucet deployment:

| Variable | What it is | Value |
| --- | --- | --- |
| `HMZ_CONTRACT_ADDRESS` | Your HMZ token address from the deploy step above. | `0x...` from the previous command. (Or use the live one: `0x619F30ec004442cdc3BE060FC927A3688054e6c3`.) |
| `TRUSTED_SIGNER_ADDRESS` | The wallet whose signatures the faucet will trust. | If you use the same wallet for everything, paste your MetaMask address here. (This is the **public** address — *not* the private key.) |

Deploy the faucet:

```bash
# in crypto_class/
npx hardhat run scripts/deploy-faucet.js --network sepolia
```

Save the printed faucet address.

Fund the faucet with 1000 HMZ (default; override with `AMOUNT=`):

```bash
# in crypto_class/  (PowerShell)
$env:FAUCET_ADDRESS="0xYourFaucetAddress"
npx hardhat run scripts/fund-faucet.js --network sepolia

# in crypto_class/  (bash)
FAUCET_ADDRESS=0xYourFaucetAddress npx hardhat run scripts/fund-faucet.js --network sepolia
```

The script approves the faucet to pull 1000 HMZ from your wallet and then calls `depositTokens(1000 * 1e18)`. It prints the faucet's new balance.

#### Local development (optional)

If you want to play with Hardhat without spending Sepolia ETH, you can run a local in-memory blockchain instead:

```bash
# terminal 1, in crypto_class/
npx hardhat node

# terminal 2, in crypto_class/
npx hardhat run scripts/deploy.js --network localhost
npx hardhat run scripts/transfer.js --network localhost   # sends 100 HMZ between two of the 20 pre-funded test accounts
```

Hardhat prints 20 pre-funded accounts when the node starts. Any test you do here disappears when you stop the node.

### Step 3: Set up the backend

```bash
# in hamzacoin-website/hamzacoin-backend/
npm install
cp .env.example .env       # or `copy` on Windows
```

Fill in `.env`:

| Variable | What it is | Where to get it |
| --- | --- | --- |
| `GROQ_API_KEY` | Free API key for the LLM that writes the quiz. | [console.groq.com/keys](https://console.groq.com/keys) → Sign in → API Keys → Create API Key → copy. |
| `SIGNER_PRIVATE_KEY` | Private key of the wallet whose address matches the `TRUSTED_SIGNER_ADDRESS` you used when deploying the faucet. | Same export step as `PRIVATE_KEY` above. If you used your deployer wallet for both, this is the same string. |
| `FAUCET_CONTRACT_ADDRESS` | Your faucet address from Step 2. | The address printed by `deploy-faucet.js`. |

Start the backend:

```bash
# in hamzacoin-backend/
npm run dev
```

It listens on `http://localhost:3001`. Smoke test:

```bash
curl http://localhost:3001/health
```

You should see `{"ok":true, ...}`.

### Step 4: Set up the frontend

```bash
# in hamzacoin-website/hamzacoin-react/
npm install
cp .env.example .env
```

Fill in `.env`:

| Variable | What it is | Where to get it |
| --- | --- | --- |
| `VITE_BACKEND_URL` | Where your backend is running. | `http://localhost:3001` for local dev. |
| `VITE_FAUCET_ADDRESS` | Your faucet address from Step 2. | Same as `FAUCET_CONTRACT_ADDRESS` in the backend `.env`. |

Start the frontend:

```bash
# in hamzacoin-react/
npm run dev
```

Open `http://localhost:5173` in your browser.

### Step 5: Test the full flow

1. Connect MetaMask. The site asks to switch to Sepolia — accept.
2. Click **Learn & Earn** in the header.
3. Click **Random article** or pick a featured one (Blockchain, Bitcoin, etc.).
4. Read the article (or scroll to the bottom). When you reach the end, the **Start Quiz** button activates.
5. Answer the 5 questions. You can use keys `1–4` to select options.
6. Click **Grade my answers**. Wait a second while the backend grades and signs.
7. See your score — between 0 and 5.
8. Click **Claim X HMZ**.
9. MetaMask pops up. Confirm the transaction.
10. After ~15 seconds, the transaction confirms.
11. Confetti fires. Your HMZ balance updates. The Recent Moments feed shows your new earning.

### Step 6 (bonus): Deploy your own coin

This whole project is meant to be a template. To make your own coin, *e.g.* `AhmedCoin / AHM`:

1. Edit `contracts/HamzaCoin.sol`. Change the constructor's name and symbol strings, and (if you want) the `50000` total supply number.
2. Optionally rename the file to `AhmedCoin.sol` and the contract to `contract AhmedCoin is ERC20`.
3. Update the contract name string passed to `getContractFactory("HamzaCoin")` in `scripts/deploy.js`, `scripts/transfer.js`, `scripts/check-balance.js`, and `scripts/fund-faucet.js`.
4. `npx hardhat compile && npx hardhat run scripts/deploy.js --network sepolia`.
5. Update `VITE_CONTRACT_ADDRESS` in the frontend `.env` (or hardcode in `src/utils/constants.ts`).
6. Update `HMZ_CONTRACT_ADDRESS` in the backend `.env` if you want the faucet to pay out your new token.
7. Restart the backend and frontend.

The faucet contract itself doesn't care what token it pays — it just calls `transfer()` on whatever address is in `hmzToken`. So you can repoint the same faucet at a different ERC20 by deploying a fresh faucet with your new token address as the `_hmzToken` constructor argument.

---

## Folder structure

```text
crypto_class/
├── contracts/
│   ├── HamzaCoin.sol            # the ERC20 token
│   └── HamzaFaucet.sol          # EIP-712 signature-gated reward faucet
├── scripts/
│   ├── deploy.js                # deploy HMZ to local or Sepolia (--network flag)
│   ├── deploy-faucet.js         # deploy the faucet to Sepolia
│   ├── fund-faucet.js           # approve + deposit HMZ into the faucet
│   ├── transfer.js              # demo: send 100 HMZ between two accounts
│   └── check-balance.js         # read any account's HMZ balance
├── hardhat.config.js            # Hardhat compiler + network config (solc 0.8.24, cancun)
├── package.json
├── .env                         # your private key + RPC URL (gitignored — never commit)
├── .env.example
├── .gitignore
└── README.md                    # this file
```

---

## Common errors

| Error | What it means | Fix |
| --- | --- | --- |
| `HH404: File @openzeppelin/contracts/... not found` | You forgot to install dependencies. | `cd crypto_class && npm install` |
| Compile error mentioning Solidity version | Wrong compiler. | Check `hardhat.config.js` says `solidity: { version: "0.8.24", settings: { evmVersion: "cancun" } }`. |
| `insufficient funds` for gas on Sepolia | Your wallet has zero or near-zero Sepolia ETH. | Get free Sepolia ETH from [faucet.alchemy.com](https://www.alchemy.com/faucets/ethereum-sepolia). |
| `could not detect network` / `ECONNREFUSED 127.0.0.1:8545` | The local Hardhat node isn't running. | `npx hardhat node` in another terminal, *or* use `--network sepolia`. |
| `nonce too high` | MetaMask remembers transactions from an old local node. | MetaMask → Settings → Advanced → **Clear activity tab data**. |
| `Invalid signature` (contract revert during claim) | The backend's `SIGNER_PRIVATE_KEY` doesn't match the `trustedSigner` address you passed when deploying the faucet. | Either redeploy the faucet with the correct signer, or update the backend `.env` to the matching key. |
| `Already claimed` (contract revert) | You already claimed for this exact article. | Pick a different article. One claim per `(user, articleHash)` pair. |
| `HMZ transfer failed` | The faucet has no HMZ left. | Re-run `scripts/fund-faucet.js`. |

---

## Security warnings

- **Never push your `.env` file to GitHub.** The `.gitignore` already excludes it, but always double-check `git status` before committing.
- **Never paste your private key into a chat with an AI assistant, support form, Discord channel, or Telegram group.** No one legitimate needs your private key, ever.
- **Use a fresh wallet for development.** Create a new MetaMask account that has no real mainnet money on it. Use *that* key for `PRIVATE_KEY` and `SIGNER_PRIVATE_KEY`.
- **This is a testnet project.** HMZ has no monetary value. Sepolia ETH is free from faucets. Nothing here is real money.
- **`SIGNER_PRIVATE_KEY` controls who can mint rewards.** Anyone who has it can sign valid claims for any score for any user. Treat it as secret as the deployer key. If you suspect it's leaked, redeploy or call `setTrustedSigner` with a fresh wallet.
- **Fund the faucet only with what you're prepared to lose.** Even on testnet, a misconfigured signer key can drain the full balance.

---

## What I learned building this

- **ERC20 standard** — what `transfer`, `balanceOf`, `approve`, `transferFrom` actually do; what `decimals()` means; why fixed-supply tokens use the constructor `_mint`.
- **OpenZeppelin v5 inheritance** — `ERC20`, `Ownable(initialOwner)`, `EIP712("name", "version")` constructor patterns.
- **EIP-712 typed data** — how a contract signs *structured* data so the wallet pop-up is readable, the typehash, the domain separator, and how `_hashTypedDataV4` ties it all together.
- **ECDSA signature recovery** — `ECDSA.recover(digest, signature)` and why the signer can only ever sign the *exact* tuple `(user, score, articleHash)` for this exact contract on this exact chain.
- **Checks-Effects-Interactions** — why `claimed[claimId] = true` happens *before* the token transfer, to defeat re-entrancy.
- **Hardhat workflow** — `npx hardhat compile`, `node`, `run scripts/*.js --network`, `getContractFactory`, `getContractAt`, `waitForDeployment`.
- **Solidity 0.8.24 + Cancun EVM** — bumping the compiler past 0.8.20 because OpenZeppelin's newer files use `mcopy`, and pinning `evmVersion: "cancun"` so the bytecode targets a hard fork Sepolia supports.

---

## How to use this as a template for your own coin

1. Fork all the repos on GitHub: `crypto_class`, `hamzacoin-website`.
2. Pick your coin's name and symbol — for example, `AhmedCoin` with symbol `AHM`.
3. In this repo, edit `contracts/HamzaCoin.sol`:
   - Rename the contract: `contract AhmedCoin is ERC20`
   - Change `ERC20("HamzaCoin", "HMZ")` to `ERC20("AhmedCoin", "AHM")`
   - Optionally change the supply: `_mint(msg.sender, 100000 * 10 ** decimals());`
4. Rename the file to `AhmedCoin.sol` and update all `getContractFactory("HamzaCoin")` and `getContractAt("HamzaCoin", ...)` calls in `scripts/` to `"AhmedCoin"`.
5. In the frontend, update `src/utils/constants.ts` → `CONTRACT_ADDRESS` to your deployed token address.
6. Optionally retheme the frontend: `tailwind.config.js` has a `coffee` color palette that runs through every component. Rename it (e.g. `to "sand"`, `"forest"`, `"ocean"`) and update the hex values; the whole site re-themes.
7. Update each `package.json` `name` field and each `README.md` so the repos describe your project.
8. Redeploy your contracts and put the new addresses into the frontend and backend `.env` files.

The faucet contract can be reused without changes — its constructor takes the token address as an argument, so the same compiled bytecode works for any ERC20.

---

## License

[MIT](LICENSE) — use it, change it, ship something cool.

---

## Credits

- Built by [Taha Bakri](https://github.com/tahabakri) as a learning project.
- Bitcoin whitepaper — Satoshi Nakamoto (2008).
- [OpenZeppelin Contracts](https://github.com/OpenZeppelin/openzeppelin-contracts) for the audited ERC20 and EIP-712 base classes.
- [Hardhat](https://hardhat.org) for the dev toolchain.
- [Wikipedia](https://www.wikipedia.org) for the article content the quiz pulls from (CC BY-SA).

---

## Companion repos

- **This repo (contracts)**: [github.com/tahabakri/crypto_class](https://github.com/tahabakri/crypto_class)
- **Frontend + backend monorepo**: [github.com/tahabakri/hamzacoin-website](https://github.com/tahabakri/hamzacoin-website)
  - `hamzacoin-react/` — React + Vite + ethers v6 dApp
  - `hamzacoin-backend/` — Express + Groq + EIP-712 signer
