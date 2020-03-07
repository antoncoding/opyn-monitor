import React from 'react'

import { IdentityBadge } from '@aragon/ui'

function AddressBlock({label, address}){

  return (
    <>
      <div style={{ fontSize: 16, padding: 3 }}> {label} </div>
      <div style={{ padding: 5 }}>
        <IdentityBadge entity={address} shorten={true} />
      </div>
    </>
  );
};

export default AddressBlock