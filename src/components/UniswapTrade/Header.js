import React from 'react';
import BigNumber from 'bignumber.js';
import PropTypes from 'prop-types';

import { BalanceBlock, AddressBlock } from '../common/index.ts';

/**
 *
 * @param {{ poolTokenBalance: BigNumber, poolETHBalance: BigNumber }}
 */
const TradePageHeader = ({
  symbol, poolETHBalance, poolTokenBalance, uniswapExchange,
}) => (
  <div style={{ padding: '2%', display: 'flex', alignItems: 'center' }}>
    <div style={{ width: '30%' }}>
      <BalanceBlock asset="Total ETH Liquidity" balance={poolETHBalance} />
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

TradePageHeader.propTypes = {
  symbol: PropTypes.string.isRequired,
  poolETHBalance: PropTypes.instanceOf(BigNumber).isRequired,
  poolTokenBalance: PropTypes.instanceOf(BigNumber).isRequired,
  uniswapExchange: PropTypes.string.isRequired,
};

export default TradePageHeader;
