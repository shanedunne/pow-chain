const Blockchain = require('./models/Blockchain');
const Transaction = require('./models/transaction');
const UTXO = require('./models/UTXO');
const Block = require('./models/Block');
const db = require('./db');
const {PUBLIC_KEY} = require('./config');
const { BlockList } = require('net');
const TARGET_DIFFICULTY = BigInt("0x0000" + "F".repeat(60));
const BLOCK_REWARD = 10;

let mining = false;

function startMining() {
    mining = true;
    mine();
}

function stopMining() {
    mining = false;
}

var blockTimeArr = [];

function mine() {
    if(!mining) return;

    const startTime = new Date()

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

    let time = new Date()
    let blockTime = time - startTime
    blockTimeArr.push(blockTime)
    console.log(blockTime)

    if(blockTimeArr.length % 5 === 0) {
        let averageTime = Math.floor((blockTimeArr.reduce((a, b) => a + b, 0)) / 5)
        console.log(averageTime);
        blockTimeArr = [];
    }

    setTimeout(mine, 3000);

}

function adjustDifficulty(){
     
}

module.exports = {
    startMining,
    stopMining
};