import React from 'react';
import { Box, Split, IdentityBadge } from '@aragon/ui';

import { toTokenUnitsBN } from '../../utils/number';
import * as types from '../../types'

type OptionOverviewProps = {
  option: types.optionWithStat
}

function OptionOverview({
  option
}: OptionOverviewProps) {

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
                    {toTokenUnitsBN(option.totalCollateral, option.collateral.decimals).toFormat(0)}
                    {' '}
                    {option.collateral.symbol}
                  </Box>
                }
              />

            )}
            secondary={(
              <Box heading="total supply" padding={15}>
                {toTokenUnitsBN(option.totalSupply, option.decimals).toFormat(2)}
                {' '}
                {option.symbol.split(' ')[0]}
              </Box>
            )}
          />
        )}
        secondary={(
          <Box heading="total payout" padding={15}>
            {toTokenUnitsBN(option.totalExercised, option.collateral.decimals).toFormat(0)}
            {' '}
            {option.collateral.symbol}
          </Box>
        )}
      />
    </>
  );
}

export default OptionOverview;
