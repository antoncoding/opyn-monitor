import React, { useState } from 'react';

import { addLiquidity } from '../../utils/web3';

import {
  // getTokenBalance,
} from '../../utils/infura';

import { BalanceBlock, MaxButton } from '../common';
import { formatETHAmtToStr, toBaseUnitString } from '../../utils/number';
import { Box, TextInput, Button, IconCirclePlus, IconEthereum } from '@aragon/ui';

function AddLiquidity({ 
  otoken, 
  otokenSymbol, 
  otokenDecimals, 
  userTokenBalance, 
  userETHBalance,
  uniswapExchange, 
  user, 
  poolTokenBalance, 
  poolETHBalance,
  liquidityTokenDecimals,
  liquidityTokenSupply
}) {
  const SLIPPAGE_RATE = 2;


  const [amtETHToAdd, setAmtETHToAdd] = useState(0);
  const [amtTokenToAdd, setAmtTokenToAdd] = useState(0);

  const liquidityMinted = (liquidityTokenSupply * amtETHToAdd) / poolETHBalance;
  const liquidityMintedMin = (liquidityMinted * (100 - SLIPPAGE_RATE)) / 100;
  const ethToTokenRatio = poolETHBalance / poolTokenBalance;
  const tokenToEthRatio = poolTokenBalance / poolETHBalance;

  const onChangeETHAmtToSend = (ethAmt) => {
    const newTokenAmt = (ethAmt * tokenToEthRatio);
    setAmtETHToAdd(ethAmt);
    setAmtTokenToAdd(newTokenAmt);
  };

  const onChangeTokenAmtToSend = (tokenAmt) => {
    const newEthAmt = tokenAmt * ethToTokenRatio;
    setAmtETHToAdd(newEthAmt);
    setAmtTokenToAdd(tokenAmt);
  };

  return (
    <Box heading={'Add Liquidity'}>
      <div style={{ display: 'flex' }}>
        {/* Pool Status */}
        <div style={{ width: '30%' }}>
          <BalanceBlock asset={`ETH Balance`} balance={userETHBalance} />
        </div>
        {/* Add Liquidity too pool */}
        <div style={{ width: '70%', paddingTop: '2%' }}>
          <div style={{ display: 'flex' }}>
            <div style={{ width: '35%', marginRight: '5%' }}>
              <>
                <TextInput
                  adornmentPosition='end'
                  adornment={otokenSymbol}
                  type='number'
                  wide={true}
                  value={amtTokenToAdd}
                  onChange={(event) => {
                    onChangeTokenAmtToSend(event.target.value);
                  }}
                />
                <MaxButton
                  onClick={() => {
                    onChangeTokenAmtToSend(userTokenBalance);
                  }}
                />
              </>
            </div>
            <div style={{ width: '35%', marginRight: '5%' }}>
              <TextInput
                adornmentPosition='end'
                adornment={<IconEthereum />}
                type='number'
                wide={true}
                value={amtETHToAdd}
                onChange={(event) => {
                  onChangeETHAmtToSend(event.target.value);
                }}
              />
              <PriceSection label='Mint' amt={liquidityMinted} symbol='Pool Tokens' />
            </div>
            <div style={{ width: '30%' }}>
              <Button
                wide={true}
                icon={<IconCirclePlus />}
                label='Add Liquidity'
                onClick={() => {
                  const maxToken = toBaseUnitString(amtTokenToAdd, otokenDecimals);
                  const minLiquidity = toBaseUnitString(liquidityMintedMin, liquidityTokenDecimals);
                  addLiquidity(
                    otoken,
                    uniswapExchange,
                    maxToken,
                    minLiquidity,
                    formatETHAmtToStr(amtETHToAdd)
                  );
                }}
              />
            </div>
          </div>
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

export default AddLiquidity;
