import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box, Split, IdentityBadge } from '@aragon/ui';

import BigNumber from 'bignumber.js';
import * as MyPTypes from '../types';

import { getTotalSupply, getBalance, getTokenBalance } from '../../utils/infura';
import { toTokenUnitsBN } from '../../utils/number';

function OptionOverview({
  oToken, tokenSymbol, option, collateralIsETH,
}) {
  const [totalCollateral, setTotalCollateral] = useState(new BigNumber(0));
  const [totalSupply, setTotalSupply] = useState(new BigNumber(0));

  useEffect(() => {
    let isCancelled = false;
    async function init() {
      let totalCollt;
      if (collateralIsETH) {
        totalCollt = new BigNumber(await getBalance(oToken));
      } else {
        const rawCollateralBalance = await getTokenBalance(option.collateral, oToken);
        totalCollt = toTokenUnitsBN(rawCollateralBalance, option.collateralDecimals);
      }
      const supply = await getTotalSupply(oToken);
      if (!isCancelled) {
        setTotalCollateral(totalCollt);
        setTotalSupply(toTokenUnitsBN(supply, option.decimals));
      }
    }
    init();

    return () => {
      isCancelled = true;
    };
  }, [option.collateralDecimals, collateralIsETH, oToken, option.collateral, option.decimals]);

  return (
    <>
      <Split
        primary={(
          <Split
            primary={(
              <Box heading="contract" padding={15}>
                <IdentityBadge entity={oToken} shorten={false} />
              </Box>
            )}
            secondary={(
              <Box heading="Total Collateral" padding={15}>
                {totalCollateral.toFormat(4)}
              </Box>
            )}
          />
        )}
        secondary={(
          <Box heading="total supply" padding={15}>
            {totalSupply.toFormat(4)}
            {' '}
            {tokenSymbol}
          </Box>
        )}
      />
    </>
  );
}

OptionOverview.propTypes = {
  oToken: PropTypes.string.isRequired,
  tokenSymbol: PropTypes.string.isRequired,
  option: MyPTypes.option.isRequired,
  collateralIsETH: PropTypes.bool.isRequired,
};

export default OptionOverview;
