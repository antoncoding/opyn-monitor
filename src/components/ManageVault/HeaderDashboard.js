import React from 'react';

import { BalanceBlock, RatioTag } from '../common';


const HeaderDashboard = ({ owner, user, ratio, minRatio, symbol, ethBalance, tokenBalance }) => {
  return (
    <div style={{ padding: '2%', display: 'flex', alignItems: 'center' }}>
      <div style={{ width: '30%' }}>
        <BalanceBlock asset='Owner ETH Balance' balance={ethBalance} />
      </div>
      <div style={{ width: '50%' }}>
        <BalanceBlock asset={`${symbol} Balance`} balance={tokenBalance} />
      </div>
      <div style={{ width: '20%' }}>
        <>
          <div style={{ fontSize: 14, padding: 3 }}>
            Current Ratio {ratio > 0 ? <RatioTag isSafe={ratio >= minRatio} ratio={ratio} /> : <></>}
          </div>
          <div style={{ fontSize: 24, padding: 3 }}>
            <span style={{ fontSize: 24 }}>{ratio.toString().split('.')[0]}</span>.
            <span style={{ fontSize: 18 }}>{ratio.toString().split('.')[1]} </span>
            {minRatio > 0 ? <span style={{ fontSize: 16 }}> / {minRatio} </span> : ''}
          </div>
        </>
      </div>
    </div>
  );
};

export default HeaderDashboard;
