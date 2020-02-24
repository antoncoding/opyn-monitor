import Web3 from 'web3';
import { formatDigits } from './common'

const optionContractABI = require('../constants/abi/OptionContract.json')
const oracleABI = require('../constants/abi/Oracle.json')

const Promise = require('bluebird');
const web3 = new Web3('https://mainnet.infura.io/v3/44fd23cda65746a699a5d3c0e2fa45d5');

/**
 * Call only once
 * @param {*} oToken
 */
export const getOptionContractDetail = async (oToken) => {
  const [name, balance, totalSupply] = await Promise.all([
    getOptionName(oToken),
    getBalance(oToken), 
    getTotalSupply(oToken)]
  );
  return {
    name,
    balance,
    totalSupply,
  };
};

/**
 *
 * @param {Array<string>} owners
 * @param {string} oToken
 */
export const getVaults = async (owners, oToken) => {
  const oTokenContract = new web3.eth.Contract(optionContractABI, oToken);

  const vaults = await Promise.map(owners, async (owner) => {
    const res = await oTokenContract.methods.getVault(owner).call();
    const collateral = formatDigits(web3.utils.fromWei(res[0]), 6);
    const oTokensIssued = res[1];
    const underlying = res[2];
    const owned = res[3];
    return { collateral, oTokensIssued, underlying, owned, owner };
  }).filter((vault) => vault.owned && parseFloat(vault.collateral) > 0)
  
    return vaults 
};

export const getVaultsWithLiquidatable = async(vaults, oToken) => {
  const oTokenContract = new web3.eth.Contract(optionContractABI, oToken);
  const NewVaults = await Promise.map(vaults, async(vault) => {
    let maxLiquidatable = 0
    if(vault.isUnsafe) {
      maxLiquidatable = await oTokenContract.methods
        .maxOTokensLiquidatable(vault.owner)
        .call();
    }
    vault.maxLiquidatable = maxLiquidatable
    return vault
  })
  return NewVaults.sort(compare);
}

export const getOptionName = async(address) => {
  const token = new web3.eth.Contract(optionContractABI, address);
  const name = await token.methods.name().call();
  // const name = await web3.eth.name.call();
  return name
}

/**
 * Get balance of accounts
 * @param {string} address
 */
export const getBalance = async (address) => {
  const balance = await web3.eth.getBalance(address);
  return web3.utils.fromWei(balance);
};

export const getPrice = async (oracleAddr, token) => {
  const oracle = new web3.eth.Contract(oracleABI, oracleAddr);
  const price = await oracle.methods.getPrice(token).call();
  return web3.utils.fromWei(price); // price base eth/ per token
};

export const getTotalSupply = async (address) => {
  const token = new web3.eth.Contract(optionContractABI, address);
  const totalSupply = await token.methods.totalSupply().call();
  const decimals = await token.methods.decimals().call();
  return parseInt(totalSupply) / 10 ** parseInt(decimals);
};

function compare(ownerA, ownerB) {
  const rateA = ownerA.ratio;
  const rateB = ownerB.ratio;

  let comparison = 0;
  if (rateA > rateB) {
    comparison = 1;
  } else if (rateA < rateB) {
    comparison = -1;
  }
  return comparison;
}
