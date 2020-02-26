import React, { Component } from 'react';
import { Button, IdentityBadge, IconConnect } from '@aragon/ui';

class ConnectButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isConnected: false,
      account: '',
    };
  }

  connectWeb3 = async () => {
    const accounts = await window.ethereum.enable();
    this.setState({
      isConnected: true,
      account: accounts[0],
    });
    return true;
  };

  render() {
    return this.state.isConnected ? (
      <Button>
        <IdentityBadge entity={this.state.account} connectedAccount />
      </Button>
    ) : (
      <Button 
        icon={<IconConnect/>} 
        label={'Connect'} 
        onClick={this.connectWeb3}/> 
    );
  }
}

export default ConnectButton;
