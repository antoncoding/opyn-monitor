import BigNumber from 'bignumber.js'

export type greeks = {
  Delta: BigNumber
  Gamma: BigNumber
  Vega: BigNumber
  Theta: BigNumber
}

export type stats = {
  OpenInterest: BigNumber,
  IV: BigNumber,
} & greeks