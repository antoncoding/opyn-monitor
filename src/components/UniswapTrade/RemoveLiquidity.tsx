import React, { useState } from 'react';
import {
  Box, TextInput, Button, IconCircleMinus, IconFundraising,
} from '@aragon/ui';
import BigNumber from 'bignumber.js';
import { removeLiquidity } from '../../utils/web3';

import { BalanceBlock, MaxButton, PriceSection } from '../common/index';
import { toBaseUnitBN } from '../../utils/number';

type RemoveLiquidityProps = {
  otokenDecimals: number,
  otokenSymbol: string,
  uniswapExchange: string
  userliquidityTokenBalance: BigNumber
  poolTokenBalance: BigNumber
  poolETHBalance: BigNumber
  liquidityTokenDecimals: number,
  liquidityTokenSupply: BigNumber
}


function RemoveLiquidity({
  otokenSymbol,
  otokenDecimals,
  userliquidityTokenBalance,
  uniswapExchange,
  poolTokenBalance,
  poolETHBalance,
  liquidityTokenDecimals,
  liquidityTokenSupply,
}: RemoveLiquidityProps) {
  const SLIPPAGE_RATE = 2;

  const [amtLiquidityTokenToSell, setAmtLiquidityTokenToSell] = useState(new BigNumber(0));

  const poolPortion = amtLiquidityTokenToSell.div(liquidityTokenSupply);
  const estETHRecieved = poolETHBalance.times(poolPortion);
  const estOTokenReceived = poolTokenBalance.times(poolPortion);

  const minETHReceived = estETHRecieved.times(new BigNumber(100 - SLIPPAGE_RATE)).div(new BigNumber(100));
  const minTokenReceived = estOTokenReceived.times(new BigNumber(100 - SLIPPAGE_RATE)).div(new BigNumber(100));
  const onChangeTokenAmtToSend = (tokenAmt) => {
    if (!tokenAmt) {
      setAmtLiquidityTokenToSell(new BigNumber(0));
      return;
    }
    const tokenAmtBN = new BigNumber(tokenAmt);
    setAmtLiquidityTokenToSell(tokenAmtBN);
  };

  return (
    <Box heading="Remove Liquidity">
      <div style={{ display: 'flex' }}>
        {/* Pool Token in Hold */}
        <div style={{ width: '30%' }}>
          <BalanceBlock asset="Pool Token Balance" balance={userliquidityTokenBalance} />
        </div>
        {/* Remove */}
        <div style={{ width: '70%', paddingTop: '2%' }}>
          <div style={{ display: 'flex' }}>
            <div style={{ width: '35%', marginRight: '5%' }}>
              <TextInput
                adornmentPosition="end"
                adornment={<IconFundraising />}
                type="number"
                wide
                value={amtLiquidityTokenToSell.toNumber()}
                onChange={(event) => {
                  onChangeTokenAmtToSend(event.target.value);
                }}
              />
              <MaxButton
                onClick={() => setAmtLiquidityTokenToSell(userliquidityTokenBalance)}
              />
            </div>
            <div style={{ width: '35%', marginRight: '5%' }}>
              <>
                <PriceSection label="You get" amt={estETHRecieved} symbol="ETH" />
                <PriceSection label="+" amt={estOTokenReceived} symbol={otokenSymbol} />
              </>
            </div>
            <div style={{ width: '30%' }}>
              <Button
                wide
                icon={<IconCircleMinus />}
                label="Remove Liquidity"
                onClick={() => {
                  const amt = toBaseUnitBN(amtLiquidityTokenToSell, liquidityTokenDecimals).toString();
                  const min_eth = toBaseUnitBN(minETHReceived, 18).toString();
                  const min_token = toBaseUnitBN(minTokenReceived, otokenDecimals).toString();

                  removeLiquidity(
                    uniswapExchange,
                    amt,
                    min_eth,
                    min_token,
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

export default RemoveLiquidity;
