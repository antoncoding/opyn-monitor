import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Header, Split } from '@aragon/ui';

import OptionBoard from './OptionBoard';
import OrderHistory from './OrderHistory';

import { getOrderBook } from '../../utils/0x';

import { mock_eth_puts as eth_puts, mock_eth_calls as eth_calls } from '../../constants/options';

const quoteAsset = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'; // WETH


function OptionTrading({ user }) {
  // const baseAsset =;
  const [baseAsset, setBaseAsset] = useState(eth_calls[0]); // DAI
  // const [quoteAsset, ] = useState(); //  WETH

  const [asks, setAsks] = useState([]);
  const [bids, setBids] = useState([]);

  // Update orderbook data
  useMemo(() => {
    let isCancelled = false;
    const updateOrderBook = async () => {
      // console.log('update orderbook');
      const res = await getOrderBook(baseAsset.addr, quoteAsset);
      if (!isCancelled) {
        setAsks(res.asks.records);
        setBids(res.bids.records);
      }
    };
    updateOrderBook();
    const id = setInterval(updateOrderBook, 1000);

    return () => {
      isCancelled = true;
      clearInterval(id);
    };
  }, [baseAsset]);

  return (
    <>
      <Header
        primary="Trade ETH Options"
      />
      <Split
        invert="horizontal"
        primary={(
          <>
            <OptionBoard
              puts={eth_puts}
              calls={eth_calls}
              setBaseAsset={setBaseAsset}
            />
            <br />
            <OrderHistory
              asks={asks}
              bids={bids}
              user={user}
              option={baseAsset}
            />
          </>
        )}
      />

    </>
  );
}

OptionTrading.propTypes = {
  user: PropTypes.string.isRequired,
};


export default OptionTrading;
