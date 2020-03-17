import React, { useState, useEffect } from 'react';
import { DataView, IdentityBadge } from '@aragon/ui';
import { getAllVaultsForOption } from '../../utils/graph';
import { getPrice } from '../../utils/infura';
import { options } from '../../constants/options';
import VaultModal from './VaultModal'
import { SectionTitle, RatioTag } from '../common';
import { formatDigits, fromWei, compareVaultRatio, calculateRatio, toTokenUnits } from '../../utils/number';

function VaultOwnerList({ oToken, user }) {
  const option = options.find((option) => option.addr === oToken);
  const [isLoading, setIsLoading] = useState(true);
  const [vaults, setVaults] = useState([]);

  useEffect(() => {
    let isCancelled = false;
    const updateInfo = async () => {
      const vaults = await getAllVaultsForOption(oToken)
      const { strike, decimals, minRatio, strikePrice, oracle } = option;

      const tokenPriceInWei = await getPrice(oracle, strike);
      const vaultDetail = vaults.map((vault) => {
        if (vault.oTokensIssued === '0') {
          vault.ratio = Infinity
          vault.isSafe = true
          return vault
        } 
        const ratio = calculateRatio(vault.collateral, vault.oTokensIssued, strikePrice, tokenPriceInWei) 
        const oTokensIssued = toTokenUnits(vault.oTokensIssued, decimals);
        vault.oTokensIssued = oTokensIssued;
        vault.ratio = ratio;
        vault.isSafe = ratio > minRatio;
        vault.oToken = oToken
        return vault;
      }).sort(compareVaultRatio);

      if (!isCancelled) {
        setVaults(vaultDetail);
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
      <SectionTitle title={'All Vaults'} />
      <DataView
        status={isLoading ? 'loading' : 'default'}
        fields={['Owner', 'collateral', 'Issued', 'RATIO', 'Status', '']}
        entries={vaults}
        entriesPerPage={5}
        renderEntry={({ owner, collateral, oTokensIssued, ratio, isSafe }) => {
          return [
            <IdentityBadge entity={owner} shorten={true} />,
            formatDigits(fromWei(collateral), 6),
            formatDigits(oTokensIssued, 6),
            formatDigits(ratio, 5),
            RatioTag({isSafe, ratio}),
            <VaultModal 
              decimals={option.decimals}
              oToken={oToken} owner={owner} 
              collateral={fromWei(collateral)}
              isSafe={isSafe}
              oTokensIssued={oTokensIssued}
              ratio={ratio}
            />
          ];
        }}
      />
    </>
  );
}

export default VaultOwnerList;
