import React from 'react';

import { useHistory } from 'react-router-dom';

import {
  Button
} from '@aragon/ui';

function MangeButton({ oToken, owner, collateral, isSafe, oTokensIssued, ratio }) {
  const history = useHistory();

  const manage = (oToken, owner) => {
    history.push(`/manage/${oToken}/${owner}`);
  };

  return <Button onClick={() => manage(oToken, owner)} label='Manage'></Button>;
}

export default MangeButton;
