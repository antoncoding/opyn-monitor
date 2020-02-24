import React from 'react';

import { useParams } from 'react-router-dom';

import VaultOwnerList from './VaultOwnerList';
import Overview from './VaultInfoBox';

function TokenView() {
  let { addr } = useParams();
  return (
    <>
      <Overview oToken={addr} />
      <VaultOwnerList oToken={addr} />
    </>
  );
}

export default TokenView;
