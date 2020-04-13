import { assetDataUtils } from '@0x/order-utils';
import BigNumber from 'bignumber.js';
import { WETH } from '../constants/contracts';

import { toTokenUnitsBN } from './number';

const Promise = require('bluebird');

const endpoint = 'https://api.0x.org/';

/**
 * get orderbook: BASE:QUOTE
 * @param {string} base
 * @param {string} quote
 * @return {Promise<{
  bids: {total: number, page: number, perPage: number, records: {
    order: {
      signature: string,
      senderAddress: string,
      makerAddress: string,
      takerAddress: string,
      makerFee: string,
      takerFee: string,
      makerAssetAmount: string,
      takerAssetAmount: string,
      makerAssetData: string,
      takerAssetData: string,
      salt: string,
      exchangeAddress: string,
      feeRecipientAddress: string,
      expirationTimeSeconds: string,
      makerFeeAssetData: string,
      chainId: number,
      takerFeeAssetData: string
    },
    metaData: {
      orderHash: string,
      remainingFillableTakerAssetAmount: string
    }
  }[]},
  asks: {total: number, page: number, perPage: number, records: {
    order: {
      signature: string,
      senderAddress: string,
      makerAddress: string,
      takerAddress: string,
      makerFee: string,
      takerFee: string,
      makerAssetAmount: string,
      takerAssetAmount: string,
      makerAssetData: string,
      takerAssetData: string,
      salt: string,
      exchangeAddress: string,
      feeRecipientAddress: string,
      expirationTimeSeconds: string,
      makerFeeAssetData: string,
      chainId: number,
      takerFeeAssetData: string
    },
    metaData: {
      orderHash: string,
      remainingFillableTakerAssetAmount: string
    }
  }[]}
}>}
 */
export async function getOrderBook(base, quote) {
  const baseAsset = assetDataUtils.encodeERC20AssetData(base);
  const quoteAsset = assetDataUtils.encodeERC20AssetData(quote);
  return request(`sra/v3/orderbook?baseAssetData=${baseAsset}&quoteAssetData=${quoteAsset}&perPage=${100}`);
}

/**
 * get oToken:WETH stats (v1) for all options
 * @param {Array<{addr:string, decimals:number}>} options
 * @return {Promise<Arrya< option: address, bestAskPrice: BigNumber, bestAskPrice:BigNumber, bestAsk:{}, bestBid:{} >>}
 */
export async function getBasePairAskAndBids(options) {
  const bestAskAndBids = await Promise.map(options, async ({ addr: option, decimals }) => {
    const { asks, bids } = await getOrderBook(option, WETH);
    const validAsks = asks.records.filter((record) => isValid(record, decimals));
    const validBids = bids.records.filter((record) => isValid(record, decimals));
    const { makerAssetAmount: askTokenAmt, takerAssetAmount: askWETHAmt } = validAsks[0].order;
    const { makerAssetAmount: bidWETHAmt, takerAssetAmount: bidTokenAmt } = validBids[0].order;
    const bestAskPrice = toTokenUnitsBN(askWETHAmt, 18).div(toTokenUnitsBN(askTokenAmt, decimals));
    const bestBidPrice = toTokenUnitsBN(bidWETHAmt, 18).div(toTokenUnitsBN(bidTokenAmt, decimals));
    return {
      option, bestAskPrice, bestBidPrice, bestAsk: validAsks[0], bestBid: validBids[0],
    };
  });
  return bestAskAndBids;
}

/**
 *
 * @param {string} path
 */
async function request(path) {
  const res = await fetch(`${endpoint}${path}`);
  return res.json();
}

export function connectWebSocket(_orders, setBuyOrders) {
  const socket = new WebSocket('wss://api.0x.org/sra/v3');
  socket.onopen = () => {
    // console.log(`socket open ${e}`);
    socket.send(JSON.stringify({
      type: 'subscribe',
      channel: 'orders',
      requestId: '123e4567-e89b-12d3-a456-426655440000',
      makerAssetProxyId: '0xf47261b0',
      makerAssetData: '0x6b175474e89094c44da98b954eedeac495271d0f',
      takerAssetProxyId: '0xf47261b0',
      takerAssetData: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    }));
  };
  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    const entry = data.payload[0];

    const newOrders = _orders.concat(entry);
    setBuyOrders(newOrders);
  };
}

/**
 *
 * @param {*} entry
 * @param {*} decimals
 */
export const isValid = (entry, takerAssetDecimals) => {
  const notExpired = parseInt(entry.order.expirationTimeSeconds, 10) > Date.now() / 1000;
  // notDust: not very good
  const notDust = new BigNumber(entry.metaData.remainingFillableTakerAssetAmount)
    .gt(new BigNumber(0.0001).times(new BigNumber(10).pow(takerAssetDecimals)));
  return notExpired && notDust;
};

export const createOrder = (maker, makerAsset, takerAsset, makerAssetAmount, takerAssetAmount) => {
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
    expirationTimeSeconds: '1587389907', // 4/20
    makerFeeAssetData: '0x',
    chainId: 1,
    takerFeeAssetData: '0x',
  };
  return order;
};

export const broadcastOrders = async (orders) => {
  console.log(JSON.stringify(orders));
  const url = `${endpoint}sra/v3/orders`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orders),
  }).catch((error) => {
    console.error(error);
  });
  return res;
};

export const getBidPrice = (bid) => new BigNumber(bid.order.makerAssetAmount)
  .div(new BigNumber(bid.order.takerAssetAmount));

/**
 *
 * @param {{}} ask
 */
export const getAskPrice = (ask) => new BigNumber(ask.order.takerAssetAmount)
  .div(new BigNumber(ask.order.makerAssetAmount));

export const getOrderFillRatio = (order) => new BigNumber(100)
  .minus(new BigNumber(order.metaData.remainingFillableTakerAssetAmount)
    .div(new BigNumber(order.order.takerAssetAmount))
    .times(100)).toFixed(2);
