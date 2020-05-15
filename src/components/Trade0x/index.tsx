import React, { useEffect, useState } from 'react';
import BigNumber from 'bignumber.js';

import {  SidePanel, Button } from '@aragon/ui';
import OptionBoard from './OptionBoard';
import TabBoard from './TabBoard';
import BuyAndSell from './BuyAndSell';

import { getTokenBalance } from '../../utils/infura';
import { getOrderBook, isValid } from '../../utils/0x';
import { eth_puts, eth_calls } from '../../constants/options';
import * as types from '../../types'
import * as tokens from '../../constants/tokens';

import tracker from '../../utils/tracker';

const quoteAsset = tokens.USDC;

function OptionTrading({ user }: { user: string }) {

  const [buySellActive, setBuySellActive] = useState(false)

  const [baseAsset, setBaseAsset] = useState<types.ETHOption | undefined>(
    eth_puts.concat(eth_calls).find((o) => o.expiry > Date.now() / 1000),
  );

  useEffect(() => {
    tracker.pageview('/trade/0x');
  }, []);

  const [asks, setAsks] = useState<types.order[]>([]);
  const [bids, setBids] = useState<types.order[]>([]);

  const [tradeType, setTradeType] = useState<types.tradeType>('buy');
  const [selectedOrders, setSelectedOrders] = useState([]);

  // user balance
  const [baseAssetBalance, setBaseAssetBalance] = useState(new BigNumber(0));
  const [quoteAssetBalance, setQuoteAssetBalance] = useState(new BigNumber(0));

  // BaseAsset changeed: Update orderbook and base asset
  useEffect(() => {
    let isCancelled = false;

    // update orderbook
    const updateOrderBook = async () => {
      const res = await getOrderBook(baseAsset!.addr, quoteAsset.addr);
      if (!isCancelled) {
        setAsks(res.asks.records.filter((record) => isValid(record)));
        setBids(res.bids.records.filter((record) => isValid(record)));
      }
    };

    // update baseAsset Balance
    const updateBaseBalance = async () => {
      const baseBalance = await getTokenBalance(baseAsset!.addr, user);
      if (!isCancelled) {
        setBaseAssetBalance(new BigNumber(baseBalance));
      }
    };

    updateOrderBook();
    updateBaseBalance();
    // updateVaultData();
    const idOrderBook = setInterval(updateOrderBook, 2000);
    const idBaseBalance = setInterval(updateBaseBalance, 30000);
    // const idUpdateVault = setInterval(updateVaultData, 10000);
    return () => {
      isCancelled = true;
      clearInterval(idOrderBook);
      clearInterval(idBaseBalance);
      // clearInterval(idUpdateVault);
    };
  }, [baseAsset, user]);

  const [buttonLabel, setButtonLabel] = useState(`Make Order for ${baseAsset?.title}`)
  const [sidePanelTitle, setSidePanelTitle] = useState('Make Order')
  useEffect(()=>{
    if (selectedOrders.length > 0) {
      setButtonLabel(`Fill Orders for ${baseAsset?.title}`)
      setSidePanelTitle(`Fill Orders`)
    } else {
      setButtonLabel(`Make Orders for ${baseAsset?.title}`)
      setSidePanelTitle(`Make Orders`)
    }
  }, [selectedOrders, baseAsset])

  // update quote asset
  useEffect(() => {
    let isCancelled = false;
    const updateQuoteBalance = async () => {
      if (user === '') return;
      const quoteBalance = await getTokenBalance(quoteAsset.addr, user);
      if (!isCancelled) {
        setQuoteAssetBalance(new BigNumber(quoteBalance));
      }
    };
    updateQuoteBalance();
    const idQuoteAssetBalance = setInterval(updateQuoteBalance, 20000);
    return () => {
      isCancelled = true;
      clearInterval(idQuoteAssetBalance);
    };
  }, [user]);

  return (
    <>
      <SidePanel title={sidePanelTitle} opened={buySellActive} onClose={() => setBuySellActive(false)}>
        <br />
        <br />
        <BuyAndSell
          user={user}
          baseAsset={baseAsset!}
          quoteAsset={quoteAsset}
          baseAssetBalance={baseAssetBalance}
          quoteAssetBalance={quoteAssetBalance}
          tradeType={tradeType}
          setTradeType={setTradeType}

          selectedOrders={selectedOrders}
          setSelectedOrders={setSelectedOrders}
        />
      </SidePanel>
      <OptionBoard
        quoteAsset={quoteAsset}
        baseAsset={baseAsset!}
        setBaseAsset={setBaseAsset}
        setTradeType={setTradeType}
        setSelectedOrders={setSelectedOrders}
      />
      <br />
      <TabBoard
        asks={asks}
        bids={bids}
        user={user}
        option={baseAsset!}
        quoteAsset={quoteAsset}
        tradeType={tradeType}
        selectedOrders={selectedOrders}
        setTradeType={setTradeType}
        setSelectedOrders={setSelectedOrders}
      />
      <br />
      <Button mode="strong" wide onClick={() => { setBuySellActive(true) }}>{buttonLabel}</Button>
    </>
  );
}

// const LeftPart = styled.div`
//   width: 18%;
//   padding-right: 1.5%;
// `;

// const RightPart = styled.div`
//   width: 80%;
// `;

// const WholeScreen = styled.div`
//   textAlign: center;
//   padding-left: 1%;
//   padding-right: 10%;
//   position:fixed;
//   overflow-y:scroll;
//   overflow-x:hidden;
//   left: 0;
//   bottom: 0;
//   top: 6%;
//   width: 100%;
//   overflow: auto
// `;

// const FlexWrapper = styled.div`
//   display: flex;
//   height:87%
// `;

export default OptionTrading;
