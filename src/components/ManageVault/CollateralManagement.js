import React, { useState, useMemo } from 'react';

import { getDecimals, getERC20Symbol } from '../../utils/infura'
import { addETHCollateral, addERC20Collateral, removeCollateral,  } from '../../utils/web3';

import { BalanceBlock, MaxButton } from '../common';
import { Box, TextInput, Button, IconCirclePlus, IconCircleMinus } from '@aragon/ui';

import { formatDigits, toWei, fromWei, toTokenUnits, toBaseUnitString } from '../../utils/number'
import { calculateRatio } from '../../utils/calculation'
import { ETH_ADDRESS } from '../../constants/options';
import BigNumber from 'bignumber.js';

function CollateralManagement({
  isOwner,
  vault,
  collateralAsset,
  collateralAssetBalance,
  token,
  owner,
  strikeValue,
  strikePrice,
  minRatio,
  setNewRatio
}) {
  const [addCollateralAmt, setAddCollateralAmt] = useState(0); // in token unit
  const [removeCollateralAmt, setRemoveCollateralAmt] = useState(0); // in token unit

  const [collateralDecimals, setCollateralDecimals] = useState(0)
  const [collateralSymbol, setCollateralSymbol] = useState(0)

  const collateralIsETH = collateralAsset === ETH_ADDRESS

  useMemo(async()=>{
    if(collateralIsETH) return
    const decimals = await getDecimals(collateralAsset)
    const symbol = await getERC20Symbol(collateralAsset)
    setCollateralDecimals(decimals)
    setCollateralSymbol(symbol)
  }, [collateralAsset, collateralIsETH])

  /**
   * @param {number} newCollateral in wei
   */
  const updateNewRatio = (newCollateral) => {
    if(!newCollateral || newCollateral <= 0) return 0
    const str = newCollateral.toString()
    const newRatio = calculateRatio(str, vault.oTokensIssued, strikePrice, strikeValue)
    setNewRatio(formatDigits(newRatio,5))
  }

  return (
    <Box heading={'Collateral'}>
      <div style={{ display: 'flex' }}>
        {/* balance */}
        <div style={{ width: '30%' }}>
          {BalanceBlock({ 
            asset: collateralIsETH ? 'Your ETH Balance' : `Your ${collateralSymbol} Balance`, 
            balance: formatDigits(collateralAssetBalance,6) })}
        </div>
        {/* Add collateral */}
        <div style={{ width: '32%', paddingTop: '2%' }}>
          <div style={{ display: 'flex' }}>
            <div style={{ width: '60%' }}>
              <>
                <TextInput
                  type='number'
                  wide={true}
                  value={addCollateralAmt}
                  onChange={(event) => {
                    const amt = event.target.value
                    if (amt === '') {
                      setAddCollateralAmt(0)
                      return
                    } 
                    setAddCollateralAmt(amt);
                    const amtRaw = collateralIsETH ? toWei(amt) : toBaseUnitString(amt, collateralDecimals)
                    const newCollateralInWei = new BigNumber(vault.collateral).plus( new BigNumber(amtRaw)).toNumber()
                    updateNewRatio(newCollateralInWei)
                  }}
                />
                <MaxButton
                  onClick={() => {
                    setAddCollateralAmt(collateralAssetBalance);
                    const collateralBalanceRaw = collateralIsETH ? toWei(collateralAssetBalance) : toBaseUnitString(collateralAssetBalance, collateralDecimals)
                    const newCollateral = new BigNumber(vault.collateral).plus(new BigNumber(collateralBalanceRaw)).toNumber()
                    updateNewRatio(newCollateral)
                  }}
                />
              </>
            </div>
            <div style={{ width: '40%' }}>
              <Button
                wide={true}
                icon={<IconCirclePlus />}
                label='Add'
                onClick={() => {
                  collateralIsETH 
                    ? addETHCollateral(token, owner, addCollateralAmt)
                    : addERC20Collateral(collateralAsset, token, owner, toBaseUnitString(addCollateralAmt, collateralDecimals))
                }}
              />
            </div>
          </div>
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
                  value={removeCollateralAmt}
                  onChange={(event) => {
                    const amt = event.target.value
                    if(amt === '') {
                      setRemoveCollateralAmt(0)
                      return
                    }
                    setRemoveCollateralAmt(amt);
                    const amtRaw = collateralIsETH ? toWei(amt) : toBaseUnitString(amt, collateralDecimals)
                    const newCollateralWei = new BigNumber(vault.collateral).minus(new BigNumber(amtRaw)).toNumber()
                    updateNewRatio(newCollateralWei)
                  }}
                />
                <MaxButton
                  onClick={() => {
                    if (strikeValue <= 0) return;
                    const minValueInStrike = strikePrice * vault.oTokensIssued * minRatio;
                    const minCollateral = minValueInStrike * strikeValue;
                    const maxToRemove = parseInt(vault.collateral - minCollateral).toString();
                    const maxToRemoveInTokenUnit = collateralIsETH ? fromWei(maxToRemove) : toTokenUnits(maxToRemove, collateralDecimals)
                    setRemoveCollateralAmt(maxToRemoveInTokenUnit);
                    setNewRatio(minRatio)
                  }}
                />
              </>
            </div>
            <div style={{ width: '40%' }}>
              <Button
                disabled={!isOwner}
                wide={true}
                icon={<IconCircleMinus />}
                label='Remove'
                onClick={() => {
                  collateralIsETH 
                    ? removeCollateral(collateralAsset, token, removeCollateralAmt)
                    : removeCollateral(collateralAsset, token, toBaseUnitString(removeCollateralAmt, collateralDecimals));
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </Box>
  );
}


export default CollateralManagement