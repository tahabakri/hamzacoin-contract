// ============================================================================
// transfer.js
// ----------------------------------------------------------------------------
// Demonstrates sending HamzaCoin from one student/account to another.
// This is the real point of an ERC20 token: people can move it around.
//
// Run AFTER scripts/deploy.js, and make sure the CONTRACT_ADDRESS env var
// is set to the address that deploy.js printed.
//
//   PowerShell:  $env:CONTRACT_ADDRESS="0x..."
//   bash/macOS:  export CONTRACT_ADDRESS=0x...
//
//   npx hardhat run scripts/transfer.js --network localhost
//
// The script sends 100 HMZ from Hardhat account[0] (the deployer) to
// Hardhat account[1], then prints balances before and after.
// ============================================================================

const hre = require("hardhat");

async function main() {
    // ------------------------------------------------------------------------
    // 1. Make sure we know which contract to talk to
    // ------------------------------------------------------------------------
    const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
    if (!CONTRACT_ADDRESS) {
        console.error(
            "CONTRACT_ADDRESS env var is not set.\n" +
            "Deploy first (scripts/deploy.js), then set the env var to the printed address."
        );
        process.exit(1);
    }

    // ------------------------------------------------------------------------
    // 2. Grab two accounts — the sender and the recipient
    // ------------------------------------------------------------------------
    // Hardhat gives us 20 pre-funded test accounts on the local network.
    // account[0] is the same account that deployed the contract (so it has
    // the 50,000 HMZ supply). account[1] starts with 0 HMZ.
    const [sender, recipient] = await hre.ethers.getSigners();

    // ------------------------------------------------------------------------
    // 3. Attach to the already-deployed contract
    // ------------------------------------------------------------------------
    // getContractAt creates a JavaScript handle to a contract that's already
    // on the chain. We pass the contract name (so ethers knows which ABI to
    // use) and the address (where it lives on chain).
    const hamzaCoin = await hre.ethers.getContractAt("HamzaCoin", CONTRACT_ADDRESS);

    // Tiny helper so we don't keep repeating the formatting code.
    const fmt = (raw) => hre.ethers.formatUnits(raw, 18);

    // ------------------------------------------------------------------------
    // 4. Show balances BEFORE the transfer
    // ------------------------------------------------------------------------
    const senderBefore = await hamzaCoin.balanceOf(sender.address);
    const recipientBefore = await hamzaCoin.balanceOf(recipient.address);
    console.log("Before transfer:");
    console.log(`  Sender    (${sender.address}): ${fmt(senderBefore)} HMZ`);
    console.log(`  Recipient (${recipient.address}): ${fmt(recipientBefore)} HMZ`);

    // ------------------------------------------------------------------------
    // 5. Send the transfer
    // ------------------------------------------------------------------------
    // parseUnits("100", 18) -> 100 * 10^18, the integer the contract expects.
    // .transfer(...) calls the ERC20 transfer function inherited from
    // OpenZeppelin. By default, the contract call is signed by sender
    // (which is the first signer returned by getSigners()).
    const amount = hre.ethers.parseUnits("100", 18);
    console.log(`\nTransferring 100 HMZ from sender -> recipient...`);
    const tx = await hamzaCoin.transfer(recipient.address, amount);

    // .wait() blocks until the transaction is mined into a block.
    const receipt = await tx.wait();
    console.log(`Transaction mined in block ${receipt.blockNumber}`);
    console.log(`Tx hash: ${tx.hash}`);

    // ------------------------------------------------------------------------
    // 6. Show balances AFTER the transfer
    // ------------------------------------------------------------------------
    const senderAfter = await hamzaCoin.balanceOf(sender.address);
    const recipientAfter = await hamzaCoin.balanceOf(recipient.address);
    console.log("\nAfter transfer:");
    console.log(`  Sender    : ${fmt(senderAfter)} HMZ  (was ${fmt(senderBefore)})`);
    console.log(`  Recipient : ${fmt(recipientAfter)} HMZ  (was ${fmt(recipientBefore)})`);

    console.log("\nDone. Tokens moved on-chain — that's a real ERC20 transfer.");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
