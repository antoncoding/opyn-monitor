import BigNumber from 'bignumber.js';

const iv = require('implied-volatility');

const PI = new BigNumber(3.1415926)

export function getIV(
  type: string,
  optionPrice: number,
  strikePriceInUSD: number,
  expiry: number,
  ethPrice: number
): number {
  const t = new BigNumber(expiry - Date.now() / 1000).div(86400).div(365).toNumber();
  const r = 0;
  const k = strikePriceInUSD;

  const v = iv.getImpliedVolatility(optionPrice, ethPrice, k, t, r, type); // 0.11406250000000001 (11.4%)
  return v;
}

export function getApprxATMPrice(ethPrice: BigNumber, volatility: number, now: Date, expiry: Date) {
  const timeInYear = new BigNumber(expiry.getTime() - now.getTime()).div(1000).div(86400).div(365);
  return ethPrice.times(0.4).times(new BigNumber(volatility)).times(timeInYear.sqrt());
}

export function getApprxATMPrice2(strikePrice: BigNumber, ethPrice: BigNumber, volatility: number, now: Date, expiry: Date) {
  const t = new BigNumber(expiry.getTime() - now.getTime()).div(1000)
  // const timeInYear = new BigNumber(expiry.getTime() - now.getTime()).div(1000).div(86400).div(365);
  const d = (ethPrice.minus(strikePrice)).div(2)
  const avg = (ethPrice.plus(strikePrice)).div(2)
  
  return avg.times(volatility)
    .times(t.sqrt())
    .div(14040)
    .plus(d) ;
}

// export function getApprxATMIV(
//   optionPrice: BigNumber,
//   ethPrice: BigNumber,
//   now: Date,
//   expiry: Date
// ) {
//   const timeInYear = new BigNumber(expiry.getTime() - now.getTime()).div(1000).div(86400).div(365);
//   return optionPrice.div(0.4).div(timeInYear.sqrt()).div(ethPrice);
// }

export function getApprxIV2(
  optionPrice: BigNumber,
  ethPrice: BigNumber,
  strikePrice: BigNumber,
  now: Date,
  expiry: Date
) {
  const intrisic = (ethPrice.minus(strikePrice)).div(2)
  const timeInYear = new BigNumber(expiry.getTime() - now.getTime()).div(1000).div(86400).div(365);
  // return PI.times(2).div(timeInYear).sqrt().times(optionPrice.minus(intrisic)).div(ethPrice.minus(intrisic))
  const divider = timeInYear.sqrt().times(new BigNumber(0.4))
    .times(ethPrice.minus(intrisic));
  return optionPrice.minus(intrisic).div(divider)
}

export function getIVCorrandoMiller(
  optionPrice: BigNumber,
  strikePrice: BigNumber,
  ethPrice: BigNumber,
  now: Date,
  expiry: Date
){
  const time = new BigNumber(expiry.getTime() - now.getTime()).div(1000).div(86400).div(365);
  const f1 = PI.times(2).div(time).sqrt().div((ethPrice.plus(strikePrice)))
  const f2 = optionPrice.minus((strikePrice.minus(ethPrice)).div(2))
  const f3 = f2.pow(2)
  const f4 = (ethPrice.minus(strikePrice)).div(PI)
  const iv = f1.times(f2.plus((f3.minus(f4).sqrt())))
  return iv
}

export function updateWight(newSpotPrice: BigNumber, balance1: BigNumber, balance2: BigNumber) {
  const w1 = balance1.div(newSpotPrice.times(balance2).plus(balance1));
  const w2 = new BigNumber(1).minus(w1);
  return {
    w1,
    w2,
  };
}

export function calculateOutGivenIn(
  amountIn: BigNumber,
  balanceIn: BigNumber,
  balanceOut: BigNumber,
  weightIn: BigNumber,
  weightOut: BigNumber
) {
  const amountOut = balanceOut.times(
      new BigNumber(1).minus(
        Math.pow(
          balanceIn.div((balanceIn.plus(amountIn))).toNumber(),
          weightIn.div(weightOut).toNumber()
        )
      )
    )
  return amountOut
}
