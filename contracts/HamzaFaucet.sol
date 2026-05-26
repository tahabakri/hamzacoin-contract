// ============================================================================
// HamzaFaucet.sol
// ----------------------------------------------------------------------------
// This contract is the on-chain piece of the "Learn & Earn HMZ" feature.
//
// THE STORY
// ----------
// A user reads a Wikipedia article on the website, then takes a 5-question
// quiz. The website's backend grades the quiz and signs a short message that
// says, in effect:
//
//     "I, the trusted signer, confirm that user 0xABC...
//      scored S out of 5 on the article whose text hashes to H."
//
// The user takes that signed message to THIS contract and calls claimReward.
// The contract:
//
//   1. checks the signature is from the trusted signer (so the user can't
//      forge their own score),
//   2. checks the user hasn't already claimed for this article,
//   3. pays out S * 1 HMZ from the faucet's HMZ balance.
//
// WHY DO IT THIS WAY?
// -------------------
// The score is computed off-chain (in the backend, after grading the quiz)
// because running an LLM and grading text inside a smart contract would be
// impossibly expensive. But we still want the PAYMENT to live on-chain —
// trustless, public, and verifiable by anyone. The EIP-712 signature is the
// bridge: the backend stays in control of WHAT counts as a win, while the
// contract stays in control of WHO gets paid and HOW MUCH.
//
// This is the same pattern that NFT mint allow-lists, Optimism's airdrop
// claims, and many gasless meta-transactions use.
// ============================================================================


// SPDX-License-Identifier: MIT
//
// ^ Every Solidity file should declare a software license. MIT is permissive.


pragma solidity ^0.8.20;
//
// ^ Same compiler version as HamzaCoin.sol. OpenZeppelin v5 requires >= 0.8.20.


// ----------------------------------------------------------------------------
// IMPORTS — three small, audited pieces from OpenZeppelin
// ----------------------------------------------------------------------------
// IERC20    — the interface that all ERC20 tokens (including HamzaCoin)
//             expose. We call balanceOf, transfer, and transferFrom on it.
// ECDSA     — the math for recovering an Ethereum address from a signature.
//             "Given the message that was signed and the signature bytes,
//             return the address whose private key signed it."
// EIP712    — implements the "EIP-712 typed data" hashing standard, so that
//             what the user signs in their wallet looks like a structured
//             object ("you are claiming 5 HMZ for article 0xABC...") instead
//             of a meaningless blob of bytes. The wallet pop-up is readable.
// Ownable   — gives us an `onlyOwner` modifier for admin functions (fund,
//             rotate signer, withdraw).
// ----------------------------------------------------------------------------
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


// ----------------------------------------------------------------------------
// THE CONTRACT
// ----------------------------------------------------------------------------
// "is EIP712, Ownable" means we INHERIT from both:
//   - EIP712  gives us _hashTypedDataV4(structHash) which does all the
//             domain-separator math for us
//   - Ownable gives us `onlyOwner` and `owner()`
// ----------------------------------------------------------------------------
contract HamzaFaucet is EIP712, Ownable {

    // ------------------------------------------------------------------------
    // STATE
    // ------------------------------------------------------------------------

    // The HamzaCoin (HMZ) token this faucet pays out.
    // `immutable` means: assigned exactly once in the constructor, then frozen
    // for the life of the contract. Cheaper gas than a normal storage slot.
    IERC20 public immutable hmzToken;

    // The address whose signatures this contract accepts. Set in the
    // constructor; can be rotated by the owner via setTrustedSigner().
    // In practice this will be the backend server's signing wallet.
    address public trustedSigner;

    // Tracks which (user, article) pairs have already been paid out, so the
    // same user can't claim the same article twice.
    //   key   = keccak256(abi.encodePacked(user, articleHash))
    //   value = true once paid
    mapping(bytes32 => bool) public claimed;

    // ------------------------------------------------------------------------
    // CONSTANTS
    // ------------------------------------------------------------------------

    // The maximum score (5 questions in the quiz).
    uint8 public constant MAX_SCORE = 5;

    // How many HMZ a user earns per correct answer.
    // `1 ether` is Solidity shorthand for 10^18, which is the standard
    // "one whole token" amount for an 18-decimal ERC20 like HMZ.
    uint256 public constant REWARD_PER_POINT = 1 ether;

    // EIP-712 typehash for the Claim struct.
    //
    // WHAT IS A TYPEHASH?
    //   It's the keccak256 of the canonical string describing the struct.
    //   It uniquely identifies the SHAPE of data we're signing, so a
    //   signature for one struct type can never be replayed as a signature
    //   for a different struct type, even by accident.
    //
    // The string below MUST match — byte-for-byte — the `types` object the
    // backend uses when it calls ethers.signTypedData. Whitespace matters.
    bytes32 private constant CLAIM_TYPEHASH = keccak256(
        "Claim(address user,uint8 score,bytes32 articleHash)"
    );


    // ------------------------------------------------------------------------
    // EVENTS
    // ------------------------------------------------------------------------
    // Events are how smart contracts "log" things. They don't change state —
    // they just emit a record that front-ends and indexers can subscribe to.
    // `indexed` parameters become searchable filters on block explorers.

    event RewardClaimed(
        address indexed user,
        uint8 score,
        bytes32 indexed articleHash,
        uint256 reward
    );

    event TokensDeposited(address indexed from, uint256 amount);

    event SignerUpdated(address indexed oldSigner, address indexed newSigner);

    event RemainingWithdrawn(address indexed to, uint256 amount);


    // ------------------------------------------------------------------------
    // CONSTRUCTOR
    // ------------------------------------------------------------------------
    //   _hmzToken      = address of the deployed HamzaCoin contract
    //   _trustedSigner = address whose signatures this faucet will trust
    //
    // We call two parent constructors:
    //   EIP712("HamzaFaucet", "1") locks in the domain name and version,
    //                              which become part of every signed message
    //                              so a signature for THIS contract can never
    //                              be replayed against any other contract.
    //   Ownable(msg.sender)        sets the deployer as the initial owner.
    // ------------------------------------------------------------------------
    constructor(address _hmzToken, address _trustedSigner)
        EIP712("HamzaFaucet", "1")
        Ownable(msg.sender)
    {
        require(_hmzToken != address(0), "HMZ token address required");
        require(_trustedSigner != address(0), "Trusted signer required");

        hmzToken = IERC20(_hmzToken);
        trustedSigner = _trustedSigner;

        emit SignerUpdated(address(0), _trustedSigner);
    }


    // ------------------------------------------------------------------------
    // claimReward — the main user-facing function
    // ------------------------------------------------------------------------
    // The caller (msg.sender) is the user. They pass in:
    //   score        — what the backend says they scored (1–5)
    //   articleHash  — keccak256 of the article text they were quizzed on
    //   signature    — 65-byte EIP-712 signature from the trusted signer
    //
    // The contract verifies the signature really came from the trusted
    // signer FOR THIS SPECIFIC (user, score, articleHash), enforces a
    // one-per-article limit, and pays the user.
    // ------------------------------------------------------------------------
    function claimReward(
        uint8 score,
        bytes32 articleHash,
        bytes calldata signature
    ) external {
        // 1. Sanity-check the score.
        require(score >= 1 && score <= MAX_SCORE, "Invalid score");

        // 2. Rebuild the EIP-712 struct hash exactly the way the backend did.
        //    abi.encode (NOT abi.encodePacked!) is the rule for EIP-712 structs.
        bytes32 structHash = keccak256(
            abi.encode(CLAIM_TYPEHASH, msg.sender, score, articleHash)
        );

        // 3. Combine struct hash with the EIP-712 domain separator. The
        //    inherited _hashTypedDataV4 helper takes care of:
        //      digest = keccak256("\x19\x01" || domainSeparator || structHash)
        bytes32 digest = _hashTypedDataV4(structHash);

        // 4. Recover the address from the signature. If `signature` doesn't
        //    decode cleanly ECDSA.recover reverts; otherwise we get back the
        //    address whose private key signed the digest.
        address recovered = ECDSA.recover(digest, signature);
        require(recovered == trustedSigner, "Invalid signature");

        // 5. Have they already claimed this article? Build a deterministic id
        //    from (user, articleHash) and check the claimed map.
        bytes32 claimId = keccak256(abi.encodePacked(msg.sender, articleHash));
        require(!claimed[claimId], "Already claimed");

        // 6. CHECKS-EFFECTS-INTERACTIONS:
        //    Mark claimed BEFORE the transfer, so a malicious token cannot
        //    re-enter this function and double-spend.
        claimed[claimId] = true;

        // 7. Pay out. score * REWARD_PER_POINT, which for score=5 is 5 HMZ.
        uint256 reward = uint256(score) * REWARD_PER_POINT;
        require(
            hmzToken.transfer(msg.sender, reward),
            "HMZ transfer failed"
        );

        emit RewardClaimed(msg.sender, score, articleHash, reward);
    }


    // ------------------------------------------------------------------------
    // depositTokens — owner refills the faucet's HMZ balance
    // ------------------------------------------------------------------------
    // The owner first calls hmzToken.approve(faucet, amount) externally,
    // then calls this function which pulls the tokens in via transferFrom.
    // ------------------------------------------------------------------------
    function depositTokens(uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be > 0");
        require(
            hmzToken.transferFrom(msg.sender, address(this), amount),
            "transferFrom failed (did you approve?)"
        );
        emit TokensDeposited(msg.sender, amount);
    }


    // ------------------------------------------------------------------------
    // setTrustedSigner — rotate the signer wallet if it's ever compromised
    // ------------------------------------------------------------------------
    function setTrustedSigner(address newSigner) external onlyOwner {
        require(newSigner != address(0), "Signer cannot be zero address");
        address old = trustedSigner;
        trustedSigner = newSigner;
        emit SignerUpdated(old, newSigner);
    }


    // ------------------------------------------------------------------------
    // withdrawRemaining — pull all remaining HMZ back out of the faucet
    // ------------------------------------------------------------------------
    // Useful for shutting the campaign down or moving funds to a new faucet.
    // ------------------------------------------------------------------------
    function withdrawRemaining() external onlyOwner {
        uint256 balance = hmzToken.balanceOf(address(this));
        require(balance > 0, "Nothing to withdraw");
        require(hmzToken.transfer(owner(), balance), "Withdraw transfer failed");
        emit RemainingWithdrawn(owner(), balance);
    }


    // ------------------------------------------------------------------------
    // Convenience view — the faucet's current HMZ balance (in wei units).
    // ------------------------------------------------------------------------
    function faucetBalance() external view returns (uint256) {
        return hmzToken.balanceOf(address(this));
    }
}
