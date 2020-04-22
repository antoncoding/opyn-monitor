/* eslint-disable no-restricted-syntax */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  DataView, DropDown, LinkBase, Radio, Header, Tag,
} from '@aragon/ui';
import { AskText, BidText } from './styled';

import { SectionTitle } from '../common';

import { getBasePairAskAndBids } from '../../utils/0x';
import { option as OptionType, token as TokenType } from '../types';

function OptionBoard({
  calls, puts, baseAsset, quoteAsset, setBaseAsset, setTradeType, setSelectedOrders,
}) {
  const [putStats, setPutStats] = useState([]);
  const [callStats, setCallStats] = useState([]);

  const [selectedExpiryIdx, setExpiryIdx] = useState(0);

  const optionsByDate = groupByDate(puts, calls, putStats, callStats);

  // get option status
  useEffect(() => {
    let isCancelled = false;
    const updateBoardStats = async () => {
      const [callData, putData] = await Promise.all([
        getBasePairAskAndBids(calls, quoteAsset),
        getBasePairAskAndBids(puts, quoteAsset),
      ]);

      if (!isCancelled) {
        setCallStats(callData);
        setPutStats(putData);
      }
    };
    updateBoardStats();
    const id = setInterval(updateBoardStats, 3000);

    return () => {
      clearInterval(id);
      isCancelled = true;
    };
  }, [calls, puts, quoteAsset]);

  // onchange expiry
  useEffect(() => {
    for (const { call, put } of optionsByDate[selectedExpiryIdx].entry) {
      if (call !== undefined) {
        setBaseAsset(call);
        return;
      } if (put !== undefined) {
        setBaseAsset(put);
        return;
      }
    }
  }, [selectedExpiryIdx, optionsByDate, setBaseAsset]);

  return (
    <div>
      <div style={{ display: 'flex' }}>
        {' '}
        <Header primary="Option Trading" />
        {' '}
        <div style={{ paddingTop: '24px' }}>
          <Tag> beta </Tag>
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
        fields={[

          { label: 'last', align: 'start' },
          { label: 'bid', align: 'start' },
          { label: 'ask', align: 'start' },
          { label: ' ', align: 'start' },
          { label: 'strike', align: 'start' },
          { label: ' ', align: 'start' },
          { label: 'last', align: 'start' },
          { label: 'bid', align: 'start' },
          { label: 'ask', align: 'start' },

        ]}
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
          let callBidOnclick = () => {};
          let callAskOnclick = () => {};

          const lastPutPrice = '-';
          let putAsk = '-';
          let putBid = '-';
          let putOnclick = () => {};
          let putBidOnclick = () => {};
          let putAskOnclick = () => {};

          if (callDetail !== undefined) {
            // have call option has this strike price
            callAsk = callDetail.bestAskPrice.toFixed(4);
            callBid = callDetail.bestBidPrice.toFixed(4);
            callOnclick = () => { setBaseAsset(call); };

            callBidOnclick = () => {
              setTradeType('sell');
              setBaseAsset(call);
              setSelectedOrders(callDetail.bestBid ? [callDetail.bestBid] : []);
            };
            callAskOnclick = () => {
              setTradeType('buy');
              setBaseAsset(call);
              setSelectedOrders(callDetail.bestAsk ? [callDetail.bestAsk] : []);
            };
          }
          if (putDetail !== undefined) {
            // has put option has this strike price
            putAsk = putDetail.bestAskPrice.toFixed(4);
            putBid = putDetail.bestBidPrice.toFixed(4);
            putOnclick = () => { setBaseAsset(put); };

            putBidOnclick = () => {
              setBaseAsset(put);
              setTradeType('sell');
              setSelectedOrders(putDetail.bestBid ? [putDetail.bestBid] : []);
            };
            putAskOnclick = () => {
              setBaseAsset(put);
              setTradeType('buy');
              setSelectedOrders(putDetail.bestAsk ? [putDetail.bestAsk] : []);
            };
          }

          return [
            <Cell onClick={callOnclick} text={lastCallPrice} type="normal" />,
            <Cell onClick={callBidOnclick} text={callBid} type="bid" />,
            <Cell onClick={callAskOnclick} text={callAsk} type="ask" />,
            <div style={{ width: '30px' }}>
              <Radio
                disabled={!call}
                onChange={() => setBaseAsset(call)}
                checked={call && call.addr === baseAsset.addr}
              />
            </div>,
            <div style={{ fontSize: 20, width: '50px', padding: '10px' }}>{strikePrice}</div>,
            <div style={{ width: '30px' }}>
              <Radio
                disabled={!put}
                onChange={() => (setBaseAsset(put))}
                checked={put && put.addr === baseAsset.addr}
              />
            </div>,
            <Cell onClick={putOnclick} text={lastPutPrice} type="normal" />,
            <Cell onClick={putBidOnclick} text={putBid} type="bid" />,
            <Cell onClick={putAskOnclick} text={putAsk} type="ask" />,

          ];
        }}
      />
    </div>
  );
}

OptionBoard.propTypes = {
  calls: PropTypes.arrayOf(OptionType).isRequired,
  puts: PropTypes.arrayOf(OptionType).isRequired,
  baseAsset: TokenType.isRequired,
  quoteAsset: TokenType.isRequired,
  setBaseAsset: PropTypes.func.isRequired,
  setTradeType: PropTypes.func.isRequired,
  setSelectedOrders: PropTypes.func.isRequired,
};

export default OptionBoard;

/**
 *
 * @param {Array<{strikePriceInUSD:number, addr:string, expiry:number}>} puts
 * @param {Array<{strikePriceInUSD:number, addr:string, expiry:number}>} calls
 * @param {Array<{option: string, bestBidPrice: BigNumber, bestAskPrice: BigNumber}>} putStats
 * @param {Array<{option: string, bestBidPrice: BigNumber, bestAskPrice: BigNumber}>} callStats
 * @returns {} key: expiry in string, value: array of { call, put, callDetail, putDetail, strikePrice}
 */
function groupByDate(puts, calls, putStats, callStats) {
  const result = [];
  const allOptions = puts.concat(calls).filter((option) => option.expiry > Date.now() / 1000);
  const distinctExpirys = [...new Set(allOptions.map((option) => option.expiry))];

  for (const expiry of distinctExpirys) {
    const optionsExpiresThisDay = allOptions.filter((o) => o.expiry === expiry);
    const strikePrices = [
      ...new Set(optionsExpiresThisDay.map((option) => option.strikePriceInUSD)),
    ];

    // const allStrikesForThisDay = {};
    const entries = [];
    for (const strikePrice of strikePrices) {
      const put = puts.find((o) => o.strikePriceInUSD === strikePrice && o.expiry === expiry);
      const call = calls.find((o) => o.strikePriceInUSD === strikePrice && o.expiry === expiry);
      const putDetail = put ? putStats.find((p) => p.option === put.addr) : undefined;
      const callDetail = call ? callStats.find((c) => c.option === call.addr) : undefined;
      entries.push({
        strikePrice,
        call,
        put,
        callDetail,
        putDetail,
      });
    }
    entries.sort((a, b) => (a.strikePrice > b.strikePrice ? 1 : -1));
    const expiryText = new Date(expiry * 1000).toDateString();
    result.push({
      expiryText,
      entry: entries,
    });
    // result[expiryKey] = entryRow;
  }
  return result;
}

function Cell({
  onClick, text, type,
}) {
  return (
    <LinkBase onClick={onClick}>
      <div style={{ width: '60px', textAlign: 'center' }}>
        { type === 'bid' ? (
          <BidText>
            {' '}
            {text}
            {' '}
          </BidText>
        ) : type === 'ask' ? (
          <AskText>
            {' '}
            {text}
            {' '}
          </AskText>
        ) : (
          <div>
            {' '}
            {text}
            {' '}
          </div>
        ) }
      </div>
    </LinkBase>
  );
}

Cell.propTypes = {
  onClick: PropTypes.func.isRequired,
  text: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
};
