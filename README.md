# Opyn Vault Monitor

[![Netlify Status](https://api.netlify.com/api/v1/badges/aff350a5-fd8c-49c8-b8c6-c96bd69d5343/deploy-status)](https://app.netlify.com/sites/opynmoinor/deploys)

This is a frontend for users to easily manage assets on Opyn protocol. Currently hosted on GitHub Page: [opynmonitor.xyz](https://opynmonitor.xyz/#/) For more information about Opyn protocol, Please visit https://opyn.co/

## Contracts this UI interacts with

* [Opyn](https://github.com/opynfinance/Convexity-Protocol): option contract and exchange
* [0x](https://0x.org/): 0x trading dex
* [Flashloan liquidator](https://github.com/antoncoding/LiquidatorBot): Flashloan liquidator built with [Kollateral](https://www.kollateral.co/) aggregator

### Other services / libraries used

* [AragonUI](https://github.com/aragon/aragon-ui) - UI lib
* [Blocknative](https://www.blocknative.com/) - onboarding and mempool notify sdk.
* [The Graph](https://thegraph.com/)

## Install & Run

```shell
npm install && npm start
```

## Screenshots

### All Opyn Options

![all](https://i.imgur.com/yisoOuF.png)

### Trade ETH Options

![trade](https://i.imgur.com/r1vTdIz.png)
