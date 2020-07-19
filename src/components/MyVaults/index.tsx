import React, { useState, useMemo, useEffect, useContext } from 'react';

import BigNumber from 'bignumber.js';
import {
  Header, DataView, IdentityBadge,
} from '@aragon/ui';
import NoWalletView from './NoWallet';
import * as types from '../../types'
import { useOptions } from '../../hooks'
import { userContext } from '../../contexts/userContext'
import {
  SectionTitle, ManageVaultButton, CheckBox,
} from '../common/index';
import {
  formatDigits, compareVaultRatio, toTokenUnitsBN,
} from '../../utils/number';
import { getAllVaultsForUser } from '../../utils/graph';
import { getPreference, storePreference } from '../../utils/storage';
import { calculateRatio, calculateStrikeValueInCollateral } from '../../utils/calculation';
import tracker from '../../utils/tracker';
import OpenVaultModal from './OpenVaultModal';

const Promise = require('bluebird');

export type vaultWithDetail = {
  oToken: string,
  collateral: string,
  oTokenName: string
  collateralDecimals: number,
  collateralSymbol: string,
  expiry: number
  ratio: number
}

function MyVaults() {
  useEffect(() => {
    tracker.pageview('/myvaults/');
  }, []);

  const { user } = useContext(userContext)

  const { isInitializing, options } = useOptions()

  const [opendVaults, setOpenedVaults] = useState<vaultWithDetail[]>([]);
  const [tokensToOpen, setTokensToOpen] = useState<types.option[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  // enable not logged in user to use this feature
  const [watchAddress, setWatchAddress] = useState('');
  const isWatchMode = user === '' && watchAddress !== '';
  const hasAddressConnected = user !== '' || watchAddress !== '';

  // checkbox
  const [showExpired, setShowExpired] = useState(getPreference('showExpired', '0') === '1');
  const [showEmpty, setShowEmpty] = useState(getPreference('showEmpty', '1') === '1');

  const displayVaults = opendVaults
    .filter((vault) => showExpired || vault.expiry * 1000 > Date.now())
    .filter((vault) => showEmpty || new BigNumber(vault.collateral).gt(new BigNumber(0)));

  // Only request all vaults once
  useMemo(async () => {
    if (!hasAddressConnected) return;
    const userVaults = await getAllVaultsForUser(isWatchMode ? watchAddress : user);
    const openedVaults: vaultWithDetail[] = [];
    const notOpenedTokens: types.option[] = [];
    await Promise.map(options, async (option: types.option) => {
      const entry = userVaults.find((vault) => vault.optionsContract.address === option.addr);

      if (entry !== undefined) {
        const strikeValueInCollateral = await calculateStrikeValueInCollateral(
          option.collateral.addr,
          option.strike.addr,
          option.oracle,
          option.collateral.decimals,
        );
        const ratio = calculateRatio(
          entry.collateral,
          entry.oTokensIssued,
          option.strikePrice,
          strikeValueInCollateral,
        );
        openedVaults.push({
          oToken: option.addr,
          oTokenName: option.title,
          collateral: entry.collateral,
          collateralSymbol: option.collateral.symbol,
          collateralDecimals: option.collateral.decimals,
          expiry: option.expiry,
          ratio,
        });
      } else if (option.expiry > (Date.now() / 1000)) {
        // only put non-expired token to "can open" list
        notOpenedTokens.push(option);
      }
    });
    setIsLoading(false);
    setOpenedVaults(openedVaults.sort(compareVaultRatio));
    setTokensToOpen(notOpenedTokens);
  }, [user, watchAddress, hasAddressConnected, isWatchMode, options]);

  const [vaultListPage, setVPage] = useState(0)
  const [openVaultPage, setOPage] = useState(0)

  return (
    <>
      <Header primary="My Vaults" />
      {hasAddressConnected ? ( 
        <>
         { (displayVaults.length > 0 || (isInitializing || isLoading)) && 
          <div style={{ paddingBottom: '3%' }}>
            <div style={{ display: 'flex' }}>
              <SectionTitle title="Existing Vaults" />
              <div style={{ marginLeft: 'auto' }}>
                <div style={{ display: 'flex' }}>
                  <CheckBox
                    text="Expired"
                    checked={showExpired}
                    onCheck={(checked: boolean) => {
                      storePreference('showExpired', checked ? '1' : '0');
                      setShowExpired(checked);
                    }}
                  />
                  <CheckBox
                    text="Empty"
                    checked={showEmpty}
                    onCheck={(checked: boolean) => {
                      storePreference('showEmpty', checked ? '1' : '0');
                      setShowEmpty(checked);
                    }}
                  />
                </div>
              </div>
            </div>

            <DataView
              status={isInitializing || isLoading ? 'loading' : 'default'}
              fields={['Token', 'contract', 'collateral', 'Ratio', '']}
              entries={displayVaults}
              entriesPerPage={5}
              page={vaultListPage}
              onPageChange={setVPage}
              renderEntry={({
                oToken, oTokenName, collateral, collateralDecimals, ratio, collateralSymbol
              }: vaultWithDetail) => [
                  oTokenName,
                  <IdentityBadge entity={oToken} />,
                  `${formatDigits(toTokenUnitsBN(collateral, collateralDecimals).toNumber(), 5)} ${collateralSymbol}`,
                  formatDigits(ratio, 4),
                  <ManageVaultButton oToken={oToken} owner={isWatchMode ? watchAddress : user} />,
                ]}
            />
          </div>
          }
          
          {tokensToOpen.length > 0 && !isWatchMode ? (
            <div>
              <SectionTitle title="Open new vaults" />
              <DataView
                fields={['Token', 'contract', 'manage']}
                entries={tokensToOpen}
                page={openVaultPage}
                entriesPerPage={5}
                onPageChange={setOPage}
                renderEntry={(option: types.option) => {
                  return [
                    option.title,
                    <IdentityBadge entity={option.addr} shorten={false} />,
                    <OpenVaultModal user={user} option={option} />,
                  ];
                }}
              />
            </div>
          ) : (
              <></>
            )}
        </>
      ) : (
          <NoWalletView
            setWatchAddress={setWatchAddress}
          />
        )}
    </>
  );
}

export default MyVaults;
