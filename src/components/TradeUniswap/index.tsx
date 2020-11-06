import React, { useEffect, useState, useContext, useMemo } from 'react';
import {Header, DropDown} from '@aragon/ui'
import Options from './Options'
import UserData from './UserData';
import BigNumber from 'bignumber.js';

import { useOptions, useETHSpotPrice, useTokenPriceCoinGeck } from '../../hooks'
import { userContext } from '../../contexts/userContext'

import { getPremiumToPay } from '../../utils/infura'
import { toTokenUnitsBN, toBaseUnitBN } from '../../utils/number';
import { getUserOptionBalances } from '../../utils/graph'
import { WETH, OPYN_ETH } from '../../constants/tokens'
import tracker from '../../utils/tracker';
import * as types from '../../types';
import { noPoolList } from '../../constants/options';

const Promise = require('bluebird')

function TradeUniswap() {

  useEffect(() => {
    tracker.pageview(`/trade/uniswap/`);
  }, []);

  const { user } = useContext(userContext)
  
  const { ethCalls: calls, ethPuts: puts, otherPuts, otherCalls } = useOptions()
  
  // Update token price every 5 secs
  const [tokenPrices, setTokenPrices] = useState<{ oToken: string, price: BigNumber }[]>([])
  
  // set all options
  const allOptions = useMemo(()=>{
    return puts.concat(calls).concat(otherPuts).concat(otherCalls)
      .filter((o) => o.expiry > Date.now() / 1000)
      .filter((o) => !noPoolList.includes(o.addr))
  }, [puts, calls, otherPuts, otherCalls])

  // const [selectedType, setSelectedType] = useState(0)
  const [selectedUnderlyingIdx, setSelectedUnderlying] = useState(0)
  const [selectedExpiryIdx, setExpiryIdx] = useState(0);
  const [distinctExpirys, setDistinctExpirys] = useState<number[]>([])

  const underlyingTypes = useMemo(() => {
    const types = allOptions.map(option => {
      if (option.type === 'call') return option.strike;
      if (option.underlying === WETH) {
        return OPYN_ETH
      }
      return option.underlying
    })
    return [...new Set(types)]
  }, [allOptions])

  const ethSpotPrice = useETHSpotPrice()
  const underlyingSpotPrice = useTokenPriceCoinGeck(underlyingTypes[selectedUnderlyingIdx])

  // group expiries
  useEffect(() => {
    const distinctExpirys = [...new Set(allOptions.map((option) => option.expiry))].sort((a, b) => a > b ? 1 : -1);
    setDistinctExpirys(distinctExpirys)
  }, [allOptions])

  // update otoken prices
  useEffect(() => {
    let cancelled = false
    async function getOTokenPrices() {
      const _tokenPrices = await Promise.map(allOptions, async (option:types.ETHOption) => {
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
          ? toTokenUnitsBN(priceUnit, 18).times(ethSpotPrice).times(option.strikePriceInUSD) // 250 call tokens = 1 call option
          : toTokenUnitsBN(priceUnit, 18).times(ethSpotPrice)
        return {
          oToken: option.addr,
          price
        }
      })

      if (!cancelled) {
        setTokenPrices(_tokenPrices)
      }
    }
    getOTokenPrices()
    const id = setInterval(getOTokenPrices, 30000)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [underlyingSpotPrice, allOptions, ethSpotPrice])

  // options filtered by underlying, expiry dates.
  const filteredOptions = useMemo(() => {
    return allOptions
      .filter((option) => {
        return selectedExpiryIdx === 0 ? true : option.expiry === distinctExpirys[selectedExpiryIdx - 1]
      })
      .filter((option) => {
        if(option.type === 'put') {
          if (underlyingTypes[selectedUnderlyingIdx] === OPYN_ETH) {
            return option.underlying === WETH
          }
          return option.underlying === underlyingTypes[selectedUnderlyingIdx]
        }
        else return option.strike === underlyingTypes[selectedUnderlyingIdx]
      })
      .sort((a, b) => a.strikePriceInUSD > b.strikePriceInUSD ? 1 : -1)
  }, [selectedExpiryIdx, allOptions, distinctExpirys, selectedUnderlyingIdx, underlyingTypes])

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

  }, [user, filteredOptions, allOptions]);

  return (
    <>
    <div style={{ display: 'flex' }}>
        <Header primary="Option Trading" />
        <img alt="icon" style={{ paddingTop: 24, paddingLeft: 14, height: 64, width: 54 }} src={ underlyingTypes[selectedUnderlyingIdx] ? underlyingTypes[selectedUnderlyingIdx].img : 'https://i.imgur.com/4eX8GlY.png'} />
        <div style={{ paddingTop: '28px', paddingLeft: '36px' }}>
          <DropDown
            items={(underlyingTypes).map((option) => option.symbol)}
            selected={selectedUnderlyingIdx}
            onChange={setSelectedUnderlying}
          />
        </div>
        <div style={{ paddingTop: '28px', paddingLeft: '36px' }}>
          <DropDown
            items={['All Dates']
              .concat(distinctExpirys.map(timestamp => new Date(timestamp * 1000).toLocaleDateString("en-US", { timeZone: "UTC" })))
            }
            selected={selectedExpiryIdx}
            onChange={setExpiryIdx}
          />
        </div>
        <div style={{ paddingTop: '36px', paddingLeft: '36px' }}>
          Spot Price: {underlyingSpotPrice.toFixed(2)} USD
        </div>

      </div>
      <Options
        optionPrices={tokenPrices}
        filteredOptions={filteredOptions}
        underlyingSpotPrice={underlyingSpotPrice}
        ethSpotPrice={ethSpotPrice}
        balances={balances}
      />
      <br />
      <br />
      <UserData
        balances={balances}
        allOptions={allOptions}
        selectedOptions={filteredOptions}
        underlyingSpotPrice={underlyingSpotPrice}
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