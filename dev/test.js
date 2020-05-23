const Blockchain = require('./blockchain');

const bitcoin = new Blockchain();
/*
const previousBlockHash = 'HASHPREV12453698740';
const currentBlockData = [
	{
		amount: 35,
		sender: 'PAUL6666',
		recepient: 'BRUNO888'
	},
	{
		amount: 35,
		sender: 'BRUNO888',
		recepient: 'SANCHO77'
	},
	{
		amount: 50,
		sender: 'SANCHO77',
		recepient: 'ICARDI10'
	}
];

const nonce = bitcoin.proofOfWork(previousBlockHash, currentBlockData);

const hash = bitcoin.hashBlock(previousBlockHash, currentBlockData, nonce);

bitcoin.createNewBlock(nonce, 'GENESIS#HASH', 'hash'); 

console.log('nonce : ', nonce);
console.log('hash : ', hash);
console.log('bitcoin blockchain : ', bitcoin);
*/

const bc1 = {
"chain": [
{
"index": 1,
"timestamp": 1589974650354,
"transactions": [],
"nonce": 0,
"hash": "0",
"previousBlockHash": "0"
},
{
"index": 2,
"timestamp": 1589974696358,
"transactions": [],
"nonce": 18140,
"hash": "0000b9135b054d1131392c9eb9d03b0111d4b516824a03c35639e12858912100",
"previousBlockHash": "0"
},
{
"index": 3,
"timestamp": 1589974838567,
"transactions": [
{
"amount": 12.5,
"sender": "00",
"recepient": "49ddd6109a8e11eaa7246d5a0d1776dc",
"transactionId": "656060b09a8e11eaa7246d5a0d1776dc"
},
{
"amount": 50,
"sender": "POGBA6666",
"recepient": "THIAGO181818",
"transactionId": "9f950b009a8e11eaa7246d5a0d1776dc"
},
{
"amount": 50,
"sender": "THIAGO181818",
"recepient": "SANCHO7777",
"transactionId": "a9ba16c09a8e11eaa7246d5a0d1776dc"
},
{
"amount": 100,
"sender": "SANCHO7777",
"recepient": "ICARDI9999",
"transactionId": "b22e8c509a8e11eaa7246d5a0d1776dc"
}
],
"nonce": 12602,
"hash": "0000c1d5d9ed0d3e73669eaad459552ee41344c7b3f4f7f613f20449f24bd3b2",
"previousBlockHash": "0000b9135b054d1131392c9eb9d03b0111d4b516824a03c35639e12858912100"
},
{
"index": 4,
"timestamp": 1589974945484,
"transactions": [
{
"amount": 12.5,
"sender": "00",
"recepient": "49ddd6109a8e11eaa7246d5a0d1776dc",
"transactionId": "ba0d78a09a8e11eaa7246d5a0d1776dc"
},
{
"amount": 100,
"sender": "ICARDI9999",
"recepient": "GOAL1111",
"transactionId": "da5ad1c09a8e11eaa7246d5a0d1776dc"
},
{
"amount": 200,
"sender": "ICARDI9999",
"recepient": "GOAL2222",
"transactionId": "e42254309a8e11eaa7246d5a0d1776dc"
},
{
"amount": 300,
"sender": "ICARDI9999",
"recepient": "GOAL3333",
"transactionId": "ea8af4309a8e11eaa7246d5a0d1776dc"
}
],
"nonce": 219859,
"hash": "00009a99f62d44d72df5f68c19305f40feb7dd968563b67e5b043e240dc8e414",
"previousBlockHash": "0000c1d5d9ed0d3e73669eaad459552ee41344c7b3f4f7f613f20449f24bd3b2"
},
{
"index": 5,
"timestamp": 1589974977896,
"transactions": [
{
"amount": 12.5, // valid data
//"amount": 45,
"sender": "00",
"recepient": "49ddd6109a8e11eaa7246d5a0d1776dc",
"transactionId": "f9c78ee09a8e11eaa7246d5a0d1776dc"
}
],
"nonce": 16398,
"hash": "0000e2b4fe50f51675e0869384c3ee345ab7068a438de1232b1edd703592e302", // valid hash
//"hash": "0000e2b4fe50f51675e0869384c3ee345ab7068a438de1232b1edd703592e30", // invalid hash
"previousBlockHash": "00009a99f62d44d72df5f68c19305f40feb7dd968563b67e5b043e240dc8e414"
},
{
"index": 6,
"timestamp": 1589974980473,
"transactions": [
{
"amount": 12.5,
"sender": "00",
"recepient": "49ddd6109a8e11eaa7246d5a0d1776dc",
"transactionId": "0d193ca09a8f11eaa7246d5a0d1776dc"
}
],
"nonce": 40340,
"hash": "0000f84a7ca32ac9c8dc1825ba878e25bb506ff019d188a1c9f77fc8ceca5c8f",
"previousBlockHash": "0000e2b4fe50f51675e0869384c3ee345ab7068a438de1232b1edd703592e302"
}
],
"pendingTransactions": [
{
"amount": 12.5,
"sender": "00",
"recepient": "49ddd6109a8e11eaa7246d5a0d1776dc",
"transactionId": "0ea310f09a8f11eaa7246d5a0d1776dc"
}
],
"currentNodeUrl": "http://localhost:3001",
"networkNodes": []
};

const isValid = bitcoin.chainIsValid(bc1.chain);
console.log('Is blockchain valid : ', isValid);

