/* eslint-disable camelcase */
import Web3 from 'web3';
import BigNumber from 'bignumber.js';
import { MetamaskSubprovider } from '@0x/subproviders';
import { signatureUtils } from '@0x/order-utils';
import Onboard from 'bnc-onboard';

import { notify } from './blockNative.ts';
import { getAllowance, getPremiumToPay } from './infura';
import { getPreference, storePreference } from './storage.ts';
import {
  ETH_ADDRESS,
  Kollateral_Liquidator,
  Kollateral_Invoker,
  KETH,
  ZeroX_Exchange,
  WETH,
  Oracle,
  OptionExchange,
} from '../constants/contracts';

import oTokenBytecode from '../constants/bytecode/optionContract';

const oTokenABI = require('../constants/abi/OptionContract.json');
const exchangeABI = require('../constants/abi/OptionExchange.json');
const uniswapExchangeABI = require('../constants/abi/UniswapExchange.json');
const invokerABI = require('../constants/abi/KollateralInvoker.json');
const ZX_ExchagneABI = require('../constants/abi/ZeroX_Exchange.json');
const wrapETHABI = require('../constants/abi/WETH.json');

const DEADLINE_FROM_NOW = 60 * 15;
const UINT256_MAX = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

const INFURA_KEY = process.env.REACT_APP_INFURA_KEY;
const BLOCKNATIVE_KEY = process.env.REACT_APP_BLOCKNATIVE_KEY;
const FORTMATIC_KEY = process.env.REACT_APP_FORTMATIC_KEY;

let web3;

let onboard;

export const initOnboard = async (setAddressCallback) => {
  const previouslySelectedWallet = getPreference('selectedWallet', null);

  onboard = Onboard({
    darkMode: getPreference('theme', 'light') === 'dark',
    dappId: BLOCKNATIVE_KEY, // [String] The API key created by step one above
    networkId: 1, // [Integer] The Ethereum network ID your Dapp uses.
    subscriptions: {
      address: setAddressCallback,
      wallet: (wallet) => {
        storePreference('selectedWallet', wallet.name);
        web3 = new Web3(wallet.provider);
      },
    },
    walletSelect: {
      description: 'Please select a wallet to connect to Opyn Monitor',
      wallets: [
        { walletName: 'metamask' },
        {
          walletName: 'walletConnect',
          infuraKey: INFURA_KEY,
        },
        {
          walletName: 'fortmatic',
          apiKey: FORTMATIC_KEY,
        },
        { walletName: 'trust' },
        { walletName: 'coinbase' },
        { walletName: 'status' },
      ],
    },
  });

  // call wallet select with that value if it exists
  if (previouslySelectedWallet != null) {
    const selected = await onboard.walletSelect(previouslySelectedWallet);
    if (selected) {
      const address = onboard.getState().address;
      setAddressCallback(address);
    }
  }
};

export const updateModalMode = async (theme) => {
  const darkMode = theme === 'dark';
  onboard.config({ darkMode });
};

export const connect = async () => {
  const selected = await onboard.walletSelect();
  if (!selected) return false;
  const checked = await onboard.walletCheck();
  if (!checked) return false;
  return onboard.getState().address;
};

export const disconnect = async () => {
  onboard.walletReset();
};

// eslint-disable-next-line consistent-return
export const checkConnectedAndGetAddress = async () => {
  let checked = false;
  try {
    checked = await onboard.walletCheck();
  } catch (error) {
    await onboard.walletSelect();
    checked = await onboard.walletCheck();
  } finally {
    // eslint-disable-next-line no-unsafe-finally
    if (checked) return onboard.getState().address;
  }
};
/**
 * Deploy a new oToken contract
 * @param {string} _collateral collateral address
 * @param {number} _collExp - collateral decimals
 * @param {string} _underlying underlying address
 * @param {number} _underlyingExp - underlying decimals
 * @param {number} _oTokenExchangeExp decimals
 * @param {number} _strikePrice strikePrice
 * @param {number} _strikeExp striekPrice exp
 * @param {string} _strike strike asset address
 * @param {number} _expiry
 * @param {number} _windowSize
 */
export const deployOTokenContract = async (
  _collateral,
  _collExp,
  _underlying,
  _underlyingExp,
  _oTokenExchangeExp,
  _strikePrice,
  _strikeExp,
  _strike,
  _expiry,
  _windowSize,
) => {
  const account = await checkConnectedAndGetAddress();
  const contract = new web3.eth.Contract(oTokenABI);
  const oToken = await contract.deploy({
    data: oTokenBytecode,
    // eslint-disable-next-line max-len
    arguments: [_collateral, _collExp, _underlying, _underlyingExp, _oTokenExchangeExp, _strikePrice, _strikeExp, _strike, _expiry,
      OptionExchange, Oracle, _windowSize,
    ],
  })
    .send({
      from: account,
    })
    .on('transactionHash', (hash) => {
      notify.hash(hash);
    });

  return oToken.options.address;
};

/**
 * Option Exchange
 */

/**
 * Set token name ans symbol to newly created token
 * @param {*} oTokenAdr
 * @param {*} _symbol
 * @param {*} _name
 */
export const setDetail = async (oTokenAdr, _symbol, _name) => {
  const account = await checkConnectedAndGetAddress();
  // const account = await checkConnectedAndGetAddress();
  const oToken = new web3.eth.Contract(oTokenABI, oTokenAdr);
  await oToken.methods.setDetails(_symbol, _name)
    .send({ from: account })
    .on('transactionHash', (hash) => {
      notify.hash(hash);
    });
};

export const liquidate = async (oTokenAddr, owner, liquidateAmt) => {
  const account = await checkConnectedAndGetAddress();
  const oToken = new web3.eth.Contract(oTokenABI, oTokenAddr);

  await oToken.methods
    .liquidate(owner, liquidateAmt)
    .send({ from: account })
    .on('transactionHash', (hash) => {
      notify.hash(hash);
    });
};

/**
 *
 * @param {string} oTokenAddr
 * @param {string} optionExchange
 * @param {string} owner
 * @param {string} paymentToken payment token address
 */
export const kollateralLiquidate = async (oTokenAddr, optionExchange, owner, paymentToken) => {
  const account = await checkConnectedAndGetAddress();

  const oToken = new web3.eth.Contract(oTokenABI, oTokenAddr);
  const amountOTokens = await oToken.methods.maxOTokensLiquidatable(owner).call();

  if (new BigNumber(amountOTokens).lte(new BigNumber(0))) {
    throw new Error('Nothing to liquidate');
  }

  const premiumToPay = await getPremiumToPay(
    optionExchange, // exchange
    oTokenAddr,
    amountOTokens,
    paymentToken === KETH ? ETH_ADDRESS : paymentToken,
  );

  const kollateralInvoker = new web3.eth.Contract(invokerABI, Kollateral_Invoker);

  const data = web3.eth.abi.encodeParameters(['address', 'address'], [owner, oTokenAddr]);
  await kollateralInvoker.methods
    .invoke(
      Kollateral_Liquidator, // invokeTo
      data, // invokeData
      paymentToken, // tokenAddress: Dai, ETH,
      premiumToPay,
    )
    .send({ from: account })
    .on('transactionHash', (hash) => {
      notify.hash(hash);
    });
};

export const burnOToken = async (oTokenAddr, burnAmt) => {
  const account = await checkConnectedAndGetAddress();
  const oToken = new web3.eth.Contract(oTokenABI, oTokenAddr);
  await oToken.methods
    .burnOTokens(burnAmt)
    .send({ from: account })
    .on('transactionHash', (hash) => {
      notify.hash(hash);
    });
};

export const issueOToken = async (oTokenAddr, issueAmt) => {
  const account = await checkConnectedAndGetAddress();
  const oToken = new web3.eth.Contract(oTokenABI, oTokenAddr);

  await oToken.methods
    .issueOTokens(issueAmt, account)
    .send({ from: account })
    .on('transactionHash', (hash) => {
      notify.hash(hash);
    });
};

export const addETHCollateral = async (oTokenAddr, owner, ethAmt) => {
  const account = await checkConnectedAndGetAddress();
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
 * @param {number|string|BigNumber} collateralAmt in min unit
 */
export const addERC20Collateral = async (collateral, oTokenAddr, owner, collateralAmt) => {
  const collateralAmtBN = new BigNumber(collateralAmt);
  const account = await checkConnectedAndGetAddress();
  const oToken = new web3.eth.Contract(oTokenABI, oTokenAddr);
  const allowance = await getAllowance(collateral, account, oTokenAddr);
  // Approve to move collateral
  if (new BigNumber(allowance).lt(collateralAmtBN)) {
    const collateralToken = new web3.eth.Contract(oTokenABI, collateral);
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
};

/**
 *
 * @param {string} collateral
 * @param {string} oTokenAddr
 * @param {string} collateralAmt in base unit
 */
export const removeCollateral = async (collateral, oTokenAddr, collateralAmt) => {
  const account = await checkConnectedAndGetAddress();
  const oToken = new web3.eth.Contract(oTokenABI, oTokenAddr);
  if (collateral === ETH_ADDRESS) {
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

export const redeem = async (token) => {
  const account = await checkConnectedAndGetAddress();
  const oToken = new web3.eth.Contract(oTokenABI, token);
  await oToken.methods
    .redeemVaultBalance()
    .send({ from: account })
    .on('transactionHash', (hash) => {
      notify.hash(hash);
    });
};

/**
 *
 * @param {string} token
 */
export const removeUnderlying = async (token) => {
  const account = await checkConnectedAndGetAddress();
  const oToken = new web3.eth.Contract(oTokenABI, token);
  await oToken.methods
    .removeUnderlying()
    .send({ from: account })
    .on('transactionHash', (hash) => {
      notify.hash(hash);
    });
};

export const approve = async (tokenAddr, spender, amt = UINT256_MAX) => {
  const account = await checkConnectedAndGetAddress();
  const oToken = new web3.eth.Contract(oTokenABI, tokenAddr);
  await oToken.methods
    .approve(spender, amt)
    .send({ from: account })
    .on('transactionHash', (hash) => {
      notify.hash(hash);
    });
};

/**
 * Exercise your oTokens
 * @param {string} oTokenAddr
 * @param {string} underlying asset type
 * @param {string} amountToExercise
 * @param {string[]} vaults vault owners
 */
export const exercise = async (oTokenAddr, underlying, amountToExercise, vaults) => {
  const account = await checkConnectedAndGetAddress();
  const oToken = new web3.eth.Contract(oTokenABI, oTokenAddr);
  const underlyingRequired = await oToken.methods
    .underlyingRequiredToExercise(amountToExercise)
    .call();

  const underlyingIsETH = underlying === ETH_ADDRESS;

  if (!underlyingIsETH) {
    const allowance = await getAllowance(underlying, account, oTokenAddr);
    if (new BigNumber(allowance).lt(new BigNumber(underlyingRequired))) {
      await approve(underlying, oTokenAddr, UINT256_MAX);
    }
  }

  await oToken.methods
    .exercise(amountToExercise, vaults)
    .send({ from: account, value: underlyingIsETH ? underlyingRequired : '0' })
    .on('transactionHash', (hash) => {
      notify.hash(hash);
    });
};

export const openVault = async (oTokenAddr) => {
  const account = await checkConnectedAndGetAddress();
  const oToken = new web3.eth.Contract(oTokenABI, oTokenAddr);
  await oToken.methods
    .openVault()
    .send({ from: account })
    .on('transactionHash', (hash) => {
      notify.hash(hash);
    });
};

export const openVaultAddCollateralAndMint = async (
  oTokenAddr,
  collateralAsset,
  collateralAmt,
  tokenAmount,
) => {
  const account = await checkConnectedAndGetAddress();
  const oToken = new web3.eth.Contract(oTokenABI, oTokenAddr);
  if (collateralAsset === ETH_ADDRESS) {
    await oToken.methods
      .createETHCollateralOption(tokenAmount, account)
      .send({
        from: account,
        value: collateralAmt,
      })
      .on('transactionHash', (hash) => {
        notify.hash(hash);
      });
  } else {
    // check allowance
    const allowance = await getAllowance(collateralAsset, account, oTokenAddr);
    if (new BigNumber(allowance).lt(new BigNumber(collateralAmt))) {
      await approve(collateralAsset, oTokenAddr, UINT256_MAX);
    }
    await oToken.methods
      .createERC20CollateralOption(tokenAmount, collateralAmt, account)
      .send({
        from: account,
      })
      .on('transactionHash', (hash) => {
        notify.hash(hash);
      });
  }
};

// Option Exchange

export const buyOTokensFromExchange = async (oTokenAddr, exchangeAddr, buyAmt, ethAmt) => {
  const account = await checkConnectedAndGetAddress();
  const exchange = new web3.eth.Contract(exchangeABI, exchangeAddr);
  await exchange.methods
    .buyOTokens(
      account,
      oTokenAddr,
      '0x0000000000000000000000000000000000000000', // payment
      buyAmt,
    )
    .send({ from: account, value: ethAmt })
    .on('transactionHash', (hash) => {
      notify.hash(hash);
    });
};

export const sellOTokensFromExchange = async (oTokenAddr, exchangeAddr, sellAmt) => {
  const account = await checkConnectedAndGetAddress();
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
      sellAmt,
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
  const account = await checkConnectedAndGetAddress();
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
      deadline, // deadline
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
  const account = await checkConnectedAndGetAddress();
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

/*
 * 0x Protocols
 */
export const wrapETH = async (amountInWei) => {
  const account = await checkConnectedAndGetAddress();
  const weth = new web3.eth.Contract(wrapETHABI, WETH);
  await weth.methods
    .deposit()
    .send({
      from: account,
      value: amountInWei,
    })
    .on('transactionHash', (hash) => {
      notify.hash(hash);
    });
};

export const unwrapETH = async (amountInWei) => {
  const account = await checkConnectedAndGetAddress();
  const weth = new web3.eth.Contract(wrapETHABI, WETH);
  await weth.methods
    .withdraw(amountInWei)
    .send({
      from: account,
    })
    .on('transactionHash', (hash) => {
      notify.hash(hash);
    });
};

/**
 * Sign Order
 * @param {*} order
 */
export const signOrder = async (order) => {
  const account = await checkConnectedAndGetAddress();
  const provider = new MetamaskSubprovider(web3.currentProvider);
  return signatureUtils.ecSignOrderAsync(provider, order, account);
};

export const fillOrders = async (orders, amts, signatures, value, gasPrice) => {
  const account = await checkConnectedAndGetAddress();
  const exchange = new web3.eth.Contract(ZX_ExchagneABI, ZeroX_Exchange);
  await exchange.methods
    .batchFillOrders(orders, amts, signatures)
    .send({
      from: account,
      value, // Protocol fee: gas to be gas price * 150
      gasPrice: web3.utils.toWei(gasPrice, 'gwei'), // gwei to wei
    })
    .on('transactionHash', (hash) => {
      notify.hash(hash);
    });
};

export const cancelOrders = async (orders) => {
  const account = await checkConnectedAndGetAddress();
  const exchange = new web3.eth.Contract(ZX_ExchagneABI, ZeroX_Exchange);
  await exchange.methods
    .batchCancelOrders(orders)
    .send({
      from: account,
    })
    .on('transactionHash', (hash) => {
      notify.hash(hash);
    });
};
