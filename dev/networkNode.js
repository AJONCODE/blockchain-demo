const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const Blockchain = require('./blockchain');
const uuid = require('uuid/v1');
const port = process.argv[2];
const rp = require('request-promise');

const nodeAddress = uuid().split('-').join('');

const bitcoin = new Blockchain();

/*
 * If a request comes in with json data or with form data, we simply wanna parse that data, 
 * so that we can access it in which ever end-point is receiving it
 */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// get an entire blockchain
app.get('/blockchain', (req, res) => {
	res.send(bitcoin);	
});

// create a new transaction
// app.post('/transaction', (req, res) => {

// 	const blockIndex = bitcoin.createNewTransaction(req.body.amount, req.body.sender, req.body.recepient);

// 	res.json({ note: `Transaction will be added in block ${blockIndex}.` });
// });

// create a new transaction
app.post('/transaction', (req, res) => {
	const newTransaction = req.body;
	const blockIndex = bitcoin.addTransactionToPendingTransactions(newTransaction);

	res.json({ note: `Transaction will be added in block ${blockIndex}.` });
});

// create a new transaction and then broadcasts it to all the nodes in our network
app.post('/transaction/broadcast', (req, res) => {
	const newTransaction = bitcoin.createNewTransaction(req.body.amount, req.body.sender, req.body.recepient);
	bitcoin.addTransactionToPendingTransactions(newTransaction);

	const requestPromises = [];
	bitcoin.networkNodes.forEach(networkNodeUrl => {
		const requestOptions = {
			uri: networkNodeUrl + '/transaction',
			method: 'POST',
			body: newTransaction, 
			json: true
		};

		requestPromises.push(rp(requestOptions));
	});

	Promise.all(requestPromises)
	.then(data => {
		res.json({ note: 'Transaction created and broadcast successfully.' });	
	});
});

// mine a new block 
/*
*app.get('/mine', (req, res) => {
*	const lastBlock = bitcoin.getLastBlock();
*	const previousBlockHash = lastBlock['hash'];
*
*	const currentBlockData = {
*		transactions: bitcoin.pendingTransactions,
*		index: lastBlock['index'] + 1,
*
*	};
*	const nonce = bitcoin.proofOfWork(previousBlockHash, currentBlockData);
*	const blockHash =  bitcoin.hashBlock(previousBlockHash, currentBlockData, nonce);
*
*	 
*	// mining reward
*	// whenever we see a transaction send from address "00", it implies it's a mining reward
*	
*	bitcoin.createNewTransaction(12.5, "00", nodeAddress);
*
*	const newBlock = bitcoin.createNewBlock(nonce, previousBlockHash, blockHash);
*
*	res.json({ 
*		note: 'New block mined successfully',
*		block: newBlock
*	});
*});
*/

app.get('/mine', (req, res) => {
        const lastBlock = bitcoin.getLastBlock();
        const previousBlockHash = lastBlock['hash'];

        const currentBlockData = {
                transactions: bitcoin.pendingTransactions,
                index: lastBlock['index'] + 1,

        };
        const nonce = bitcoin.proofOfWork(previousBlockHash, currentBlockData);
        const blockHash =  bitcoin.hashBlock(previousBlockHash, currentBlockData, nonce);

        const newBlock = bitcoin.createNewBlock(nonce, previousBlockHash, blockHash);

	// broadcast the new block to all the other nodes in the network
        const requestPromises = [];
	bitcoin.networkNodes.forEach(networkNodeUrl => {
		const requestOptions = {
			uri: networkNodeUrl + '/receive-new-block',
			method: 'POST',
			body: { newBlock: newBlock },
			json: true
		};

		requestPromises.push(rp(requestOptions));
	});

	Promise.all(requestPromises)
	.then(data => {
		// mining reward of 12.5
	        // whenever we see a transaction send from address "00", it implies it's a mining reward
        	// we also need to to broadcast the mining reward transaction to the whole network
		const requestOptions = {
			uri: bitcoin.currentNodeUrl + '/transaction/broadcast',
			method: 'POST',
			body: { 
				amount: 12.5,
				sender: "00",
				recepient: nodeAddress
			},
			json: true
		};

		return rp(requestOptions);
	})
	.then(data => {
		res.json({
                	note: 'New block mined & broadcast successfully',
                	block: newBlock
		});
	});
});

// receive the broadcasted block and store it to the blockchain
app.post('/receive-new-block', (req, res) => {
	const newBlock = req.body.newBlock;
	// we want to check if the previous block hash on our newBlock is equal to the hash on the last block in our chain
	const lastBlock = bitcoin.getLastBlock();
	const correctHash = lastBlock.hash === newBlock.previousBlockHash;
	// we also want to ensure that the newBlock has the correct index
	const correctIndex = lastBlock['index'] + 1 === newBlock['index'];
	if(correctHash && correctIndex) {
		bitcoin.chain.push(newBlock);
		bitcoin.pendingTransactions = [];

		res.json({ 
			note: 'New block received & accepted.',
			newBlock: newBlock
		});
	} else {
		res.json({ 
			'note': 'New block rejected.',
			newBlock: newBlock
		});
	}
});

/*
 * Basically what's going to happen is whenever we want to register a new node with our network, we are going to hit 
 * '/register-and-broadcast-node' endpoint. '/register-and-broadcast-node' endpoint is going to register the new node 
 * on its own server and then it's going to broadcast this new node to all of the other network nodes. Those network 
 * nodes will simply accept the new network node inside of '/register-node' endpoint, because all we want those other
 * network nodes to do is simply register it. We just want them to register the new node. We do not want them to 
 * broadcast the new node, because the new node has already been broadcast. If all the other nodes in the network were 
 * to broadcast the node as well, that would severely degrade the performance of our blockchain network, and would lead
 * to an infinite loop and would totally crash our blockchain. So when all of the other nodes receive the new node's url,
 * we just want them to register it, we don't want them to broadcast it.
 */

// register a node and broadcast it to the network
app.post('/register-and-broadcast-node', (req, res) => {
	const { newNodeUrl } = req.body;
	if(bitcoin.networkNodes.indexOf(newNodeUrl) == -1) {
		// registering the node
		bitcoin.networkNodes.push(newNodeUrl);
	}

	// broadcasting the node to all nodes in the network
	const regNodePromises = [];
	bitcoin.networkNodes.forEach(networkNodeUrl => { 
		// hit register-node endpoint
		const requestOptions = {
			uri: networkNodeUrl + '/register-node',
			method: 'POST',
			body: { newNodeUrl: newNodeUrl },
			json: true
		};

		regNodePromises.push(rp(requestOptions));
	});

	Promise.all(regNodePromises)
	.then(data => {
		const bulkRegisterOptions = {
			uri: newNodeUrl + '/register-nodes-bulk',
			method: 'POST',
			body: { allNetworkNodes: [ ... bitcoin.networkNodes, bitcoin.currentNodeUrl ]  },
			json: true
		};

		return rp(bulkRegisterOptions);
	})
	.then(data => {
		return res.json({ note: 'New node registered with network successfully.'  });
	});
}); 

// register a node with the network
app.post('/register-node', (req, res) => {
	const { newNodeUrl } = req.body;
	const nodeNotAlreadyPresent =  bitcoin.networkNodes.indexOf(newNodeUrl) == -1;
	const notCurrentNode = bitcoin.currentNodeUrl !== newNodeUrl;
	if(nodeNotAlreadyPresent && notCurrentNode) {
		bitcoin.networkNodes.push(newNodeUrl);
	}

	res.json({ note: 'New node registered successfully.' });
});

// register multiple nodes at once with the network
app.post('/register-nodes-bulk', (req, res) => {
	const { allNetworkNodes } = req.body;
	allNetworkNodes.forEach(networkNodeUrl => {
		const nodeNotAlreadyPresent = bitcoin.networkNodes.indexOf(networkNodeUrl) == -1;
		const notCurrentNode = bitcoin.currentNodeUrl !== networkNodeUrl;
		if(nodeNotAlreadyPresent && notCurrentNode) {
			bitcoin.networkNodes.push(networkNodeUrl);
		}
	});

	res.json({ note: 'Bulk registration successful.' });
});

app.get('/consensus', (req, res) => {
	const requestPromises = [];

	bitcoin.networkNodes.forEach(networkNodeUrl => {
		const requestOptions = {
			uri: networkNodeUrl + '/blockchain',
			method: 'GET',
			json: true
		};

		requestPromises.push(rp(requestOptions));
	});

	Promise.all(requestPromises)
	.then(networkBlockchains => {
		const currentChainLength = bitcoin.chain.length;
		let maxChainLength = currentChainLength;
		let newLongestChain = null;
		let newPendingTransactions = null;

		networkBlockchains.forEach(blockchain => {
			// check if blockchain is longer than the copy of the blockchain that is being hosted in our current node
			if(blockchain.chain.length > maxChainLength) {
				maxChainLength = blockchain.chain.length;
				newLongestChain = blockchain.chain;
				newPendingTransactions = blockchain.pendingTransactions;
			}	
		});

		if(!newLongestChain || (newLongestChain && !bitcoin.chainIsValid(newLongestChain))) {
			// If there is no longest chain or if there is a longest chain but that chain is not valid
			res.json({
				note: 'Current chain has not been replaced.',
				chain: bitcoin.chain
			});
		} else { // else if(newLongestChain && bitcoin.chainIsValid(newLongestChain)) {
			// If there is a longest chain and that longest chain is valid
			// Now we want to replace the blockchain that's hosted on our current node with the longest chain in the network
			bitcoin.chain = newLongestChain;
			bitcoin.pendingTransactions = newPendingTransactions;

			res.json({
				note: 'This chain has been replaced.',
				chain: bitcoin.chain
			});
		}
	});
});

// returns a block if a block with specified blockHash is present
app.get('/block/:blockHash', (req, res) => {
	const blockHash = req.params.blockHash;
	const correctBlock = bitcoin.getBlock(blockHash);

	res.json({
		block: correctBlock
	});
});

app.get('/transaction/:transactionId', (req, res) => {
	const transactionId = req.params.transactionId;
	const transactionData = bitcoin.getTransaction(transactionId);

	res.json({
		transaction: transactionData['transaction'],
		block: transactionData['block']
	});
});

app.get('/address/:address', (req, res) => {
	const address = req.params.address;
	const addressData = bitcoin.getAddressData(address);

	res.json({
		addressData: addressData
	});
});

app.listen(port, () => {
	console.log(`🐋 🐳 🦈 🦉 🦚 Listening on port ${port} ...... 🐊 🦅 🐧 🐓 🦃`);
});
