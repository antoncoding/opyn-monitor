/* eslint-disable no-restricted-syntax */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Tabs } from '@aragon/ui';

import MyOrders from './MyOrders';
import OrderBook from './OrderBook';

import { order as OrderType, option as OptionType } from '../types';

function Orders({
  asks, bids, option, user, quoteAsset,
  setTradeType,
  setSelectedOrders,
}) {
  const [selectedTab, setSelectedTab] = useState(0);

  return (
    <>
      <Tabs
        items={['OrderBook', 'My Orders']}
        selected={selectedTab}
        onChange={setSelectedTab}
      />
      { selectedTab === 0
        ? (
          <OrderBook
            asks={asks}
            bids={bids}
            option={option}
            quoteAsset={quoteAsset}
            setTradeType={setTradeType}
            setSelectedOrders={setSelectedOrders}
          />
        )
        : (
          <MyOrders asks={asks} bids={bids} option={option} user={user} quoteAsset={quoteAsset} />
        )}

    </>
  );
}

Orders.propTypes = {
  asks: PropTypes.arrayOf(OrderType).isRequired,
  bids: PropTypes.arrayOf(OrderType).isRequired,
  user: PropTypes.string.isRequired,
  option: OptionType.isRequired,
  quoteAsset: PropTypes.shape({
    decimals: PropTypes.number.isRequired,
    addr: PropTypes.string.isRequired,
    symbol: PropTypes.string.isRequired,
  }).isRequired,
  setTradeType: PropTypes.func.isRequired,
  setSelectedOrders: PropTypes.func.isRequired,
};

export default Orders;
