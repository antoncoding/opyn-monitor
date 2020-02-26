import React, { Component } from 'react';
import { Box, Split, Header, IdentityBadge } from '@aragon/ui';
import { getOptionContractDetail } from '../../utils/infura';

class VaultBox extends Component {
  state = {
    name: 'oToken',
    balance: '0',
    supply: '0',
  };

  async componentDidMount() {
    const { balance, totalSupply, name } = await getOptionContractDetail(this.props.oToken);
    this.setState({ balance, supply: totalSupply, name });
  }

  render() {
    return (
      <>
        <Header
          primary={this.state.name}
        />
        <Split
          primary={
            <Split
              primary={
                <Box heading={'contract'} padding={30}>
                  <IdentityBadge entity={this.props.oToken} shorten={false} />
                </Box>
              }
              secondary={
                <Box heading={'balance'} padding={30}>
                  {this.state.balance}
                </Box>
              }
            />
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
