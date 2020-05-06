import BigNumber from 'bignumber.js'

export type greeks = {
  Delta: number,
  Gamma: number,
  Vega: number,
  Theta: number,
  Rho: number,
}

export type stats = {
  OpenInterest: BigNumber,
  IV: BigNumber,
} & greeks