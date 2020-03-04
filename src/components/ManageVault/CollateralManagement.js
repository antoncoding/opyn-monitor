import React, { useState } from 'react';

import { addETHCollateral, removeETHCollateral } from '../../utils/web3';

import { BalanceBlock, MaxButton } from '../common';

import { Box, TextInput, Button, IconCirclePlus, IconCircleMinus } from '@aragon/ui';

function CollateralManagement({
  vault,
  ethBalance,
  token,
  owner,
  lastETHValueInStrike,
  strikePrice,
  minRatio,
}) {
  const [addCollateralAmt, setAddCollateralAmt] = useState(0);
  const [removeCollateralAmt, setRemoveCollateralAmt] = useState(0);

  return (
    <Box heading={'Collateral'}>
      <div style={{ display: 'flex' }}>
        {/* balance */}
        <div style={{ width: '30%' }}>
          {BalanceBlock({ asset: 'ETH', balance: vault.collateral })}
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
                    setAddCollateralAmt(event.target.value);
                  }}
                />
                <MaxButton
                  onClick={() => {
                    setAddCollateralAmt(ethBalance);
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
                    setRemoveCollateralAmt(event.target.value);
                  }}
                />
                <MaxButton
                  onClick={() => {
                    if (lastETHValueInStrike <= 0) return;
                    const minValueInStrike = strikePrice * vault.oTokensIssued * minRatio;
                    const minCollateral = minValueInStrike / lastETHValueInStrike;
                    const maxToRemove = vault.collateral - minCollateral;
                    setRemoveCollateralAmt(maxToRemove);
                  }}
                />
              </>
            </div>
            <div style={{ width: '40%' }}>
              <Button
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