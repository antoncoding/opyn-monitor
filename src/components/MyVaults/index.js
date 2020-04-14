import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';

import { Header, DataView, IdentityBadge } from '@aragon/ui';
import NoWalletView from './NoWallet';

import { allOptions } from '../../constants/options';
import {
  SectionTitle, ManageVaultButton, OpenVaultButton, Comment,
} from '../common';
import { getAllVaultsForUser } from '../../utils/graph';
import {
  formatDigits, compareVaultRatio, toTokenUnitsBN,
} from '../../utils/number';
import { calculateRatio, calculateStrikeValueInCollateral } from '../../utils/calculation';

const Promise = require('bluebird');

function MyVaults({ user }) {
  const [opendVaults, setOpenedVaults] = useState([]);
  const [tokensToOpen, setTokensToOpen] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  // enable not logged in user to use this feature
  const [watchAddress, setWatchAddress] = useState('');
  const isWatchMode = user === '' && watchAddress !== '';
  const hasAddressConnected = user !== '' || watchAddress !== '';

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
          option.collateral,
          option.strike,
          option.oracle,
          option.collateralDecimals,
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
          collateralDecimals: option.collateralDecimals,
          ratio,
        });
      } else if (option.expiry > (Date.now() / 1000)) {
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
              <SectionTitle title="Existing Vaults" />
              <DataView
                fields={['Token', 'contract', 'collateral', 'Ratio', '']}
                entries={opendVaults}
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
                renderEntry={({ oToken, oTokenName }) => [
                  oTokenName,
                  <IdentityBadge entity={oToken} shorten={false} />,
                  <OpenVaultButton oToken={oToken} user={user} />,
                ]}
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
