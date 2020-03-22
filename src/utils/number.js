import Web3 from 'web3'
import BigNumber from 'bignumber.js'
const web3 = new Web3()

/**
 * Convert 10.999 to 10999000
 * @param {number|string|BigNumber} rawAmt 
 * @param {number} decimals 
 * @returns {BigNumber}
 */
export function toBaseUnitBN(rawAmt, decimals) {
  const raw = new BigNumber(rawAmt)
  const base = new BigNumber(10)
  const decimalsBN = new BigNumber(decimals)
  return raw.times(base.pow(decimalsBN)).integerValue()
}

/**
 * Convert 10999000 to 10.999
 * @param {string | number | BigNumber} tokenAmount in base unit
 * @param {number} tokenDecimals 
 * @return {BigNumber}
 */
export const toTokenUnitsBN = (tokenAmount, tokenDecimals) => {
  const _amt = new BigNumber(tokenAmount)
  const _digits = new BigNumber(10).pow(new BigNumber(tokenDecimals))
  return _amt.div(_digits)
}

export function formatDigits(num, percision) {
  return parseFloat(num).toFixed(percision)
}

export const handleDecimals = (rawAmt, decimal) => {
  return Math.round(parseFloat(rawAmt) * 10 ** decimal);
};

export const fromWei = web3.utils.fromWei
export const toWei = web3.utils.toWei

export function timeSince(timeStamp) {
  var now = new Date(),
    secondsPast = (now.getTime() - timeStamp) / 1000;
  if (secondsPast < 60) {
    return parseInt(secondsPast) + 's ago';
  }
  if (secondsPast < 3600) {
    return parseInt(secondsPast / 60) + 'm ago';
  }
  if (secondsPast <= 86400) {
    return parseInt(secondsPast / 3600) + 'h ago';
  }
  if (secondsPast > 86400) {
    const ts = new Date(timeStamp)
    const day = ts.getDate();
    const month = ts.toDateString().match(/ [a-zA-Z]*/)[0].replace(" ", "");
    const year = ts.getFullYear() === now.getFullYear() ? "" : " " + ts.getFullYear();
    return day + " " + month + year;
  }
}

export function compareVaultRatio(vaultA, vaultB) {
  const rateA = vaultA.ratio;
  const rateB = vaultB.ratio;

  let comparison = 0;
  if (parseFloat(rateA) > parseFloat(rateB)) {
    comparison = 1;
  } else if (parseFloat(rateA) < parseFloat(rateB)) {
    comparison = -1;
  }
  return comparison;
}
