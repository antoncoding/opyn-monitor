import React, { useEffect, useState, useContext } from 'react';

import Options from './Options'
import UserData from './UserData';
import BigNumber from 'bignumber.js';

import { useOptions, useETHSpotPrice } from '../../hooks'
import { userContext } from '../../contexts/userContext'

import { getPremiumToPay } from '../../utils/infura'
import { toTokenUnitsBN, toBaseUnitBN } from '../../utils/number';
import { getUserOptionBalances } from '../../utils/graph'
import tracker from '../../utils/tracker';
import * as types from '../../types';

const Promise = require('bluebird')

function TradeUniswap() {

  useEffect(() => {
    tracker.pageview(`/trade/uniswap/`);
  }, []);

  const { user } = useContext(userContext)
  const spotPrice = useETHSpotPrice()
  const { ethCalls: calls, ethPuts: puts } = useOptions()
  
  // Update token price every 5 secs
  const [tokenPrices, setTokenPrices] = useState<{ oToken: string, price: BigNumber }[]>([])

  const [allEthOptions, setAllEthOptions] = useState<types.ethOptionWithStat[]>([])

  useEffect(()=>{
    const allOptions = puts.concat(calls).filter((o) => o.expiry > Date.now() / 1000)
    setAllEthOptions(allOptions)
  }, [puts, calls])

  useEffect(() => {
    let cancelled = false
    async function getTokenPrices() {

      const _tokenPrices = await Promise.map(allEthOptions, async (option:types.ETHOption) => {
        if (option.uniswapExchange === '0x0000000000000000000000000000000000000000') {
          return {
            oToken: option.addr,
            price: new BigNumber(0)
          }
        }
        let priceUnit = new BigNumber(0);
        try {
          priceUnit = await getPremiumToPay(
            option.exchange,
            option.addr,
            toBaseUnitBN(1, option.decimals).toString()
          )
        } catch(error) {
          console.log(`Error Fetching price for ${option.name}`, error.toString());
        }
        
        const price = option.type === 'call'
          ? toTokenUnitsBN(priceUnit, 18).times(spotPrice).times(option.strikePriceInUSD) // 250 call tokens = 1 call option
          : toTokenUnitsBN(priceUnit, 18).times(spotPrice)
        return {
          oToken: option.addr,
          price
        }
      })

      if (!cancelled) {
        setTokenPrices(_tokenPrices)
      }
    }
    getTokenPrices()
    const id = setInterval(getTokenPrices, 30000)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [spotPrice, allEthOptions])

  // update token balances for all options
  const [balances, setBalances] = useState<balance[]>([])
  useEffect(() => {
    let cancelled = false
    async function updateBalances() {
      if (!user) return
      const balances = (await getUserOptionBalances(user))
        .filter(obj => allEthOptions.find(option => option.addr === obj.oToken))
        .map(obj => {
          return {
            oToken: obj.oToken,
            balance: new BigNumber(obj.balance)
          }
        })
      if (!cancelled)
        setBalances(balances)
    }
    
    updateBalances()
    const id = setInterval(updateBalances, 5000)
    return () => {
      cancelled = true
      clearInterval(id)
    }

  }, [user, allEthOptions]);

  return (
    <>
      <Options
        optionPrices={tokenPrices}
        allOptions={allEthOptions}
        spotPrice={spotPrice}
        balances={balances}
      />
      <br />
      <br />
      <UserData
        balances={balances}
        allOptions={allEthOptions}
        spotPrice={spotPrice}
        tokenPrices={tokenPrices}
        user={user}
      />
      <br />
    </>
  );
}

export default TradeUniswap;

type balance = {
  oToken: string,
  balance: BigNumber
}