
import { useState, useEffect } from 'react'
// eslint-disable-next-line
import { token } from '../types'
import BigNumber from 'bignumber.js'

export const useTokenPriceCoinGeck = (token: token | undefined) => {
  const [tokenPrice, setPrice] = useState<BigNumber>(new BigNumber(0))

  useEffect(() => {
    let canceled = false
    async function getSpotPrice() {
      if(!token) return
      const spot = await getTokenPriceCoingecko(token.addr)
      if (!canceled) {
        setPrice(new BigNumber(spot))
      }
    }
    getSpotPrice()
    const id = setInterval(getSpotPrice, 10000)
    return () => {
      clearInterval(id)
    }
  }, [token])
  return tokenPrice
}

export const getTokenPriceCoingecko = async (token: string): Promise<string> => {
  const url =
    token === '0x0000000000000000000000000000000000000000'
      ? 'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd'
      : `https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${token}&vs_currencies=usd`

  const returnToken = token === '0x0000000000000000000000000000000000000000' ? 'ethereum' : token
  const res = await fetch(url)
  
  const price = (await res.json())[returnToken.toLowerCase()].usd
  return price as string
}