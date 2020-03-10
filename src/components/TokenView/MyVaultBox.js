import React from 'react';
import { useHistory } from 'react-router-dom';
import { DataView, Button, IdentityBadge } from '@aragon/ui';
import { SectionTitle, RatioTag } from '../common';
import { openVault } from '../../utils/web3'
import { fromWei, formatDigits } from '../../utils/number'

function MangeButton({ oToken, owner }) {
  const history = useHistory();
  const goToManagePage = (oToken, owner) => {
    history.push(`/manage/${oToken}/${owner}`);
  };
  return <Button onClick={() => goToManagePage(oToken, owner)} label='Manage'></Button>;
}

function OpenVaultButton({ oToken, user }) {

  const history = useHistory();

  const openAndGoToVault = () => {
    openVault(oToken)
    history.push(`/manage/${oToken}/${user}`);
  }

  return <Button 
    onClick={() => openAndGoToVault(oToken)} 
    label='Open Vault'
    />;
}

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
        renderEntry={({ owner, collateral, oTokensIssued, ratio, isSafe, oToken }) => {
          return [
            <IdentityBadge entity={owner} shorten={true} connectedAccount={true} />,
            formatDigits(fromWei(collateral), 6),
            oTokensIssued,
            ratio,
            <RatioTag isSafe={isSafe} ratio={ratio}/>,
            MangeButton({ oToken, owner }),
          ];
        }}
      />
    </>
  );
}

export default MyVault;
