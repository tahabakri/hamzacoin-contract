// ============================================================================
// hardhat.config.js
// ----------------------------------------------------------------------------
// Configuration for Hardhat — the development environment we use to compile,
// deploy, and test Solidity smart contracts.
//
// Hardhat reads this file automatically every time you run `npx hardhat ...`.
// ============================================================================

// Loads the standard Hardhat plugin bundle. It includes:
//   - ethers v6              (talk to the blockchain in JS)
//   - chai + matchers        (assertions for tests)
//   - hardhat-network-helpers (time travel, snapshots, etc.)
//   - solidity-coverage      (test coverage reports)
//   - hardhat-verify         (verify source code on Etherscan)
// Requiring it here is what makes `hre.ethers` available in our scripts.
require("@nomicfoundation/hardhat-toolbox");

// Loads PRIVATE_KEY and SEPOLIA_RPC_URL from .env into process.env
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    // ------------------------------------------------------------------------
    // Solidity compiler version.
    // OpenZeppelin v5's newer files (EIP712, MessageHashUtils, Strings, Bytes)
    // require ^0.8.24. HamzaCoin.sol's `pragma ^0.8.20` is forward-compatible
    // with 0.8.24, so it still compiles unchanged.
    //
    // evmVersion: "cancun" — OpenZeppelin's Bytes.sol uses the `mcopy` opcode,
    // which only exists from the Cancun hard fork onwards. Sepolia mainnet has
    // been on Cancun since the Dencun upgrade in March 2024, so this is safe.
    // ------------------------------------------------------------------------
    solidity: {
        version: "0.8.24",
        settings: {
            evmVersion: "cancun",
        },
    },

    // ------------------------------------------------------------------------
    // Networks Hardhat knows how to talk to.
    // ------------------------------------------------------------------------
    // - `hardhat` is an in-memory, single-process blockchain that exists only
    //   for the duration of one Hardhat command. It's perfect for running
    //   tests, but anything you deploy disappears the moment the command
    //   ends.
    //
    // - `localhost` connects to a persistent node you start separately with
    //   `npx hardhat node`. Because the node keeps running, contracts you
    //   deploy STAY DEPLOYED across multiple `hardhat run` invocations —
    //   which is exactly what we need to deploy once and then run transfer
    //   scripts against it.
    // ------------------------------------------------------------------------
    networks: {
        hardhat: {
            // No URL needed — Hardhat spins this up in-process.
            // Default 10,000 fake ETH per test account.
        },
        localhost: {
            url: "http://127.0.0.1:8545",   // default JSON-RPC port for `hardhat node`
            // chainId is 31337 for the default hardhat node — usually
            // detected automatically, but we leave it implicit here.
        },
        sepolia: {
            url: process.env.SEPOLIA_RPC_URL || "",
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
            chainId: 11155111,
        },
    },
};
