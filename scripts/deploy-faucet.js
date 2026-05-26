// ============================================================================
// deploy-faucet.js
// ----------------------------------------------------------------------------
// Deploys the HamzaFaucet contract.
//
// Reads from environment:
//   HMZ_CONTRACT_ADDRESS   = the deployed HamzaCoin (HMZ) contract address.
//                            For Sepolia: 0x619F30ec004442cdc3BE060FC927A3688054e6c3
//   TRUSTED_SIGNER_ADDRESS = the wallet whose signatures the faucet will trust.
//                            This MUST match the address derived from
//                            SIGNER_PRIVATE_KEY in hamzacoin-backend/.env.
//
// Example:
//   npx hardhat run scripts/deploy-faucet.js --network sepolia
//
// After the script prints the faucet address, set it as FAUCET_ADDRESS in
// your env, then run fund-faucet.js to seed the faucet with HMZ.
// ============================================================================

const hre = require("hardhat");

async function main() {
    const hmzAddress = process.env.HMZ_CONTRACT_ADDRESS;
    const signerAddress = process.env.TRUSTED_SIGNER_ADDRESS;

    if (!hmzAddress) {
        throw new Error(
            "HMZ_CONTRACT_ADDRESS is not set. Add it to your .env file."
        );
    }
    if (!signerAddress) {
        throw new Error(
            "TRUSTED_SIGNER_ADDRESS is not set. Add it to your .env file."
        );
    }

    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying HamzaFaucet with account:", deployer.address);
    console.log("  HMZ token address:    ", hmzAddress);
    console.log("  Trusted signer:       ", signerAddress);

    // Deploy the contract: constructor(_hmzToken, _trustedSigner)
    const HamzaFaucet = await hre.ethers.getContractFactory("HamzaFaucet");
    const faucet = await HamzaFaucet.deploy(hmzAddress, signerAddress);
    await faucet.waitForDeployment();

    const faucetAddress = await faucet.getAddress();
    console.log("\nHamzaFaucet deployed to:", faucetAddress);

    console.log("\nNext steps:");
    console.log("  1. Save the address above. Add it to your env as FAUCET_ADDRESS.");
    console.log("     PowerShell:");
    console.log(`       $env:FAUCET_ADDRESS=\"${faucetAddress}\"`);
    console.log("     bash:");
    console.log(`       export FAUCET_ADDRESS=${faucetAddress}`);
    console.log("");
    console.log("  2. Fund it with HMZ (default 1000):");
    console.log("       npx hardhat run scripts/fund-faucet.js --network sepolia");
    console.log("");
    console.log("  3. Put the same FAUCET_ADDRESS into:");
    console.log("       hamzacoin-backend/.env   as  FAUCET_CONTRACT_ADDRESS");
    console.log("       hamzacoin-react/.env     as  VITE_FAUCET_ADDRESS");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
