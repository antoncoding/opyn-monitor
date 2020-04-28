import React from 'react';
import { IdentityBadge } from '@aragon/ui';

type AddressBlockProps = {
  label:string,
  address: string
}

function AddressBlock({ label, address }: AddressBlockProps) {
  return (
    <>
      <div style={{ fontSize: 16, padding: 3 }}>{label}</div>
      <div style={{ padding: 5 }}>
        <IdentityBadge entity={address} shorten />
      </div>
    </>
  );
}

export default AddressBlock;
