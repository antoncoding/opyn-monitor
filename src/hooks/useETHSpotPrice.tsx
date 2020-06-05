import { useState, useEffect } from 'react'
import BigNumber from 'bignumber.js'

import { getETHPrice } from '../utils/etherscan'

export const useETHSpotPrice = () => {
  const [spotPrice, setSpot] = useState<BigNumber>(new BigNumber(0))

  useEffect(() => {
    let canceled = false
    async function getSpotPrice() {
      const spot = await getETHPrice()
      if (!canceled) {
        setSpot(new BigNumber(spot))
      }
    }
    getSpotPrice()
    const id = setInterval(getSpotPrice, 10000)
    return () => {
      clearInterval(id)
    }
  }, [])
 
  return spotPrice

}