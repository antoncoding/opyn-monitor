import React from 'react';

import { BalanceBlock, RatioTag, HelperText } from '../common';
import { formatDigits, fromWei } from '../../utils/number';

const HeaderDashboard = ({ ratio, minRatio, symbol, vault, decimals, newRatio }) => {
  const tokenInUnit = vault.oTokensIssued ? vault.oTokensIssued / 10 ** decimals : 0;
  let collateralInETH = '0'
  if(vault.collateral)
    collateralInETH = fromWei(vault.collateral)
  
  return (
    <div style={{ padding: '2%', display: 'flex', alignItems: 'center' }}>
      <div style={{ width: '30%' }}>
        <BalanceBlock asset='Total Collateral' balance={formatDigits(collateralInETH, 6)} />
      </div>
      <div style={{ width: '50%' }}>
        <BalanceBlock asset={`${symbol} Issued`} balance={tokenInUnit} />
      </div>
      <div style={{ width: '20%' }}>
        <>
          <div style={{ fontSize: 14, padding: 3 }}>
            Current Ratio{' '}
            {ratio > 0 ? <RatioTag isSafe={ratio >= minRatio} ratio={ratio} /> : <></>}
          </div>
          <div style={{ fontSize: 24, padding: 3 }}>
            <span style={{ fontSize: 24 }}>{ratio.toString().split('.')[0]}</span>.
            <span style={{ fontSize: 18 }}>{ratio.toString().split('.')[1]} </span>
            {minRatio > 0 ? <span style={{ fontSize: 16 }}> / {minRatio} </span> : ''}
          </div>
          <> {newRatio === ratio ? '' : <HelperText label='New Ratio' amt={newRatio} />} </>
        </>
      </div>
    </div>
  );
};

export default HeaderDashboard;
