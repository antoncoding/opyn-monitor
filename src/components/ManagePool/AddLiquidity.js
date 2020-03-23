import React, { useState } from 'react';
import BigNumber from 'bignumber.js'
import { addLiquidity } from '../../utils/web3';

import { BalanceBlock, MaxButton, PriceSection } from '../common';
import { toBaseUnitBN } from '../../utils/number';
import { Box, TextInput, Button, IconCirclePlus, IconEthereum } from '@aragon/ui';

/**
 * 
 * @param {{ 
 * poolTokenBalance: BigNumber, 
 * poolETHBalance:BigNumber, 
 * liquidityTokenSupply: BigNumber, 
 * userTokenBalance: BigNumber, 
 * userETHBalance:BigNumber 
 * uniswapExchange: string
 * }} param0 
 */
function AddLiquidity({ 
  otoken, 
  otokenSymbol, 
  otokenDecimals, 
  userTokenBalance, 
  userETHBalance,
  uniswapExchange,
  poolTokenBalance, 
  poolETHBalance,
  liquidityTokenDecimals,
  liquidityTokenSupply
}) {
  const SLIPPAGE_RATE = 2;


  const [amtETHToAdd, setAmtETHToAdd] = useState(new BigNumber(0));
  const [amtTokenToAdd, setAmtTokenToAdd] = useState(new BigNumber(0));

  const liquidityMinted = (liquidityTokenSupply.times( amtETHToAdd)).div(poolETHBalance);
  const liquidityMintedMin = (liquidityMinted.times(new BigNumber(100 - SLIPPAGE_RATE))).div(new BigNumber(100))
  const ethToTokenRatio = poolETHBalance.div(poolTokenBalance);
  const tokenToEthRatio = poolTokenBalance.div(poolETHBalance);

  const onChangeETHAmtToSend = (ethAmt) => {
    if (!ethAmt) {
      setAmtTokenToAdd(new BigNumber(0));
      setAmtETHToAdd(new BigNumber(0));
      return
    }

    const newTokenAmt = (new BigNumber(ethAmt).times(tokenToEthRatio));
    setAmtETHToAdd(new BigNumber(ethAmt));
    setAmtTokenToAdd(newTokenAmt);
  };

  const onChangeTokenAmtToSend = (tokenAmt) => {
    if (!tokenAmt) {
      setAmtTokenToAdd(new BigNumber(0));
      setAmtETHToAdd(new BigNumber(0));
      return
    }

    const newEthAmt = new BigNumber(tokenAmt).times(ethToTokenRatio);
    setAmtETHToAdd(newEthAmt);
    setAmtTokenToAdd(new BigNumber(tokenAmt));
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
                  value={amtTokenToAdd.toNumber()}
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
                value={amtETHToAdd.toNumber()}
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
                  const maxToken = toBaseUnitBN(amtTokenToAdd, otokenDecimals).toString();
                  const minLiquidity = toBaseUnitBN(liquidityMintedMin, liquidityTokenDecimals).toString();
                  const ethWei = toBaseUnitBN(amtETHToAdd, 18).toString()
                  addLiquidity(
                    otoken,
                    uniswapExchange,
                    maxToken,
                    minLiquidity,
                    ethWei
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



export default AddLiquidity;
