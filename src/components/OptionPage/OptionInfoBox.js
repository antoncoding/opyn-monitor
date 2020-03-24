import React, { useState, useEffect } from 'react';
import { Box, Split, IdentityBadge } from '@aragon/ui';

import BigNumber from 'bignumber.js'

import { getERC20Info, getBalance, getTokenBalance } from '../../utils/infura';
import { toTokenUnitsBN } from '../../utils/number'

function OptionOverview({ oToken, tokenName, option, collateralIsETH, collateralDecimals }) {
  const [totalCollateral, setTotalCollateral] = useState(new BigNumber(0));
  const [totalSupply, setTotalSupply] = useState('0');

  useEffect(() => {
    let isCancelled = false;
    async function init() {
      let _totalCollateral;
      if (collateralIsETH) {
        _totalCollateral = new BigNumber(await getBalance(oToken))
      } else {
        const rawCollateralBalance = await getTokenBalance(option.collateral, oToken)
        _totalCollateral = toTokenUnitsBN(rawCollateralBalance, collateralDecimals)
      }
      const { totalSupply } = await getERC20Info(oToken);
      if (!isCancelled) {
        setTotalCollateral(_totalCollateral);
        setTotalSupply(totalSupply);
      }
    }
    init();

    return () => {
      isCancelled = true;
    };
  }, [collateralDecimals, collateralIsETH, oToken, option.collateral]);

  return (
    <>
      <Split
        primary={
          <Split
            primary={
              <Box heading={'contract'} padding={15}>
                <IdentityBadge entity={oToken} shorten={false} />
              </Box>
            }
            secondary={
              <Box heading={'Total Collateral'} padding={15}>
                {totalCollateral.toNumber()}
              </Box>
            }
          />
        }
        secondary={
          <Box heading={'total supply'} padding={15}>
            {totalSupply} {tokenName}
          </Box>
        }
      />
    </>
  );
}

export default OptionOverview;
