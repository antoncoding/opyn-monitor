import * as tokens from '../tokens'
import { optionWithStat } from '../../types'
import BigNumber from 'bignumber.js';

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