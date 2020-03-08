import React, { useState } from 'react';

import { removeLiquidity } from '../../utils/web3';

import {
  // getTokenBalance,
} from '../../utils/infura';

import { BalanceBlock, MaxButton } from '../common';
import { handleDecimals, formatETHAmtToStr } from '../../utils/number';
import { Box, TextInput, Button, IconCircleMinus, IconFundraising } from '@aragon/ui';

function RemoveLiquidity({ 
  otoken, 
  otokenSymbol, 
  otokenDecimals, 
  userTokenBalance, 
  userliquidityTokenBalance,
  uniswapExchange, 
  poolTokenBalance, 
  poolETHBalance,
  liquidityTokenDecimals,
  liquidityTokenSupply
}) {
  const SLIPPAGE_RATE = 3;

  const [amtLiquidityTokenToSell, setAmtLiquidityTokenToSell] = useState(0);

  const poolPortion = (amtLiquidityTokenToSell) / liquidityTokenSupply
  const estETHRecieved = poolETHBalance * poolPortion
  const estOTokenReceived = poolTokenBalance * poolPortion

  const minETHReceived = estETHRecieved * (100 - SLIPPAGE_RATE) / 100
  const minTokenReceived = estOTokenReceived * (100 - SLIPPAGE_RATE) / 100
  
  const onChangeTokenAmtToSend = (tokenAmt) => {
    setAmtLiquidityTokenToSell(tokenAmt)
  };

  return (
    <Box heading={'Remove Liquidity'}>
      <div style={{ display: 'flex' }}>
        {/* Pool Token in Hold */}
        <div style={{ width: '30%' }}>
          <BalanceBlock asset={`Pool Token Balance`} balance={userliquidityTokenBalance} />
        </div>
        {/* Remove */}
        <div style={{ width: '70%', paddingTop: '2%' }}>
          <div style={{ display: 'flex' }}>
            <div style={{ width: '35%', marginRight: '5%' }}>
              <TextInput
                adornmentPosition='end'
                adornment={<IconFundraising />}
                type='number'
                wide={true}
                value={amtLiquidityTokenToSell}
                onChange={(event) => {
                  onChangeTokenAmtToSend(event.target.value);
                }}
              />
              <MaxButton
                onClick={()=>setAmtLiquidityTokenToSell(userliquidityTokenBalance)}
              />
            </div>
            <div style={{ width: '35%', marginRight: '5%' }}>
              <>
              <PriceSection label='You get' amt={estETHRecieved} symbol='ETH' />
              <PriceSection label='+' amt={estOTokenReceived} symbol={otokenSymbol} />
              </>
            </div>
            <div style={{ width: '30%' }}>
              <Button
                wide={true}
                icon={<IconCircleMinus />}
                label='Remove Liquidity'
                onClick={() => {
                  const amt = handleDecimals(amtLiquidityTokenToSell, liquidityTokenDecimals).toString()
                  const min_eth = formatETHAmtToStr(minETHReceived)
                  const min_token = handleDecimals(minTokenReceived, otokenDecimals)
                  
                  removeLiquidity(
                    uniswapExchange,
                    amt,
                    min_eth,
                    min_token
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

export default RemoveLiquidity;
