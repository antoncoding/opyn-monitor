import React, { useState } from 'react';

import { addETHCollateral, removeETHCollateral } from '../../utils/web3';

import { BalanceBlock, MaxButton } from '../common';
import { Box, TextInput, Button, IconCirclePlus, IconCircleMinus } from '@aragon/ui';

import { formatDigits, calculateRatio, toWei, fromWei } from '../../utils/number'

function CollateralManagement({
  isOwner,
  vault,
  ethBalance,
  token,
  owner,
  strikeValue,
  strikePrice,
  minRatio,
  setNewRatio
}) {
  const [addCollateralAmt, setAddCollateralAmt] = useState(0);
  const [removeCollateralAmt, setRemoveCollateralAmt] = useState(0);

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
          {BalanceBlock({ asset: 'Your ETH Balance', balance: formatDigits(ethBalance,6) })}
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
                    const newCollateralInWei = parseInt(vault.collateral) + parseInt(toWei(amt))
                    updateNewRatio(newCollateralInWei)
                  }}
                />
                <MaxButton
                  onClick={() => {
                    setAddCollateralAmt(ethBalance);
                    const newCollateral = parseInt(vault.collateral) + parseInt(toWei(ethBalance))
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
                  addETHCollateral(token, owner, addCollateralAmt);
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
                    const newCollateralWei = parseInt(vault.collateral) - parseInt(toWei(amt))
                    updateNewRatio(newCollateralWei)
                  }}
                />
                <MaxButton
                  onClick={() => {
                    if (strikeValue <= 0) return;
                    const minValueInStrike = strikePrice * vault.oTokensIssued * minRatio;
                    const minCollateral = minValueInStrike * strikeValue;
                    const maxToRemoveWei = parseInt(vault.collateral - minCollateral).toString();
                    setRemoveCollateralAmt(fromWei(maxToRemoveWei));
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
                  removeETHCollateral(token, removeCollateralAmt);
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