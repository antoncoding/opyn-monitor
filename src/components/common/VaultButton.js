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


function OpenVaultButton({ oToken, user, goToMangePage = true }) {
  const history = useHistory();

  const openAndGoToVault = async () => {
    await openVault(oToken);
    if (goToMangePage) history.push(`/manage/${oToken}/${user}`);
  };

  return (
    <Button
      onClick={() => openAndGoToVault(oToken)}
      label="Open"
    />
  );
}

OpenVaultButton.propTypes = {
  oToken: PropTypes.string.isRequired,
  user: PropTypes.string.isRequired,
  goToMangePage: PropTypes.bool,
};

OpenVaultButton.defaultProps = {
  goToMangePage: true,
};

export { ManageVaultButton, OpenVaultButton };
