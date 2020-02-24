import React, { Component } from 'react';
import { Box, Split, Header } from '@aragon/ui';
import ConnectButton from './ConnectButton'
import { getOptionContractDetail } from '../utils/infura';

class VaultBox extends Component {
  state = {
    name: 'oToken',
    balance: '0',
    supply: '0',
  };

  async componentDidMount() {
    const { balance, totalSupply, name } = await getOptionContractDetail(this.props.oToken)
    this.setState({ balance, supply: totalSupply, name });
  }

  render() {
    return (
      <>
      <Header
        primary={ this.state.name }
        secondary={<ConnectButton />}
      />
      <Split
        primary={
          <Box heading={'balance'} padding={30}>
            {this.state.balance} ETH
          </Box>
        }
        secondary={
          <Box heading={'supply'} padding={30}>
            {this.state.supply} {this.props.tokenName}
          </Box>
        }
      />
      </>
    );
  }
}

export default VaultBox;
