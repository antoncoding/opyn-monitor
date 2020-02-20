import Web3 from 'web3';
import { oToken as OTOKEN_ABI } from '../constants/abi'

import { mainnet } from '../constants/addresses'
const Promise = require("bluebird");
const web3 = new Web3('https://mainnet.infura.io/v3/44fd23cda65746a699a5d3c0e2fa45d5')

const ocDAIToken = new web3.eth.Contract(OTOKEN_ABI, mainnet.ocDAI)

export const getLiquidationInfo = async(owners) => {
  const info = await Promise.map(owners, async(ownerAddress) => {
    const maxLiquidatable = await ocDAIToken.methods.maxOTokensLiquidatable(ownerAddress).call()
    return {
      account: ownerAddress,
      maxLiquidatable
    }
  })
  return info
}