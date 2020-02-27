import React from 'react';

import { DataView } from '@aragon/ui';

import { renderMyVaultRow } from './common'

function MyVault({ vaults, oToken, user }) {
  const myVault = vaults.find((vault) => vault.owner === user);
  return user === '' ? (
    <></> // not login
  ) : myVault === undefined ? (
    <></> // has no open vault
  ) : (
    <DataView
      heading={'Your Vault'}
      fields={['Owner', 'collateral', 'Issued', 'RATIO', 'Status', '']}
      entries={[myVault]}
      entriesPerPage={1}
      renderEntry={renderMyVaultRow}
    />
  );
}

export default MyVault;
