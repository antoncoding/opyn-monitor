import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Header } from '@aragon/ui';

import styled from 'styled-components';
import OptionBoard from './OptionBoard';
import OrderHistory from './OrderHistory';
import BuyAndSell from './BuyAndSell';

import { getOrderBook } from '../../utils/0x';

import { mock_eth_puts as eth_puts, mock_eth_calls as eth_calls } from '../../constants/options';

const quoteAsset = {
  symbol: 'WETH',
  addr: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  decimals: '18',
}; // WETH

function OptionTrading({ user, theme }) {
  const [baseAsset, setBaseAsset] = useState(eth_calls[0]); // DAI
  // const [quoteAsset, ] = useState(); //  WETH

  const [asks, setAsks] = useState([]);
  const [bids, setBids] = useState([]);

  // Update orderbook data
  useEffect(() => {
    let isCancelled = false;
    const updateOrderBook = async () => {
      const res = await getOrderBook(baseAsset.addr, quoteAsset.addr);
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
    <WholeScreen>
      <FlexWrapper>
        <LeftPart>
          {/* OrderBook */}
          {/* Buy And Sell */}
          <FixBottom>
            <BuyAndSell
              baseAssetSymbol={baseAsset.symbol}
              collateralSymbol={baseAsset.collateralSymbol}
              quoteAssetSymbol={quoteAsset.symbol}
              theme={theme}
            />
          </FixBottom>
        </LeftPart>
        <RightPart>
          <Header primary="Trade ETH Options" />
          <OptionBoard puts={eth_puts} calls={eth_calls} setBaseAsset={setBaseAsset} />
          <FixBottom>
            <OrderHistory asks={asks} bids={bids} user={user} option={baseAsset} />
          </FixBottom>
        </RightPart>
      </FlexWrapper>
    </WholeScreen>
  );
}

OptionTrading.propTypes = {
  user: PropTypes.string.isRequired,
  theme: PropTypes.string.isRequired,
};

const FixBottom = styled.div`
  margin-top: auto;
`;

const LeftPart = styled.div`
  width: 20%;
  padding-right: 1.5%;
  display: flex;
  flex-direction: column;
`;

const RightPart = styled.div`
  width: 80%;
  display: flex;
  flex-direction: column;
`;

const WholeScreen = styled.div`
  textAlign: center;
  padding-left: 4%;
  padding-right: 4%;
  position: fixed;
  left: 0;
  top: 7%;
  width: 100%;
  height: 100%;
`;

const FlexWrapper = styled.div`
  display: flex;
  height:87%
`;

export default OptionTrading;
