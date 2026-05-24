// ============================================================================
// HamzaCoin.sol
// ----------------------------------------------------------------------------
// This file defines the HamzaCoin (HMZ) smart contract.
// A smart contract is a program that lives on a blockchain. Once deployed,
// anyone can interact with it (subject to its rules) and no one — not even
// the author — can secretly change its code.
//
// HamzaCoin is an "ERC20 token". ERC20 is the most common standard for
// fungible tokens on Ethereum-compatible blockchains. "Fungible" means every
// token is identical and interchangeable, like dollars or shares of stock
// (as opposed to NFTs, which are unique).
//
// Famous real-world ERC20 tokens include USDC, DAI, LINK, and UNI.
// ============================================================================


// SPDX-License-Identifier: MIT
//
// ^ Every Solidity file should declare a software license at the very top.
//   "MIT" is a permissive open-source license. The Solidity compiler will
//   warn you if this line is missing.


pragma solidity ^0.8.20;
//
// ^ Tells the compiler which version of Solidity this contract is written for.
//   "^0.8.20" means "any 0.8.x version >= 0.8.20, but less than 0.9.0".
//   We pick 0.8.20+ because OpenZeppelin v5 requires it.


// ----------------------------------------------------------------------------
// IMPORT — pulling in OpenZeppelin's audited ERC20 implementation.
// ----------------------------------------------------------------------------
// OpenZeppelin is a widely-used library of secure, battle-tested smart
// contracts. Writing ERC20 from scratch is risky — even tiny mistakes can
// drain user funds — so virtually every production project inherits from
// OpenZeppelin's version instead.
//
// The file path below resolves to:
//   node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol
// after you run `npm install`.
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


// ----------------------------------------------------------------------------
// THE CONTRACT
// ----------------------------------------------------------------------------
// "contract HamzaCoin is ERC20" means HamzaCoin INHERITS from ERC20.
// That gives us — for free — all the standard ERC20 functions:
//
//   * balanceOf(address)        -> how many tokens an address owns
//   * transfer(to, amount)      -> send tokens from msg.sender to `to`
//   * approve(spender, amount)  -> let `spender` move up to `amount` of your tokens
//   * allowance(owner, spender) -> how much `spender` is allowed to move
//   * transferFrom(from, to, amount) -> move tokens you've been approved to move
//   * totalSupply()             -> total tokens in existence
//   * name(), symbol(), decimals()
//
// These functions are already implemented and audited inside OpenZeppelin's
// ERC20.sol — we just plug in our own name, symbol, and starting supply.
// ----------------------------------------------------------------------------
contract HamzaCoin is ERC20 {

    // ------------------------------------------------------------------------
    // CONSTRUCTOR
    // ------------------------------------------------------------------------
    // The constructor runs EXACTLY ONCE — at the moment the contract is
    // deployed to the blockchain. After that, it can never run again.
    //
    // We use it to (1) tell the parent ERC20 contract what our token is
    // called, and (2) create ("mint") the entire initial supply and give
    // it to whoever deployed the contract.
    // ------------------------------------------------------------------------
    constructor() ERC20("HamzaCoin", "HMZ") {
        //                  ^^^^^^^^^^   ^^^^^
        //                  full name   ticker symbol (shown in wallets)
        //
        // The line above calls the parent ERC20 constructor with our name
        // and symbol. It's the equivalent of `super(...)` in JavaScript.

        // --------------------------------------------------------------------
        // _mint(account, amount)
        // --------------------------------------------------------------------
        // _mint is an INTERNAL function inherited from ERC20. "Internal"
        // means it can only be called from inside this contract (or contracts
        // that inherit it) — never by a random user. That's important:
        // if anyone could mint, the token would be worthless.
        //
        // Here we mint the entire fixed supply once, to msg.sender, and
        // never expose any further minting functions — so the supply is
        // capped at 50,000 forever.
        //
        // What's `msg.sender`?
        //   It's a global variable that means "the address that called this
        //   function." Since this is the constructor, msg.sender is the
        //   account that deployed the contract.
        //
        // What's the magic `10 ** decimals()`?
        //   ERC20 tokens store values as integers — there are no decimals
        //   in Solidity. To represent "50,000 tokens" with 18 decimals,
        //   we store 50,000 * 10^18 = 50,000,000,000,000,000,000,000.
        //
        //   This is exactly how Ether works: 1 ETH is internally stored as
        //   10^18 "wei". The decimals() function (inherited from ERC20)
        //   returns 18 by default, which is the convention nearly every
        //   ERC20 token follows so wallets render balances consistently.
        // --------------------------------------------------------------------
        _mint(msg.sender, 50000 * 10 ** decimals());
    }

    // ------------------------------------------------------------------------
    // That's it! We don't need to write transfer(), balanceOf(), approve(),
    // etc. ourselves — they're all inherited from OpenZeppelin's ERC20.
    //
    // When a student calls `contract.transfer(friendAddress, 100)`, it's
    // really calling the function defined in OpenZeppelin's ERC20.sol,
    // which:
    //   1. Checks msg.sender's balance is >= amount
    //   2. Subtracts amount from msg.sender's balance
    //   3. Adds amount to recipient's balance
    //   4. Emits a `Transfer` event (so block explorers and wallets see it)
    // ------------------------------------------------------------------------
}
