import BigNumber from 'bignumber.js'

export type tradeType = 'buy' | 'sell'

export type OptionRealTimeStat = {
  option: string, 
  bestAskPrice: BigNumber, 
  bestBidPrice: BigNumber, 
  totalBidAmt: BigNumber,
  totalAskAmt: BigNumber, 
  bestAsk: order | undefined, 
  bestBid: order | undefined
}


export type order = {
  type?: 'Bid' | 'Ask',
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