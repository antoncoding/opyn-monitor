import React, { useState } from 'react';
import { Tabs } from '@aragon/ui';

import MyOrders from './MyOrders';
import OrderBook from './OrderBook';

import * as types from '../../types';

type TabBoardProps = {
  asks: types.order[],
  bids: types.order[],
  option: types.option,
  user: string,
  quoteAsset: types.token,
  tradeType: types.tradeType,
  selectedOrders: types.order[],
  setTradeType: Function,
  setSelectedOrders: Function
}

function Orders({
  asks, bids, option, user, quoteAsset,
  tradeType,
  selectedOrders,
  setTradeType,
  setSelectedOrders,
}: TabBoardProps) {
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
            tradeType={tradeType}
            setTradeType={setTradeType}
            selectedOrders={selectedOrders}
            setSelectedOrders={setSelectedOrders}
          />
        )
        : (
          <MyOrders asks={asks} bids={bids} option={option} user={user} quoteAsset={quoteAsset} />
        )}

    </>
  );
}

export default Orders;
