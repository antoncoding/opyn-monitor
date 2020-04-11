/* eslint-disable no-restricted-syntax */
import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { DataView, DropDown, LinkBase } from '@aragon/ui';

import { SectionTitle } from '../common';

import { getBasePairAskAndBids } from '../../utils/0x';
import { option as OptionType } from '../types';

function OptionBoard({ calls, puts, setBaseAsset }) {
  const [putStats, setPutStats] = useState([]);
  const [callStats, setCallStats] = useState([]);

  const [selectedExpiryIdx, setExpiryIdx] = useState(0);

  const optionsByDate = groupByDate(puts, calls, putStats, callStats);

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
    <div>
      <div style={{ display: 'flex' }}>
        <DropDown
          items={optionsByDate.map((item) => item.expiryText)}
          selected={selectedExpiryIdx}
          onChange={setExpiryIdx}
        />
      </div>
      <div style={{ display: 'flex' }}>
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
      {/* <div style={{ display: 'flex' }}> */}
      {/* Calls */}
      {/* <div style={{ width: '45%' }}> */}
      <DataView
            // mode="table"
        fields={['last', 'bid', 'ask', 'strike', 'last', 'bid', 'ask']}
        entries={optionsByDate[selectedExpiryIdx] ? optionsByDate[selectedExpiryIdx].entry : []}
        renderEntry={({
          call,
          put,
          putDetail,
          callDetail,
          strikePrice,
        }) => {
          const lastCallPrice = '-';
          let callAsk = '-';
          let callBid = '-';
          let callOnclick = () => {};

          const lastPutPrice = '-';
          let putAsk = '-';
          let putBid = '-';
          let putOnclick = () => {};

          if (callDetail !== undefined) {
            callAsk = callDetail.bestAsk.toFixed(6);
            callBid = callDetail.bestBid.toFixed(6);
            callOnclick = () => { setBaseAsset(call); };
          }
          if (putDetail !== undefined) {
            putAsk = putDetail.bestAsk.toFixed(6);
            putBid = putDetail.bestBid.toFixed(6);
            putOnclick = () => { setBaseAsset(put); };
          }

          return [
            <LinkBase onClick={callOnclick}>{lastCallPrice}</LinkBase>,
            <LinkBase onClick={callOnclick}><BidText>{callBid}</BidText></LinkBase>,
            <LinkBase onClick={callOnclick}><AskText>{callAsk}</AskText></LinkBase>,
            <div style={{ fontSize: 20 }}>{strikePrice}</div>,
            <LinkBase onClick={putOnclick}>{lastPutPrice}</LinkBase>,
            <LinkBase onClick={putOnclick}><BidText>{putBid}</BidText></LinkBase>,
            <LinkBase onClick={putOnclick}><AskText>{putAsk}</AskText></LinkBase>,
          ];
        }}
      />
    </div>
  );
}

OptionBoard.propTypes = {
  calls: PropTypes.arrayOf(OptionType).isRequired,
  puts: PropTypes.arrayOf(OptionType).isRequired,
  setBaseAsset: PropTypes.func.isRequired,
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
    const strikePrices = [
      ...new Set(optionsExpiresThisDay.map((option) => option.strikePriceInUSD)),
    ];

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
      expiryText,
      entry,
    });
    // result[expiryKey] = entryRow;
  }
  return result;
}

const BidText = styled.div`{
  color: #7aae1a;
  font-size: 17px;
}`;

const AskText = styled.div`{
  color: #da5750;
  font-size: 17px;
}`;
