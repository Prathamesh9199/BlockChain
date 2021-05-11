const SHA = require('crypto-js/sha256');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

class Transaction{
    constructor(fromAddress, toAddress, amount){
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
    }    

    calculateHash(){
        return SHA(this.fromAddress + this.toAddress + this.amount).toString();
    }

    signTransaction(signingKey){ // Sender Private Key
        if(signingKey.getPublic('hex') !== this.fromAddress)
            throw new Error("You cannot sign transactions for other wallet ...");

        const hashTx = this.calculateHash();
        const sig = signingKey.sign(hashTx, 'base64');
        this.signature = sig.toDER('hex');
    }

    isTransactionValid(){
        if(this.fromAddress === null)
            return true;

        if(!this.signature || this.signature.length === 0)
            throw new Error("No signature in this transaction ...");

        const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
        return publicKey.verify(this.calculateHash(), this.signature);
    }
}

class Block{
    constructor(timeStamp, transactions, previousHash = ""){
        this.timeStamp = timeStamp;
        this.transactions = transactions;
        this.previousHash = previousHash;

        this.nOnce = 0;
        this.hash = this.calculateHash();
    }

    calculateHash(){
        return SHA(this.previousHash + this.timeStamp + JSON.stringify(this.transactions) + this.nOnce).toString();
    }

    mineBlock(difficulty){
        while(this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
            this.nOnce++;
            this.hash = this.calculateHash();
        }
    }

    hasValidTrasactions(){
        for(const trans of this.transactions){
            if(!trans.isTransactionValid())
                return false;
        }
        return true;
    }
}

class BlockChain{
    constructor(){
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 2;
        this.pendingTransactions = [];
        this.miningReward = 100;
    }

    createGenesisBlock(){
        return new Block(Date.now(), "Genesis Block", "0");
    }

    addTrasaction(transaction){
        if(!transaction.fromAddress || !transaction.toAddress)
            throw new Error("Transaction must include From & To Address");

        if(!transaction.isTransactionValid())            
            throw new Error("Cannot add Invalid Transaction to Block");

        this.pendingTransactions.push(transaction);
    }

    lastBlock(){
        return this.chain[this.chain.length - 1];
    }

    minePendingTrasactions(miningRewardAddress){
        if(this.pendingTransactions.length === 0)
            throw new Error("Please add some transactions to Block");

        this.pendingTransactions.push(new Transaction(null, miningRewardAddress, this.miningReward));

        let block = new Block(Date.now(), this.pendingTransactions, this.lastBlock().hash);
        block.mineBlock(this.difficulty);
        this.chain.push(block);
        console.log("Block Mined successfully");

        this.pendingTransactions = [];
    }

    balanceOfAccount(address){
        let balance = 0;
        for(const block of this.chain){
            for(const trans of block.transactions){
                if(trans.fromAddress === address)
                    balance -= trans.amount;

                if(trans.toAddress === address)
                    balance += trans.amount;
            }
        }

        return balance;
    }

    isBlockChainValid(){
        for(let i = 1; i < this.chain.length; i++){
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if(!currentBlock.hasValidTrasactions())
                return false;

            if(currentBlock.hash !== currentBlock.calculateHash())
                return false;

            if(previousBlock.hash !== currentBlock.previousHash)
                return false;
        }

        return true;
    }
}

module.exports.BlockChain = BlockChain;
module.exports.Transaction = Transaction;
