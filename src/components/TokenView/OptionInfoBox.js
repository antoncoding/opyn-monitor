import React, { useState, useEffect } from 'react';
import { Box, Split, Header, IdentityBadge } from '@aragon/ui';
import { getOptionContractDetail } from '../../utils/infura';

function VaultBox({ oToken, tokenName }) {
  const [name, setName] = useState('oToken');
  const [balance, setBalance] = useState('0');
  const [totalSupply, setTotalSupply] = useState('0');

  useEffect(() => {
    
    let isCancelled = false;
    async function init() {
      const { balance, totalSupply, name } = await getOptionContractDetail(oToken);
      if(!isCancelled) {
        setBalance(balance);
        setTotalSupply(totalSupply);
        setName(name);
      }
    }
    init();

    return () => {
      isCancelled = true
    }
  }, [oToken]);


  return (
    <>
      <Header primary={name} />
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

export default VaultBox;
