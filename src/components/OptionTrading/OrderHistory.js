/* eslint-disable no-restricted-syntax */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { DataView, Timer, Button } from '@aragon/ui';

// import { assetDataUtils } from '@0x/order-utils';

import BigNumber from 'bignumber.js';
import { toTokenUnitsBN } from '../../utils/number';
import { order as OrderType, option as OptionType } from '../types';
import { AskText, BidText } from './styled';
import { SectionTitle } from '../common';

function OrderHistory({
  asks, bids, option, user,
}) {
  const [page, setPage] = useState(0);

  const orders = []; // asks.concat(bids);

  // const bidsFromUser = bids.filter((o) => o.order.makerAddress === '0x6924a03bb710eaf199ab6ac9f2bb148215ae9b5d');
  // const asksFromUser = asks.filter((o) => o.order.makerAddress === '0x6924a03bb710eaf199ab6ac9f2bb148215ae9b5d');

  const bidsFromUser = bids.slice(0, 3);
  const asksFromUser = asks.slice(0, 3);
  console.log(user);

  // .filter((o) => o.order.makerAddress === user);
  for (const bid of bidsFromUser) {
    // taker asset: option
    const price = new BigNumber(bid.order.makerAssetAmount).div(new BigNumber(bid.order.takerAssetAmount));
    const filledRatio = 100 - new BigNumber(bid.metaData.remainingFillableTakerAssetAmount)
      .div(new BigNumber(bid.order.takerAssetAmount)).times(100).toFixed(2);
    orders.push({
      id: bid.metaData.orderHash.slice(2, 8),
      type: 'Bid',
      price: price.toFixed(6),
      filledRatio,
      total: toTokenUnitsBN(bid.order.takerAssetAmount, option.decimals).toFixed(6),
      status: 'open',
      expiry: bid.order.expirationTimeSeconds,
    });
  }

  // Selling the option
  for (const ask of asksFromUser) {
    // makerAssetAmount: option
    // takerAssetAmount: weth
    const price = new BigNumber(ask.order.takerAssetAmount).div(new BigNumber(ask.order.makerAssetAmount));
    // unit weth left -> unit option left
    const filledRatio = 100 - new BigNumber(ask.metaData.remainingFillableTakerAssetAmount)
      .div(new BigNumber(ask.order.takerAssetAmount)).times(100).toFixed(2);

    const total = toTokenUnitsBN(ask.order.makerAssetAmount, option.decimals).toFixed(6);
    orders.push({
      id: ask.metaData.orderHash.slice(2, 8),
      type: 'Ask',
      price: price.toFixed(6),
      filledRatio,
      total,
      expiry: ask.order.expirationTimeSeconds,
    });
  }


  return (
    <>
      <SectionTitle title="My Orders" />
      <DataView
        entriesPerPage={4}
        page={page}
        onPageChange={setPage}
        fields={['digest', 'type', 'price', 'amount', 'filled', 'expiration', '']}
        entries={orders}
        renderEntry={(order) => [// call, put, callDetail, putDetail, strikePrice
          order.id,
          order.type === 'Ask' ? <AskText>{order.type}</AskText> : <BidText>{order.type}</BidText>,
          order.price,
          order.total,
          `${order.filledRatio}%`,
          <Timer end={new Date(order.expiry * 1000)} />,
          <Button onClick={() => {}}>Cancel Order</Button>,
        ]}
      />
    </>
  );
}

OrderHistory.propTypes = {
  asks: PropTypes.arrayOf(OrderType).isRequired,
  bids: PropTypes.arrayOf(OrderType).isRequired,
  user: PropTypes.string.isRequired,
  option: OptionType.isRequired,
};

export default OrderHistory;
