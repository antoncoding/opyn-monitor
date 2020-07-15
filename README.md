# Opyn Vault Monitor

[![Netlify Status](https://api.netlify.com/api/v1/badges/aff350a5-fd8c-49c8-b8c6-c96bd69d5343/deploy-status)](https://app.netlify.com/sites/heuristic-babbage-d6f109/deploys)

This is a frontend for users to easily manage/liquidate vaults under opyn protocol, and also buy/sell options. For more information about opyn protocol, take a look at https://opyn.co/

### Contracts this UI interacts with:
* [Opyn](https://github.com/opynfinance/Convexity-Protocol): option contract and exchange
* [0x](https://0x.org/): 0x trading dex
* [Flashloan liquidator](https://github.com/antoncoding/LiquidatorBot): Flashloan liquidator built with [Kollateral](https://www.kollateral.co/) aggregator


#### Other services used:
* [AragonUI](https://github.com/aragon/aragon-ui) - UI lib
* [Blocknative](https://www.blocknative.com/) - onboarding and mempool notify sdk.
* [The Graph](https://thegraph.com/)


## Install & Run

```shell
npm install && npm start

npm run deploy
```

## Screenshot
![](https://i.imgur.com/CCZWQmM.png)

