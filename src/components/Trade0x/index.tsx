import React, { useEffect, useState, useContext } from 'react';
import BigNumber from 'bignumber.js';
import styled from 'styled-components'

import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'

import { Header, DropDown, Layout } from '@aragon/ui';
import OptionBoard from './OptionBoard';
import TabBoard from './TabBoard';
import BuyAndSell from './BuyAndSell';
import { useOptions } from '../../hooks'
import { getTokenBalance } from '../../utils/infura';
import { getOrderBook, isValid } from '../../utils/0x';
import { defaultOption } from '../../constants/options';
import * as types from '../../types'
import * as tokens from '../../constants/tokens';
import { userContext } from '../../contexts/userContext'

import tracker from '../../utils/tracker';
import { groupByDate, entriesForExpiry } from './utils'

const quoteAsset = tokens.USDC;

function OptionTrading() {

  const { user } = useContext(userContext)
  
  const [selectedExpiryIdx, setExpiryIdx] = useState(0);
  const [optionsByDate, setOptionsByDate] = useState<entriesForExpiry[]>([])

  const [baseAsset, setBaseAsset] = useState<types.ETHOption>((defaultOption as types.option) as types.ETHOption);
  const { ethCalls: calls, ethPuts: puts } = useOptions()
  useEffect(()=>{
    const optionsByDate = groupByDate(puts, calls);
    setOptionsByDate(optionsByDate)
    const defaultBaseAsset = puts.concat(calls).find((o) => o.expiry > Date.now() / 1000)
    if (defaultBaseAsset) {
      setBaseAsset(defaultBaseAsset)
    }
  },[puts, calls])

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
    if (baseAsset.addr === '') return
    let isCancelled = false;

    // update orderbook
    const updateOrderBook = async () => {
      if(!baseAsset.addr) return 
      const res = await getOrderBook(baseAsset!.addr, quoteAsset.addr);
      if (!isCancelled) {
        setAsks(res.asks.records.filter((record) => isValid(record)));
        setBids(res.bids.records.filter((record) => isValid(record)));
      }
    };

    // update baseAsset Balance
    const updateBaseBalance = async () => {
      if(!baseAsset.addr) return 
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

  // when selection change: update selected order to the first option of the expiry
  const onExpiryChange = (idx) => {
    setExpiryIdx(idx);
    for (const { call, put } of optionsByDate[idx].pairs) {
      if (call !== undefined) {
        setBaseAsset(call);
        setSelectedOrders([])
        return;
      } if (put !== undefined) {
        setBaseAsset(put);
        setSelectedOrders([])
        return;
      }
    }
  };

  return (
    <MyContainer>
      <Layout>
        <div style={{ display: 'flex' }}>
            {' '}
            <Header primary="Option Trading" />
            <img alt="icon" style={{ paddingTop: 24, paddingLeft:5, height: 64 }} src={'https://cdn.worldvectorlogo.com/logos/0x-virtual-money-.svg'} />
            <div style={{ paddingTop: '28px', paddingLeft: '15px' }}>
              <DropDown
                items={optionsByDate.map((item) => item.expiryText)}
                selected={selectedExpiryIdx}
                onChange={onExpiryChange}
              />
            </div>
          </div>


      </Layout>

      <Row>
        <Col xl={2} lg={3} md={4} sm={12} xs={12}>
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
          {/* </SidePanel> */}
        </Col>
        <Col xl={10} lg={9} md={8} sm={12} xs={12}>
          <OptionBoard
            selectedExpiryIdx={selectedExpiryIdx}
            optionsByDate={optionsByDate}
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

        </Col>
      </Row>
    </MyContainer>
  );
}

const MyContainer = styled.div`
  padding-left: 4%;
  padding-right: 4%
`

export default OptionTrading;
