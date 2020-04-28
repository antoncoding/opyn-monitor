export type vault = {
  owner: string,
  oTokensIssued: string,
  collateral: string,
  underlying: string,
};

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

export type order = {
  order: {
    signature: string
    senderAddress: string
    makerAddress: string
    takerAddress: string
    makerFee: string
    takerFee: string
    makerAssetAmount: string
    takerAssetAmount: string
    makerAssetData: string
    takerAssetData: string
    salt: string
    exchangeAddress: string
    feeRecipientAddress: string
    expirationTimeSeconds: string
    makerFeeAssetData: string
    chainId: string
    takerFeeAssetData: string
  },
  metaData: {
    orderHash: string,
    remainingFillableTakerAssetAmount: string
  }
}