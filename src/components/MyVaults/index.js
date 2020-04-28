import React, { useState, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import BigNumber from 'bignumber.js';
import {
  Header, DataView, IdentityBadge,
} from '@aragon/ui';
import NoWalletView from './NoWallet';

import { allOptions } from '../../constants/options';
import {
  SectionTitle, ManageVaultButton, Comment, CheckBox,
} from '../common';
import {
  formatDigits, compareVaultRatio, toTokenUnitsBN,
} from '../../utils/number';
import { getAllVaultsForUser } from '../../utils/graph';
import { getPreference, storePreference } from '../../utils/storage';
import { calculateRatio, calculateStrikeValueInCollateral } from '../../utils/calculation';
import tracker from '../../utils/tracker';
import OpenVaultModal from './OpenVaultModal';

const Promise = require('bluebird');

function MyVaults({ user }) {
  useEffect(() => {
    tracker.pageview('/myvaults/');
  }, []);
  const [opendVaults, setOpenedVaults] = useState([]);
  const [tokensToOpen, setTokensToOpen] = useState([]);

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
    const openedVaults = [];
    const notOpenedTokens = [];
    await Promise.map(allOptions, async (option) => {
      const entry = userVaults.find((vault) => vault.optionsContract.address === option.addr);
      const isOpened = entry !== undefined;
      if (isOpened) {
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
          collateralDecimals: option.collateral.decimals,
          expiry: option.expiry,
          ratio,
        });
      } else if (option.expiry > (Date.now() / 1000)) {
        // only put non-expired token to "can open" list
        notOpenedTokens.push({
          oToken: option.addr,
          oTokenName: option.title,
        });
      }
    });
    setIsLoading(false);
    setOpenedVaults(openedVaults.sort(compareVaultRatio));
    setTokensToOpen(notOpenedTokens);
  }, [user, watchAddress, hasAddressConnected, isWatchMode]);

  return (
    <>
      <Header primary="My Vaults" />
      {hasAddressConnected ? (
        <>
          {opendVaults.length > 0 ? (
            <div style={{ paddingBottom: '3%' }}>

              <div style={{ display: 'flex' }}>
                <SectionTitle title="Existing Vaults" />
                <div style={{ marginLeft: 'auto' }}>
                  <div style={{ display: 'flex' }}>
                    <CheckBox
                      text="Expired"
                      checked={showExpired}
                      onCheck={(checked) => {
                        storePreference('showExpired', checked ? '1' : '0');
                        setShowExpired(checked);
                      }}
                    />
                    <CheckBox
                      text="Empty"
                      checked={showEmpty}
                      onCheck={(checked) => {
                        storePreference('showEmpty', checked ? '1' : '0');
                        setShowEmpty(checked);
                      }}
                    />
                  </div>
                </div>
              </div>

              <DataView
                fields={['Token', 'contract', 'collateral', 'Ratio', '']}
                entries={displayVaults}
                entriesPerPage={6}
                renderEntry={({
                  oToken, oTokenName, collateral, collateralDecimals, ratio,
                }) => [
                  oTokenName,
                  <IdentityBadge entity={oToken} />,
                  formatDigits(toTokenUnitsBN(collateral, collateralDecimals).toNumber(), 5),
                  formatDigits(ratio, 4),
                  <ManageVaultButton oToken={oToken} owner={isWatchMode ? watchAddress : user} />,
                ]}
              />
            </div>
          ) : isLoading ? (
            <Comment text="Loading" />
          ) : (
            <Comment text="No Opened Vaults" />
          )}
          {tokensToOpen.length > 0 && !isWatchMode ? (
            <div>
              <SectionTitle title="Open new vaults" />
              <DataView
                fields={['Token', 'contract', 'manage']}
                entries={tokensToOpen}
                renderEntry={({ oToken, oTokenName }) => {
                  const option = allOptions.find((o) => o.addr === oToken);
                  return [
                    oTokenName,
                    <IdentityBadge entity={oToken} shorten={false} />,
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
        // Not connected to wallet
        <NoWalletView
          watchAddress={watchAddress}
          setWatchAddress={setWatchAddress}
        />
      )}
    </>
  );
}

MyVaults.propTypes = {
  user: PropTypes.string.isRequired,
};

export default MyVaults;
