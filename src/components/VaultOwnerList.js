import React, { Component } from 'react';
import { LoadingRing, DataView, Button, IdentityBadge } from '@aragon/ui';
import { getAllVaultOwners } from '../utils/graph';
import { getVaults, getPrice, getVaultsWithLiquidatable } from '../utils/infura';
import { liquidate } from '../utils/web3';
class VaultOwnerList extends Component {
  state = {
    isLoading: true,
    underlyingPrice: '0',
    vaults: [], // { account, maxLiquidatable, collateral, oTokensIssued, ratio } []
  };

  componentDidMount = async () => {
    const owners = await getAllVaultOwners();
    const underlyingPrice = await getPrice(this.props.oracle, this.props.underlying)
    console.log(`underlyingprice `, typeof underlyingPrice, underlyingPrice)
    
    const vaults = await getVaults(owners, this.props.oToken);
    
    const vaultDetail = vaults.map(vault => {
      const oTokensIssued = parseInt(vault.oTokensIssued) / 10 ** this.props.decimals
      const valueProtectingInEth = parseFloat(underlyingPrice) * oTokensIssued
      const ratio = parseFloat(vault.collateral) / valueProtectingInEth
      vault.oTokensIssued = oTokensIssued
      vault.ratio = ratio
      vault.isSafe = ratio > this.props.minRatio
      return vault
    })

    const vaultWithLiquidatable = await getVaultsWithLiquidatable(vaultDetail)

    this.setState({
      vaults: vaultWithLiquidatable,
      isLoading: false,
      underlyingPrice
    });
  console.log(this.state)
  };

  render() {
    return this.state.isLoading ? (
      <LoadingRing />
    ) : (
      <DataView
        fields={['Owner', 'Collecteral', 'Issued', 'RATIO', 'Status']}
        entries={this.state.vaults}
        renderEntry={({ owner, collateral, oTokensIssued, ratio, maxLiquidatable }) => {
          return [
            <IdentityBadge entity={owner} shorten={true} />,
            collateral,
            oTokensIssued,
            ratio,         
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
