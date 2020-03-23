import React, { useState, useEffect, useMemo } from 'react';

import { DataView, IdentityBadge } from '@aragon/ui';
import VaultModal from './VaultModal';
import { SectionTitle, RatioTag } from '../common';

import { getAllVaultsForOption } from '../../utils/graph';
import { getDecimals } from '../../utils/infura';
import { formatDigits, compareVaultRatio, toTokenUnitsBN } from '../../utils/number';
import { calculateRatio, calculateStrikeValueInCollateral } from '../../utils/calculation';

import { options, ETH_ADDRESS } from '../../constants/options';

function VaultOwnerList({ oToken, user }) {
  const option = options.find((option) => option.addr === oToken);

  const [collateralDecimals, setCollateralDecimals] = useState(18);

  // like ETH:DAI option, not using other assets as collateral. vaultUseCollateral = false
  const vaultUsesCollateral = option.collateral !== option.strike;
  const collateralIsETH = option.collateral === ETH_ADDRESS;

  const [isLoading, setIsLoading] = useState(true);
  const [vaults, setVaults] = useState([]);
  const [vaultsWithDetail, setVaultDetail] = useState([])

  const [page, setPage] = useState(0)

  // Get Collateral decimals if collateral is not eth
  useMemo(async () => {
    if (!collateralIsETH) {
      const _decimals = await getDecimals(option.collateral);
      setCollateralDecimals(_decimals);
    }
    // Get All vaults once
    const vaults = await getAllVaultsForOption(oToken);
    setVaults(vaults)

  }, [collateralIsETH, oToken, option.collateral]);

  useEffect(() => {
    let isCancelled = false;
    const updateInfo = async () => {
      if(vaults.length === 0) return
      const { strike, minRatio, strikePrice, oracle, collateral } = option;

      const strikeValueInCollateral = await calculateStrikeValueInCollateral(
        collateral,
        strike,
        oracle
      );
      const vaultDetail = vaults
        .map((vault) => {
          if (vault.oTokensIssued === '0') {
            vault.ratio = Infinity;
            vault.useCollateral = vaultUsesCollateral;
            vault.isSafe = true;
            return vault;
          }
          const ratio = calculateRatio(
            vault.collateral,
            vault.oTokensIssued,
            strikePrice,
            strikeValueInCollateral
          );
          vault.ratio = ratio;
          vault.useCollateral = vaultUsesCollateral;
          vault.isSafe = ratio > minRatio;
          vault.oToken = oToken;
          return vault;
        })
        .sort(compareVaultRatio);

      if (!isCancelled) {
        setVaultDetail(vaultDetail);
        setIsLoading(false);
      }
    };

    updateInfo();
    const id = setInterval(updateInfo, 12000);

    return () => {
      isCancelled = true;
      clearInterval(id);
    };
  }, [collateralDecimals, collateralIsETH, oToken, option, user, vaultUsesCollateral, vaults]);

  return (
    <>
      <SectionTitle title={'All Vaults'} />
      <DataView
        page={page}
        onPageChange={setPage}
        status={isLoading ? 'loading' : 'default'}
        fields={['Owner', 'collateral', 'Issued', 'RATIO', 'Status', '']}
        entries={vaultsWithDetail}
        entriesPerPage={5}
        renderEntry={({ owner, collateral, oTokensIssued, ratio, isSafe, useCollateral }) => {
          return [
            <IdentityBadge entity={owner} shorten={true} />,
            formatDigits(
              toTokenUnitsBN(collateral, collateralDecimals).toNumber(),
              6
            ),
            formatDigits(
              toTokenUnitsBN(oTokensIssued, option.decimals).toNumber(), 
              6
            ),
            formatDigits(ratio, 5),
            RatioTag({ isSafe, ratio, useCollateral }),
            <VaultModal
              decimals={option.decimals}
              oToken={oToken}
              owner={owner}
              collateral={collateral}
              collateralAsset={option.collateral}
              collateralDecimals={collateralDecimals}
              isSafe={isSafe}
              useCollateral={useCollateral}
              collateralIsETH={collateralIsETH}
              oTokensIssued={oTokensIssued}
              ratio={ratio}
            />,
          ];
        }}
      />
    </>
  );
}

export default VaultOwnerList;
