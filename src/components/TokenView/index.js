import React from 'react';

import { useParams } from 'react-router-dom';

import VaultsList from './VaultsList';
import OptionInfoBox from './OptionInfoBox';

function TokenView({user}) {
  let { addr } = useParams();
  return (
    <>
      <OptionInfoBox oToken={addr} user={user} />
      <VaultsList oToken={addr} user={user}/>
    </>
  );
}

export default TokenView;
