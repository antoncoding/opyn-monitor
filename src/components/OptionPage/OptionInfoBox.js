import React, { useState, useEffect } from 'react';
import { Box, Split, IdentityBadge } from '@aragon/ui';

import { getERC20Info, getBalance } from '../../utils/infura';

function OptionOverview({ oToken, tokenName }) {
  const [balance, setBalance] = useState('0');
  const [totalSupply, setTotalSupply] = useState('0');

  useEffect(() => {
    let isCancelled = false;
    async function init() {
      const [balance, tokenInfo] = await Promise.all([getBalance(oToken), getERC20Info(oToken)]);
      const { totalSupply } = tokenInfo;
      if (!isCancelled) {
        setBalance(balance);
        setTotalSupply(totalSupply);
      }
    }
    init();

    return () => {
      isCancelled = true;
    };
  }, [oToken]);

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
              <Box heading={'balance'} padding={15}>
                {balance}
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
