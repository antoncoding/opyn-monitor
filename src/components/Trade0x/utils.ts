import * as types from '../../types'

type strikePricePair = {
  strikePrice: number,
  call: types.ETHOption | undefined,
  put: types.ETHOption | undefined
}

export type entriesForExpiry = { 
  expiry: number, 
  expiryText: string, 
  pairs: strikePricePair[]
}

/**
 * Group options by expiration date.
 */
export function groupByDate(puts: types.ETHOption[], calls: types.ETHOption[]): entriesForExpiry[] {
  const result: entriesForExpiry[] = [];
  const allOptions = puts.concat(calls)
    .filter((option) => option.expiry > Date.now() / 1000) // filter out expired options
    .sort((oa, ob) =>  oa.expiry > ob.expiry ? 1 : -1 ); // short by date (so the dropdown is sorted)
  
  const distinctExpirys = [...new Set(allOptions.map((option) => option.expiry))];

  for (const expiry of distinctExpirys) {
    const optionsExpiresThisDay = allOptions.filter((o) => o.expiry === expiry);
    const strikePrices = [
      ...new Set(optionsExpiresThisDay.map((option) => option.strikePriceInUSD)),
    ];

    // const allStrikesForThisDay = {};
    const pairs: strikePricePair[] = [];
    for (const strikePrice of strikePrices) {
      const put = puts.find((o) => o.strikePriceInUSD === strikePrice && o.expiry === expiry);
      const call = calls.find((o) => o.strikePriceInUSD === strikePrice && o.expiry === expiry);
      pairs.push({
        strikePrice,
        call,
        put,
      });
    }
    pairs.sort((a, b) => (a.strikePrice > b.strikePrice ? 1 : -1));
    const expiryText = new Date(expiry * 1000).toLocaleDateString("en-US", { timeZone: "UTC" });
    result.push({
      expiry,
      expiryText,
      pairs,
    });
  }
  return result;
}