import React, { useState, useMemo } from 'react';

import { getDecimals, getERC20Symbol } from '../../utils/infura'
import { addCollateral, removeCollateral } from '../../utils/web3';

import { BalanceBlock, MaxButton } from '../common';
import { Box, TextInput, Button, IconCirclePlus, IconCircleMinus } from '@aragon/ui';

import { formatDigits, calculateRatio, toWei, fromWei, handleDecimals, toTokenUnits } from '../../utils/number'
import { ETH_ADDRESS } from '../../constants/options';

function CollateralManagement({
  isOwner,
  vault,
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

  const collateralIsETH = vault.collateral === ETH_ADDRESS

  useMemo(async()=>{
    const decimals = await getDecimals(token)
    const symbol = await getERC20Symbol(token)
    setCollateralDecimals(decimals)
    setCollateralSymbol(symbol)
  }, [token])

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
                    setAddCollateralAmt(amt);
                    const amtRaw = collateralIsETH ? parseInt(toWei(amt)) : handleDecimals(amt, collateralDecimals)
                    const newCollateralInWei = parseInt(vault.collateral) + amtRaw
                    updateNewRatio(newCollateralInWei)
                  }}
                />
                <MaxButton
                  onClick={() => {
                    setAddCollateralAmt(collateralAssetBalance);
                    const collateralBalanceRaw = collateralIsETH ? parseInt(toWei(collateralAssetBalance)) : handleDecimals(collateralAssetBalance, collateralDecimals)
                    const newCollateral = parseInt(vault.collateral) + collateralBalanceRaw
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
                  addCollateral(vault.collateral, token, owner, addCollateralAmt);
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
                    setRemoveCollateralAmt(amt);
                    const amtRaw = collateralIsETH ? parseInt(toWei(amt)) : handleDecimals(amt, collateralDecimals)
                    const newCollateralWei = parseInt(vault.collateral) - amtRaw
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
                  removeCollateral(vault.collateral, token, removeCollateralAmt);
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