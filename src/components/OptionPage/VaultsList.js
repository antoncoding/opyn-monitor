import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { DataView, IdentityBadge } from '@aragon/ui';
import VaultModal from './VaultModal';
import { SectionTitle, RatioTag } from '../common';
import * as MyPTypes from '../types';
import { formatDigits, compareVaultRatio, toTokenUnitsBN } from '../../utils/number';
import { calculateRatio, calculateStrikeValueInCollateral } from '../../utils/calculation';


function VaultOwnerList({
  oToken, user, vaults, option, collateralIsETH, collateralDecimals,
}) {
  const vaultUsesCollateral = option.collateral !== option.strike;

  const [isLoading, setIsLoading] = useState(true);
  const [vaultsWithDetail, setVaultDetail] = useState([]);

  const [page, setPage] = useState(0);

  useEffect(() => {
    let isCancelled = false;
    const updateInfo = async () => {
      if (vaults.length === 0) return;
      const {
        strike, minRatio, strikePrice, oracle, collateral,
      } = option;

      const strikeValueInCollateral = await calculateStrikeValueInCollateral(
        collateral,
        strike,
        oracle,
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
            oToken,
          };
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
      <SectionTitle title="All Vaults" />
      <DataView
        page={page}
        onPageChange={setPage}
        status={isLoading ? 'loading' : 'default'}
        fields={['Owner', 'collateral', 'Issued', 'RATIO', 'Status', '']}
        entries={vaultsWithDetail}
        entriesPerPage={5}
        renderEntry={({
          owner, collateral, oTokensIssued, ratio, isSafe, useCollateral,
        }) => [
          <IdentityBadge entity={owner} shorten />,
          formatDigits(
            toTokenUnitsBN(collateral, collateralDecimals).toNumber(),
            6,
          ),
          formatDigits(
            toTokenUnitsBN(oTokensIssued, option.decimals).toNumber(),
            6,
          ),
          formatDigits(ratio, 5),
          RatioTag({ isSafe, ratio, useCollateral }),
          <VaultModal
            option={option}
            oToken={oToken}
            owner={owner}
            collateral={collateral}
            collateralDecimals={collateralDecimals}
            isSafe={isSafe}
            useCollateral={useCollateral}
            collateralIsETH={collateralIsETH}
            oTokensIssued={oTokensIssued}
            ratio={ratio}
          />,
        ]}
      />
    </>
  );
}

VaultOwnerList.propTypes = {
  oToken: PropTypes.string.isRequired,
  user: PropTypes.string.isRequired,
  vaults: PropTypes.arrayOf(MyPTypes.vault).isRequired,
  option: MyPTypes.option.isRequired,
  collateralIsETH: PropTypes.bool.isRequired,
  collateralDecimals: PropTypes.number.isRequired,
};

export default VaultOwnerList;
