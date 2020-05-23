const sha256 = require('sha256');
const uuid = require('uuid/v1');
const currentNodeUrl = process.argv[3];

function Blockchain() {
	/*
	 * @constant {Array} chain -All of the blocks that we create and that we mine will be stored in "this.chain".
	 * @constant {Array} pendingTransactions - "this.pendingTransactions" will store all of the new transactions that 
	 * are created before they are placed into a block and mined.
	 */
	this.chain = [];
	this.pendingTransactions = [];
	this.currentNodeUrl = currentNodeUrl;
	this.networkNodes = [];

	/* 
	 * In order to create a genesis block it's ok to pass in arbitrary parameters (say 0, '0', '0'). But any other time we
	 * use createNewBlock method, we have to pass in legitimate values for parameters in order for our blockchain to work 
	 * properly
	 */
	this.createNewBlock(0, '0', '0');
}

/* createNewBlock creates a new block, and inside of this block we have our transactions. The new transactions that have been 
 * created since our last block was mined. And after we created newBlock, we clear out the pendingTransactions array, we push 
 * the newBlock into our chain array and we simply return our newBlock.
 *
 * @params {number} nonce - this comes from a proof of work, and a nonce in our case is simply just a number 
 * @params {string} hash - this will be the data from our new block. Basically, what's going to happn is we're going to pass 
 * our pendingTransactions into a hashing function and we'll be getting our hash
 * @params {string} previousBlockHash - this will be the hash of the previous block
 *
 * @returns {object} newBlock
 */
Blockchain.prototype.createNewBlock = function(nonce, previousBlockHash, hash) {
	const newBlock = {
		index: this.chain.length + 1,
		timestamp: Date.now(),
		transactions: this.pendingTransactions,
		nonce: nonce,
		hash: hash,
		previousBlockHash: previousBlockHash
	};

	this.pendingTransactions = [];
	this.chain.push(newBlock);

	return newBlock;
}

Blockchain.prototype.getLastBlock = function() {
	return this.chain[this.chain.length - 1];
}

/* createNewTransaction simply creates a new transaction object, and then pushes that into our pendingTransactions array, and 
 * finally returns the index of the block where newly created transaction is added to
 *
 * @params {number} amount - how much is being sent in this transaction
 * @params {string} sender - sender's address
 * @params {string} recepient - recepient's address
 *
 * @returns {number} index of the block where newly created transaction is added to
 */
// Blockchain.prototype.createNewTransaction = function(amount, sender, recepient) {
// 	const newTransaction = {
// 		amount: amount,
// 		sender: sender,
// 		recepient: recepient
// 	};

// 	this.pendingTransactions.push(newTransaction);

// 	return this.getLastBlock()['index'] + 1; 	
// }


/* createNewTransaction simply creates a new transaction object, and then returns it
 *
 * @params {number} amount - how much is being sent in this transaction
 * @params {string} sender - sender's address
 * @params {string} recepient - recepient's address
 *
 * @returns {object} = new transaction object created 
 */
Blockchain.prototype.createNewTransaction = function(amount, sender, recepient) {
        const newTransaction = {
                amount: amount,
                sender: sender,
                recepient: recepient,
		transactionId: uuid().split('-').join('')
        };

        return newTransaction;
}

/* addTransactionToPendingTransactions simply creates a new transaction object, and then pushes that into our pendingTransactions array, and
 * finally returns the index of the block where newly created transaction is added to
 *
 * @params {object} transactionObj - transaction object to be added into our pendingTransactions array of our blockchain
 *
 * @returns {number} index of the block where newly created transaction is added to
 */
Blockchain.prototype.addTransactionToPendingTransactions = function(transactionObj) {
	this.pendingTransactions.push(transactionObj);

	return this.getLastBlock()['index'] + 1; 
}

/*
 * hashBlock will take a block from our blockchain, hash of previous block and nonce, and hash all those using sha-256 hashing 
 * algorithm to generate a hash 
 *
 * @params {string} previousBlockHash
 * @params {Array} currentBlockData - current block data (all transaction that are in the block)
 * @params {number} nonce
 *
 * @returns {string} hash generated from the previousBlockHash, currentBlockData and nonce that we passed in 
 */
Blockchain.prototype.hashBlock = function(previousBlockHash, currentBlockData, nonce) {
	const dataAsString = previousBlockHash + nonce.toString() + JSON.stringify(currentBlockData);	
	const hash = sha256(dataAsString);

	return hash;
}
/*
 * proofOfWork will repeatedly hash block until it finds correct hash (which starts with 5 zero's e.g., "0000HASH478453"). It uses
 * currentBlockData, previousBlockHash and nonce for the generating hash (using hashBlock method). It has to continuously change 
 * nonce value in order to generate the correct hash. Once it generates a valid hash, it will return the nonce.
 *
 * @params {string} previousBlockHash
 * @params {Array} currentBlockData - current block data (all transaction that are in the block)
 *
 * @returns {number} nonce
 */
Blockchain.prototype.proofOfWork = function(previousBlockHash, currentBlockData) {
	let nonce = 0;
	let hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
	
	while(hash.substring(0, 4) !== '0000') {
		nonce++;
		hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
	}

	return nonce;
}

/*
 * chainIsValid will validate if a chain is legitimate or not
 *
 * @params {Array} blockchain
 *
 * @returns {boolean} validChain - returns whether the blockchain is valid or not
 */
Blockchain.prototype.chainIsValid = function(blockchain) {
	let validChain = true;

	for(let i = 1; i < blockchain.length; i++) {
		const currentBlock = blockchain[i];
		const previousBlock = blockchain[i - 1];
		
		const currentBlockData = {
			transactions: currentBlock['transactions'],
			index: currentBlock['index']
		};
		// console.log(`block data at index ${i} : `, currentBlockData);
		// validate that block has the correct data (via rehashing and check if it starts with '0000')
                const blockHash = this.hashBlock(previousBlock['hash'], currentBlockData, currentBlock['nonce']);
		// console.log('blockHash : ', blockHash);
		if(blockHash.substring(0, 4) !== '0000') {
			validChain = false;
		}
		// chain is not valid
		if(currentBlock['previousBlockHash'] !== previousBlock['hash']) {
			validChain = false;		
		}

		console.log('PreviousBlockHash : ', previousBlock['hash']);
		console.log('CurrentBlockHash : ', currentBlock['hash']);
	}

	// checking if genesis block is valid (previoushash and hash must be equal to '0', nonce must be equal to 0 
	// and there should be no transactions in the block)
	const genesisBlock = blockchain[0];
	const correctNonce = genesisBlock['nonce'] === 0;
	const correctPreviousBlockHash = genesisBlock['previousBlockHash'] === '0';
	const correctBlockHash = genesisBlock['hash'] === '0';
	const correctTransactions = genesisBlock['transactions'].length === 0;

	if(!correctNonce || !correctPreviousBlockHash || !correctBlockHash || !correctTransactions) {
		validChain = false;
	}


	return validChain;
}

Blockchain.prototype.getBlock = function(blockHash) {
	let correctBlock = null;
	this.chain.forEach(block => {
		if(block['hash'] === blockHash) {
			correctBlock = block;
		}
	});

	return correctBlock;
}

Blockchain.prototype.getTransaction = function(transactionId) {
	let correctTransaction = null;
	let correctBlock = null;

	this.chain.forEach(block => {
		block['transactions'].forEach(transaction => {
			if(transaction['transactionId'] === transactionId) {
				correctTransaction = transaction;
				correctBlock = block;
			}
		});
	});

	return {
		transaction: correctTransaction,
		block: correctBlock
	};
}

Blockchain.prototype.getAddressData = function(address) {
	const addressTransactions = [];
	this.chain.forEach(block => {
		block['transactions'].forEach(transaction => {
			if(transaction.sender === address || transaction.recepient === address) {
				addressTransactions.push(transaction);
			}
		});
	});

	let balance = 0;
	addressTransactions.forEach(transaction => {
		if(transaction.recepient === address) {
			balance += transaction['amount'];
		} else if(transaction.sender === address) {
			balance -= transaction['amount'];
		}
	});

	return {
		addressTransactions: addressTransactions,
		addressBalance: balance
	};
}

module.exports = Blockchain;
