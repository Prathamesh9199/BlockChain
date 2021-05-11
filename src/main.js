const {BlockChain, Transaction} = require('./BlockChain');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const myKey = ec.keyFromPrivate("PRIVATE_KEY");
const walletAddress = myKey.getPublic('hex');

let peoplePower = new BlockChain();

const tx1 = new Transaction(walletAddress, "SenderPublicKey", 10);
tx1.signTransaction(myKey);

peoplePower.addTrasaction(tx1);

peoplePower.minePendingTrasactions(walletAddress);

//console.log(JSON.stringify(peoplePower, null, 4));

//console.log(peoplePower.balanceOfAccount(walletAddress));

console.log("isValid: " + peoplePower.isBlockChainValid());

peoplePower.chain[1].transactions[0].amount = 100;

console.log("isValid: " + peoplePower.isBlockChainValid());
