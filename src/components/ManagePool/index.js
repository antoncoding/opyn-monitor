import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Header } from '@aragon/ui';

import { getTokenBalance, getBalance, getERC20Info } from '../../utils/infura';
import { toTokenUnitsBN } from '../../utils/number'


import { options } from '../../constants/options';

import DashBoard from './Header';
import OptionExchange from './OptionExchange'

import AddLiquidity from './AddLiquidity';
import RemoveLiquidity from './RemoveLiquidity'
import BigNumber from 'bignumber.js';

function ManagePool({ user }) {

  let { token } = useParams();

  const option = options.find((option) => option.addr === token);
  const { uniswapExchange, decimals, symbol, exchange } = option;

  const [poolTokenBalance, setPoolTokenBalance] = useState(new BigNumber(0));
  const [userTokenBalance, setUserTokenBalance] = useState(new BigNumber(0));
  const [poolETHBalance, setPoolETHBalance] = useState(new BigNumber(0));
  const [userETHBalance, setUserETHBalance] = useState(new BigNumber(0));

  const [userliquidityTokenBalance, setUserLiquidityTokenBalance] = useState(new BigNumber(0));
  const [liquidityTokenSupply, setLiquidityTokenSupply] = useState(new BigNumber(0));
  const [liquidityTokenDecimals, setLiquidityTokenDecimals] = useState(0);

  useEffect(() => {
    let isCancelled = false;

    async function updatePoolInfo() {
      let [exTokenBalance, exchagneETHBalance, liquidityTokenInfo] = await Promise.all([
        getTokenBalance(token, uniswapExchange),
        getBalance(uniswapExchange),
        getERC20Info(uniswapExchange),
      ]);
      const { decimals: liqTokenDecimal, totalSupply: liqTokenTotalSupply } = liquidityTokenInfo;
      const exchangeTokenBalance = toTokenUnitsBN(exTokenBalance, decimals);
      if (!isCancelled) {
        setLiquidityTokenDecimals(liqTokenDecimal);
        setLiquidityTokenSupply(new BigNumber(liqTokenTotalSupply));
        setPoolETHBalance(new BigNumber(exchagneETHBalance));
        setPoolTokenBalance(exchangeTokenBalance);
      }
    }
    updatePoolInfo();
    const id = setInterval(updatePoolInfo, 10000);

    return () => {
      isCancelled = true;
      clearInterval(id);
    };
  }, [decimals, token, uniswapExchange]);

  useEffect(() => {
    if (user === '') return;
    let isCancelled = false;

    async function updateUserInfo() {
      let [tokenBalance, userETHBalance, liqTokenBalance] = await Promise.all([
        getTokenBalance(token, user),
        getBalance(user),
        getTokenBalance(uniswapExchange, user),
      ]);

      const userTokenBalance = toTokenUnitsBN(tokenBalance, decimals);
      const userLiqTokenBalance = toTokenUnitsBN(liqTokenBalance, liquidityTokenDecimals);
      if (!isCancelled) {
        setUserLiquidityTokenBalance(userLiqTokenBalance);
        setUserETHBalance(userETHBalance);
        setUserTokenBalance(userTokenBalance);
      }
    }
    updateUserInfo();
    const id = setInterval(updateUserInfo, 10000);

    return () => {
      isCancelled = true;
      clearInterval(id);
    };
  }, [decimals, liquidityTokenDecimals, token, uniswapExchange, user]);

  return (
    <>
      <Header primary='Exchange' />

      <DashBoard
        user={user}
        symbol={symbol}
        poolETHBalance={poolETHBalance}
        poolTokenBalance={poolTokenBalance}
        uniswapExchange={uniswapExchange}
      />

      <OptionExchange
        symbol={symbol}
        tokenBalance={userTokenBalance}
        token={token}
        exchange={exchange}
        decimals={decimals}
      />

      <Header primary='Provide Liquidity' />

      <AddLiquidity
        user={user}
        otoken={token}
        otokenDecimals={decimals}
        otokenSymbol={symbol}
        userTokenBalance={userTokenBalance}
        userliquidityTokenBalance={userliquidityTokenBalance}
        userETHBalance={userETHBalance}
        uniswapExchange={uniswapExchange}
        poolETHBalance={poolETHBalance}
        poolTokenBalance={poolTokenBalance}
        liquidityTokenDecimals={liquidityTokenDecimals}
        liquidityTokenSupply={liquidityTokenSupply}
      />

      <RemoveLiquidity
        otokenDecimals={decimals}
        otokenSymbol={symbol}
        userliquidityTokenBalance={userliquidityTokenBalance}
        userETHBalance={userETHBalance}
        uniswapExchange={uniswapExchange}
        poolETHBalance={poolETHBalance}
        poolTokenBalance={poolTokenBalance}
        liquidityTokenDecimals={liquidityTokenDecimals}
        liquidityTokenSupply={liquidityTokenSupply}
      />
    </>
  );
}

export default ManagePool;
