import React from 'react';
import { Button } from '@aragon/ui';
import { useHistory } from 'react-router-dom';
import PropTypes from 'prop-types';
import { openVault } from '../../utils/web3';


function ManageVaultButton({ oToken, owner }) {
  const history = useHistory();

  const goToManagePage = () => {
    history.push(`/manage/${oToken}/${owner}`);
  };

  return <Button onClick={() => goToManagePage(oToken, owner)} label="Manage" />;
}

ManageVaultButton.propTypes = {
  oToken: PropTypes.string.isRequired,
  owner: PropTypes.string.isRequired,
};


function OpenVaultButton({ oToken, user }) {
  const history = useHistory();

  const openAndGoToVault = () => {
    openVault(oToken);
    history.push(`/manage/${oToken}/${user}`);
  };

  return (
    <Button
      onClick={() => openAndGoToVault(oToken)}
      label="Open Vault"
    />
  );
}

OpenVaultButton.propTypes = {
  oToken: PropTypes.string.isRequired,
  user: PropTypes.string.isRequired,
};

export { ManageVaultButton, OpenVaultButton };
