import React, { useEffect, useState } from 'react';

import Options from './Options'
import UserData from './UserData';

import { getPremiumToPay } from '../../utils/infura'
import BigNumber from 'bignumber.js';

import { eth_puts, eth_calls } from '../../constants/options';
import { toTokenUnitsBN, toBaseUnitBN } from '../../utils/number';
import tracker from '../../utils/tracker';

const allOptions = eth_puts.concat(eth_calls).filter((o) => o.expiry > Date.now() / 1000)
const Promise = require('bluebird')

function PositionManagement({ user, spotPrice }: { user: string, spotPrice: BigNumber }) {

  useEffect(() => {
    tracker.pageview(`/positions/`);
  }, []);

  const [tokenPrices, setTokenPrices] = useState<{ oToken: string, price: BigNumber }[]>([])
  useEffect(() => {
    let canceled = false
    async function getTokenPrices() {

      const _tokenPrices = await Promise.map(allOptions, async option => {
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

      if (!canceled) {
        setTokenPrices(_tokenPrices)
      }
    }
    getTokenPrices()
    const id = setInterval(getTokenPrices, 5000)
    return () => {
      canceled = true
      clearInterval(id)
    }
  }, [spotPrice])


  return (
    <>
      <Options optionPrices={tokenPrices} spotPrice={spotPrice}/>
      <br/>
      <br/>
      <UserData
        spotPrice={spotPrice}
        tokenPrices={tokenPrices}
        user={user}
      />
      <br />
    </>
  );
}


export default PositionManagement;
