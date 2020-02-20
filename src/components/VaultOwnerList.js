import React, { Component } from 'react';
import { LoadingRing, DataView, Button, IdentityBadge } from '@aragon/ui';
import { getAllVaultOwners } from '../utils/graph';
import { getVaults } from '../utils/infura';
import { liquidate } from '../utils/web3';
class VaultOwnerList extends Component {
  state = {
    isLoading: true,
    vaults: [], // { account, maxLiquidatable, collateral, oTokensIssued } []
  };

  componentDidMount = async () => {
    const ownerAddrs = await getAllVaultOwners();
    const vaults = await getVaults(ownerAddrs);
    this.setState({
      vaults,
      isLoading: false,
    });
  };

  render() {
    return this.state.isLoading ? (
      <LoadingRing />
    ) : (
      <DataView
        fields={['Owner', 'Collecteral', 'Issued', 'Status']}
        entries={this.state.vaults}
        renderEntry={({ owner, collateral, oTokensIssued, maxLiquidatable }) => {
          return [
            <IdentityBadge entity={owner} shorten={true} />,
            collateral,
            oTokensIssued,            
            maxLiquidatable > 0 ? (
              <Button onClick={() => liquidate(owner, maxLiquidatable)}>
                Can Liquidate {maxLiquidatable}
              </Button>
            ) : (
              <div> safe </div>
            ),
          ];
        }}
      />
    );
  }
}

export default VaultOwnerList;
