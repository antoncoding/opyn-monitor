import React from 'react'
import { Button } from '@aragon/ui'
import { useHistory } from 'react-router-dom';
import { openVault } from '../../utils/web3'

function ManageVaultButton({ oToken, owner }) {
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

export { ManageVaultButton, OpenVaultButton }