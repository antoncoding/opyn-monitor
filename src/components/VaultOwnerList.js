import React, { Component } from 'react';
import { Tag, DataView, Button, IdentityBadge } from '@aragon/ui';
import { getAllVaultOwners } from '../utils/graph';
import { getVaults, getPrice, getVaultsWithLiquidatable } from '../utils/infura';
import { liquidate } from '../utils/web3';
import { formatDigits } from '../utils/common'
class VaultOwnerList extends Component {
  state = {
    isLoading: true,
    underlyingPrice: '0',
    vaults: [], // { account, maxLiquidatable, collateral, oTokensIssued, ratio } []
  };

  componentDidMount = async () => {
    const owners = await getAllVaultOwners();
    const vaults = await getVaults(owners, this.props.oToken);

    const underlyingPrice = await getPrice(this.props.oracle, this.props.underlying);

    const vaultDetail = vaults.map((vault) => {
      const oTokensIssued = formatDigits((parseInt(vault.oTokensIssued) / 10 ** this.props.decimals), 4);
      const valueProtectingInEth = parseFloat(underlyingPrice) * oTokensIssued;
      const ratio = formatDigits(parseFloat(vault.collateral) / valueProtectingInEth, 4);
      vault.oTokensIssued = oTokensIssued;
      vault.ratio = ratio;
      vault.isSafe = ratio > this.props.minRatio;
      return vault;
    });

    const vaultWithLiquidatable = await getVaultsWithLiquidatable(vaultDetail);
    this.setState({
      vaults: vaultWithLiquidatable,
      isLoading: false,
      underlyingPrice,
    });
  };

  render() {
    return (
      <DataView
        heading={<h3> All Vaults </h3>}
        status={this.state.isLoading ? 'loading' : 'default'}
        fields={['Owner', 'Collecteral', 'Issued', 'RATIO', 'Status']}
        entries={this.state.vaults}
        entriesPerPage={6}
        renderEntry={({ owner, collateral, oTokensIssued, ratio, maxLiquidatable, isSafe }) => {
          return [
            <IdentityBadge entity={owner} shorten={true} />,
            collateral,
            oTokensIssued,
            ratio,
            isSafe ? (
              <Tag> safe </Tag>
            ) : (
              <Button onClick={() => liquidate(this.props.oToken, owner, maxLiquidatable)}>
                Can Liquidate {maxLiquidatable}
              </Button>
            ),
          ];
        }}
      />
    );
  }
}

export default VaultOwnerList;
