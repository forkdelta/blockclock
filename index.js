const ethers = require('ethers');
const { send } = require('micro');

const wsProvider = new ethers.providers.WebSocketProvider(process.env.WS_PROVIDER_URL);

let blockNumber = null;

console.log('subscribing...')
wsProvider.on('block', (newBlockNumber) => {
  console.log('new block', newBlockNumber);
  blockNumber = newBlockNumber;
});

module.exports = async (req, res) => {
  if (req.url !== '/') {
    return send(res, 404);
  }

  if (blockNumber === null) {
    console.log('blockNumber is null, fetching block number directly');
    const newBlockNumber = await wsProvider.getBlockNumber();
    blockNumber = newBlockNumber;
  }

  send(res, 200, blockNumber);
};