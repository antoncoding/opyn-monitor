import React, { Component } from 'react';
import { Tag, DataView, IdentityBadge, LinkBase } from '@aragon/ui';
import { getAllVaultOwners } from '../../utils/graph';
import {
  getOptionContractDetail,
  getVaults,
  getPrice,
  getVaultsWithLiquidatable,
} from '../../utils/infura';
import { liquidate } from '../../utils/web3';
import { formatDigits } from '../../utils/common';

class VaultOwnerList extends Component {
  state = {
    isLoading: true,
    strikePrice: '0',
    vaults: [], // { account, maxLiquidatable, collateral, oTokensIssued, ratio } []
  };

  componentDidMount = async () => {
    const owners = await getAllVaultOwners();
    const { strike, decimals, minRatio, strikePrice, oracle } = await getOptionContractDetail(
      this.props.oToken
    );
    const vaults = await getVaults(owners, this.props.oToken);

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
              ratio < 1.7 ? (
                <Tag background='#FFEBAD' color='#FEC100'>
                  {' '}
                  Danger{' '}
                </Tag>
              ) : (
                <Tag mode='new'> safe </Tag>
              )
            ) : (
              <LinkBase
                onClick={() => {
                  console.log(`can liquidate max ${maxLiquidatable}`);
                  liquidate(this.props.oToken, owner, maxLiquidatable);
                }}
              >
                <Tag color='#E34343' background='#FFC6C6'>
                  Unsafe!
                </Tag>
              </LinkBase>
            ),
          ];
        }}
      />
    );
  }
}

export default VaultOwnerList;
