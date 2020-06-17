import * as tokens from '../tokens'
import { optionWithStat } from '../../types'
import BigNumber from 'bignumber.js';

export const blackList = [
  "0x67904e24b071d1406a63eceddea6ba0f4a79ab1e", // testing yDai insurance
  "0xc714cea4daaed7fbc66f936b69e79ec0ee998d93", // testing yDai insurance
  // opyn testing eth puts?
  "0x4a9eece4892c7770238dd387236d1fc4644147e1",
  "0x30e5dd773e0e0b0c6ed54cd4123058660d1cbf39",
  "0x26dca35587b9591489bfaa1acb3e7615b5fc3530",
  "0x6ba566e667bdefcec27955689e30a56872cacf98", // test call 200
  "0x7e30449da59e5489b8013744cc17c1dff3c2c670",
  "0x9960c89e8b4a50d7d8e8694ccf5c2f78fbfc931b",
  "0x0840fa4a72c5bd400f7f6d0a1496e37f935d0675",
  //
  "0xde34d5e3f942b4543c309a0fb0461497e72c793c" // testing aUSDC
]

export const defaultOption: optionWithStat = {
  title: '',
  addr: '',
  type: 'insurance',
  symbol: '',
  name: '',
  decimals: 0,
  oracle: '',
  collateral: tokens.OPYN_ETH,
  underlying: tokens.cDAI,
  strike: tokens.USDC,
  strikePrice: 1,
  minRatio: 1,
  exchange: '',
  uniswapExchange: '',
  expiry: 0,
  totalCollateral: new BigNumber(0),
  totalExercised: new BigNumber(0),
  totalSupply: new BigNumber(0)
}