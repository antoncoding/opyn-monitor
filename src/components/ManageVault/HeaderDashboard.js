import React from 'react';

import PropTypes from 'prop-types';
import { BalanceBlock, RatioTag, HelperText } from '../common';
import { formatDigits, toTokenUnitsBN } from '../../utils/number';
import * as MyPTypes from '../types';

const HeaderDashboard = ({
  ratio,
  minRatio,
  symbol,
  vault,
  decimals,
  newRatio,
  collateralDecimals,
  useCollateral,
}) => {
  const tokenInUnit = vault.oTokensIssued
    ? toTokenUnitsBN(vault.oTokensIssued, decimals).toNumber()
    : '0';
  const collateralBalance = vault.collateral
    ? toTokenUnitsBN(vault.collateral, collateralDecimals).toString()
    : '0';

  return (
    <div style={{ padding: '2%', display: 'flex', alignItems: 'center' }}>
      <div style={{ width: '30%' }}>
        <BalanceBlock asset="Total Collateral" balance={formatDigits(collateralBalance, 6)} />
      </div>
      <div style={{ width: '50%' }}>
        <BalanceBlock asset={`${symbol} Issued`} balance={tokenInUnit.toString()} />
      </div>
      <div style={{ width: '20%' }}>
        <>
          <div style={{ fontSize: 14, padding: 3 }}>
            Current Ratio
            {' '}
            {ratio > 0 ? (
              <RatioTag isSafe={ratio >= minRatio} ratio={ratio} useCollateral={useCollateral} />
            ) : (
              <></>
            )}
          </div>
          <div style={{ fontSize: 24, padding: 3 }}>
            <span style={{ fontSize: 24 }}>{formatDigits(ratio, 5).split('.')[0]}</span>
            .
            <span style={{ fontSize: 18 }}>
              {formatDigits(ratio, 5).split('.')[1]}
              {' '}
            </span>
            {minRatio > 0 ? (
              <span style={{ fontSize: 16 }}>
                {' '}
                /
                {' '}
                {minRatio}
                {' '}
              </span>
            ) : ''}
          </div>
          <>
            {' '}
            {newRatio === ratio ? (
              ''
            ) : (
              <HelperText label="New Ratio" amt={newRatio.toString()} />
            )}
            {' '}
          </>
        </>
      </div>
    </div>
  );
};

HeaderDashboard.propTypes = {
  ratio: PropTypes.number.isRequired,
  minRatio: PropTypes.number.isRequired,
  symbol: PropTypes.string.isRequired,
  vault: MyPTypes.vault.isRequired,
  decimals: PropTypes.number.isRequired,
  newRatio: PropTypes.number.isRequired,
  collateralDecimals: PropTypes.number.isRequired,
  useCollateral: PropTypes.bool.isRequired,
};

export default HeaderDashboard;
