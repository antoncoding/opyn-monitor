import { greeks as Greeks, ETHOption } from '../../types'
import BigNumber from 'bignumber.js'

const greek = require('greeks')
const iv = require("implied-volatility");


export function getGreeks (option: ETHOption, optionPrice: BigNumber, spotPrice: BigNumber): Greeks {
  
  const type = option.type
  // expiry in year
  const t = new BigNumber(option.expiry - (Date.now() / 1000)).div(86400).div(365).toNumber()

  const r = 0
  const s = spotPrice.toNumber()
  const k = option.strikePriceInUSD
  const expectedCost = optionPrice.toNumber()

  const v = iv.getImpliedVolatility(expectedCost, s, k, t, r, type); // 0.11406250000000001 (11.4%)
  return {
    iv: v,
    Delta: greek.getDelta(s, k, t, v, r, type).toFixed(3),
    Gamma: greek.getGamma(s, k, t, v, r).toFixed(3),
    Vega: greek.getVega(s, k, t, v, r).toFixed(3),
    Theta: greek.getTheta(s, k, t, v, r, type).toFixed(3),
    Rho: greek.getRho(s, k, t, v, r, type).toFixed(3),
  }
}
