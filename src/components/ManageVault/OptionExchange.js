import React, { useState } from 'react';

import { buyOTokensFromExchange,  sellOTokensFromExchange, } from '../../utils/web3';

import {
  getPremiumToPay,
  getPremiumReceived,
} from '../../utils/infura';

import { BalanceBlock, MaxButton } from '../common';
import { handleDecimals } from '../../utils/number'
import { Box, TextInput, Button, IconCirclePlus, IconCircleMinus } from '@aragon/ui';

function OptionExchange({
  symbol,
  tokenBalance,
  token,
  exchange,
  decimals,
}) {
  const [buyAmt, setBuyAmt] = useState(0);
  const [sellAmt, setSellAmt] = useState(0);
  const [premiumToPay, setPremiumToPay] = useState(0);
  const [premiumReceived, setPremiumReceived] = useState(0);

  const updatePremiumToPay = async (buyAmt) => {
    if (!buyAmt || buyAmt === 0) {
      setPremiumToPay(0)
      return;
    }
    const amount = handleDecimals(buyAmt, decimals);
    const premium = await getPremiumToPay(exchange, token, amount);
    setPremiumToPay(premium);
  };

  const updatePremiumReceived = async (sellAmt) => {
    if (!sellAmt || sellAmt === 0) {
      setPremiumReceived(0)
      return
    };
    const amount = handleDecimals(sellAmt, decimals);
    const premium = await getPremiumReceived(exchange, token, amount);
    setPremiumReceived(premium);
  };

  return (
    <Box heading={'Exchange'}>
        <div style={{ display: 'flex' }}>
          {/* total Issued */}
          <div style={{ width: '30%' }}>
            <BalanceBlock
              asset={`${symbol} Balance`}
              balance={tokenBalance}
            />
          </div>
          {/* Buy Token from Uniswap */}
          <div style={{ width: '32%', paddingTop: '2%' }}>
            <div style={{ display: 'flex' }}>
              <div style={{ width: '60%' }}>
                <>
                  <TextInput
                    type='number'
                    wide={true}
                    value={buyAmt}
                    onChange={(event) => {
                      setBuyAmt(event.target.value);
                      updatePremiumToPay(event.target.value);
                    }}
                  />
                </>
              </div>
              <div style={{ width: '40%' }}>
                <Button
                  wide={true}
                  icon={<IconCirclePlus />}
                  label='Buy'
                  onClick={() => {
                    buyOTokensFromExchange(
                      token,
                      exchange,
                      handleDecimals(buyAmt, decimals),
                      premiumToPay
                    );
                  }}
                />
              </div>
            </div>
            <PriceSection label='Cost:' amt={premiumToPay} symbol='' />
          </div>
          <div style={{ width: '6%' }}></div>
          {/* Remove collateral */}
          <div style={{ width: '32%', paddingTop: '2%' }}>
            <div style={{ display: 'flex' }}>
              <div style={{ width: '60%' }}>
                <>
                  <TextInput
                    type='number'
                    wide={true}
                    value={sellAmt}
                    onChange={(event) => {
                      setSellAmt(event.target.value);
                      updatePremiumReceived(event.target.value);
                    }}
                  />
                  <MaxButton
                    onClick={() => {
                      setSellAmt(tokenBalance);
                      updatePremiumReceived(tokenBalance);
                    }}
                  />
                </>
              </div>
              <div style={{ width: '40%' }}>
                <Button
                  wide={true}
                  icon={<IconCircleMinus />}
                  label='Sell'
                  onClick={() => {
                    sellOTokensFromExchange(
                      token,
                      exchange,
                      handleDecimals(sellAmt, decimals)
                    );
                  }}
                />
              </div>
            </div>
            <PriceSection label='Premium' amt={premiumReceived} />
          </div>
        </div>
      </Box>
  );
}

function PriceSection({ label, amt, symbol = '' }) {
  if (parseFloat(amt) > 0) {
    return (
      <div style={{ padding: 3, opacity: 0.5 }}>
        <span style={{ fontSize: 13 }}> {label} </span>{' '}
        <span style={{ fontSize: 13 }}> {parseFloat(amt).toFixed(5)} </span>{' '}
        <span style={{ fontSize: 13 }}> {symbol} </span>
      </div>
    );
  } else return <div style={{ padding: 3, opacity: 0.5 }}></div>;
}

export default OptionExchange