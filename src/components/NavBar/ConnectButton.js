import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Button, IdentityBadge, IconConnect, Box, IconPower, LinkBase,
} from '@aragon/ui';

import { connect, disconnect } from '../../utils/web3';

function ConnectButton({ user, setUser }) {
  const [isConnected, setIsConnected] = useState(false);

  const connectWeb3 = async () => {
    const address = await connect();
    if (address === false) return;
    setIsConnected(true);
    setUser(address);
  };

  const disconnectWeb3 = async () => {
    await disconnect();
    setIsConnected(false);
    setUser('');
  };

  return isConnected ? (
    <>
      <div style={{ paddingTop: 5, paddingRight: 5 }}>
        <LinkBase onClick={disconnectWeb3} size="small">
          {' '}
          <IconPower />
          {' '}
        </LinkBase>
      </div>
      <Box padding={6}>
        <IdentityBadge entity={user} />
      </Box>

    </>
  ) : (
    <Button icon={<IconConnect />} label="Connect" onClick={connectWeb3} />
  );
}

ConnectButton.propTypes = {
  user: PropTypes.string.isRequired,
  setUser: PropTypes.func.isRequired,
};

export default ConnectButton;
