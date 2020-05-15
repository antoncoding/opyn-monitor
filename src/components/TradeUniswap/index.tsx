import React, { useEffect, useState } from 'react';

import Options from './Options'
import UserData from './UserData';

import { getPremiumToPay } from '../../utils/infura'
import BigNumber from 'bignumber.js';
import { eth_puts, eth_calls } from '../../constants/options';
import { toTokenUnitsBN, toBaseUnitBN } from '../../utils/number';
import { getUserOptionBalances } from '../../utils/graph'
import tracker from '../../utils/tracker';
import { ETHOption } from '../../types';

const allOptions = eth_puts.concat(eth_calls).filter((o) => o.expiry > Date.now() / 1000)
const Promise = require('bluebird')

function PositionManagement({ user, spotPrice }: { user: string, spotPrice: BigNumber }) {

  useEffect(() => {
    tracker.pageview(`/positions/`);
  }, []);
  
  // Update token price every 5 secs
  const [tokenPrices, setTokenPrices] = useState<{ oToken: string, price: BigNumber }[]>([])
  useEffect(() => {
    let cancelled = false
    async function getTokenPrices() {

      const _tokenPrices = await Promise.map(allOptions, async (option:ETHOption) => {
        if (option.uniswapExchange === '0x0000000000000000000000000000000000000000') {
          return {
            oToken: option.addr,
            price: new BigNumber(0)
          }
        }
        const priceUnit = await getPremiumToPay(
          option.exchange,
          option.addr,
          toBaseUnitBN(1, option.decimals).toString()
        )
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
  }, [spotPrice])

  // update token balances for all options
  const [balances, setBalances] = useState<balance[]>([])
  useEffect(() => {
    let cancelled = false
    async function updateBalances() {
      if (!user) return
      const balances = (await getUserOptionBalances(user))
        .filter(obj => allOptions.find(option => option.addr === obj.oToken))
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

  }, [user]);

  return (
    <>
      <Options
        optionPrices={tokenPrices}
        spotPrice={spotPrice}
        balances={balances}
      />
      <br />
      <br />
      <UserData
        balances={balances}
        spotPrice={spotPrice}
        tokenPrices={tokenPrices}
        user={user}
      />
      <br />
    </>
  );
}

export default PositionManagement;

type balance = {
  oToken: string,
  balance: BigNumber
}