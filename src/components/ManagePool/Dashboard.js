import React from 'react';

import { BalanceBlock, AddressBlock } from '../common';
// import { AddressBlock } from '@aragon/ui'

const HeaderDashboard = ({ symbol, poolETHBalance, poolTokenBalance, uniswapExchange }) => {
  return (
    <div style={{ padding: '2%', display: 'flex',  alignItems: 'center' }}>
      <div style={{ width: '30%' }}>
        <BalanceBlock asset='Total ETH Liquidity' balance={poolETHBalance} />
      </div>
      <div style={{ width: '30%' }}>
        <BalanceBlock asset={`${symbol} Liquidity`} balance={poolTokenBalance} />
      </div>
      <div style={{ width: '40%' }}>
        <>
          <AddressBlock label="Uniswap Contract" address={uniswapExchange} />
        </>
      </div>
    </div>
  );
};

export default HeaderDashboard;
