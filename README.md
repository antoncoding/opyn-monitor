# Opyn Monitor

[![Netlify Status](https://api.netlify.com/api/v1/badges/aff350a5-fd8c-49c8-b8c6-c96bd69d5343/deploy-status)](https://app.netlify.com/sites/opynmoinor/deploys)

<p align="center">
<img src="./public/favicon.ico" height=100>

<p align="center"><code>  Position Management for Opyn assets</code></p>

Opyn Monitor is an open source frontend interface for Opyn, an decentralized option protocol. This project is built by the community and maintained by @antoncoding. 

Currently hosted on: [opynmonitor.xyz](https://opynmonitor.xyz/#/). 

## Disclaimer
* This is not the official interface to interact with Opyn. Please visit Opyn.co to use the official interface provided by the opyn core team.

* Frontend code is not verified or auditted in any way, please use at your own risk.

## Contracts this UI interacts with

* [Opyn](https://github.com/opynfinance/Convexity-Protocol): option core
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

## Donation

Any Donations are appreciated :yellow_heart:, you can contribute through [GitCoin Grant](https://gitcoin.co/grants/1064/opyn-monitor) or directly send any token to the following address:

```ethereum
0xD325E15A52B780698C45CA3BdB6c49444fe5B588
```

## Screenshots

### All Opyn Options

![all](https://i.imgur.com/yisoOuF.png)

### Trade ETH Options

![trade](https://i.imgur.com/r1vTdIz.png)
