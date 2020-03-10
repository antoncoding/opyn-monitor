import Web3 from 'web3'
const web3 = new Web3()

export function formatDigits(num, percision) {
  return parseFloat(num).toFixed(percision)
}

export const handleDecimals = (rawAmt, decimal) => {
  return Math.round(parseFloat(rawAmt) * 10 ** decimal);
};

export const fromWei = web3.utils.fromWei
export const toWei = web3.utils.toWei

/**
 * 
 * @param {string | number} amtInEth 
 */
export const formatETHAmtToStr = (amtInEth) => {
  const strETHSegments = amtInEth.toString().split('.')
  const int = strETHSegments[0]
  if (strETHSegments.length === 1) return int
  let digits = strETHSegments[1]
  if(digits.length > 18) digits = digits.slice(0, 18)
  const result = `${int}.${digits}`
  return result
  
}