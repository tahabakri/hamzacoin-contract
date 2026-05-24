// ============================================================================
// deploy.js
// ----------------------------------------------------------------------------
// This script deploys the HamzaCoin contract to whatever blockchain network
// you point Hardhat at with the --network flag.
//
// Examples:
//   npx hardhat run scripts/deploy.js                       (uses the in-memory hardhat network — wiped after the script ends)
//   npx hardhat run scripts/deploy.js --network localhost   (uses the local node started with `npx hardhat node`)
//
// IMPORTANT: when deploying to `localhost`, you must already have a separate
// terminal running `npx hardhat node`. That node hosts the local blockchain
// and stays alive between script runs, so the deployed contract is still
// there when you run scripts/transfer.js afterwards.
// ============================================================================

// `hre` stands for "Hardhat Runtime Environment". It is automatically
// available in any Hardhat script. We pull `ethers` out of it — ethers is
// the standard JavaScript library for talking to Ethereum-style chains.
const hre = require("hardhat");

async function main() {
    // ------------------------------------------------------------------------
    // 1. Get the deployer account
    // ------------------------------------------------------------------------
    // getSigners() returns the list of accounts Hardhat is managing. On the
    // local Hardhat network, the first 20 accounts come pre-loaded with
    // 10,000 fake ETH each. We use the first one as the deployer.
    const [deployer] = await hre.ethers.getSigners();

    console.log("Deploying contracts with account:", deployer.address);

    // ------------------------------------------------------------------------
    // 2. Get the contract "factory"
    // ------------------------------------------------------------------------
    // A ContractFactory is an object that knows how to deploy a particular
    // contract. The string "HamzaCoin" must match the contract name in
    // contracts/HamzaCoin.sol.
    const HamzaCoin = await hre.ethers.getContractFactory("HamzaCoin");

    // ------------------------------------------------------------------------
    // 3. Deploy the contract
    // ------------------------------------------------------------------------
    // .deploy() sends the deployment transaction. Our constructor takes no
    // arguments, so we call it with empty parentheses. We then wait for the
    // transaction to be mined into a block (waitForDeployment).
    const hamzaCoin = await HamzaCoin.deploy();
    await hamzaCoin.waitForDeployment();

    const contractAddress = await hamzaCoin.getAddress();
    console.log("HamzaCoin deployed to:", contractAddress);

    // ------------------------------------------------------------------------
    // 4. Confirm the deployer received the entire initial supply
    // ------------------------------------------------------------------------
    // The contract minted 50,000 HMZ to msg.sender in the constructor —
    // msg.sender during deployment is the deployer. Let's verify.
    //
    // balanceOf returns the raw integer balance (with 18 decimals baked in).
    // ethers.formatUnits(value, 18) converts it back to a human-readable
    // string like "50000.0".
    const balance = await hamzaCoin.balanceOf(deployer.address);
    console.log(
        "Deployer balance:",
        hre.ethers.formatUnits(balance, 18),
        "HMZ"
    );

    console.log("\nNext step:");
    console.log("  Copy the contract address above, then run:");
    console.log(`    $env:CONTRACT_ADDRESS="${contractAddress}"      (PowerShell)`);
    console.log(`    export CONTRACT_ADDRESS=${contractAddress}      (bash / macOS)`);
    console.log("  npx hardhat run scripts/transfer.js --network localhost");
}

// Run main() and force the process to exit with code 1 on failure, so CI
// systems and shells correctly register that something went wrong.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
