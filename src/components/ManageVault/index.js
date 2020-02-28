import React from 'react';

import { useParams } from 'react-router-dom';

import ManageMyVault from './Manage'

function ManageVault({user}) {
  let { token, owner } = useParams();

  return (
    <>
      <ManageMyVault owner={owner} user={user} token={token}/>
    </>
  );
}

export default ManageVault;
