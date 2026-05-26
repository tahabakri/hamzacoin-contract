// ============================================================================
// fund-faucet.js
// ----------------------------------------------------------------------------
// Funds the HamzaFaucet with HMZ tokens.
//
// Two on-chain steps are required to move ERC20 tokens INTO another contract:
//   1. The owner calls hmzToken.approve(faucet, amount) — "I allow the faucet
//                                                         to pull up to `amount` from me."
//   2. The owner calls faucet.depositTokens(amount)     — the faucet uses its
//                                                         allowance to pull tokens in.
//
// This script does both in sequence.
//
// Reads from environment:
//   HMZ_CONTRACT_ADDRESS = HamzaCoin token address.
//   FAUCET_ADDRESS       = HamzaFaucet address printed by deploy-faucet.js.
//   AMOUNT               = how many whole HMZ to deposit (default 1000).
//
// Example:
//   $env:FAUCET_ADDRESS="0x..."
//   $env:AMOUNT="500"
//   npx hardhat run scripts/fund-faucet.js --network sepolia
// ============================================================================

const hre = require("hardhat");

async function main() {
    const hmzAddress = process.env.HMZ_CONTRACT_ADDRESS;
    const faucetAddress = process.env.FAUCET_ADDRESS;
    const amountWhole = process.env.AMOUNT || "1000";

    if (!hmzAddress) throw new Error("HMZ_CONTRACT_ADDRESS is not set.");
    if (!faucetAddress) throw new Error("FAUCET_ADDRESS is not set.");

    const [owner] = await hre.ethers.getSigners();
    console.log("Funding faucet from account:", owner.address);
    console.log("  HMZ token:   ", hmzAddress);
    console.log("  Faucet:      ", faucetAddress);
    console.log("  Amount:      ", amountWhole, "HMZ");

    // Attach to the existing HMZ token + faucet.
    const hmz = await hre.ethers.getContractAt("HamzaCoin", hmzAddress);
    const faucet = await hre.ethers.getContractAt("HamzaFaucet", faucetAddress);

    // Convert "1000" -> 1000 * 10^18 (raw integer that the contract understands).
    const decimals = await hmz.decimals();
    const amount = hre.ethers.parseUnits(amountWhole, decimals);

    // Pre-flight: make sure the owner actually has enough HMZ to deposit.
    const ownerBal = await hmz.balanceOf(owner.address);
    if (ownerBal < amount) {
        throw new Error(
            `Insufficient HMZ. Owner has ${hre.ethers.formatUnits(ownerBal, decimals)} HMZ, tried to deposit ${amountWhole}.`
        );
    }

    // Step 1: approve.
    console.log("\nApproving faucet to spend HMZ...");
    const approveTx = await hmz.approve(faucetAddress, amount);
    await approveTx.wait();
    console.log("  approve tx:", approveTx.hash);

    // Step 2: deposit.
    console.log("\nDepositing HMZ into the faucet...");
    const depositTx = await faucet.depositTokens(amount);
    await depositTx.wait();
    console.log("  depositTokens tx:", depositTx.hash);

    // Confirm the faucet's new balance.
    const newBalance = await hmz.balanceOf(faucetAddress);
    console.log(
        "\nFaucet balance now:",
        hre.ethers.formatUnits(newBalance, decimals),
        "HMZ"
    );

    console.log("\nDone. Users with a valid signature can now claim rewards.");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
