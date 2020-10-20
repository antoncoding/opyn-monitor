const key = process.env.REACT_APP_ETHERSCAN_KEY

export const getTokenPrice = async (addr) : Promise<string> => {
  const url = `https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${addr}&vs_currencies=usd`
  const res = await fetch(url)
  try {
    return (await res.json())[addr].usd
  } catch(error) {
    console.error(`getTokenPrice error`, error)
    return '0'
  }
}

export const getETHPrice = async(): Promise<string> => {
  const res = await fetch(`https://api.etherscan.io/api?module=stats&action=ethprice&tag=latest&apikey=${key}`)
  try {
    return (await res.json()).result.ethusd
  } catch(error) {
    return getTokenPrice('0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2')
  }
  
}
