import Web3 from 'web3';
// import Onboard from 'bnc-onboard';
import Notify from 'bnc-notify';

// const INFURA_KEY = process.env.REACT_APP_INFURA_KEY;
const BLOCKNATIVE_KEY = process.env.REACT_APP_BLOCKNATIVE_KEY;

const ControllerABI = require('./controllerabi.json');
const oracleABI = require('./fakeOracleABI.json');


const web3 = new Web3(window.ethereum);

console.log(web3.eth.accounts[0]);
console.log(web3);
// const onboard = Onboard({
//   darkMode: true,
//   dappId: BLOCKNATIVE_KEY, // [String] The API key created by step one above
//   networkId: 42, // [Integer] The Ethereum network ID your Dapp uses.
//   subscriptions: {
//     wallet: (wallet) => {
//       web3 = new Web3(wallet.provider);
//     },
//   },
//   walletSelect: {
//     description: 'Please select a wallet to connect to Opyn Monitor',
//     wallets: [
//       { walletName: 'metamask' },
//       {
//         walletName: 'walletConnect',
//         infuraKey: INFURA_KEY,
//       },
//     ],
//   },
// });

const oToken = '0x6d2e52cac19d85fa1f8002c2b054502d962305e8';
const usdc = '0x6de3919ad3e78a848a169c282d959de9a20267db';
const controllerAddr = '0x8746BE1226DC25bdF70eD4Ff75ec3eB091749243';
const oracleAddr = '0xf53fea168194fd80214a8b8d876893b7aaada344';

export const swapInUSDC = async (amount) => {
  // const account = await checkConnectedAndGetAddress();
  // const account = await checkConnectedAndGetAddress();
  const controller = new web3.eth.Contract(ControllerABI, controllerAddr);
  await controller.methods.swapExactAmountIn(usdc, amount, oToken, '0', '999999999999999999999999999999')
    .send({ from: web3.eth.accounts[0] })
    .on('transactionHash', (hash) => {
      notify.hash(hash);
    });
};

export const swapInOETH = async (amount) => {
  // const account = await checkConnectedAndGetAddress();
  // const account = await checkConnectedAndGetAddress();
  const controller = new web3.eth.Contract(ControllerABI, controllerAddr);
  await controller.methods.swapExactAmountIn(oToken, amount, usdc, '0', '999999999999999999999999999999')
    .send({ from: web3.eth.accounts[0] })
    .on('transactionHash', (hash) => {
      notify.hash(hash);
    });
};

export const updatePrice = async (price) => {
  // const account = await checkConnectedAndGetAddress();
  // const account = await checkConnectedAndGetAddress();
  const controller = new web3.eth.Contract(oracleABI, oracleAddr);
  await controller.methods.updatePrice(price)
    .send({ from: web3.eth.accounts[0] })
    .on('transactionHash', (hash) => {
      notify.hash(hash);
    });
};


// eslint-disable-next-line import/prefer-default-export
const notify = Notify({
  dappId: BLOCKNATIVE_KEY,
  networkId: 42,
});
