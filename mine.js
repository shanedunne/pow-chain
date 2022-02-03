const Blockchain = require('./models/Blockchain');
const Transaction = require('./models/transaction');
const UTXO = require('./models/UTXO');
const Block = require('./models/Block');
const db = require('./db');
const {PUBLIC_KEY} = require('./config');
const { BlockList } = require('net');

// set as variables to allow adjustment
let leadingZero = 3;
let fCount = 61;

let TARGET_DIFFICULTY = BigInt("0x" + "0".repeat(leadingZero) + "F".repeat(fCount));
const BLOCK_REWARD = 10;


let mining = false;

function startMining() {
    mining = true;
    mine();
}

function stopMining() {
    mining = false;
}

// push block times here
var blockTimeArr = [];


function mine() {
    if(!mining) return;

    // get block start time
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

    // get time at block execution
    let time = Date.now()

    // get block time
    let blockTime = time - startTime

    // push to array containing block times to get average
    blockTimeArr.push(blockTime)
    console.log(blockTime)

    // every 5 blocks run this
    if(blockTimeArr.length % 5 === 0) {
        let averageTime = Math.floor((blockTimeArr.reduce((a, b) => a + b, 0)) / 5)

        // if average less than 6000 increment leadingZero and decrement fCount then empty blockTimeArr to refresh average calculation
        if (averageTime < 6000) {
            leadingZero++;
            fCount--;
            blockTimeArr = []
            console.log("Difficulty Increased")

        // if average greater than 14000 decrement leadingZero and increment fCount then empty blockTimeArr to refresh average calculation
        } else if(averageTime > 14000) {
            leadingZero--;
            fCount++;
            blockTimeArr = []
            console.log("Difficulty Decreased")
        
        // if difficulty within the correct band empty blockTimeArr to refresh average calculation
        } else {
            blockTimeArr = []
            console.log("Difficulty not adjusted")
        }
        console.log(averageTime)
    }
    TARGET_DIFFICULTY = BigInt("0x" + "0".repeat(leadingZero) + "F".repeat(fCount));

    mine()

}

module.exports = {
    startMining,
    stopMining
};