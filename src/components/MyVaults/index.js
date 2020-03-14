import React, { useState, useMemo } from 'react';

import { Header, DataView, IdentityBadge } from '@aragon/ui';
import { SectionTitle, ManageVaultButton, OpenVaultButton } from '../common';

import { getAllVaultsForUser } from '../../utils/graph';
import { getPrice } from '../../utils/infura'
import { options } from '../../constants/options';
import { fromWei, formatDigits, calculateRatio, compareVaultRatio } from '../../utils/number';

const Promise = require('bluebird');

function MyVaults({ user }) {
  const [opendVaults, setOpenedVaults] = useState([]);
  const [tokensToOpen, setTokensToOpen] = useState([]);
  const isConnected = user !== '';

  // Only request all vaults once
  useMemo(async () => {
    if (!isConnected) return;
    const userVaults = await getAllVaultsForUser(user);
    const opendVaults = [];
    const notOpenedTokens = [];
    await Promise.map(options, async(option) => {
      const entry = userVaults.find((vault) => vault.optionsContract.address === option.addr);
      const isOpened = entry !== undefined;
      if (isOpened) {

        const strikePriceInWei = await getPrice(option.oracle, option.strike);
        const ratio = calculateRatio(entry.collateral, entry.oTokensIssued, option.strikePrice, strikePriceInWei)
        opendVaults.push({
          oToken: option.addr,
          oTokenName: option.title,
          collateral: entry.collateral,
          ratio,
        });
      } else {
        notOpenedTokens.push({
          oToken: option.addr,
          oTokenName: option.title,
        });
      }
    })
    setOpenedVaults(opendVaults.sort(compareVaultRatio));
    setTokensToOpen(notOpenedTokens);
  }, [isConnected, user]);

  return (
    <>
      <Header  primary={'My Vaults'} />
      {isConnected ? (
        <>
          {opendVaults.length > 0 ? (
            <div style={{paddingBottom: '3%'}}>
              <SectionTitle title={'Existing Vaults'} />
              <DataView
                fields={['Token', 'contract', 'collateral', 'Ratio', '']}
                entries={opendVaults}
                entriesPerPage={6}
                renderEntry={({ oToken, oTokenName, collateral, ratio, decimals }) => {
                  return [
                    oTokenName,
                    <IdentityBadge entity={oToken} />,
                    formatDigits(fromWei(collateral), 5),
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
            <div >
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
        <div style={{padding: 5, opacity:0.5}}> Please connect wallet to proceed </div>
      )}
    </>
  );
}

export default MyVaults;
