import React from 'react';

import { useParams } from 'react-router-dom';

import VaultOwnerList from './VaultOwnerList';
import Overview from './VaultInfoBox';

function TokenView({user}) {
  let { addr } = useParams();
  return (
    <>
      <Overview oToken={addr} user={user} />
      <VaultOwnerList oToken={addr} user={user}/>
    </>
  );
}

export default TokenView;
