import Web3 from 'web3';
import { oToken as OTOKEN_ABI } from '../constants/abi'

import { mainnet } from '../constants/addresses'
const Promise = require("bluebird");
const web3 = new Web3('https://mainnet.infura.io/v3/44fd23cda65746a699a5d3c0e2fa45d5')

const ocDAIToken = new web3.eth.Contract(OTOKEN_ABI, mainnet.ocDAI)

export const getVaults = async(owners) => {
  const vaults = await Promise.map(owners, async(owner) => {
    const res = await ocDAIToken.methods.getVault(owner).call()
    const collateral = web3.utils.fromWei(res[0])
    const oTokensIssued = res[1]
    const underlying = res[2]
    const owned = res[3]
    return { collateral, oTokensIssued, underlying, owned, owner }
  })
  .filter(
    vault => vault.owned && vault.collateral > 0
  )
  .map(async(vault) => {
    const maxLiquidatable = await ocDAIToken.methods.maxOTokensLiquidatable(vault.owner).call()
    vault.maxLiquidatable = maxLiquidatable
    return vault
  })

  return vaults.sort(compare).reverse()
}

/**
 * Get balance of accounts
 * @param {string} address 
 */
export const getBalance = async(address) => {
  const balance = await web3.eth.getBalance(address)
  return web3.utils.fromWei(balance)
}

export const getTotalSupply = async(address) => {
  const token = new web3.eth.Contract(OTOKEN_ABI, address)
  const totalSupply = await token.methods.totalSupply().call()
  const decimals = await token.methods.decimals().call()
  return parseInt(totalSupply)/10**parseInt(decimals)
}

function compare(ownerA, ownerB) {
  const amountA = ownerA.maxLiquidatable;
  const amountB = ownerB.maxLiquidatable;

  let comparison = 0;
  if (amountA > amountB) {
    comparison = 1;
  } else if (amountA < amountB) {
    comparison = -1;
  }
  return comparison;
}
