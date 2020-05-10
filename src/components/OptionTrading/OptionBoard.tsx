import React, { useState, useEffect } from 'react';
import {
  DataView, DropDown, LinkBase, Radio, Header, Tag,
} from '@aragon/ui';
import { AskText, BidText } from './styled';

import { SectionTitle } from '../common';

import { getBasePairAskAndBids } from '../../utils/0x';
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
  setBaseAsset: Function,
  setTradeType: Function,
  setSelectedOrders: Function,
};

function OptionBoard({
  baseAsset, quoteAsset, setBaseAsset, setTradeType, setSelectedOrders,
}:OptionBoardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedExpiryIdx, setExpiryIdx] = useState(0);
  const [entriesToDisplay, setEntriesToDisplay] = useState<dataViewEntryType[]>([]);

  // on expiry change: start the call and put update function on the options of that day
  useEffect(() => {
    setIsLoading(true);
    let isCancelled = false;

    const updateBoardStats = async () => {
      const callsOfExpiry = optionsByDate[selectedExpiryIdx].pairs
        .filter((pair) => pair.call !== undefined)
        .map((pair) => pair.call);

      const putsOfExpiry = optionsByDate[selectedExpiryIdx].pairs
        .filter((pair) => pair.put !== undefined)
        .map((pair) => pair.put);

      const [callData, putData] = await Promise.all([
        getBasePairAskAndBids(callsOfExpiry as types.ETHOption[] , quoteAsset),
        getBasePairAskAndBids(putsOfExpiry as types.ETHOption[], quoteAsset),
      ]);

      const displayEntries: dataViewEntryType[] = [];
      optionsByDate[selectedExpiryIdx].pairs.forEach((pair) => {
        const { call, put, strikePrice } = pair;
        const entry: dataViewEntryType = { strikePrice };
        if (call !== undefined) {
          // has call option on this strikePrice
          entry.call = call;
          entry.callDetail = callData.find((c) => c.option === call.addr);
        }
        if (put !== undefined) {
          entry.put = put;
          entry.putDetail = putData.find((p) => p.option === put.addr);
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

  // when selection change: update selected order to the first option of the expiry
  const onExpiryChange = (idx) => {
    setExpiryIdx(idx);
    for (const { call, put } of optionsByDate[idx].pairs) {
      if (call !== undefined) {
        setBaseAsset(call);
        return;
      } if (put !== undefined) {
        setBaseAsset(put);
        return;
      }
    }
  };

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
            onChange={onExpiryChange}
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
        tableRowHeight={50}
        status={isLoading ? 'loading' : 'default'}
        fields={[
          { label: 'last', align: 'start' },
          { label: 'bid', align: 'start' },
          { label: 'amt', align: 'start' },
          { label: 'ask', align: 'start' },
          { label: 'amt', align: 'start' },
          { label: ' ', align: 'start' },
          { label: 'strike', align: 'start' },
          { label: ' ', align: 'start' },
          { label: 'last', align: 'start' },
          { label: 'bid', align: 'start' },
          { label: 'amt', align: 'start' },
          { label: 'ask', align: 'start' },
          { label: 'amt', align: 'last' },

        ]}
        entries={entriesToDisplay}
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
          let callBidAmt = '-';
          let callAskAmt = '-';
          let callOnclick = () => { };
          let callBidOnclick = () => { };
          let callAskOnclick = () => { };

          const lastPutPrice = '-';
          let putAsk = '-';
          let putBid = '-';
          let putBidAmt = '-';
          let putAskAmt = '-';
          let putOnclick = () => { };
          let putBidOnclick = () => { };
          let putAskOnclick = () => { };

          if (callDetail !== undefined) {
            // have call option has this strike price
            callAsk = callDetail.bestAskPrice.toFixed(4);
            callBid = callDetail.bestBidPrice.toFixed(4);
            callAskAmt = callDetail.totalAskAmt.toFixed(2);
            callBidAmt = callDetail.totalBidAmt.toFixed(2);
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
            putAskAmt = putDetail.totalAskAmt.toFixed(2);
            putBidAmt = putDetail.totalBidAmt.toFixed(2);

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
            <Cell onClick={callBidOnclick} text={callBidAmt} type="normal" />,

            <Cell onClick={callAskOnclick} text={callAsk} type="ask" />,
            <Cell onClick={callAskOnclick} text={callAskAmt} type="normal" />,
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
            <Cell onClick={putBidOnclick} text={putBidAmt} type="normal" />,
            <Cell onClick={putAskOnclick} text={putAsk} type="ask" />,
            <Cell onClick={putBidOnclick} text={putAskAmt} type="normal" />,

          ];
        }}
      />
    </div>
  );
}



export default OptionBoard;

/**
 *
 */
function groupByDate(puts: types.ETHOption[], calls: types.ETHOption[]): entriesForExpiry[] {
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
    const expiryText = new Date(expiry * 1000).toDateString();
    result.push({
      expiry,
      expiryText,
      pairs,
    });
  }
  return result;
}

type CellProps = {
  onClick: Function,
  text: string,
  type: 'bid' | 'ask' | 'normal'
}

function Cell({
  onClick, text, type,
}:CellProps) {
  return (
    <LinkBase onClick={onClick}>
      <div style={{ width: '60px', textAlign: 'center' }}>
        {type === 'bid' ? (
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
            )}
      </div>
    </LinkBase>
  );
}

