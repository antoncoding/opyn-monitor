import React, { useState, useEffect, useMemo } from 'react';
import { DataView, IdentityBadge } from '@aragon/ui';
import { getAllVaultsForOption } from '../../utils/graph';
import { getPrice, getDecimals } from '../../utils/infura';
import { options, ETH_ADDRESS } from '../../constants/options';
import VaultModal from './VaultModal';
import { SectionTitle, RatioTag } from '../common';
import {
  formatDigits,
  fromWei,
  compareVaultRatio,
  calculateRatio,
  toTokenUnits,
  handleDecimals,
} from '../../utils/number';

function VaultOwnerList({ oToken, user }) {
  const option = options.find((option) => option.addr === oToken);

  const [collateralDecimals, setCollateralDecimals] = useState(0);

  // like ETH:DAI option, not using other assets as collateral. vaultUseCollateral = false
  const vaultUsesCollateral = option.collateral !== option.strike;
  const collateralIsETH = option.collateral === ETH_ADDRESS;

  const [isLoading, setIsLoading] = useState(true);
  const [vaults, setVaults] = useState([]);

  // Get Collateral decimals if collateral is not eth
  useMemo(async () => {
    if (!collateralIsETH) {
      const _decimals = await getDecimals(option.collateral);
      setCollateralDecimals(_decimals);
    }
  }, [collateralIsETH, option.collateral]);

  useEffect(() => {
    let isCancelled = false;
    const updateInfo = async () => {
      const vaults = await getAllVaultsForOption(oToken);
      const { strike, decimals, minRatio, strikePrice, oracle, collateral } = option;

      let strikeValueInCollateral;
      if (collateralIsETH) {
        const strikeValueInWei = await getPrice(oracle, strike);
        strikeValueInCollateral = strikeValueInWei;
      } else if (!vaultUsesCollateral) {
        // No collateral, like ETH option
        strikeValueInCollateral = 10 ** collateralDecimals;
      } else {
        // Use other ERC20 as collateral
        const strikeValueInWei = await getPrice(oracle, strike);
        const collateralValueInWei = await getPrice(oracle, collateral);
        // Untested
        strikeValueInCollateral = handleDecimals(
          parseInt(strikeValueInWei) / parseInt(collateralValueInWei),
          collateralDecimals
        );
      }
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
          const oTokensIssued = toTokenUnits(vault.oTokensIssued, decimals);
          vault.oTokensIssued = oTokensIssued;
          vault.ratio = ratio;
          vault.useCollateral = vaultUsesCollateral;
          vault.isSafe = ratio > minRatio;
          vault.oToken = oToken;
          return vault;
        })
        .sort(compareVaultRatio);

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
  }, [collateralDecimals, collateralIsETH, oToken, option, user, vaultUsesCollateral]);

  return (
    <>
      <SectionTitle title={'All Vaults'} />
      <DataView
        status={isLoading ? 'loading' : 'default'}
        fields={['Owner', 'collateral', 'Issued', 'RATIO', 'Status', '']}
        entries={vaults}
        entriesPerPage={5}
        renderEntry={({ owner, collateral, oTokensIssued, ratio, isSafe, useCollateral }) => {
          return [
            <IdentityBadge entity={owner} shorten={true} />,
            formatDigits(
              collateralIsETH ? fromWei(collateral) : toTokenUnits(collateral, collateralDecimals),
              6
            ),
            formatDigits(oTokensIssued, 6),
            formatDigits(ratio, 5),
            RatioTag({ isSafe, ratio, useCollateral }),
            <VaultModal
              decimals={option.decimals}
              oToken={oToken}
              owner={owner}
              collateral={
                collateralIsETH ? fromWei(collateral) : toTokenUnits(collateral, collateralDecimals)
              }
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
