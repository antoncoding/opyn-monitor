import React from 'react';
import PropTypes from 'prop-types';
import { IdentityBadge } from '@aragon/ui';

function AddressBlock({ label, address }) {
  return (
    <>
      <div style={{ fontSize: 16, padding: 3 }}>{label}</div>
      <div style={{ padding: 5 }}>
        <IdentityBadge entity={address} shorten />
      </div>
    </>
  );
}

AddressBlock.propTypes = {
  label: PropTypes.string.isRequired,
  address: PropTypes.string.isRequired,
};

export default AddressBlock;
