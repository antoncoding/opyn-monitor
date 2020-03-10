import React, { useState, useEffect } from 'react';
import { DataView, IdentityBadge } from '@aragon/ui';
import { getAllVaultOwners, getVaultsDetails } from '../../utils/graph';
import { getPrice, getVaultsWithLiquidatable } from '../../utils/infura';
import { options } from '../../constants/options';
import { SectionTitle, RatioTag } from '../common';
import { formatDigits, fromWei } from '../../utils/number';
import VaultModal from './VaultModal'
import MyVault from './MyVaultBox';

const renderListEntry = ({ owner, collateral, oTokensIssued, ratio, isSafe, oToken }) => {
  return [
    <IdentityBadge entity={owner} shorten={true} />,
    formatDigits(fromWei(collateral), 6),
    formatDigits(oTokensIssued, 6),
    ratio,
    RatioTag({isSafe, ratio}),
    <VaultModal
      oToken={oToken}
      owner={owner}
      collateral={fromWei(collateral)}
      isSafe={isSafe}
      oTokensIssued={oTokensIssued}
      ratio={ratio}
    />,
  ];
};


function VaultOwnerList({ oToken, user }) {
  const option = options.find((option) => option.addr === oToken);
  const [isLoading, setIsLoading] = useState(true);
  const [vaults, setVaults] = useState([]);

  useEffect(() => {
    let isCancelled = false;
    const updateInfo = async () => {
      const owners = await getAllVaultOwners(oToken);
      const vaults = await getVaultsDetails(oToken, owners)
      const { strike, decimals, minRatio, strikePrice, oracle } = option;

      const ethValueInStrike = 1 / (await getPrice(oracle, strike));
      const vaultDetail = vaults.map((vault) => {
        if (vault.oTokensIssued === '0') {
          vault.ratio = Infinity
          vault.isSafe = true
          return vault
        } 
        const valueProtectingInEth = parseFloat(strikePrice) * vault.oTokensIssued;
        const ratio = formatDigits(
          (parseFloat(vault.collateral) * ethValueInStrike) / valueProtectingInEth,
          4
        );

        const oTokensIssued = formatDigits(parseInt(vault.oTokensIssued) / 10 ** decimals, 6);
        vault.oTokensIssued = oTokensIssued;
        vault.ratio = ratio;
        vault.isSafe = ratio > minRatio;
        vault.oToken = oToken
        return vault;
      });

      const vaultWithLiquidatable = await getVaultsWithLiquidatable(vaultDetail);

      if (!isCancelled) {
        setVaults(vaultWithLiquidatable);
        setIsLoading(false);
      }
    };

    updateInfo();
    const id = setInterval(updateInfo, 12000);

    return () => {
      isCancelled = true;
      clearInterval(id);
    };
  }, [oToken, option, user]);

  return (
    <>
      <MyVault vaults={vaults} oToken={oToken} user={user} />
      <SectionTitle title={'All Vaults'} />
      <DataView
        status={isLoading ? 'loading' : 'default'}
        fields={['Owner', 'collateral', 'Issued', 'RATIO', 'Status', '']}
        entries={vaults}
        entriesPerPage={5}
        renderEntry={renderListEntry}
      />
    </>
  );
}

export default VaultOwnerList;
