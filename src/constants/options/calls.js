/* eslint-disable import/prefer-default-export */
import * as tokens from '../tokens';

export const eth_calls = [
  {
    addr: '0x6ba566e667bdefcec27955689e30a56872cacf98',
    title: '(test) ETH Call $200 04/24/20',

    // constants in contract
    symbol: 'oETH $200 Call',
    name: 'Opyn ETH Call $200 04/24/20',
    decimals: 8,
    oracle: '0x7054e08461e3eCb7718B63540adDB3c3A1746415',
    collateral: tokens.OPYN_ETH,
    underlying: tokens.USDC,
    strike: tokens.OPYN_ETH,
    strikePrice: 5e-9,
    strikePriceInUSD: 200,
    minRatio: 1,
    exchange: '0x39246c4f3f6592c974ebc44f80ba6dc69b817c71',
    uniswapExchange: '0x30651Fc7F912f5E40AB22F3D34C2159431Fb1c4F', // wrong
    expiry: 1587715200,
  },
];
