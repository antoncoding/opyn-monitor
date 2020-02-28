import React from 'react';
import { useHistory } from 'react-router-dom';

import { DataView, Button, IdentityBadge } from '@aragon/ui';
import { createTag } from './common';

function MangeButton({ oToken, owner }) {
  const history = useHistory();
  const goToManagePage = (oToken, owner) => {
    history.push(`/manage/${oToken}/${owner}`);
  };
  return <Button onClick={() => goToManagePage(oToken, owner)} label='Manage'></Button>;
}

function MyVault({ vaults, oToken, user }) {
  const myVault = vaults.find((vault) => vault.owner === user);
  return user === '' ? (
    <></> // not login
  ) : myVault === undefined ? (
    <></> // has no open vault
  ) : (
    <DataView
      heading={'My Vault'}
      fields={['Owner', 'collateral', 'Issued', 'RATIO', 'Status', '']}
      entries={[myVault]}
      entriesPerPage={1}
      renderEntry={({ owner, collateral, oTokensIssued, ratio, isSafe, oToken }) => {
        return [
          <IdentityBadge entity={owner} shorten={true} connectedAccount={true} />,
          collateral,
          oTokensIssued,
          ratio,
          createTag(isSafe, ratio),
          MangeButton({ oToken, owner }),
        ];
      }}
    />
  );
}

export default MyVault;
