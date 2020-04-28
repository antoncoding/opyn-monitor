import React, { useState } from 'react';
import BigNumber from 'bignumber.js';
import {
  Box, TextInput, Button, IconCirclePlus, IconCircleMinus,
} from '@aragon/ui';
import { addETHCollateral, addERC20Collateral, removeCollateral } from '../../utils/web3';

import { BalanceBlock, MaxButton } from '../common/index';

import { formatDigits, toTokenUnitsBN, toBaseUnitBN } from '../../utils/number';
import { calculateRatio } from '../../utils/calculation';
import { ETH_ADDRESS } from '../../constants/contracts';
import * as types from '../../types';

type CollateralManagementProps = {
  isOwner: boolean,
  vault: types.vault,
  collateral: types.token,
  collateralAssetBalance: BigNumber,
  token: string,
  owner: string,
  strikeValue: BigNumber,
  strikePrice: number,
  minRatio: number,
  setNewRatio: Function,

}

function CollateralManagement({
  isOwner,
  vault,
  collateral,
  collateralAssetBalance, // Bignumber, / token unit
  token,
  owner,
  strikeValue,
  strikePrice,
  minRatio,
  setNewRatio,
}: CollateralManagementProps) {
  const [addCollateralAmt, setAddCollateralAmt] = useState(0); // in token unit
  const [removeCollateralAmt, setRemoveCollateralAmt] = useState(0); // in token unit

  const collateralIsETH = collateral.addr === ETH_ADDRESS;

  /**
   * @param {number} newCollateral in wei
   */
  // eslint-disable-next-line consistent-return
  const updateNewRatio = (newCollateral) => {
    if (!newCollateral || newCollateral <= 0) return 0;
    const str = newCollateral.toString();
    const newRatio = calculateRatio(str, vault.oTokensIssued, strikePrice, strikeValue);
    setNewRatio(formatDigits(newRatio, 5));
  };

  return (
    <Box heading="Collateral">
      <div style={{ display: 'flex' }}>
        {/* balance */}
        <div style={{ width: '30%' }}>
          {BalanceBlock({
            asset: `Your ${collateral.symbol} Balance`,
            balance: formatDigits(collateralAssetBalance.toString(), 6),
          })}
        </div>
        {/* Add collateral */}
        <div style={{ width: '32%', paddingTop: '2%' }}>
          <div style={{ display: 'flex' }}>
            <div style={{ width: '60%' }}>
              <>
                <TextInput
                  type="number"
                  wide
                  value={addCollateralAmt}
                  onChange={(event) => {
                    const amt = event.target.value;
                    if (amt === '') {
                      setAddCollateralAmt(0);
                      return;
                    }
                    setAddCollateralAmt(amt);
                    const amtRaw = toBaseUnitBN(amt, collateral.decimals);
                    const newCollateralInWei = new BigNumber(vault.collateral).plus(amtRaw).toNumber();
                    updateNewRatio(newCollateralInWei);
                  }}
                />
                <MaxButton
                  onClick={() => {
                    setAddCollateralAmt(collateralAssetBalance.toNumber());
                    const collateralBalanceRaw = toBaseUnitBN(collateralAssetBalance, collateral.decimals);
                    const newCollateral = new BigNumber(vault.collateral).plus(collateralBalanceRaw).toNumber();
                    updateNewRatio(newCollateral);
                  }}
                />
              </>
            </div>
            <div style={{ width: '40%' }}>
              <Button
                wide
                icon={<IconCirclePlus />}
                label="Add"
                onClick={() => {
                  if (collateralIsETH) {
                    addETHCollateral(token, owner, addCollateralAmt);
                  } else {
                    addERC20Collateral(
                      collateral.addr,
                      token,
                      owner,
                      toBaseUnitBN(addCollateralAmt, collateral.decimals),
                    );
                  }
                }}
              />
            </div>
          </div>
        </div>
        <div style={{ width: '6%' }} />
        {/* Remove collateral */}
        <div style={{ width: '32%', paddingTop: '2%' }}>
          <div style={{ display: 'flex' }}>
            <div style={{ width: '60%' }}>
              <>
                <TextInput
                  type="number"
                  wide
                  value={removeCollateralAmt}
                  onChange={(event) => {
                    const amt = event.target.value;
                    if (amt === '') {
                      setRemoveCollateralAmt(0);
                      return;
                    }
                    setRemoveCollateralAmt(amt);
                    const amtRaw = toBaseUnitBN(amt, collateral.decimals);
                    const newCollateralWei = new BigNumber(vault.collateral).minus(amtRaw).toNumber();
                    updateNewRatio(newCollateralWei);
                  }}
                />
                <MaxButton
                  onClick={() => {
                    if (strikeValue.toNumber() <= 0) return;
                    const strikePriceBN = new BigNumber(strikePrice);
                    const tokenIssuedBN = new BigNumber(vault.oTokensIssued);
                    const minRatioBN = new BigNumber(minRatio);
                    const minCollateral = strikePriceBN.times(tokenIssuedBN).times(minRatioBN).times(strikeValue);
                    // const minValueInStrike = strikePrice * vault.oTokensIssued * minRatio;
                    // const minCollateral = minValueInStrike * strikeValue;
                    const maxToRemove = new BigNumber(vault.collateral).minus(minCollateral).toString();
                    const maxToRemoveInTokenUnit = toTokenUnitsBN(maxToRemove, collateral.decimals).toNumber();
                    setRemoveCollateralAmt(maxToRemoveInTokenUnit);
                    setNewRatio(minRatio);
                  }}
                />
              </>
            </div>
            <div style={{ width: '40%' }}>
              <Button
                disabled={!isOwner}
                wide
                icon={<IconCircleMinus />}
                label="Remove"
                onClick={() => {
                  removeCollateral(
                    collateral.addr,
                    token,
                    toBaseUnitBN(removeCollateralAmt, collateral.decimals).toString(),
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

export default CollateralManagement;
