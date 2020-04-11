/* eslint-disable no-restricted-syntax */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { DataView } from '@aragon/ui';

// import { assetDataUtils } from '@0x/order-utils';

import BigNumber from 'bignumber.js';
import { toTokenUnitsBN } from '../../utils/number';
import { order as OrderType, option as OptionType } from '../types';


import { SectionTitle } from '../common';

function OrderHistory({
  asks, bids, option, user,
}) {
  const [page, setPage] = useState(0);

  const orders = []; // asks.concat(bids);

  const bidsFromUser = bids;
  // .filter((o) => o.order.makerAddress === '0x6924a03bb710eaf199ab6ac9f2bb148215ae9b5d');
  // const asksFromUser = asks.filter((o) => o.order.makerAddress === '0x6924a03bb710eaf199ab6ac9f2bb148215ae9b5d');
  // .filter((o) => o.order.makerAddress === user);
  for (const bid of bidsFromUser) {
    const price = new BigNumber(bid.order.makerAssetAmount).div(new BigNumber(bid.order.takerAssetAmount));
    const amount = toTokenUnitsBN(bid.metaData.remainingFillableTakerAssetAmount, option.decimals);
    orders.push({
      id: bid.metaData.orderHash.slice(2, 6),
      price: price.toFixed(6),
      amount: amount.toFixed(6),
      status: 'open',
      expiry: bid.order.expirationTimeSeconds,
    });
    // assetDataUtils.decodeAssetDataOrThrow(bid.order.takerAssetData).tokenAddress === option);
  }

  // for (const ask of asksFromUser) {
  // console.log(assetDataUtils.decodeAssetDataOrThrow(ask.order.makerAssetData).tokenAddress === option);
  // }


  return (
    <>
      {/* <Tabs
        items={['Orders']}
        selected={selectedTab}
        onChange={setSelectedTab}
      /> */}
      <SectionTitle title="My Orders" />
      <DataView
        entriesPerPage={5}
        page={page}
        onPageChange={setPage}
        fields={['digest', 'status', 'price', 'amount', 'expiration']}
        entries={orders}
        renderEntry={(order) => [// call, put, callDetail, putDetail, strikePrice,
          order.id,
          order.status,
          order.price,
          order.amount,
          order.expiry,
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
