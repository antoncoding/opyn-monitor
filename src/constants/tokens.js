import * as imgs from '../imgs';

export const USDC = {
  addr: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  decimals: 6,
  symbol: 'USDC',
  img: imgs.USDC,
};

export const OPYN_ETH = {
  addr: '0x0000000000000000000000000000000000000000',
  decimals: 18,
  symbol: 'ETH',
  img: imgs.ETH,
};

export const cDAI = {
  addr: '0x5d3a536e4d6dbd6114cc1ead35777bab948e3643',
  decimals: 8,
  symbol: 'cDAI',
  img: imgs.cDAI,
  protocol: 'Compound',
};

export const cUSDC = {
  addr: '0x39aa39c021dfbae8fac545936693ac917d5e7563',
  decimals: 8,
  symbol: 'cUSDC',
  img: imgs.cUSDC,
  protocol: 'Compound',
};

export const CurveFi = {
  addr: '0xdf5e0e81dff6faf3a7e52ba697820c5e32d806a8',
  decimals: 18,
  symbol: 'yDAI+yUSDC+yUSDT+yTUSD',
};

export const WETH = {
  addr: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  decimals: 18,
  symbol: 'WETH',
};

export const DAI = {
  addr: '0x6b175474e89094c44da98b954eedeac495271d0f',
  decimals: 18,
  symbol: 'DAI',
};

export const yDAI = {
  addr: '0x16de59092dae5ccf4a1e6439d611fd0653f0bd01',
  decimals: 18,
  symbol: 'yDAI',
};

export const aUSDC = {
  addr: '0x9ba00d6856a4edf4665bca2c2309936572473b7e',
  decimals: 6,
  symbol: 'aUSDC',
  img: imgs.aUSDC,
  protocol: 'Aave',
};

export const COMP = {
  addr: '0xc00e94cb662c3520282e6f5717214004a7f26888',
  decimals: 18,
  img: imgs.COMP,
  symbol: 'COMP',
};

export const BAL = {
  addr: '0xba100000625a3754423978a60c9317c58a424e3d',
  decimals: 18,
  symbol: 'BAL',
  img: imgs.BalancerLogo,
};

export const YFI = {
  addr: '0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e',
  decimals: 18,
  symbol: 'YFI',
  img: imgs.YFI,
};

export const CRV = {
  addr: '0xd533a949740bb3306d119cc777fa900ba034cd52',
  decimals: 18,
  symbol: 'CRV',
  img: imgs.CRV,
};

export const UNI = {
  addr: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
  decimals: 18,
  symbol: 'UNI',
  img: imgs.UNI,
};

export const knownTokens = [USDC, OPYN_ETH, cDAI, cUSDC, CurveFi, WETH, DAI, yDAI, aUSDC, COMP, BAL, YFI, CRV, UNI];
