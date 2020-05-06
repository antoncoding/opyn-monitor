import React, { useState, useEffect } from 'react';
import {
  DataView, DropDown,Header, Tag,
} from '@aragon/ui';

import { SectionTitle } from '../common';

import * as types from '../../types';

import { eth_puts, eth_calls } from '../../constants/options';

const optionsByDate = groupByDate(eth_puts, eth_calls);


type dataViewEntryType = {
  strikePrice: number,
  call?: types.ETHOption,
  callDetail?: types.OptionRealTimeStat,
  put?: types.ETHOption,
  putDetail?: types.OptionRealTimeStat
}


type strikePricePair = {
  strikePrice: number,
  call: types.ETHOption | undefined,
  put: types.ETHOption | undefined
}

type entriesForExpiry = {
  expiry: number,
  expiryText: string,
  pairs: strikePricePair[]
}

type OptionBoardProps = {
  baseAsset: types.token,
  quoteAsset: types.token,
};

function Options({
  quoteAsset
}: OptionBoardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedExpiryIdx, setExpiryIdx] = useState(0);
  const [entriesToDisplay, setEntriesToDisplay] = useState<dataViewEntryType[]>([]);


  // on expiry change: start the call and put update function on the options of that day
  useEffect(() => {
    setIsLoading(true);
    let isCancelled = false;

    const updateBoardStats = async () => {
      const displayEntries: dataViewEntryType[] = [];
      optionsByDate[selectedExpiryIdx].pairs.forEach((pair) => {
        const { call, put, strikePrice } = pair;
        const entry: dataViewEntryType = { strikePrice };
        if (call !== undefined) {
          // has call option on this strikePrice
          entry.call = call;
        }
        if (put !== undefined) {
          entry.put = put;
        }
        displayEntries.push(entry);
      });

      if (!isCancelled) {
        setIsLoading(false);
        setEntriesToDisplay(displayEntries);
      }
    };
    updateBoardStats();
    const id = setInterval(updateBoardStats, 3000);

    return () => {
      clearInterval(id);
      isCancelled = true;
    };
  }, [selectedExpiryIdx, quoteAsset]);


  return (
    <div>
      <div style={{ display: 'flex' }}>
        <Header primary="All Options" />
        <div style={{ paddingTop: '24px' }}>
          <Tag> alpha </Tag>
        </div>
        <div style={{ paddingTop: '28px', paddingLeft: '36px' }}>
          <DropDown
            items={optionsByDate.map((item) => item.expiryText)}
            selected={selectedExpiryIdx}
            onChange={setExpiryIdx}
          />
        </div>
      </div>

      {/* <div style={{ display: 'flex' }}> */}

      {/* </div> */}
      <div style={{ display: 'flex', padding: '0px' }}>
        <SectionTitle title="Calls" />
        <div
          style={{
            marginLeft: 'auto',
            marginRight: 0,
          }}
        >
          <SectionTitle title="Puts" />
        </div>
      </div>
      {/* Calls */}
      <DataView
        mode="table"
        status={isLoading ? 'loading' : 'default'}
        fields={[
          { label: 'price', align: 'start' },
          { label: 'IV', align: 'start' },
          { label: 'Open', align: 'start' },
          { label: 'Δ|Delta', align: 'start' },
          { label: 'γ|Gamma', align: 'start' },
          { label: 'strike', align: 'start' },
          { label: 'price', align: 'start' },
          { label: 'IV', align: 'start' },
          { label: 'Open', align: 'start' },
          { label: 'Δ|Delta', align: 'start' },
          { label: 'γ|Gamma', align: 'start' },

        ]}
        entries={entriesToDisplay}
        renderEntry={({
          call,
          put,
          strikePrice,
        }) => {
          let callprice = '-';
          let callIV = '-';
          let callOpen = '-';
          let callDelta = '-';
          let callGamma = '-'

          let putprice = '-';
          let putIV = '-';
          let putOpen = '-';
          let putDelta = '-';
          let putGamma = '-'


          if (call !== undefined) {
            // have call option has this strike price
            callprice = '0.3'
            callIV = '30%'
            callOpen = '24'
            callDelta = '0.85'
            callGamma = '0.03'

          }
          if (put !== undefined) {
            // has put option has this strike price
            putprice  = '0.3'
            putIV  = '30%'
            putOpen  = '24'
            putDelta  = '0.85'
            putGamma = '0.03'

          }

          return [
            callprice,
            callIV,
            callOpen,
            callDelta,
            callGamma,
            <div style={{ fontSize: 20, width: '50px', padding: '10px' }}>{strikePrice}</div>,
            putprice,
            putIV,
            putOpen,
            putDelta,
            putGamma,

          ];
        }}
      />
    </div>
  );
}



export default Options;

/**
 *
 */
function groupByDate(puts: types.ETHOption[], calls: types.ETHOption[]): entriesForExpiry[] {
  const result: entriesForExpiry[] = [];
  const allOptions = puts.concat(calls).filter((option) => option.expiry > Date.now() / 1000);
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
    const expiryText = new Date(expiry * 1000).toDateString();
    result.push({
      expiry,
      expiryText,
      pairs,
    });
  }
  return result;
}

// type CellProps = {
//   text: string,
//   type: 'bid' | 'ask' | 'normal'
// }
