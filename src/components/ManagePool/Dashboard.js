import React from 'react';

import { BalanceBlock } from '../common';

const HeaderDashboard = ({ symbol, poolETHBalance, poolTokenBalance }) => {
  return (
    <div style={{ padding: '2%', display: 'flex',  alignItems: 'center' }}>
      <div style={{ width: '30%' }}>
        <BalanceBlock asset='Total ETH Liquidity' balance={poolETHBalance} />
      </div>
      <div style={{ width: '50%' }}>
        <BalanceBlock asset={`${symbol} Liquidity`} balance={poolTokenBalance} />
      </div>
      <div style={{ width: '20%' }}>
        <>
        </>
      </div>
    </div>
  );
};

export default HeaderDashboard;
