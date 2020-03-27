const ethers = require('ethers');
const { send } = require('micro');

const wsProvider = new ethers.providers.WebSocketProvider(process.env.WS_PROVIDER_URL);
const etherscanProvider = new ethers.providers.EtherscanProvider(process.env.ETHERSCAN_NETWORK, process.env.ETHERSCAN_API_KEY);

let blockNumber = null;

console.log('subscribing...');
wsProvider.on('block', (newBlockNumber) => {
  console.log('new block', newBlockNumber);
  blockNumber = newBlockNumber;
});

setInterval(async () => {
  try {
    if (blockNumber === null) {
      console.log('blockNumber is null, skipping background check');
      return;
    }

    const checkBlockNumber = await etherscanProvider.getBlockNumber();

    console.log('background checker sees', { checkBlockNumber, blockNumber })
    if (checkBlockNumber - blockNumber > process.env.BLOCK_DIFF_THRESH) {
      console.error('Block difference exceeded, exiting', { blockNumber, checkBlockNumber });
      process.exit(1);
    }
  } catch (err) {
    console.error('Uncaught error in background checker, forcing an exit', err);
    process.exit(1);
  }
}, 10000);

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