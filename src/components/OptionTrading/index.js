import React, { useEffect, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Header, Button } from '@aragon/ui';

import styled from 'styled-components';
import BigNumber from 'bignumber.js';
import OptionBoard from './OptionBoard';
import OrderList from './Orders';
import BuyAndSell from './BuyAndSell';

import { getTokenBalance, getDecimals } from '../../utils/infura';
import { getOrderBook, isValid } from '../../utils/0x';
import { getVault } from '../../utils/graph';
import { approve } from '../../utils/web3';
import { eth_puts, eth_calls } from '../../constants/options';
import { ZeroX_ERC20Proxy } from '../../constants/contracts';

const quoteAsset = {
  symbol: 'WETH',
  addr: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  decimals: 18,
}; // WETH

function OptionTrading({ user, theme }) {
  const [baseAsset, setBaseAsset] = useState(eth_puts[0]); // DAI

  const [asks, setAsks] = useState([]);
  const [bids, setBids] = useState([]);

  const [tradeType, setTradeType] = useState('bid');
  const [selectedOrders, setSelectedOrders] = useState([]);

  // user balance
  const [baseAssetBalance, setBaseAssetBalance] = useState(BigNumber(0));
  const [quoteAssetBalance, setQuoteAssetBalance] = useState(BigNumber(0));

  // Collateral info for baseAsset
  const [collateralDecimals, setCollateralDecimals] = useState(18);
  const [vault, setVault] = useState({});

  // BaseAsset changeed: Update orderbook and base asset
  useEffect(() => {
    let isCancelled = false;

    // update orderbook
    const updateOrderBook = async () => {
      const res = await getOrderBook(baseAsset.addr, quoteAsset.addr);
      if (!isCancelled) {
        setAsks(res.asks.records.filter((record) => isValid(record)));
        setBids(res.bids.records.filter((record) => isValid(record)));
      }
    };

    // update baseAsset Balance
    const updateBaseBalance = async () => {
      const baseBalance = await getTokenBalance(baseAsset.addr, user);
      if (!isCancelled) {
        setBaseAssetBalance(new BigNumber(baseBalance));
      }
    };

    const updateVaultData = async () => {
      if (user === '') return;
      const userVault = await getVault(user, baseAsset.addr);
      if (!isCancelled) setVault(userVault);
    };
    updateOrderBook();
    updateBaseBalance();
    updateVaultData();
    const idOrderBook = setInterval(updateOrderBook, 1000);
    const idBaseBalance = setInterval(updateBaseBalance, 5000);
    const idUpdateVault = setInterval(updateVaultData, 10000);
    return () => {
      isCancelled = true;
      clearInterval(idOrderBook);
      clearInterval(idBaseBalance);
      clearInterval(idUpdateVault);
    };
  }, [baseAsset, user]);

  // update quote asset
  useEffect(() => {
    let isCancelled = false;
    const updateQuoteBalance = async () => {
      const quoteBalance = await getTokenBalance(quoteAsset.addr, user);
      if (!isCancelled) {
        setQuoteAssetBalance(new BigNumber(quoteBalance));
      }
    };
    updateQuoteBalance();
    const idQuoteAssetBalance = setInterval(updateQuoteBalance, 5000);
    return () => {
      isCancelled = true;
      clearInterval(idQuoteAssetBalance);
    };
  }, [user]);

  // get collateral decimals
  useMemo(async () => {
    const cltrDecimals = await getDecimals(baseAsset.collateral);
    setCollateralDecimals(cltrDecimals);
  }, [baseAsset.collateral]);

  return (
    <WholeScreen>
      <FlexWrapper>
        <LeftPart>
          {/* Buy And Sell */}
          <Header />
          <Header
            primary={(
              <Button
                label="Enable oToken"
                onClick={() => {
                  approve(baseAsset.addr, ZeroX_ERC20Proxy);
                }}
              />
          )}
            secondary={(
              <Button
                label="Enable WETH"
                onClick={() => {
                  approve(quoteAsset.addr, ZeroX_ERC20Proxy);
                }}
              />
)}
          />
          <BuyAndSell
            user={user}
            baseAsset={baseAsset.addr}
            quoteAsset={quoteAsset.addr}
            baseAssetSymbol={baseAsset.symbol}
            collateralSymbol={baseAsset.collateralSymbol}
            quoteAssetSymbol={quoteAsset.symbol}
            baseAssetBalance={baseAssetBalance}
            quoteAssetBalance={quoteAssetBalance}
            baseAssetDecimals={baseAsset.decimals}
            quoteAssetDecimals={quoteAsset.decimals}
            collateralDecimals={collateralDecimals}
            vault={vault}
            theme={theme}

            tradeType={tradeType}
            setTradeType={setTradeType}

            selectedOrders={selectedOrders}
            setSelectedOrders={setSelectedOrders}
          />
        </LeftPart>
        <RightPart>
          <Header primary="Trade ETH Options" />
          <OptionBoard
            puts={eth_puts}
            calls={eth_calls}
            setBaseAsset={setBaseAsset}
            setTradeType={setTradeType}
            setSelectedOrders={setSelectedOrders}
          />
          <br />
          {/* <FixBottom> */}
          <OrderList
            asks={asks}
            bids={bids}
            user={user}
            option={baseAsset}
            quoteAsset={quoteAsset}
          />
          {/* </FixBottom> */}
        </RightPart>
      </FlexWrapper>
    </WholeScreen>
  );
}

OptionTrading.propTypes = {
  user: PropTypes.string.isRequired,
  theme: PropTypes.string.isRequired,
};

// const FixBottom = styled.div`
//   margin-top: auto;
// `;

const LeftPart = styled.div`
  width: 20%;
  padding-right: 1.5%;
  display: flex;
  flex-direction: column;
`;

const RightPart = styled.div`
  width: 70%;
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
