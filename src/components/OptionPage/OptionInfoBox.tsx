import React, { useState, useEffect } from 'react';
import { Box, Split, IdentityBadge } from '@aragon/ui';

import BigNumber from 'bignumber.js';

import { getTotalSupply, getBalance, getTokenBalance } from '../../utils/infura';
import { toTokenUnitsBN } from '../../utils/number';
import * as types from '../../types'

type OptionOverviewProps = {
  option: types.option,
  collateralIsETH: boolean
}

function OptionOverview({
  option,
  collateralIsETH,
}:OptionOverviewProps) {
  const [totalCollateral, setTotalCollateral] = useState(new BigNumber(0));
  const [totalSupply, setTotalSupply] = useState(new BigNumber(0));

  useEffect(() => {
    let isCancelled = false;
    async function init() {
      let totalCollt:BigNumber;
      if (collateralIsETH) {
        totalCollt = new BigNumber(await getBalance(option.addr));
      } else {
        const rawCollateralBalance = await getTokenBalance(option.collateral.addr, option.addr);
        totalCollt = toTokenUnitsBN(rawCollateralBalance, option.collateral.decimals);
      }
      const supply = await getTotalSupply(option.addr);
      if (!isCancelled) {
        setTotalCollateral(totalCollt);
        setTotalSupply(toTokenUnitsBN(supply, option.decimals));
      }
    }
    init();

    return () => {
      isCancelled = true;
    };
  }, [collateralIsETH, option]);

  return (
    <>
      <Split
        primary={(
          <Split
            primary={(
              <Box heading="contract" padding={15}>
                <IdentityBadge entity={option.addr} shorten={false} />
              </Box>
            )}
            secondary={(
              <Box heading="Total Collateral" padding={15}>
                {totalCollateral.toFormat(4)}
                {' '}
                {option.collateral.symbol}
              </Box>
            )}
          />
        )}
        secondary={(
          <Box heading="total supply" padding={15}>
            {totalSupply.toFormat(4)}
            {' '}
            {option.symbol}
          </Box>
        )}
      />
    </>
  );
}

export default OptionOverview;
