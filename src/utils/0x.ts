/* eslint-disable no-restricted-syntax */
import { assetDataUtils } from '@0x/order-utils';
import BigNumber from 'bignumber.js';
import { USDC } from '../constants/tokens';

import { toTokenUnitsBN } from './number';
import * as types from '../types'

const Promise = require('bluebird');

const endpoint = 'https://api.0x.org/';

type entries = {
  total:number,
  page:number,
  perPage:number,
  records: types.order[]
}


/**
 * get orderbook: BASE:QUOTE
 */
export async function getOrderBook(base:string, quote:string): Promise<{
  asks:entries, bids:entries
}> {
  const baseAsset = assetDataUtils.encodeERC20AssetData(base);
  const quoteAsset = assetDataUtils.encodeERC20AssetData(quote);
  return request(`sra/v3/orderbook?baseAssetData=${baseAsset}&quoteAssetData=${quoteAsset}&perPage=${100}`);
}

/**
 * get oToken:WETH stats (v1) for all options
 * @param {Array<{addr:string, decimals:number}>} options
 * @param {{addr:string, decimals:number}} quoteAsset
 * @return {Promise<Array<
 * {option: string, bestAskPrice: BigNumber, bestAskPrice:BigNumber,
 * totalBidAmt:BigNumber, totalAskAmt:BigNumber,
 * bestAsk:{}, bestBid:{}
 * }>>}
 */
export async function getBasePairAskAndBids(options: types.option[], quoteAsset:types.token): Promise<types.OptionRealTimeStat[]> {
  const bestAskAndBids = await Promise.map(options, async ({ addr: option, decimals }) => {
    const { asks, bids } = await getOrderBook(option, USDC.addr);
    let totalBidAmt = new BigNumber(0);
    let totalAskAmt = new BigNumber(0);
    let bestAskPrice = new BigNumber(0);
    let bestBidPrice = new BigNumber(0);
    let bestAsk: types.order|undefined; 
    let bestBid: types.order|undefined;
    const validAsks = asks.records.filter((record) => isValid(record));
    if (validAsks.length > 0) {
      totalAskAmt = validAsks
        .reduce((prev, cur) => prev.plus(toTokenUnitsBN(
          getRemainingMakerAndTakerAmount(cur).remainingMakerAssetAmount, decimals,
        )), new BigNumber(0));

      const { makerAssetAmount: askTokenAmt, takerAssetAmount: askQuoteAmt } = validAsks[0].order;
      bestAskPrice = toTokenUnitsBN(askQuoteAmt, quoteAsset.decimals).div(toTokenUnitsBN(askTokenAmt, decimals));
      bestAsk = validAsks[0];
    }

    const validBids = bids.records.filter((record) => isValid(record));
    if (validBids.length > 0) {
      totalBidAmt = validBids
        .reduce((prev, cur) => prev.plus(toTokenUnitsBN(
          cur.metaData.remainingFillableTakerAssetAmount, decimals,
        )), new BigNumber(0));

      const { makerAssetAmount: bidQuoteAmt, takerAssetAmount: bidTokenAmt } = validBids[0].order;
      bestBidPrice = toTokenUnitsBN(bidQuoteAmt, quoteAsset.decimals).div(toTokenUnitsBN(bidTokenAmt, decimals));
      bestBid = validBids[0];
    }

    return {
      option, bestAskPrice, bestBidPrice, bestAsk, bestBid, totalBidAmt, totalAskAmt,
    };
  });
  return bestAskAndBids;
}

/**
 *
 * @param {string} path
 */
async function request(path:string): Promise<any> {
  const res = await fetch(`${endpoint}${path}`);
  return res.json();
}

/**
 * Return true if the order is valid
 */
export const isValid = (entry: types.order) => {
  const notExpired = parseInt(entry.order.expirationTimeSeconds, 10) > Date.now() / 1000;
  const notDust = parseInt(getOrderFillRatio(entry)) < 100;
  return notExpired && notDust;
};

/**
 * Create Order Object
 */
export const createOrder = (maker:string, makerAsset:string, takerAsset:string, makerAssetAmount:BigNumber, takerAssetAmount:BigNumber, expiry:number) => {
  const salt = BigNumber.random(20).times(new BigNumber(10).pow(new BigNumber(20))).integerValue().toString(10);
  const order = {
    senderAddress: '0x0000000000000000000000000000000000000000',
    makerAddress: maker,
    takerAddress: '0x0000000000000000000000000000000000000000',
    makerFee: '0',
    takerFee: '0',
    makerAssetAmount: makerAssetAmount.toString(),
    takerAssetAmount: takerAssetAmount.toString(),
    makerAssetData: assetDataUtils.encodeERC20AssetData(makerAsset),
    takerAssetData: assetDataUtils.encodeERC20AssetData(takerAsset),
    salt,
    exchangeAddress: '0x61935cbdd02287b511119ddb11aeb42f1593b7ef',
    feeRecipientAddress: '0x1000000000000000000000000000000000000011',
    expirationTimeSeconds: expiry.toString(),
    makerFeeAssetData: '0x',
    chainId: 1,
    takerFeeAssetData: '0x',
  };
  return order;
};

/**
 * Send orders to the mesh node
 * @param {*} orders
 */
export const broadcastOrders = async (orders: types.orderToSubmit[]) => {
  const url = `${endpoint}sra/v3/orders`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orders),
  });
  if (res.status === 200) return;
  const jsonRes = await res.json();
  throw jsonRes.validationErrors[0].reason;
};

/**
 * Calculate the price of a bid order
 */
export const getBidPrice = (bid: types.order, makerAssetDecimals:number, takerAssetDecimals:number):BigNumber => {
  const makerAssetAmount = toTokenUnitsBN(bid.order.makerAssetAmount, makerAssetDecimals);
  const takerAssetAmount = toTokenUnitsBN(bid.order.takerAssetAmount, takerAssetDecimals);
  return makerAssetAmount.div(takerAssetAmount);
};

/**
 * Calculate price of an ask order
 * @description maker want to sell oToken
 * takerAssetAmount 100 weth
 * makerAssetAmount 1 oToken
 */
export const getAskPrice = (ask: types.order, makerAssetDecimals:number, takerAssetDecimals:number): BigNumber => {
  const makerAssetAmount = toTokenUnitsBN(ask.order.makerAssetAmount, makerAssetDecimals);
  const takerAssetAmount = toTokenUnitsBN(ask.order.takerAssetAmount, takerAssetDecimals);
  return takerAssetAmount.div(makerAssetAmount);
};

export const getOrderFillRatio = (order: types.order) => new BigNumber(100)
  .minus(new BigNumber(order.metaData.remainingFillableTakerAssetAmount)
    .div(new BigNumber(order.order.takerAssetAmount))
    .times(100)).toFixed(2);

/**
 *
 * @param {*} order
 * @return { {remainingTakerAssetAmount: BigNumber, remainingMakerAssetAmount: BigNumber} }
 */
export const getRemainingMakerAndTakerAmount = (order: types.order): {
  remainingTakerAssetAmount: BigNumber,
  remainingMakerAssetAmount: BigNumber } => {
  const remainingTakerAssetAmount = new BigNumber(order.metaData.remainingFillableTakerAssetAmount);
  const makerAssetAmountBN = new BigNumber(order.order.makerAssetAmount);
  const takerAssetAmountBN = new BigNumber(order.order.takerAssetAmount);
  const remainingMakerAssetAmount = remainingTakerAssetAmount.multipliedBy(makerAssetAmountBN).div(takerAssetAmountBN);
  return { remainingTakerAssetAmount, remainingMakerAssetAmount };
};

/**
 *
 * @param {{}[]} orders
 * @return {}
 */
export const getOrdersTotalFillables = (orders: types.order[]): {
  totalFillableTakerAmount: BigNumber,
  totalFillableMakerAmount:BigNumber, 
  fillableTakerAmounts: string[]
} => {
  const totalFillableTakerAmount = orders
    .map((order) => new BigNumber(order.metaData.remainingFillableTakerAssetAmount))
    .reduce((prev, next) => prev.plus(new BigNumber(next)), new BigNumber(0));

  const totalFillableMakerAmount = orders
    .map((order) => getRemainingMakerAndTakerAmount(order).remainingMakerAssetAmount)
    .reduce((prev, next) => prev.plus(new BigNumber(next)), new BigNumber(0));

  const fillableTakerAmounts = orders.map((o) => o.metaData.remainingFillableTakerAssetAmount);

  return { totalFillableTakerAmount, totalFillableMakerAmount, fillableTakerAmounts };
};

/**
 * Get lastest gas price info from ethgasstation
 */
export const getGasPrice = async (): Promise<{
  fast: number, fastest: number ,safeLow: number,average: number,block_time: number,speed: number,safeLowWait: number,avgWait: number,fastWait: number,fastestWait: number,}> => {
  const url = 'https://ethgasstation.info/json/ethgasAPI.json';
  const res = await fetch(url);
  return res.json();
};

type targetAsset = 'maker' | 'taker'

/**
 * Return Minimal orders needed for target amount
 */
export const findMinOrdersForAmount = (selectedOrders: types.order[], targetAmount: BigNumber, targetAsset: targetAsset) => {
  let sum = new BigNumber(0);
  const requiredOrders: types.order[] = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const order of selectedOrders) {
    const amount = targetAsset === 'maker'
      ? new BigNumber(order.order.makerAssetAmount)
      : new BigNumber(order.order.takerAssetAmount);
    sum = sum.plus(amount);
    requiredOrders.push(order);

    if (sum.gt(targetAmount)) {
      break;
    }
  }
  return requiredOrders;
};

/**
 * @description Loop through selected orders and see what's the exact taker amount
 * and maker amount fulfilling the requirement
 */
export const getFillAmountsOfOrders = (
  selectedOrders: types.order[], 
  targetTakerAstAmount: BigNumber | undefined, 
  targetMakerAstAmount: BigNumber | undefined
  ): {
    sumTakerAmount:BigNumber,
    sumMakerAmount: BigNumber,
    takerAmountArray: string[]
  } => {
  // const fillables = getRemainingMakerAndTakerAmount(selectedOrders);
  let sumTakerAmount = new BigNumber(0);
  let sumMakerAmount = new BigNumber(0);
  const takerAmountArray: string[] = [];
  for (const order of selectedOrders) {
    const {
      remainingMakerAssetAmount: makerAmount,
      remainingTakerAssetAmount: takerAmount,
    } = getRemainingMakerAndTakerAmount(order);
    if (targetTakerAstAmount !== undefined) {
      if (sumTakerAmount.plus(takerAmount).lte(targetTakerAstAmount)) {
        sumTakerAmount = sumTakerAmount.plus(takerAmount);
        sumMakerAmount = sumMakerAmount.plus(makerAmount);
        takerAmountArray.push(takerAmount.toString());
      } else {
        const takerAmountNeeded = targetTakerAstAmount.minus(sumTakerAmount);
        const makerAmountNeeded = takerAmountNeeded.div(takerAmount).times(makerAmount);
        sumTakerAmount = sumTakerAmount.plus(takerAmountNeeded);
        sumMakerAmount = sumMakerAmount.plus(makerAmountNeeded);
        takerAmountArray.push(takerAmountNeeded.toString());
        break;
      }
    } else if (targetMakerAstAmount !== undefined) {
      // user enter mekr ast amount
      if (sumMakerAmount.plus(makerAmount).lte(targetMakerAstAmount)) {
        sumTakerAmount = sumTakerAmount.plus(takerAmount);
        sumMakerAmount = sumMakerAmount.plus(makerAmount);
        takerAmountArray.push(takerAmount.toString());
      } else {
        const makerAmountNeeded = targetMakerAstAmount.minus(sumMakerAmount);
        const takerAmountNeeded = makerAmountNeeded.div(makerAmount).multipliedBy(takerAmount);
        sumTakerAmount = sumTakerAmount.plus(takerAmountNeeded);
        sumMakerAmount = sumMakerAmount.plus(makerAmountNeeded);
        takerAmountArray.push(takerAmountNeeded.toString());
        break;
      }
    } else {
      throw new Error('wrong input to CalculateMixRate');
    }
  }
  return { sumTakerAmount, sumMakerAmount, takerAmountArray };
};
