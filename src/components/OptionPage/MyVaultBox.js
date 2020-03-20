import React from 'react';
import { DataView, IdentityBadge } from '@aragon/ui';
import { SectionTitle, RatioTag, OpenVaultButton, ManageVaultButton } from '../common';

import { fromWei, formatDigits } from '../../utils/number'


function MyVault({ vaults, oToken, user }) {
  const myVault = vaults.find((vault) => vault.owner === user);
  return user === '' ?
  <></> :
  myVault === undefined ? (
    <>
      <SectionTitle title={'No Vault Yet'} />
      <DataView
        fields={['Owner', 'collateral', 'Issued', 'RATIO', 'Status', '']}
        entries={[{}]}
        entriesPerPage={1}
        renderEntry={() => {
          return [
            <IdentityBadge entity={user} shorten={true} connectedAccount={true} />,
            '-',
            '-',
            '-',
            '-',
            OpenVaultButton({ oToken, user}),
          ];
        }}
      />
    </> // has no open vault
  ) : (
    <>
      <SectionTitle title={'My Vault'} />
      <DataView
        fields={['Owner', 'collateral', 'Issued', 'RATIO', 'Status', '']}
        entries={[myVault]}
        entriesPerPage={1}
        renderEntry={({ owner, collateral, oTokensIssued, ratio, isSafe }) => {
          return [
            <IdentityBadge entity={owner} shorten={true} connectedAccount={true} />,
            formatDigits(fromWei(collateral), 6),
            formatDigits(oTokensIssued, 6),
            formatDigits(ratio, 5),
            <RatioTag isSafe={isSafe} ratio={ratio}/>,
            <ManageVaultButton oToken={oToken} owner={owner} />
          ];
        }}
      />
    </>
  );
}

export default MyVault;
