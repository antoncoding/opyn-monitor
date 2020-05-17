import React, { useState, useEffect } from 'react';
import { Box, Split, IdentityBadge } from '@aragon/ui';

import BigNumber from 'bignumber.js';

import { getBalance, getTokenBalance } from '../../utils/infura';
import { getTotalSupplys, getTotalExercised } from '../../utils/graph'
import { toTokenUnitsBN } from '../../utils/number';
import * as types from '../../types'

type OptionOverviewProps = {
  option: types.option,
  collateralIsETH: boolean
}

function OptionOverview({
  option,
  collateralIsETH,
}: OptionOverviewProps) {
  const [totalCollateral, setTotalCollateral] = useState(new BigNumber(0));
  const [totalSupply, setTotalSupply] = useState(new BigNumber(0));
  const [totalPayout, setTotalPayout] = useState(new BigNumber(0))

  useEffect(() => {
    let isCancelled = false;
    async function init() {
      let totalCollt: BigNumber;
      if (collateralIsETH) {
        totalCollt = new BigNumber(await getBalance(option.addr));
      } else {
        const rawCollateralBalance = await getTokenBalance(option.collateral.addr, option.addr);
        totalCollt = toTokenUnitsBN(rawCollateralBalance, option.collateral.decimals);
      }
      const totalExercised = await getTotalExercised(option.addr)
      const supply = (await getTotalSupplys()).find(obj => obj.address === option.addr)?.totalSupply || '0';
      if (!isCancelled) {
        setTotalCollateral(totalCollt);
        setTotalSupply(toTokenUnitsBN(supply, option.decimals));
        setTotalPayout(toTokenUnitsBN(totalExercised, option.collateral.decimals))
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
              <Split
                primary={
                  <Box heading="contract" padding={15}>
                    <IdentityBadge entity={option.addr} shorten={true} />
                  </Box>
                }
                secondary={
                  <Box heading="Total Collateral" padding={15}>
                    {totalCollateral.toFormat(0)}
                    {' '}
                    {option.collateral.symbol}
                  </Box>
                }
              />

            )}
            secondary={(
              <Box heading="total supply" padding={15}>
                {totalSupply.toFormat(2)}
                {' '}
                {option.symbol.split(' ')[0]}
              </Box>
            )}
          />
        )}
        secondary={(
          <Box heading="total payout" padding={15}>
            {totalPayout.toFormat(0)}
            {' '}
            {option.collateral.symbol}
          </Box>
        )}
      />
    </>
  );
}

export default OptionOverview;
