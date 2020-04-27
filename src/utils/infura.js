import Web3 from 'web3';

import ENS from 'ethereum-ens';

const optionContractABI = require('../constants/abi/OptionContract.json');
const optionExchangeABI = require('../constants/abi/OptionExchange.json');
const oracleABI = require('../constants/abi/Oracle.json');

const KEYS = [process.env.REACT_APP_INFURA_KEY, process.env.REACT_APP_INFURA_KEY2].filter((k) => k);
const INFURA_KEY = KEYS[Math.floor(Math.random() * KEYS.length)];
const web3 = new Web3(`https://mainnet.infura.io/v3/${INFURA_KEY}`);
const ens = new ENS(web3);

const ETH_ADDR = '0x0000000000000000000000000000000000000000';

// ENS
export const resolveENS = async (ensName) => {
  const address = await ens.resolver(ensName).addr();
  return address.toLowerCase();
};

/**
 *
 * @param {string} erc20Token address
 * @param {string} user address
 * @return {Promise<string>}
 */
export const getTokenBalance = async (erc20Token, user) => {
  if (user === '') return '0';
  const oTokenContract = new web3.eth.Contract(optionContractABI, erc20Token);
  const balance = await oTokenContract.methods.balanceOf(user).call();
  return balance;
};

export const getDecimals = async (erc20Token) => {
  if (erc20Token === ETH_ADDR) return 18;
  const oTokenContract = new web3.eth.Contract(optionContractABI, erc20Token);
  const decimals = await oTokenContract.methods.decimals().call();
  return parseInt(decimals, 10);
};

export const getERC20Symbol = async (erc20Token) => {
  const oTokenContract = new web3.eth.Contract(optionContractABI, erc20Token);
  return oTokenContract.methods.symbol().call();
};

export const getTotalSupply = async (erc20) => {
  const token = new web3.eth.Contract(optionContractABI, erc20);
  const totalSupply = await token.methods.totalSupply().call();
  return totalSupply;
};

// Option Contract

/**
 * Max liquidatable for given vault
 * @param {string} oToken
 * @param {string} owner
 * @return {Promise<number>}
 */
export const getMaxLiquidatable = async (oToken, vaultOwner) => {
  const oTokenContract = new web3.eth.Contract(optionContractABI, oToken);
  const maxVaultLiquidatable = await oTokenContract.methods
    .maxOTokensLiquidatable(vaultOwner)
    .call();
  return maxVaultLiquidatable;
};

/**
 *
 * @param {string} oToken
 * @param {string} tokenToExercise
 * @return {Promise<string>}
 */
export const getUnderlyingRequiredToExercise = async (oToken, tokenToExercise) => {
  const oTokenContract = new web3.eth.Contract(optionContractABI, oToken);
  const underlyringRequired = await oTokenContract.methods
    .underlyingRequiredToExercise(tokenToExercise)
    .call();
  // console.log(`what `, underlyringRequired)
  return underlyringRequired;
};

/**
 *
 * @param {string} contract
 * @param {string} user
 * @param {string} spender
 * @return {Promise<string>}
 */
export const getAllowance = async (contract, user, spender) => {
  const token = new web3.eth.Contract(optionContractABI, contract);
  const allowance = await token.methods.allowance(user, spender).call();
  return allowance;
};

/**
 * Get balance in eth for the account
 * @param {string} address
 */
export const getBalance = async (address) => {
  if (address === '') return '0';
  const balance = await web3.eth.getBalance(address);
  return web3.utils.fromWei(balance);
};

/**
 * Get price of token in unit of wei
 * @param {string} oracleAddr
 * @param {string} token
 * @returns {Promise<string>}
 */
export const getPrice = async (oracleAddr, token) => {
  const oracle = new web3.eth.Contract(oracleABI, oracleAddr);
  const price = await oracle.methods.getPrice(token).call();
  return price; // unit: wei/ per token
};

// Option Exchange
export const getPremiumToPay = async (
  exchangeAddr,
  tokenToBuy,
  buyAmt,
  paymentToken = ETH_ADDR,
) => {
  const exchange = new web3.eth.Contract(optionExchangeABI, exchangeAddr);
  const premiumToPay = await exchange.methods.premiumToPay(tokenToBuy, paymentToken, buyAmt).call();
  return premiumToPay;
};

export const getPremiumReceived = async (exchangeAddr, tokenToSell, sellAmt) => {
  const exchange = new web3.eth.Contract(optionExchangeABI, exchangeAddr);
  const payoutToken = ETH_ADDR;
  const premiumReceived = await exchange.methods
    .premiumReceived(tokenToSell, payoutToken, sellAmt)
    .call();
  return web3.utils.fromWei(premiumReceived);
};

// uniswapExchange
