/* eslint-disable import/prefer-default-export */
import * as tokens from '../tokens';

export const eth_calls = [
  {
    addr: '0xbcae1db14f1b366cd4611c75aab2031492b136e9',
    title: 'ETH Call $250 05/29/20',

    // constants in contract
    symbol: 'oETH $250 Call',
    name: 'Opyn ETH Call $250 05/29/20',
    decimals: 6,
    oracle: '0x7054e08461e3eCb7718B63540adDB3c3A1746415',
    collateral: tokens.OPYN_ETH,
    underlying: tokens.USDC,
    strike: tokens.OPYN_ETH,
    strikePrice: 4e-9,
    strikePriceInUSD: 250,
    minRatio: 1,
    exchange: '0x39246c4f3f6592c974ebc44f80ba6dc69b817c71',
    uniswapExchange: '0xb1C9e4d652259467e4556BA627B00b284481744E', // wrong
    expiry: 1590739200,
  },
];
