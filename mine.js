const Blockchain = require('./models/Blockchain');
const Transaction = require('./models/transaction');
const UTXO = require('./models/UTXO');
const Block = require('./models/Block');
const db = require('./db');
const {PUBLIC_KEY} = require('./config');
const { BlockList } = require('net');

let leadingZero = 4;
let fCount = 60;
const TARGET_DIFFICULTY = BigInt("0x" + "0".repeat(leadingZero) + "F".repeat(fCount));
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
var avTimeArr = [];


function mine() {
    if(!mining) return;

    const startTime = Date.now()

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

    let time = Date.now()
    let blockTime = time - startTime
    blockTimeArr.push(blockTime)
    console.log(blockTime)

    if(blockTimeArr.length % 5 === 0) {
        let averageTime = Math.floor((blockTimeArr.reduce((a, b) => a + b, 0)) / 5)
        if (averageTime < 6000) {
            leadingZero++;
            fCount--;
            blockTimeArr = []
            console.log("Difficulty Increased")

            console.log(leadingZero)
            console.log(fCount)

        } else if(averageTime > 14000) {
            leadingZero--;
            fCount++;
            blockTimeArr = []
            console.log("Difficulty Decreased")

            console.log(leadingZero)
            console.log(fCount)
        } else {
            blockTimeArr = []
            console.log("Difficulty not adjusted")
        }
        console.log(averageTime)
    }

    mine()

}

module.exports = {
    startMining,
    stopMining
};