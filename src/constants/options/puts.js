/* eslint-disable import/prefer-default-export */
export const eth_puts = [
  {
    addr: '0x48ab8a7d3bf2eb942e153e4275ae1a8988238dc7',
    title: 'ETH Put $100 04/03/20',

    // constants in contract
    symbol: 'oETH $100 Put',
    name: 'Opyn ETH Put $100 04/03/20',
    decimals: 8,
    oracle: '0x7054e08461e3eCb7718B63540adDB3c3A1746415',
    collateral: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    underlying: '0x0000000000000000000000000000000000000000',
    strike: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    strikePrice: 1e-6,
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
    collateral: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    underlying: '0x0000000000000000000000000000000000000000',
    strike: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    strikePrice: 1e-6,
    minRatio: 1,
    exchange: '0x39246c4f3f6592c974ebc44f80ba6dc69b817c71',
    uniswapExchange: '0x5734a78b1985B47dF3fbf1736c278F57c2C30983',
    expiry: 1587715200,
  },
];

// Fake data only for 0x testing
export const mock_eth_puts = [
  {
    addr: '0x6b175474e89094c44da98b954eedeac495271d0f', // its' actually dai
    title: 'ETH Put $100 04/03/20',

    // constants in contract
    symbol: 'oETH $150 Put',
    name: 'Opyn ETH Put $150 04/03/20',
    decimals: 18,
    oracle: '0x7054e08461e3eCb7718B63540adDB3c3A1746415',
    collateral: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    underlying: '0x0000000000000000000000000000000000000000',
    strike: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    strikePrice: 1e-6,
    minRatio: 1,
    exchange: '0x39246c4f3f6592c974ebc44f80ba6dc69b817c71',
    uniswapExchange: '0x30651Fc7F912f5E40AB22F3D34C2159431Fb1c4F',
    expiry: 1585958340,
  },
  {
    addr: '0xe41d2489571d322189246dafa5ebde1f4699f498', // it's actually zrx
    title: 'ETH Put $120 04/24/20',

    // constants in contract
    symbol: 'oETH $120 Put',
    name: 'Opyn ETH Put $120 04/24/20',
    decimals: 18,
    oracle: '0x7054e08461e3eCb7718B63540adDB3c3A1746415',
    collateral: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    underlying: '0x0000000000000000000000000000000000000000',
    strike: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    strikePrice: 1e-6,
    minRatio: 1,
    exchange: '0x39246c4f3f6592c974ebc44f80ba6dc69b817c71',
    uniswapExchange: '0x5734a78b1985B47dF3fbf1736c278F57c2C30983',
    expiry: 1587715200,
  },
  {
    addr: '0x0d8775f648430679a709e98d2b0cb6250d2887ef', // it's actually bat
    title: 'ETH Put $150 04/24/20',

    // constants in contract
    symbol: 'oETH $150 Put',
    name: 'Opyn ETH Put $100 04/24/20',
    decimals: 18,
    oracle: '0x7054e08461e3eCb7718B63540adDB3c3A1746415',
    collateral: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    underlying: '0x0000000000000000000000000000000000000000',
    strike: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    strikePrice: 1e-6,
    minRatio: 1,
    exchange: '0x39246c4f3f6592c974ebc44f80ba6dc69b817c71',
    uniswapExchange: '0x5734a78b1985B47dF3fbf1736c278F57c2C30983',
    expiry: 1587715200,
  },
];
