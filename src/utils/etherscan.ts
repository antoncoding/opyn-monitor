const key = process.env.REACT_APP_ETHERSCAN_KEY

export const getETHPrice = async(): Promise<string> => {
  const res = await fetch(`https://api.etherscan.io/api?module=stats&action=ethprice&tag=latest&apikey=${key}`)
  return (await res.json()).result.ethusd
}
