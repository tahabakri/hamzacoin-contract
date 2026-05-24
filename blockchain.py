"""
Simple educational cryptocurrency.

Demonstrates:
- Block linked by SHA-256 hash to its predecessor
- Proof-of-Work mining (find a nonce that makes the hash start with N zeros)
- Transactions between wallet addresses (strings)
- Miner reward, balance derivation, chain validation, tamper detection
"""

import hashlib
import json
import time


class Block:
    def __init__(self, index, transactions, previous_hash, nonce=0):
        self.index = index
        self.timestamp = time.time()
        self.transactions = transactions
        self.previous_hash = previous_hash
        self.nonce = nonce
        self.hash = self.compute_hash()

    def compute_hash(self):
        payload = {
            "index": self.index,
            "timestamp": self.timestamp,
            "transactions": self.transactions,
            "previous_hash": self.previous_hash,
            "nonce": self.nonce,
        }
        encoded = json.dumps(payload, sort_keys=True).encode()
        return hashlib.sha256(encoded).hexdigest()

    def __repr__(self):
        return (
            f"Block(index={self.index}, "
            f"nonce={self.nonce}, "
            f"txs={len(self.transactions)}, "
            f"prev={self.previous_hash[:10]}..., "
            f"hash={self.hash[:10]}...)"
        )


class Blockchain:
    def __init__(self, difficulty=4, mining_reward=10):
        self.difficulty = difficulty
        self.mining_reward = mining_reward
        self.pending_transactions = []
        self.chain = [self.create_genesis_block()]

    def create_genesis_block(self):
        genesis = Block(index=0, transactions=[], previous_hash="0")
        genesis.hash = self.proof_of_work(genesis)
        return genesis

    def get_latest_block(self):
        return self.chain[-1]

    def add_transaction(self, sender, receiver, amount):
        self.pending_transactions.append(
            {"sender": sender, "receiver": receiver, "amount": amount}
        )
        return self.get_latest_block().index + 1

    def proof_of_work(self, block):
        target = "0" * self.difficulty
        block.nonce = 0
        computed = block.compute_hash()
        while not computed.startswith(target):
            block.nonce += 1
            computed = block.compute_hash()
        return computed

    def mine_pending_transactions(self, miner_address):
        new_block = Block(
            index=self.get_latest_block().index + 1,
            transactions=list(self.pending_transactions),
            previous_hash=self.get_latest_block().hash,
        )

        start = time.time()
        new_block.hash = self.proof_of_work(new_block)
        elapsed = time.time() - start

        self.chain.append(new_block)
        self.pending_transactions = [
            {"sender": None, "receiver": miner_address, "amount": self.mining_reward}
        ]
        return new_block, elapsed

    def get_balance(self, address):
        balance = 0
        for block in self.chain:
            for tx in block.transactions:
                if tx["sender"] == address:
                    balance -= tx["amount"]
                if tx["receiver"] == address:
                    balance += tx["amount"]
        return balance

    def is_chain_valid(self):
        target = "0" * self.difficulty
        for i, block in enumerate(self.chain):
            if block.hash != block.compute_hash():
                return False, f"block {i} hash mismatch (data was tampered)"
            if not block.hash.startswith(target):
                return False, f"block {i} hash does not satisfy difficulty"
            if i > 0 and block.previous_hash != self.chain[i - 1].hash:
                return False, f"block {i} previous_hash does not link to block {i - 1}"
        return True, "chain is valid"


def print_chain(blockchain):
    for block in blockchain.chain:
        print(f"  #{block.index}  hash={block.hash}")
        print(f"        prev={block.previous_hash}")
        print(f"        nonce={block.nonce}  txs={len(block.transactions)}")
        for tx in block.transactions:
            sender = tx["sender"] if tx["sender"] is not None else "<reward>"
            print(f"          {sender} -> {tx['receiver']}: {tx['amount']}")


if __name__ == "__main__":
    print("=" * 60)
    print(f"Creating blockchain (difficulty=4, reward=10)...")
    print("=" * 60)
    coin = Blockchain(difficulty=4, mining_reward=10)
    print(f"Genesis: {coin.chain[0]}\n")

    print("Adding transactions: alice->bob 50, bob->charlie 20")
    coin.add_transaction("alice", "bob", 50)
    coin.add_transaction("bob", "charlie", 20)

    print("Mining block 1 (miner=miner1)...")
    block1, t1 = coin.mine_pending_transactions("miner1")
    print(f"  mined in {t1:.2f}s -> {block1}\n")

    print("Adding transactions: charlie->alice 5, alice->bob 10")
    coin.add_transaction("charlie", "alice", 5)
    coin.add_transaction("alice", "bob", 10)

    print("Mining block 2 (miner=miner1)...")
    block2, t2 = coin.mine_pending_transactions("miner1")
    print(f"  mined in {t2:.2f}s -> {block2}\n")

    print("=" * 60)
    print("Full chain:")
    print("=" * 60)
    print_chain(coin)

    print()
    print("=" * 60)
    print("Balances (note: miner1's reward for block 2 is still pending):")
    print("=" * 60)
    for wallet in ("alice", "bob", "charlie", "miner1"):
        print(f"  {wallet:8s} = {coin.get_balance(wallet)}")

    print()
    print("=" * 60)
    print("Chain validation:")
    print("=" * 60)
    ok, msg = coin.is_chain_valid()
    print(f"  valid={ok}  ({msg})")

    print()
    print("Tampering with block 1: changing alice->bob amount from 50 to 5000...")
    coin.chain[1].transactions[0]["amount"] = 5000
    ok, msg = coin.is_chain_valid()
    print(f"  valid={ok}  ({msg})")
