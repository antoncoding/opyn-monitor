
export type token = {
  addr: string,
  decimals: number,
  symbol: string,
};

export type option = {
  addr: string,
  title: string,
  symbol: string,
  name: string,
  type: 'insurance' | 'call' | 'put'
  decimals: number,
  oracle: string,
  collateral: token,
  underlying: token,
  strike: token,
  strikePrice: number,
  minRatio: number,
  exchange: string,
  uniswapExchange: string,
  expiry: number,
};

export type ETHOption = option & { 
  type: 'call' | 'put'
  strikePriceInUSD: number
} 
