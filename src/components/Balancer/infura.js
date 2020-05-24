import Web3 from 'web3';

const poolABI = require('./poolabi.json');
const controllerABI = require('./controllerabi.json');
const oracleABI = require('./fakeOracleABI.json');
const optionContractABI = require('../../constants/abi/OptionContract.json');

const KEYS = [process.env.REACT_APP_INFURA_KEY, process.env.REACT_APP_INFURA_KEY2].filter((k) => k);
const INFURA_KEY = KEYS[Math.floor(Math.random() * KEYS.length)];
const web3 = new Web3(`https://kovan.infura.io/v3/${INFURA_KEY}`);


const oToken = '0x6d2e52cac19d85fa1f8002c2b054502d962305e8';
const usdc = '0x6de3919ad3e78a848a169c282d959de9a20267db';
const controllerAddr = '0x8746BE1226DC25bdF70eD4Ff75ec3eB091749243';
const poolAddr = '0x126679b2b632f643d00773b205e5a6b0559be282';
const oracleAddr = '0xf53fea168194fd80214a8b8d876893b7aaada344';


export const getIV = async () => {
  const controller = new web3.eth.Contract(controllerABI, controllerAddr);
  const iv = await controller.methods.iv().call();
  return iv;
};

export const getSpotPRice = async () => {
  const pool = new web3.eth.Contract(poolABI, poolAddr);
  const spot = await pool.methods.getSpotPrice(usdc, oToken).call();
  return spot;
};

export const getUSDC = async () => {
  const oracle = new web3.eth.Contract(oracleABI, oracleAddr);
  const price = await oracle.methods.getPrice(usdc).call();
  return price;
};

export const getWeight = async (token) => {
  const pool = new web3.eth.Contract(poolABI, poolAddr);
  const spot = await pool.methods.getDenormalizedWeight(token).call();
  return spot;
};

export const getTokenBalance = async (erc20Token, user) => {
  const oTokenContract = new web3.eth.Contract(optionContractABI, erc20Token);
  const balance = await oTokenContract.methods.balanceOf(user).call();
  return balance;
};
