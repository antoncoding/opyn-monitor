/* eslint-disable no-restricted-syntax */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { DataView, Timer } from '@aragon/ui';

import { toTokenUnitsBN } from '../../utils/number';
import { order as OrderType, option as OptionType } from '../types';
import { AskText, BidText } from './styled';
import * as zeroXUtil from '../../utils/0x';

function OrderBook({
  asks, bids, option, quoteAsset, setTradeType, setSelectedOrders,
}) {
  const [askPage, setAskPage] = useState(0);
  const [bidPage, setBidPage] = useState(0);

  const onSelectAskEntry = (entries) => {
    setTradeType('bid'); // Filling ask orders is a bid
    setSelectedOrders(entries);
  };

  const onSelectBidEntry = (entries) => {
    setTradeType('ask'); // Filling bid orders is a ask
    setSelectedOrders(entries);
  };

  return (
    <>
      <div style={{ display: 'flex' }}>
        <div style={{ width: '50%' }}>
          <DataView
            entriesPerPage={4}
            page={askPage}
            onPageChange={setAskPage}
            entries={asks}
            onSelectEntries={onSelectAskEntry}
            renderSelectionCount={(x) => `${x} Orders Selected`}
            fields={['price', 'amount', 'filled', 'expiration']}
            renderEntry={(order) => [
              <AskText>{zeroXUtil.getAskPrice(order, option.decimals, quoteAsset.decimals).toFixed(6)}</AskText>,
              toTokenUnitsBN(order.order.makerAssetAmount, option.decimals).toFixed(3),
              `${zeroXUtil.getOrderFillRatio(order)}%`,
              <Timer format="hms" showIcon end={new Date(order.order.expirationTimeSeconds * 1000)} />,
            ]}
          />
        </div>
        <div style={{ width: '50%' }}>
          <DataView
            entriesPerPage={4}
            page={bidPage}
            onPageChange={setBidPage}
            entries={bids}
            onSelectEntries={onSelectBidEntry}
            renderSelectionCount={(x) => `${x} Orders Selected`}
            fields={['price', 'amount', 'filled', 'expiration']}
            renderEntry={(order) => [
              <BidText>{zeroXUtil.getBidPrice(order, quoteAsset.decimals, option.decimals).toFixed(6)}</BidText>,
              toTokenUnitsBN(order.order.takerAssetAmount, option.decimals).toFixed(3),
              `${zeroXUtil.getOrderFillRatio(order)}%`,
              <Timer format="hms" showIcon end={new Date(order.order.expirationTimeSeconds * 1000)} />,
            ]}
          />
        </div>
      </div>


    </>
  );
}

OrderBook.propTypes = {
  asks: PropTypes.arrayOf(OrderType).isRequired,
  bids: PropTypes.arrayOf(OrderType).isRequired,
  option: OptionType.isRequired,
  quoteAsset: PropTypes.shape({
    decimals: PropTypes.number.isRequired,
    addr: PropTypes.string.isRequired,
    symbol: PropTypes.string.isRequired,
  }).isRequired,
  setTradeType: PropTypes.func.isRequired,
  setSelectedOrders: PropTypes.func.isRequired,
};

export default OrderBook;
