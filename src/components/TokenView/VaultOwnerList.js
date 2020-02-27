import React, { Component } from 'react';
import {
  DataView
} from '@aragon/ui';
import { getAllVaultOwners } from '../../utils/graph';
import {
  getOptionContractDetail,
  getVaults,
  getPrice,
  getVaultsWithLiquidatable,
} from '../../utils/infura';

import { renderListEntry } from './common'
import { formatDigits } from '../../utils/common';
import MyVault from './MyVault';

class VaultOwnerList extends Component {
  state = {
    isLoading: true,
    strikePrice: '0',
    vaults: [], // { account, maxLiquidatable, collateral, oTokensIssued, ratio } []
  };

  componentDidMount = async () => {
    await this.updateInfo()
    setInterval(this.updateInfo, 15000)
  };

  updateInfo = async() => {
    const owners = await getAllVaultOwners();
    const { strike, decimals, minRatio, strikePrice, oracle } = await getOptionContractDetail(
      this.props.oToken
    );
    const vaults = await getVaults(owners, this.props.oToken)

    const ethValueInStrike = 1 / (await getPrice(oracle, strike));
    const vaultDetail = vaults.map((vault) => {
      const valueProtectingInEth = parseFloat(strikePrice) * vault.oTokensIssued;
      const ratio = formatDigits(
        (parseFloat(vault.collateral) * ethValueInStrike) / valueProtectingInEth,
        4
      );

      const oTokensIssued = formatDigits(parseInt(vault.oTokensIssued) / 10 ** decimals, 4);
      vault.oTokensIssued = oTokensIssued;
      vault.ratio = ratio;
      vault.isSafe = ratio > minRatio;
      return vault;
    });

    const vaultWithLiquidatable = await getVaultsWithLiquidatable(vaultDetail);
    this.setState({
      vaults: vaultWithLiquidatable,
      isLoading: false,
      strikePrice,
    });
  }

  render() {
    return (
      <>
      <MyVault vaults={this.state.vaults} oToken={this.props.oToken} user={this.props.user} />
      <DataView
        status={this.state.isLoading ? 'loading' : 'default'}
        fields={['Owner', 'collateral', 'Issued', 'RATIO', 'Status', '']}
        entries={this.state.vaults}
        entriesPerPage={5}
        renderEntry={renderListEntry}
      />
      </>
    );
  }
}

export default VaultOwnerList;
