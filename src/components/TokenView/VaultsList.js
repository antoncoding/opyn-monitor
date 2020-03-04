import React, { useState, useEffect } from 'react';
import { DataView } from '@aragon/ui';
import { getAllVaultOwners } from '../../utils/graph';
import { getVaults, getPrice, getVaultsWithLiquidatable } from '../../utils/infura';
import { options } from '../../constants/options';
import { renderListEntry, SectionTitle } from './common';
import { formatDigits } from '../../utils/common';
import MyVault from './MyVaultBox';

function VaultOwnerList({ oToken, user }) {
  const option = options.find((option) => option.addr === oToken);
  const [isLoading, setIsLoading] = useState(true);
  const [vaults, setVaults] = useState([]);

  useEffect(() => {
    let isCancelled = false;
    const updateInfo = async () => {
      const owners = await getAllVaultOwners();
      const { strike, decimals, minRatio, strikePrice, oracle } = option;
      const vaults = (await getVaults(owners, oToken));

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

        const oTokensIssued = formatDigits(parseInt(vault.oTokensIssued) / 10 ** decimals, 4);
        vault.oTokensIssued = oTokensIssued;
        vault.ratio = ratio;
        vault.isSafe = ratio > minRatio;
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
