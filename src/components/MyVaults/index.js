import React, { useState, useMemo } from 'react';

import { Header, DataView, IdentityBadge } from '@aragon/ui';
import { options, ETH_ADDRESS } from '../../constants/options';
import { SectionTitle, ManageVaultButton, OpenVaultButton } from '../common';
import { getAllVaultsForUser } from '../../utils/graph';
import { formatDigits, compareVaultRatio, toTokenUnitsBN } from '../../utils/number';
import { calculateRatio, calculateStrikeValueInCollateral } from '../../utils/calculation';
import { getDecimals } from '../../utils/infura';

const Promise = require('bluebird');

function MyVaults({ user }) {
  const [opendVaults, setOpenedVaults] = useState([]);
  const [tokensToOpen, setTokensToOpen] = useState([]);
  const isConnected = user !== '';

  // Only request all vaults once
  useMemo(async () => {
    if (!isConnected) return;
    const userVaults = await getAllVaultsForUser(user);
    const openedVaults = [];
    const notOpenedTokens = [];
    await Promise.map(options, async (option) => {
      const entry = userVaults.find((vault) => vault.optionsContract.address === option.addr);
      const isOpened = entry !== undefined;
      const collatearlIsETH = option.collateral === ETH_ADDRESS;
      if (isOpened) {
        const collateralDecimals = collatearlIsETH ? 18 : await getDecimals(option.collateral);
        const strikeValueInCollateral = await calculateStrikeValueInCollateral(
          option.collateral,
          option.strike,
          option.oracle,
          collateralDecimals
        );
        const ratio = calculateRatio(
          entry.collateral,
          entry.oTokensIssued,
          option.strikePrice,
          strikeValueInCollateral
        );
        openedVaults.push({
          oToken: option.addr,
          oTokenName: option.title,
          collateral: entry.collateral,
          collateralDecimals: collateralDecimals,
          ratio,
        });
      } else {
        notOpenedTokens.push({
          oToken: option.addr,
          oTokenName: option.title,
        });
      }
    });
    setOpenedVaults(openedVaults.sort(compareVaultRatio));
    setTokensToOpen(notOpenedTokens);
  }, [isConnected, user]);

  return (
    <>
      <Header primary={'My Vaults'} />
      {isConnected ? (
        <>
          {opendVaults.length > 0 ? (
            <div style={{ paddingBottom: '3%' }}>
              <SectionTitle title={'Existing Vaults'} />
              <DataView
                fields={['Token', 'contract', 'collateral', 'Ratio', '']}
                entries={opendVaults}
                entriesPerPage={6}
                renderEntry={({ oToken, oTokenName, collateral, collateralDecimals, ratio }) => {
                  return [
                    oTokenName,
                    <IdentityBadge entity={oToken} />,
                    formatDigits(toTokenUnitsBN(collateral, collateralDecimals).toNumber(), 5),
                    formatDigits(ratio, 4),
                    <ManageVaultButton oToken={oToken} owner={user} />,
                  ];
                }}
              />
            </div>
          ) : (
            <></>
          )}
          {tokensToOpen.length > 0 ? (
            // Show vaults to open
            <div>
              <SectionTitle title={'Open new vaults'} />
              <DataView
                fields={['Token', 'contract', 'manage']}
                entries={tokensToOpen}
                renderEntry={({ oToken, oTokenName }) => {
                  return [
                    oTokenName,
                    <IdentityBadge entity={oToken} shorten={false} />,
                    <OpenVaultButton oToken={oToken} user={user} />,
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
        <div style={{ padding: 5, opacity: 0.5 }}> Please connect wallet to proceed </div>
      )}
    </>
  );
}

export default MyVaults;
