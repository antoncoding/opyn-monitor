import React from 'react';

import { useParams } from 'react-router-dom';

import VaultsList from './VaultsList';
import OptionInfoBox from './OptionInfoBox';

function OptionPage({user}) {
  let { token } = useParams();
  return (
    <>
      <OptionInfoBox oToken={token} user={user} />
      <VaultsList oToken={token} user={user}/>
    </>
  );
}

export default OptionPage;
