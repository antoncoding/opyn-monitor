import React, { Component } from 'react';
import { Box, Split } from '@aragon/ui';
// import { getAllVaultOwners } from '../utils/graph'
import { getBalance, getTotalSupply } from '../utils/infura';
// import { liquidate } from '../utils/web3'

class VaultBox extends Component {
  state = {
    balance: '0',
    supply: '0',
  };

  async componentDidMount() {
    const [balance, supply] = await Promise.all([
      getBalance(this.props.tokenAddress),
      getTotalSupply(this.props.tokenAddress),
    ]);
    this.setState({ balance, supply });
  }

  render() {
    return (
      <Split
        primary={
          <Box heading={'balance'} padding={30}>
            {this.state.balance} ETH
          </Box>
        }
        secondary={
          <Box heading={'supply'} padding={30}>
            {this.state.supply}{' '}
          </Box>
        }
      />
    );
  }
}

export default VaultBox;
