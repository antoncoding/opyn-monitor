import React, { useCallback } from 'react';
import { Button } from '@aragon/ui';
import { useHistory } from 'react-router-dom';
import { openVault } from '../../utils/web3';


function ManageVaultButton({ oToken, owner }) {
  const history = useHistory();

  const goToManagePage = useCallback(() => {
    history.push(`/manage/${oToken}/${owner}`);
  }, [history, oToken, owner]);

  return <Button onClick={() => goToManagePage()} label="Manage" />;
}

type openVaultButtonProps = {
  oToken: string,
  user: string,
  goToMangePage?: boolean
}

function OpenVaultButton({ oToken, user, goToMangePage = true }: openVaultButtonProps) {
  const history = useHistory();

  const openAndGoToVault = async () => {
    await openVault(oToken);
    if (goToMangePage) history.push(`/manage/${oToken}/${user}`);
  };

  return (
    <Button
      onClick={openAndGoToVault}
      label="Open"
    />
  );
}


export { ManageVaultButton, OpenVaultButton };
