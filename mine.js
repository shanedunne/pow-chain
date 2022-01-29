const Blockchain = require('./models/Blockchain');
const Transaction = require('./models/transaction');
const UTXO = require('./models/UTXO');
const Block = require('./models/Block');
const db = require('./db');
const {PUBLIC_KEY} = require('./config');
const TARGET_DIFFICULTY = BigInt("0x000" + "F".repeat(63));
const BLOCK_REWARD = 10;

let mining = false;

function startMining() {
    mining = true;
    mine();
}

function stopMining() {
    mining = false;
}

function mine() {
    if(!mining) return;

    const block = new Block();

    const coinbaseUTXO = new UTXO(PUBLIC_KEY, BLOCK_REWARD);
    const coinbaseTX = new Transaction([], [coinbaseUTXO]);
    block.addTransaction(coinbaseTX);

    while(BigInt("0x" + block.hash()) >= TARGET_DIFFICULTY) {
        block.nonce++;
    }

    block.execute();

    db.blockchain.addBlock(block);

    console.log(`Block #${db.blockchain.blockHeight()} HASH: 0x${block.hash()} NONCE: ${block.nonce}`)

    setTimeout(mine, 3000);

}

module.exports = {
    startMining,
    stopMining
};