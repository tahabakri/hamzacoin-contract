// ============================================================================
// check-balance.js
// ----------------------------------------------------------------------------
// Reads the HMZ balance of any address. Pure read-only — no transaction,
// no gas, no signature. Use this to verify that transfers actually moved
// tokens.
//
// Usage:
//   PowerShell:
//     $env:CONTRACT_ADDRESS="0x..."
//     $env:ADDRESS="0x..."
//     npx hardhat run scripts/check-balance.js --network localhost
//
//   bash/macOS:
//     export CONTRACT_ADDRESS=0x...
//     export ADDRESS=0x...
//     npx hardhat run scripts/check-balance.js --network localhost
//
// If ADDRESS is omitted, the script prints balances for the first two
// Hardhat accounts (the same sender/recipient used in transfer.js).
// ============================================================================

const hre = require("hardhat");

async function main() {
    const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
    if (!CONTRACT_ADDRESS) {
        console.error("CONTRACT_ADDRESS env var is not set. Set it to the address printed by deploy.js.");
        process.exit(1);
    }

    const hamzaCoin = await hre.ethers.getContractAt("HamzaCoin", CONTRACT_ADDRESS);
    const fmt = (raw) => hre.ethers.formatUnits(raw, 18);

    // If the user passed a specific ADDRESS, look up just that one.
    // Otherwise, show the first two Hardhat accounts as a quick overview.
    const explicit = process.env.ADDRESS;
    if (explicit) {
        const balance = await hamzaCoin.balanceOf(explicit);
        console.log(`Balance of ${explicit}: ${fmt(balance)} HMZ`);
        return;
    }

    const signers = await hre.ethers.getSigners();
    console.log("No ADDRESS set — showing the first two Hardhat accounts:\n");
    for (let i = 0; i < 2; i++) {
        const balance = await hamzaCoin.balanceOf(signers[i].address);
        console.log(`  account[${i}] ${signers[i].address}: ${fmt(balance)} HMZ`);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
