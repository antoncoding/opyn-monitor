import React, { useEffect, useState } from 'react';

import Options from './Options'
import UserData from './UserData';

import { getETHPrice } from '../../utils/etherscan'
import { getPremiumToPay } from '../../utils/infura'
import BigNumber from 'bignumber.js';

import { eth_puts, eth_calls } from '../../constants/options';
import { toTokenUnitsBN, toBaseUnitBN } from '../../utils/number';
import tracker from '../../utils/tracker';

const allOptions = eth_puts.concat(eth_calls).filter((o) => o.expiry > Date.now() / 1000)
const Promise = require('bluebird')

function PositionManagement({ user }: { user: string }) {

  useEffect(() => {
    tracker.pageview(`/positions/`);
  }, []);

  const [spotPrice, setSpot] = useState<BigNumber>(new BigNumber(0))

  const [tokenPrices, setTokenPrices] = useState<{ oToken: string, price: BigNumber }[]>([])
  useEffect(() => {
    let canceled = false
    async function getSpotPrice() {

      // spot price
      const spot = await getETHPrice()


      const _tokenPrices = await Promise.map(allOptions, async option => {
        const priceUnit = await getPremiumToPay(
          option.exchange,
          option.addr,
          toBaseUnitBN(1, option.decimals).toString()
        )
        const price = option.type === 'call'
          ? toTokenUnitsBN(priceUnit, 18).times(new BigNumber(spot)).times(option.strikePriceInUSD) // 250 call tokens = 1 call option
          : toTokenUnitsBN(priceUnit, 18).times(new BigNumber(spot))

        return {
          oToken: option.addr,
          price
        }
      })

      if (!canceled) {
        setSpot(new BigNumber(spot))
        setTokenPrices(_tokenPrices)
      }
    }
    getSpotPrice()
    const id = setInterval(getSpotPrice, 10000)
    return () => {
      canceled = true
      clearInterval(id)
    }
  }, [])


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
