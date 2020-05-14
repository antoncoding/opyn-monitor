/* eslint-disable no-restricted-syntax */
import React, { useState } from 'react';

import {
  DataView, Timer, Button,
} from '@aragon/ui';

import { cancelOrders } from '../../utils/web3';

import { toTokenUnitsBN } from '../../utils/number';
import * as types from '../../types';
import { AskText, BidText } from './styled';
import * as zeroXUtil from '../../utils/0x';

type MyOrdersProps = {
  asks: types.order[],
  bids: types.order[],
  user: string,
  option: types.option,
  quoteAsset: types.token,
};

function MyOrders({
  asks, bids, option, user, quoteAsset,
}: MyOrdersProps) {
  const [myOrdersPage, setMyOrdersPage] = useState(0);
  const [selectedOrders, setSelectedOrders] = useState<types.order[]>([]);
  const userAsks = asks
    .filter((o) => o.order.makerAddress === user.toLowerCase())
    .map((o) => {
      // eslint-disable-next-line no-param-reassign
      // return { ...o, type: 'Ask' }
      o.type = 'Ask';
      return o;
    });
  const userBids = bids
    .filter((o) => o.order.makerAddress === user.toLowerCase())
    .map((o) => {
      // eslint-disable-next-line no-param-reassign
      // return { ...o, type: 'Bid' }
      o.type = 'Bid';
      return o;
    });

  return (
    <>
      <DataView
        entriesPerPage={4}
        statusEmpty={(
          <div style={{ fontSize: 15 }}>
            No Open Orders for
            {' '}
            {option.symbol}
          </div>
        )}
        page={myOrdersPage}
        onPageChange={setMyOrdersPage}
        onSelectEntries={setSelectedOrders}
        fields={['digest', 'type', 'price', 'amount', 'filled', 'expiration', '']}
        entries={userAsks.concat(userBids)
          .sort((a, b) => (a.order.expirationTimeSeconds > b.order.expirationTimeSeconds ? 1 : -1))}
        renderEntry={function (order: types.order) {
          return [
            order.metaData.orderHash.slice(2, 8),
            order.type === 'Ask' ? <AskText>{order.type}</AskText> : <BidText>{order.type}</BidText>,
            order.type === 'Ask'
              ? zeroXUtil.getAskPrice(order, option.decimals, quoteAsset.decimals).toFixed(6)
              : zeroXUtil.getBidPrice(order, quoteAsset.decimals, option.decimals).toFixed(6),
            order.type === 'Ask'
              ? toTokenUnitsBN(order.order.makerAssetAmount, option.decimals).toFixed(3)
              : toTokenUnitsBN(order.order.takerAssetAmount, option.decimals).toFixed(3),
            `${zeroXUtil.getOrderFillRatio(order)}%`,
            <Timer end={new Date(parseInt(order.order.expirationTimeSeconds) * 1000)} />,

            selectedOrders.length > 0
              ? (
                <Button onClick={() => {
                  cancelOrders(selectedOrders.map((o) => o.order));
                }}
                >
                  Cancel Selected
                </Button>
              )
              : (
                <Button onClick={() => {
                  cancelOrders([order.order]);
                }}
                >
                  Cancel Order
                </Button>
              ),
          ]
        }

        }
      />
    </>
  );
}

export default MyOrders;
