import React, { useState } from 'react';
import { Button, IdentityBadge, IconConnect, Box } from '@aragon/ui';

function ConnectButton({user, setUser}){
  const [isConnected, setIsConnected] = useState(false)

  const connectWeb3 = async () => {
    const accounts = await window.ethereum.enable();
    setIsConnected(true)
    setUser(accounts[0])
    return true;
  };
  
    return isConnected ? (
      <Box padding={6}>
        <IdentityBadge entity={user} connectedAccount />
      </Box>
    ) : (
      <Button 
        icon={<IconConnect/>} 
        label={'Connect'} 
        onClick={connectWeb3}
      /> 
    );
  
}

export default ConnectButton;
