/* eslint-disable no-underscore-dangle */
import React, { useEffect, useState } from 'react';
import BigNumber from 'bignumber.js';
import {
  DataView, Header, Button, Box,
} from '@aragon/ui';
import { toTokenUnitsBN, formatDigits } from '../../utils/number';
import { getOrderBook } from '../../utils/0x';
import {
  approve,
  // signOrder,
  fillOrder,
} from '../../utils/web3';
import { ZeroX_ERC20Proxy } from '../../constants/contracts';

function OptionTrading({ user, oTokens }) {
  const [baseAsset, setBaseAsset] = useState('0x6b175474e89094c44da98b954eedeac495271d0f'); // DAI
  const [quoteAsset, setQuoteAsset] = useState('0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'); //  WETH
  // const [selectedToken, setSelectedToken] = useState('0x6b175474e89094c44da98b954eedeac495271d0f');
  const [asks, setAsks] = useState([]);
  const [bids, setBids] = useState([]);

  useEffect(() => {
    let isCancelled = false;
    const updateOrderBook = async () => {
      const res = await getOrderBook(baseAsset, quoteAsset);
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
  }, [baseAsset, quoteAsset]);

  // const onClickFillOrder = async (order) => {
  //   console.log('fill order');
  // };

  return (
    <>
      <Header
        primary="DAI / ETH"
        secondary={(
          <>
            <Button
              label="Enable DAI"
              onClick={() => { approve(baseAsset, ZeroX_ERC20Proxy); }}
            />
            <Button
              label="Enable WETH"
              onClick={() => { approve(quoteAsset, ZeroX_ERC20Proxy); }}
            />
          </>
)}
      />
      <div style={{ display: 'flex' }}>

        {/* <Box> */}
        <div style={{ width: '40%' }}>
          {/* 賣 DAI: makerAsset:dai, takerAsset: eth */}
          <Header primary="Ask" />
          <DataView
            title="ask"
            fields={['Amount (ETH)', 'Price']}
            entries={asks.filter((entry) => isValid(entry))}
            entriesPerPage={5}
            renderEntry={({ order, metaData }) => {
              const rate = new BigNumber(order.takerAssetAmount).div(new BigNumber(order.makerAssetAmount)).toNumber();
              const remainingFillabelTakerAsset = new BigNumber(metaData.remainingFillableTakerAssetAmount);
              const remainingMakerAsset = remainingFillabelTakerAsset.div(rate);
              return [
                toTokenUnitsBN(remainingMakerAsset, 18).toNumber(),
                formatDigits(
                  rate,
                  7,
                ),
              ];
            }}
          />
          <Box heading="Fill Order">
            <Button
              label="Fill best"
              onClick={() => {
                const selected = asks[0];
                const order = {
                  makerAddress: selected.order.makerAddress,
                  takerAddress: selected.order.takerAddress,
                  feeRecipientAddress: selected.order.feeRecipientAddress,
                  senderAddress: selected.order.senderAddress,
                  makerAssetAmount: selected.order.makerAssetAmount,
                  takerAssetAmount: selected.order.takerAssetAmount,
                  makerFee: selected.order.makerFee,
                  takerFee: selected.order.takerFee,
                  expirationTimeSeconds: selected.order.expirationTimeSeconds,
                  salt: selected.order.salt,
                  makerAssetData: selected.order.makerAssetData,
                  takerAssetData: selected.order.takerAssetData,
                  makerFeeAssetData: selected.order.makerFeeAssetData,
                  takerFeeAssetData: selected.order.takerFeeAssetData,
                };
                console.log(order);
                console.log(selected.order);
                fillOrder(order, '1000', selected.order.signature);
              }}
            />
          </Box>
        </div>
        <div style={{ width: '40%' }}>
          <Header primary="Bid" />
          {/* 買DAI, makerAsset: ETH, takerAsset: DAI */}
          <DataView
            fields={['Amount (DAI)', 'Price']}
            entries={bids.filter((entry) => isValid(entry))}
            entriesPerPage={5}
            renderEntry={({ order, metaData }) => [
              toTokenUnitsBN(metaData.remainingFillableTakerAssetAmount, 18).toNumber(),
              formatDigits(
                new BigNumber(order.makerAssetAmount).div(new BigNumber(order.takerAssetAmount)).toNumber(),
                7,
              ),
            ]}
          />
          <Box heading="Fill Order" />
        </div>
        {/* </Box> */}
      </div>
    </>
  );
}

const isValid = (entry) => parseInt(entry.order.expirationTimeSeconds, 10) > Date.now() / 1000
  && new BigNumber(entry.metaData.remainingFillableTakerAssetAmount) > 100000;

export default OptionTrading;
