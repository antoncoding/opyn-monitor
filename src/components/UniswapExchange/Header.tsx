import React from 'react';
import BigNumber from 'bignumber.js';

import { BalanceBlock, AddressBlock } from '../common/index';
import { option } from '../../types';

type  TradePageHeaderProps = {
  option: option,
  poolETHBalance: BigNumber,
  poolTokenBalance: BigNumber,
  uniswapExchange: string,
};

const TradePageHeader = ({
  option, poolETHBalance, poolTokenBalance, uniswapExchange,
}: TradePageHeaderProps) => (
  <div style={{ padding: '2%', display: 'flex', alignItems: 'center' }}>
    <div style={{ width: '30%' }}>
      <BalanceBlock asset="Total ETH Liquidity" balance={poolETHBalance} />
    </div>
    <div style={{ width: '30%' }}>
      <BalanceBlock asset={`${option.symbol} Liquidity`} balance={poolTokenBalance} />
    </div>
    <div style={{ width: '40%' }}>
      <>
        <AddressBlock label="Uniswap Contract" address={uniswapExchange} />
      </>
    </div>
  </div>
);


export default TradePageHeader;
