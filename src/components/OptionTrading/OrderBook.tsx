/* eslint-disable no-restricted-syntax */
import React, { useState, useEffect } from 'react';

import { DataView, Timer } from '@aragon/ui';

import { toTokenUnitsBN } from '../../utils/number';
import * as types from '../../types';
import { AskText, BidText } from './styled';
import * as zeroXUtil from '../../utils/0x';

type OrderbookProps = {
  asks: types.order[],
  bids: types.order[],
  option: types.option,
  quoteAsset: types.token,
  tradeType: types.tradeType,
  selectedOrders: types.order[],
  setTradeType: Function,
  setSelectedOrders: Function,
};

function OrderBook({
  asks, bids, option, quoteAsset, setTradeType, setSelectedOrders, selectedOrders, tradeType,
}:OrderbookProps) {
  const [askPage, setAskPage] = useState(0);
  const [bidPage, setBidPage] = useState(0);

  const [askSelectedIndexs, setAskSelectedIndexes] = useState<number[]>([]);
  const [bidSelectedIndexs, setBidSelectedIndexes] = useState<number[]>([]);

  const onSelectAskEntry = (entries, indexes) => {
    setTradeType('buy'); // Filling ask orders is a bid
    setSelectedOrders(entries);
    setAskSelectedIndexes(indexes);
  };

  const onSelectBidEntry = (entries, indexes) => {
    setTradeType('sell'); // Filling bid orders is a ask
    setSelectedOrders(entries);
    setBidSelectedIndexes(indexes);
  };

  // everytime tradeType or selectedOrders changed, the selection is updated
  useEffect(() => {
    if (tradeType === 'buy') { // user select and ask order
      setBidSelectedIndexes([]); // reset bid selections
      const selectedIdxs: number[] = [];
      for (let i = 0; i < asks.length; i += 1) {
        if (selectedOrders.map((o) => o.metaData.orderHash).includes(asks[i].metaData.orderHash)) {
          selectedIdxs.push(i);
        }
      }
      setAskSelectedIndexes(selectedIdxs);
    } else {
      setAskSelectedIndexes([]);
      const selectedIdxs: number[] = [];
      for (let i = 0; i < bids.length; i += 1) {
        if (selectedOrders.map((o) => o.metaData.orderHash).includes(bids[i].metaData.orderHash)) {
          selectedIdxs.push(i);
        }
      }
      setBidSelectedIndexes(selectedIdxs);
    }
  }, [selectedOrders, tradeType, asks, bids]);

  return (
    <>
      <div style={{ display: 'flex' }}>
        <div style={{ width: '50%' }}>
          <DataView
            statusEmpty={<div>No Sell Orders</div>}
            entriesPerPage={8}
            page={askPage}
            onPageChange={setAskPage}
            entries={asks}
            tableRowHeight={40}
            onSelectEntries={onSelectAskEntry}
            // If other operation reset selected orders, should change selected accordingly
            selection={askSelectedIndexs}
            renderSelectionCount={(x) => `${x} Orders Selected`}
            fields={['price', 'amount', 'filled', 'expiration']}
            renderEntry={(order) => [
              <AskText>{zeroXUtil.getAskPrice(order, option.decimals, quoteAsset.decimals).toFixed(4)}</AskText>,
              toTokenUnitsBN(order.order.makerAssetAmount, option.decimals).toFixed(4),
              `${zeroXUtil.getOrderFillRatio(order)}%`,
              <Timer format="hms" showIcon end={new Date(order.order.expirationTimeSeconds * 1000)} />,
            ]}
          />
        </div>
        <div style={{ width: '50%' }}>
          <DataView
            statusEmpty={<div>No Buy Orders</div>}
            entriesPerPage={8}
            page={bidPage}
            onPageChange={setBidPage}
            entries={bids}
            tableRowHeight={40}
            onSelectEntries={onSelectBidEntry}
            selection={bidSelectedIndexs}
            renderSelectionCount={(x) => `${x} Orders Selected`}
            fields={['price', 'amount', 'filled', 'expiration']}
            renderEntry={(order) => [
              <BidText>{zeroXUtil.getBidPrice(order, quoteAsset.decimals, option.decimals).toFixed(4)}</BidText>,
              toTokenUnitsBN(order.order.takerAssetAmount, option.decimals).toFixed(4),
              `${zeroXUtil.getOrderFillRatio(order)}%`,
              <Timer format="hms" showIcon end={new Date(order.order.expirationTimeSeconds * 1000)} />,
            ]}
          />
        </div>
      </div>


    </>
  );
}

export default OrderBook;
