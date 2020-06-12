import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { Header } from '@aragon/ui';

import BigNumber from 'bignumber.js';
import { useOptions, useETHSpotPrice } from '../../hooks'
import { userContext } from '../../contexts/userContext'

import {
  getTokenBalance, getBalance, getTotalSupply,
} from '../../utils/infura';
import { toTokenUnitsBN } from '../../utils/number';

import { defaultOption } from '../../constants/options';

import TradePageHeader from './Header';
import UniswapBuySell from './UniswapBuySell';
import AddLiquidity from './AddLiquidity';
import RemoveLiquidity from './RemoveLiquidity';

import tracker from '../../utils/tracker';
import * as types from '../../types';

function UniswapPool() {
  const liquidityTokenDecimals = 18;
  const { token } = useParams();

  const { user } = useContext(userContext)
  const spotPrice = useETHSpotPrice()

  useEffect(() => {
    tracker.pageview(`/uniswap/${token}`);
  }, [token]);

  const { options: allOptions } = useOptions()

  const [option, setOption] = useState<types.option>(defaultOption)
  useEffect(()=>{
    const _option = allOptions.find((o) => o.addr === token) as types.option;
    if(_option)
      setOption(_option)
  }, [allOptions, token])
  
  const {
    uniswapExchange, decimals,
  } = option!;

  
  const multiplier = new BigNumber(1) //option.type === 'call' 
    // ? new BigNumber((option as types.ETHOption).strikePriceInUSD) 
    // : new BigNumber(1)

  const [poolTokenBalance, setPoolTokenBalance] = useState(new BigNumber(0));
  const [userTokenBalance, setUserTokenBalance] = useState(new BigNumber(0));
  const [poolETHBalance, setPoolETHBalance] = useState(new BigNumber(0));
  const [userETHBalance, setUserETHBalance] = useState(new BigNumber(0));

  const [userliquidityTokenBalance, setUserLiquidityTokenBalance] = useState(new BigNumber(0));
  const [liquidityTokenSupply, setLiquidityTokenSupply] = useState(new BigNumber(0));

  // Update Uniswap Pool Info
  useEffect(() => {
    let isCancelled = false;

    async function updatePoolInfo() {
      if (!uniswapExchange) return
      const [exTokenBalance, exchagneETHBalance, liqTokenTotalSupply] = await Promise.all([
        getTokenBalance(token, uniswapExchange),
        getBalance(uniswapExchange),
        getTotalSupply(uniswapExchange),
      ]);
      // const { decimals: liqTokenDecimal, totalSupply: liqTokenTotalSupply } = liquidityTokenInfo;
      const exchangeTokenBalance = toTokenUnitsBN(exTokenBalance, decimals);
      if (!isCancelled) {
        setLiquidityTokenSupply(toTokenUnitsBN(liqTokenTotalSupply, liquidityTokenDecimals));
        setPoolETHBalance(new BigNumber(exchagneETHBalance));
        setPoolTokenBalance(exchangeTokenBalance);
      }
    }
    updatePoolInfo();
    const id = setInterval(updatePoolInfo, 15000);

    return () => {
      isCancelled = true;
      clearInterval(id);
    };
  }, [decimals, token, uniswapExchange]);

  // Update User balances
  useEffect(() => {
    if (user === '') return;
    let isCancelled = false;

    async function updateUserInfo() {
      const [tokenBalance, userEthBalance, liqTokenBalance] = await Promise.all([
        getTokenBalance(token, user),
        getBalance(user),
        getTokenBalance(uniswapExchange, user),
      ]);

      const userOTknBalanceBN = toTokenUnitsBN(tokenBalance, decimals);
      const userLiqTknBalanceBN = toTokenUnitsBN(liqTokenBalance, liquidityTokenDecimals);
      if (!isCancelled) {
        setUserLiquidityTokenBalance(userLiqTknBalanceBN);
        setUserETHBalance(new BigNumber(userEthBalance));
        setUserTokenBalance(userOTknBalanceBN);
      }
    }
    updateUserInfo();
    const id = setInterval(updateUserInfo, 15000);

    // eslint-disable-next-line consistent-return
    return () => {
      isCancelled = true;
      clearInterval(id);
    };
  }, [decimals, liquidityTokenDecimals, token, uniswapExchange, user]);

  return (
    <>
      <Header primary="Exchange" />

      <TradePageHeader
        option={option}
        poolETHBalance={poolETHBalance}
        poolTokenBalance={poolTokenBalance}
        uniswapExchange={uniswapExchange}
      />

      <UniswapBuySell
        multiplier={multiplier}
        spotPrice={spotPrice}
        option={option}
        tokenBalance={userTokenBalance}
      />

      <Header primary="Provide Liquidity" />

      <AddLiquidity
        oToken={option}
        multiplier={multiplier}
        userTokenBalance={userTokenBalance}
        userETHBalance={userETHBalance}
        uniswapExchange={uniswapExchange}
        poolETHBalance={poolETHBalance}
        poolTokenBalance={poolTokenBalance}
        liquidityTokenDecimals={liquidityTokenDecimals}
        liquidityTokenSupply={liquidityTokenSupply} // in base unit
      />

      <RemoveLiquidity
        oToken={option}
        multiplier={multiplier}
        userliquidityTokenBalance={userliquidityTokenBalance}
        uniswapExchange={uniswapExchange}
        poolETHBalance={poolETHBalance}
        poolTokenBalance={poolTokenBalance}
        liquidityTokenDecimals={liquidityTokenDecimals}
        liquidityTokenSupply={liquidityTokenSupply} // in base unit
      />
    </>
  );
}

export default UniswapPool;
