import Web3 from 'web3';

import ENS from 'ethereum-ens';

const Promise = require('bluebird');
const optionContractABI = require('../constants/abi/OptionContract.json');
const optionExchangeABI = require('../constants/abi/OptionExchange.json');
const oracleABI = require('../constants/abi/Oracle.json');

const INFURA_KEY = process.env.REACT_APP_INFURA_KEY;

const web3 = new Web3(`https://mainnet.infura.io/v3/${INFURA_KEY}`);
const ens = new ENS(web3);

const ETH_ADDR = '0x0000000000000000000000000000000000000000';

// ENS
export const resolveENS = async (ensName) => {
  const address = await ens.resolver(ensName).addr();
  return address;
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

/**
 *
 * @param {*} address
 * @return {Promise<{decimals: number, totalSupply: number}>}
 */
export const getERC20Info = async (address) => {
  const token = new web3.eth.Contract(optionContractABI, address);
  const totalSupplyDecimals = await token.methods.totalSupply().call();
  const decimals = await token.methods.decimals().call();
  const totalSupply = parseInt(totalSupplyDecimals, 10) / 10 ** parseInt(decimals, 10);
  return { decimals: parseInt(decimals, 10), totalSupply };
};

// Option Contract

/**
 * todo: use graph ql
 * @param {Array<string>} owners
 * @param {string} oToken
 */
export const getVaults = async (owners, oToken) => {
  const oTokenContract = new web3.eth.Contract(optionContractABI, oToken);

  const vaults = await Promise.map(owners, async (owner) => {
    const res = await oTokenContract.methods.getVault(owner).call();
    const collateral = web3.utils.fromWei(res[0]);
    const oTokensIssued = res[1];
    const underlying = res[2];
    return {
      collateral, oTokensIssued, underlying, owner, oToken,
    };
  });
  return vaults;
};

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

// /**
//  * Compare user balance with max liquidatable and decide max liquidatable
//  * @param {string} oToken
//  * @param {string} owner
//  * @param {string} liquidator
//  */
// export const getMaxToLiquidate = async (oToken, owner, liquidator) => {
//   const maxVaultLiquidatable = await getMaxLiquidatable(oToken, owner);
//   const oTokenContract = new web3.eth.Contract(optionContractABI, oToken);
//   const userbalance = liquidator ? await oTokenContract.methods.balanceOf(liquidator).call() : 0;

//   const maxLiquidatable = Math.min(
//     parseInt(userbalance, 10),
//     parseInt(maxVaultLiquidatable, 10),
//   ).toString();

//   return parseInt(maxLiquidatable, 10);
// };

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

export const getAssetsAndOracle = async (address) => {
  const token = new web3.eth.Contract(optionContractABI, address);
  const [oracle, underlying, strike, minRatioObj, strikePriceObj] = await Promise.all([
    token.methods.COMPOUND_ORACLE().call(),
    token.methods.underlying().call(),
    token.methods.strike().call(),
    token.methods.minCollateralizationRatio().call(),
    token.methods.strikePrice().call(),
  ]);
  const strikePrice = strikePriceObj[0] * 10 ** strikePriceObj[1];
  const minRatio = minRatioObj[0] * 10 ** minRatioObj[1];
  return {
    underlying, strike, minRatio, strikePrice, oracle,
  };
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
