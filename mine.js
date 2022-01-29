const Blockchain = require('./models/Blockchain');
const Block = require('./models/Block');
const db = require('./db');
const TARGET_DIFFICULTY = BigInt("0x0" + "F".repeat(63));

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
    while(BigInt("0x" + block.hash()) >= TARGET_DIFFICULTY) {
        block.nonce++;
    }

    db.blockchain.addBlock(block);

    console.log(`Block #${db.blockchain.blockHeight()} HASH: 0x${block.hash()} NONCE: ${block.nonce}`)

    setTimeout(mine, 500);
}

module.exports = {
    startMining,
    stopMining
};