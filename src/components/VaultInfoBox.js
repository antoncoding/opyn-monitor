import React, { Component } from 'react';
import { Box, Split } from '@aragon/ui';
// import { getAllVaultOwners } from '../utils/graph'
import { getOptionContractDetail } from '../utils/infura';
// import { liquidate } from '../utils/web3'

class VaultBox extends Component {
  state = {
    balance: '0',
    supply: '0',
  };

  async componentDidMount() {
    const { balance, totalSupply } = await getOptionContractDetail(this.props.oToken)
    this.setState({ balance, supply: totalSupply });
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
            {this.state.supply} ocDai
          </Box>
        }
      />
    );
  }
}

export default VaultBox;
