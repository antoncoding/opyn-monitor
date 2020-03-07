import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom'
import { Box, Split, Header, IdentityBadge, Button } from '@aragon/ui';
import { getERC20Info, getBalance } from '../../utils/infura';

import { options } from '../../constants/options';

function OptionOverview({ oToken, tokenName }) {
  const history = useHistory()
  const option = options.find((option) => option.addr === oToken);
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
      <Header primary={option.name} secondary={<Button label={'Exchange'} onClick={()=>{history.push(`/exchange/${oToken}`)}} />} />
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
