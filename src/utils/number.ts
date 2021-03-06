import BigNumber from 'bignumber.js';

const Web3 = require('web3')
const web3 = new Web3();

/**
 * Convert 10.999 to 10999000
 */
export function toBaseUnitBN(rawAmt:string| number| BigNumber, decimals: number):BigNumber {
  const raw = new BigNumber(rawAmt);
  const base = new BigNumber(10);
  const decimalsBN = new BigNumber(decimals);
  return raw.times(base.pow(decimalsBN)).integerValue();
}

/**
 * Convert 10999000 to 10.999
 */
export const toTokenUnitsBN = (tokenAmount:string|number|BigNumber, tokenDecimals:number): BigNumber => {
  const amt = new BigNumber(tokenAmount);
  const digits = new BigNumber(10).pow(new BigNumber(tokenDecimals));
  return amt.div(digits);
};

export function formatDigits(num, percision:number) {
  return parseFloat(num).toFixed(percision);
}


export function timeSince(timeStamp) {
  const now = new Date();
  const secondsPast = (now.getTime() - timeStamp) / 1000;
  if (secondsPast < 60) {
    return `${parseInt(secondsPast.toString(), 10)}s ago`;
  }
  if (secondsPast < 3600) {
    return `${parseInt((secondsPast / 60).toString(), 10)}m ago`;
  }
  if (secondsPast <= 86400) {
    return `${parseInt((secondsPast / 3600).toString(), 10)}h ago`;
  }
  if (secondsPast > 86400) {
    const ts = new Date(timeStamp);
    const day = ts.getDate();
    const month = (ts
      .toDateString()
      .match(/ [a-zA-Z]*/) as RegExpMatchArray)[0] 
      .replace(' ', '');
    const year = ts.getFullYear() === now.getFullYear() ? '' : ` ${ts.getFullYear()}`;
    return `${day} ${month}${year}`;
  }

  return timeStamp;
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

export function compareVaultIssued(vaultA, vaultB) {
  const amountA = vaultA.oTokensIssued;
  const amountB = vaultB.oTokensIssued;

  let comparison = 0;
  if (parseInt(amountA, 10) > parseInt(amountB, 10)) {
    comparison = -1;
  } else if (parseInt(amountA, 10) < parseInt(amountB, 10)) {
    comparison = 1;
  }
  return comparison;
}

export const isAddress = web3.utils.isAddress;
