export function formatDigits(num, percision) {
  return parseFloat(num).toFixed(percision)
}

export const handleDecimals = (rawAmt, decimal) => {
  return Math.round(parseFloat(rawAmt) * 10 ** decimal);
};

/**
 * 
 * @param {string | number} amtInEth 
 */
export const formatETHAmtToStr = (amtInEth) => {
  console.log(`input ${amtInEth}`)
  const strETHSegments = amtInEth.toString().split('.')
  const int = strETHSegments[0]
  if (strETHSegments.length === 1) return int
  let digits = strETHSegments[1]
  if(digits.length > 18) digits = digits.slice(0, 18)
  const result = `${int}.${digits}`
  console.log(`output ${result}`)
  return result
  
}