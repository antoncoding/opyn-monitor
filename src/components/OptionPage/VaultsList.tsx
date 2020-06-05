import React, { useState, useEffect, useContext } from 'react';
import BigNumber from 'bignumber.js';

import { DataView, RadioGroup, Radio, Header } from '@aragon/ui';
import VaultModal from './VaultModal';
import { RatioTag, CustomIdentityBadge } from '../common';
import { userContext } from '../../contexts/userContext'
import {
  formatDigits, compareVaultRatio, compareVaultIssued, toTokenUnitsBN,
} from '../../utils/number';

import { calculateRatio, calculateStrikeValueInCollateral } from '../../utils/calculation';
import { getExerciseForOption } from '../../utils/graph'
import * as types from '../../types'
import { vaultWithRatio } from '../../types';

type VaultOwnerListProps = {
  isInitializing: boolean
  option: types.option,
  vaults: types.vaultWithoutUnderlying[],
  collateralIsETH: boolean
}

function VaultOwnerList({
  isInitializing, option, vaults, collateralIsETH,
}: VaultOwnerListProps) {

  const { user } = useContext(userContext)

  const vaultUsesCollateral = option.collateral.addr !== option.strike.addr;

  const [isLoading, setIsLoading] = useState(true);
  const [vaultsWithDetail, setVaultDetail] = useState<types.vaultWithRatio[]>([]);

  const [checkedSorted, setChecked] = useState(0)

  const SORTED_BY = ['Collateral', 'Issued', 'Exercised', 'Ratio']

  const [page, setPage] = useState(0);

  // calculate ratio
  useEffect(() => {
    if(option.addr === '') return 
    let isCancelled = false;
    const updateInfo = async () => {
      if (vaults.length === 0) {
        setIsLoading(false)
        return
      };
      const {
        strike, minRatio, strikePrice, oracle, collateral,
      } = option;

      const allExercies = await getExerciseForOption(option.addr)
      const strikeValueInCollateral = await calculateStrikeValueInCollateral(
        collateral.addr,
        strike.addr,
        oracle,
        collateral.decimals,
      );
      const vaultDetail = vaults
        .map((vault) => {
          // calculate total exercised for this vault
          const exercised = allExercies
            .filter(action => action.vault.owner === vault.owner)
            .reduce(
              (prev: BigNumber, current) => prev.plus(current.amtCollateralToPay),
              new BigNumber(0)
            )
          if (vault.oTokensIssued === '0') {
            return {
              owner: vault.owner,
              oTokensIssued: vault.oTokensIssued,
              collateral: vault.collateral,
              ratio: Infinity,
              exercised,
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
            exercised,
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
      <Header primary="All Vaults" secondary={
        <RadioGroup onChange={setChecked} selected={checkedSorted}>
          <div style={{ display: 'flex' }}>
            {SORTED_BY.map((label, i) => {
              return (
                <label key={i} style={{ opacity: 0.8 }}>
                  <div style={{ display: 'flex' }}>
                    <Radio id={i} />
                    <div>{label} </div>
                  </div>
                </label>
              )
            })}
          </div>

        </RadioGroup>
      } />

      <DataView
        page={page}
        onPageChange={setPage}
        status={isLoading || isInitializing ? 'loading' : 'default'}
        fields={['Owner', 'collateral', 'Issued', 'Exercised', 'RATIO', 'Status', '']}
        entries={vaultsWithDetail.sort(selectSortFunction(checkedSorted))}
        entriesPerPage={5}
        renderEntry={(vault: types.vaultWithRatio) => {
          return [
            <CustomIdentityBadge entity={vault.owner} shorten />,
            toTokenUnitsBN(vault.collateral, option.collateral.decimals).toFixed(3),
            toTokenUnitsBN(vault.oTokensIssued, option.decimals).toFixed(3),
            toTokenUnitsBN(vault.exercised, option.collateral.decimals).toFixed(3),
            formatDigits(vault.ratio, 3),
            <RatioTag isSafe={vault.isSafe} ratio={vault.ratio} useCollateral={vault.useCollateral} />,

            <VaultModal
              option={option}
              vault={vault}
              collateralIsETH={collateralIsETH}
            />,
          ]
        }
        }
      />
    </>
  );
}

export default VaultOwnerList;

const selectSortFunction = (idx: number): (a, b) => 1 | -1 => {
  if (idx === 0) return sortByCollateral
  else if (idx === 1) return sortByIssued
  else if (idx === 2) return sortByExercised
  else return sortByRatio
}

const sortByCollateral = (a: vaultWithRatio, b: vaultWithRatio) =>
  new BigNumber(a.collateral).gt(new BigNumber(b.collateral)) ? -1 : 1

const sortByIssued = (a: vaultWithRatio, b: vaultWithRatio) =>
  new BigNumber(a.oTokensIssued).gt(new BigNumber(b.oTokensIssued)) ? -1 : 1

const sortByExercised = (a: vaultWithRatio, b: vaultWithRatio) =>
  a.exercised.gt(b.exercised) ? -1 : 1

const sortByRatio = (a: vaultWithRatio, b: vaultWithRatio) =>
  new BigNumber(a.ratio).lt(new BigNumber(b.ratio)) ? -1 : 1
