/* eslint-disable import/prefer-default-export */
import * as tokens from '../tokens';

export const eth_puts = [
  {
    addr: '0x48ab8a7d3bf2eb942e153e4275ae1a8988238dc7',
    title: 'ETH Put $100 04/03/20',

    // constants in contract
    symbol: 'oETH $100 Put',
    name: 'Opyn ETH Put $100 04/03/20',
    decimals: 8,
    oracle: '0x7054e08461e3eCb7718B63540adDB3c3A1746415',
    collateral: tokens.USDC,
    underlying: tokens.OPYN_ETH,
    strike: tokens.USDC,
    strikePrice: 1e-6,
    strikePriceInUSD: 100,
    minRatio: 1,
    exchange: '0x39246c4f3f6592c974ebc44f80ba6dc69b817c71',
    uniswapExchange: '0x30651Fc7F912f5E40AB22F3D34C2159431Fb1c4F',
    expiry: 1585958340,
  },
  {
    addr: '0x6c79f10543c7886c6946b8a996f824e474bac8f2',
    title: 'ETH Put $100 04/24/20',

    // constants in contract
    symbol: 'oETH $100 Put',
    name: 'Opyn ETH Put $100 04/24/20',
    decimals: 8,
    oracle: '0x7054e08461e3eCb7718B63540adDB3c3A1746415',
    collateral: tokens.USDC,
    underlying: tokens.OPYN_ETH,
    strike: tokens.USDC,
    strikePrice: 1e-6,
    strikePriceInUSD: 100,
    minRatio: 1,
    exchange: '0x39246c4f3f6592c974ebc44f80ba6dc69b817c71',
    uniswapExchange: '0x5734a78b1985B47dF3fbf1736c278F57c2C30983',
    expiry: 1587715200,
  },
  {
    addr: '0xaefc7b368f7b536c9e5e3f342bf534931ce58584',
    title: 'ETH Put $150 04/24/20',
    // constants in contract
    symbol: 'oETH $150 Put',
    name: 'Opyn ETH Put $150 04/24/20',
    decimals: 7,
    oracle: '0x7054e08461e3eCb7718B63540adDB3c3A1746415',
    collateral: tokens.USDC,
    underlying: tokens.OPYN_ETH,
    strike: tokens.USDC,
    strikePrice: 1.5e-5,
    strikePriceInUSD: 150,
    minRatio: 1,
    exchange: '0x39246c4f3f6592c974ebc44f80ba6dc69b817c71',
    uniswapExchange: '0xD2840757B0DeF8fBC2A7DC990CEF75975C2d3F0e',
    expiry: 1587715200,
  },
  {
    addr: '0x461cd647add2159e85ad57141cb5371566fceed3',
    title: 'ETH Put $160 05/01/20',

    // constants in contract
    symbol: 'oETH $160 Put',
    name: 'Opyn ETH Put $160 05/01/20',
    decimals: 7,
    oracle: '0x7054e08461e3eCb7718B63540adDB3c3A1746415',
    collateral: tokens.USDC,
    underlying: tokens.OPYN_ETH,
    strike: tokens.USDC,
    strikePrice: 1.6e-5,
    strikePriceInUSD: 160,
    minRatio: 1,
    exchange: '0x39246c4f3f6592c974ebc44f80ba6dc69b817c71',
    uniswapExchange: '0xd03f7298aE74a8618711Ec43F45Ad2225F141aa4',
    expiry: 1588320000,
  },
];
