import Web3 from 'web3';
import BigNumber from 'bignumber.js'
import Onboard from 'bnc-onboard';

import { notify } from './blockNative';
import { getAllowance } from './infura';
import { ETH_ADDRESS } from '../constants/options'

const oTokenABI = require('../constants/abi/OptionContract.json');
const exchangeABI = require('../constants/abi/OptionExchange.json');
const uniswapExchangeABI = require('../constants/abi/UniswapExchange.json');

const DEADLINE_FROM_NOW = 60 * 15;
const UINT256_MAX = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

const storedTheme = window.localStorage.getItem('theme')

const onboard = Onboard({
  darkMode: storedTheme==='dark',
  dappId: '7e7c9d55-dd5e-4ee1-bc38-edf27b59ce06', // [String] The API key created by step one above
  networkId: 1, // [Integer] The Ethereum network ID your Dapp uses.
  subscriptions: {
    wallet: (wallet) => {
      web3 = new Web3(wallet.provider);
    },
  },
  walletSelect: {
    description: "Please select a wallet to connect to Opyn Dashboard",
    wallets: [
      { walletName: 'metamask' },
      {
        walletName: 'walletConnect',
        infuraKey: '44fd23cda65746a699a5d3c0e2fa45d5'
      },
      {
        walletName: 'fortmatic',
        apiKey: 'pk_live_3009900A5E842CD5'
      },
      { walletName: 'trust' },
      { walletName: 'coinbase' },
      { walletName: "status" },
    ]
  }
});

let web3;

export const updateModalMode = async(theme) => {
  const darkMode = theme === 'dark'
  onboard.config({ darkMode })
}

export const connect = async () => {
  const selected = await onboard.walletSelect();
  if (!selected) return false
  const checked = await onboard.walletCheck();
  if(!checked) return false
  return onboard.getState().address;
};

export const disconnect = async() => {
  onboard.walletReset()
}

export const checkConnectedAndGetAddress = async() => {
  let checked = false
  try {
    checked = await onboard.walletCheck();
  } catch (error) {
    await onboard.walletSelect()
    checked = await onboard.walletCheck();
    
  } finally {
    if (checked) return onboard.getState().address;
  }
}

export const liquidate = async (oTokenAddr, owner, liquidateAmt) => {
  const account = await checkConnectedAndGetAddress()
  const oToken = new web3.eth.Contract(oTokenABI, oTokenAddr);

  await oToken.methods
    .liquidate(owner, parseInt(liquidateAmt))
    .send({ from: account })
    .on('transactionHash', (hash) => {
      notify.hash(hash);
    });
};

export const burnOToken = async (oTokenAddr, burnAmt) => {
  const account = await checkConnectedAndGetAddress()
  const oToken = new web3.eth.Contract(oTokenABI, oTokenAddr);
  await oToken.methods
    .burnOTokens(burnAmt)
    .send({ from: account })
    .on('transactionHash', (hash) => {
      notify.hash(hash);
    });
};

export const issueOToken = async (oTokenAddr, issueAmt) => {
  const account = await checkConnectedAndGetAddress()
  const oToken = new web3.eth.Contract(oTokenABI, oTokenAddr);

  await oToken.methods
    .issueOTokens(issueAmt, account)
    .send({ from: account })
    .on('transactionHash', (hash) => {
      notify.hash(hash);
    });
};

export const addETHCollateral = async (oTokenAddr, owner, ethAmt) => {
  const account = await checkConnectedAndGetAddress()
  const oToken = new web3.eth.Contract(oTokenABI, oTokenAddr);
  await oToken.methods
    .addETHCollateral(owner)
    .send({ from: account, value: web3.utils.toWei(ethAmt.toString()) })
    .on('transactionHash', (hash) => {
      notify.hash(hash);
    });
};

/**
 * 
 * @param {string} collaral 
 * @param {string} oTokenAddr 
 * @param {string} owner 
 * @param {number|string} collateralAmt in min unit
 */
export const addERC20Collateral = async (collateral, oTokenAddr, owner, collateralAmt) => {
  const collateralAmtBN = new BigNumber(collateralAmt)
  const account = await checkConnectedAndGetAddress()
  const oToken = new web3.eth.Contract(oTokenABI, oTokenAddr);
  const allowance = await getAllowance(collateral, account, oTokenAddr);
  // Approve to move collateral 
  if (new BigNumber(allowance).lt(collateralAmtBN)) {
    const collateralToken = new web3.eth.Contract(oTokenABI, collateral)
    await collateralToken.methods
      .approve(oTokenAddr, UINT256_MAX)
      .send({ from: account })
      .on('transactionHash', (hash) => {
        notify.hash(hash);
      });
  } 
  await oToken.methods
    .addERC20Collateral(owner, collateralAmtBN.toString())
    .send({ from: account })
    .on('transactionHash', (hash) => {
      notify.hash(hash);
    });

}

/**
 * 
 * @param {string} collateral 
 * @param {string} oTokenAddr 
 * @param {string} collateralAmt in base unit
 */
export const removeCollateral = async (collateral, oTokenAddr, collateralAmt) => {
  const account = await checkConnectedAndGetAddress()
  const oToken = new web3.eth.Contract(oTokenABI, oTokenAddr);
  if(collateral === ETH_ADDRESS) {
    await oToken.methods
      .removeCollateral(collateralAmt)
      .send({ from: account })
      .on('transactionHash', (hash) => {
        notify.hash(hash);
      });
  } else {
    await oToken.methods
      .removeCollateral(collateralAmt)
      .send({ from: account })
      .on('transactionHash', (hash) => {
        notify.hash(hash);
      });
  }
};

export const redeem = async(token) => {
  const account = await checkConnectedAndGetAddress()
  const oToken = new web3.eth.Contract(oTokenABI, token);
  await oToken.methods
    .redeemVaultBalance()
    .send({from: account})
    .on('transactionHash', (hash) => {
      notify.hash(hash);
    });
}


export const approve = async (oTokenAddr, spender, amt) => {
  const account = await checkConnectedAndGetAddress()
  const oToken = new web3.eth.Contract(oTokenABI, oTokenAddr);
  await oToken.methods
    .approve(spender, amt)
    .send({ from: account })
    .on('transactionHash', (hash) => {
      notify.hash(hash);
    });
};

export const openVault = async (oTokenAddr) => {
  const account = await checkConnectedAndGetAddress()
  const oToken = new web3.eth.Contract(oTokenABI, oTokenAddr);
  await oToken.methods
    .openVault()
    .send({ from: account })
    .on('transactionHash', (hash) => {
      notify.hash(hash);
    });
};

// Option Exchange

export const buyOTokensFromExchange = async (oTokenAddr, exchangeAddr, buyAmt, ethAmt) => {
  const account = await checkConnectedAndGetAddress()
  const exchange = new web3.eth.Contract(exchangeABI, exchangeAddr);
  await exchange.methods
    .buyOTokens(
      account,
      oTokenAddr,
      '0x0000000000000000000000000000000000000000', // payment
      buyAmt
    )
    .send({ from: account, value: ethAmt })
    .on('transactionHash', (hash) => {
      notify.hash(hash);
    });
};

export const sellOTokensFromExchange = async (oTokenAddr, exchangeAddr, sellAmt) => {
  const account = await checkConnectedAndGetAddress()  
  const allowance = await getAllowance(oTokenAddr, account, exchangeAddr);
  if (new BigNumber(allowance).lt(new BigNumber(sellAmt))) {
    await approve(oTokenAddr, exchangeAddr, UINT256_MAX);
  }
  const exchange = new web3.eth.Contract(exchangeABI, exchangeAddr);
  await exchange.methods
    .sellOTokens(
      account,
      oTokenAddr,
      '0x0000000000000000000000000000000000000000', // payment
      sellAmt
    )
    .send({ from: account })
    .on('transactionHash', (hash) => {
      notify.hash(hash);
    });
};

// Uniswap Exchange

/**
 *
 */
export const addLiquidity = async (oToken, uniswapAddr, maxToken, minLiquidity, ethInWei) => {
  const account = await checkConnectedAndGetAddress()
  const allowance = await getAllowance(oToken, account, uniswapAddr);
  if (new BigNumber(allowance).lt(new BigNumber(maxToken))) {
    await approve(oToken, uniswapAddr, UINT256_MAX);
  }
  const uniswapExchange = new web3.eth.Contract(uniswapExchangeABI, uniswapAddr);
  const deadline = Math.ceil(Date.now() / 1000) + DEADLINE_FROM_NOW;
  await uniswapExchange.methods
    .addLiquidity(
      minLiquidity, // min_liquidity
      maxToken, // max_tokens
      deadline // deadline
    )
    .send({ from: account, value: ethInWei })
    .on('transactionHash', (hash) => {
      notify.hash(hash);
    });
};

/**
 *
 */
export const removeLiquidity = async (uniswapAddr, pool_token_amount, min_eth_wei, min_tokens) => {
  const account = await checkConnectedAndGetAddress()
  const uniswapExchange = new web3.eth.Contract(uniswapExchangeABI, uniswapAddr);
  const deadline = Math.ceil(Date.now() / 1000) + DEADLINE_FROM_NOW;
  await uniswapExchange.methods
    .removeLiquidity(pool_token_amount, min_eth_wei, min_tokens, deadline)
    .send({
      from: account,
    })
    .on('transactionHash', (hash) => {
      notify.hash(hash);
    });
};
