import React, { useState, useEffect } from 'react';

import { DataView, IdentityBadge } from '@aragon/ui';
import VaultModal from './VaultModal';
import { SectionTitle, RatioTag } from '../common';

import {
  formatDigits, compareVaultRatio, compareVaultIssued, toTokenUnitsBN,
} from '../../utils/number';

import { calculateRatio, calculateStrikeValueInCollateral } from '../../utils/calculation';
import * as types from '../../types'

type VaultOwnerListProps = {
  user: string,
  option: types.option,
  vaults: types.vaultWithoutUnderlying[],
  collateralIsETH: boolean
}

function VaultOwnerList({
  user, option, vaults, collateralIsETH,
}:VaultOwnerListProps) {
  const vaultUsesCollateral = option.collateral.addr !== option.strike.addr;

  const [isLoading, setIsLoading] = useState(true);
  const [vaultsWithDetail, setVaultDetail] = useState<types.vaultWithRatio[]>([]);

  const [page, setPage] = useState(0);

  useEffect(() => {
    let isCancelled = false;
    const updateInfo = async () => {
      if (vaults.length === 0) return;
      const {
        strike, minRatio, strikePrice, oracle, collateral,
      } = option;

      const strikeValueInCollateral = await calculateStrikeValueInCollateral(
        collateral.addr,
        strike.addr,
        oracle,
        collateral.decimals,
      );
      const vaultDetail = vaults
        .map((vault) => {
          if (vault.oTokensIssued === '0') {
            return {
              owner: vault.owner,
              oTokensIssued: vault.oTokensIssued,
              collateral: vault.collateral,
              ratio: Infinity,
              useCollateral: vaultUsesCollateral,
              isSafe: true,
            };
          }
          const ratio = calculateRatio(
            vault.collateral,
            vault.oTokensIssued,
            strikePrice,
            strikeValueInCollateral,
          );
          return {
            owner: vault.owner,
            oTokensIssued: vault.oTokensIssued,
            collateral: vault.collateral,
            ratio,
            useCollateral: vaultUsesCollateral,
            isSafe: ratio > minRatio,
          };
        })
        .sort(vaultUsesCollateral ? compareVaultRatio : compareVaultIssued);

      if (!isCancelled) {
        setVaultDetail(vaultDetail);
        setIsLoading(false);
      }
    };

    updateInfo();
    const id = setInterval(updateInfo, 60000);

    return () => {
      isCancelled = true;
      clearInterval(id);
    };
  }, [collateralIsETH, option, user, vaultUsesCollateral, vaults]);

  return (
    <>
      <SectionTitle title="All Vaults" />
      <DataView
        page={page}
        onPageChange={setPage}
        status={isLoading ? 'loading' : 'default'}
        fields={['Owner', 'collateral', 'Issued', 'RATIO', 'Status', '']}
        entries={vaultsWithDetail}
        entriesPerPage={5}
        renderEntry={(vault: types.vaultWithRatio) => [
          <IdentityBadge entity={vault.owner} shorten />,
          formatDigits(
            toTokenUnitsBN(vault.collateral, option.collateral.decimals).toNumber(),
            6,
          ),
          formatDigits(
            toTokenUnitsBN(vault.oTokensIssued, option.decimals).toNumber(),
            6,
          ),
          formatDigits(vault.ratio, 5),
          <RatioTag isSafe={vault.isSafe} ratio={vault.ratio} useCollateral={vault.useCollateral} />,
          <VaultModal
            option={option}
            vault={vault}
            collateralIsETH={collateralIsETH}
          />,
        ]}
      />
    </>
  );
}

export default VaultOwnerList;
