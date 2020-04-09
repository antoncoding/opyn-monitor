/* eslint-disable no-restricted-syntax */
import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { DataView, DropDown } from '@aragon/ui';

// import BigNumber from 'bignumber.js';

import { getBasePairAskAndBids } from '../../utils/0x';
import { option as OptionType } from '../types';

function OptionBoard({ calls, puts }) {
  const [putStats, setPutStats] = useState([]);
  const [callStats, setCallStats] = useState([]);

  const [selectedExpiryIdx, setExpiryIdx] = useState(0);

  const optionsByDate = groupByDate(puts, calls, putStats, callStats);
  // console.log(optionsByDate[0]);
  // console.log(JSON.stringify(optionsByDate, null, 2));

  // get option status
  useMemo(() => {
    let isCancelled = false;
    const updateBoardStats = async () => {
      const [callData, putData] = await Promise.all([
        getBasePairAskAndBids(calls),
        getBasePairAskAndBids(puts),
      ]);

      if (!isCancelled) {
        setCallStats(callData);
        setPutStats(putData);
      }
    };
    updateBoardStats();
    // const id = setInterval(updateBoardStats, 5000);

    return () => {
      isCancelled = true;
    };
  }, [calls, puts]);

  return (
    <>
      <DropDown
        items={optionsByDate.map((item) => item.expiryText)}
        selected={selectedExpiryIdx}
        onChange={setExpiryIdx}
      />
      <DataView
        fields={['last', 'bid', 'ask', 'strike', 'last', 'bid', 'ask']}
        entries={optionsByDate[selectedExpiryIdx] ? optionsByDate[selectedExpiryIdx].entry : []}
        renderEntry={({
          // call,
          // put,
          callDetail,
          putDetail,
          strikePrice,
        }) => [// call, put, callDetail, putDetail, strikePrice,
          <>-</>,
          <>{ callDetail !== undefined ? callDetail.bestBid.toFixed(5) : '-' }</>,
          <>{ callDetail !== undefined ? callDetail.bestAsk.toFixed(5) : '-' }</>,
          <span style={{ fontSize: 19 }}>{strikePrice}</span>,
          <>-</>,
          <>{ putDetail !== undefined ? putDetail.bestBid.toFixed(5) : '-' }</>,
          <>{ putDetail !== undefined ? putDetail.bestAsk.toFixed(5) : '-' }</>,
        ]}
      />
    </>
  );
}

OptionBoard.propTypes = {
  calls: PropTypes.arrayOf(OptionType).isRequired,
  puts: PropTypes.arrayOf(OptionType).isRequired,
};

export default OptionBoard;

/**
 *
 * @param {Array<{strikePriceInUSD:number, addr:string, expiry:number}>} puts
 * @param {Array<{strikePriceInUSD:number, addr:string, expiry:number}>} calls
 * @param {Array<{option: string, bestBid: BigNumber, bestAsk: BigNumber}>} putStats
 * @param {Array<{option: string, bestBid: BigNumber, bestAsk: BigNumber}>} callStats
 * @returns {} key: expiry in string, value: array of { call, put, callDetail, putDetail, strikePrice}
 */
function groupByDate(puts, calls, putStats, callStats) {
  const result = [];
  const allOptions = puts.concat(calls);
  const distinctExpirys = [...new Set(allOptions.map((option) => option.expiry))];

  for (const expiry of distinctExpirys) {
    const optionsExpiresThisDay = allOptions.filter((o) => o.expiry === expiry);
    const strikePrices = [...new Set(optionsExpiresThisDay.map((option) => option.strikePriceInUSD))];

    // const allStrikesForThisDay = {};
    const entry = [];
    for (const strikePrice of strikePrices) {
      const put = puts.find((o) => o.strikePriceInUSD === strikePrice && o.expiry === expiry);
      const call = calls.find((o) => o.strikePriceInUSD === strikePrice && o.expiry === expiry);
      const putDetail = put ? putStats.find((p) => p.option === put.addr) : undefined;
      const callDetail = call ? callStats.find((c) => c.option === call.addr) : undefined;
      entry.push({
        strikePrice,
        call,
        put,
        callDetail,
        putDetail,
      });
    }
    entry.sort((a, b) => (a.strikePrice > b.strikePrice ? 1 : -1));
    const expiryText = new Date(expiry * 1000).toDateString();
    result.push({
      expiryText, entry,
    });
    // result[expiryKey] = entryRow;
  }
  return result;
}
