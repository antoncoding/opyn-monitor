import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  TextInput, DataView, Button, LinkBase, EthIdenticon, useToast,
} from '@aragon/ui';
import { getPreference, checkAddressAndAddToStorage } from '../../utils/storage';

import { Comment } from '../common/index.ts';
import { isAddress } from '../../utils/number';
import { resolveENS } from '../../utils/infura';

function PleaseLogin({ setWatchAddress }) {
  const toast = useToast();
  const [InAddress, setAddress] = useState('');
  const watch_addrs = getPreference('watch_addresses', '[]');
  const usedAddresses = JSON.parse(watch_addrs);

  return (
    <>
      {/* <Header></Header> */}
      <Comment text="Please connect wallet to proceed or enter an address to use Watch Mode." />
      <br />
      <br />
      <p style={{ fontSize: 20 }}> Watch Mode </p>
      <Comment text="You won't be able to interact with any smart contract under Watch Mode." />
      <div style={{ display: 'flex' }}>
        <div style={{ width: '50%' }}>
          <TextInput
            placeholder="Ethereum address or ENS"
            value={InAddress}
            onChange={(e) => { setAddress(e.target.value.toLowerCase()); }}
            wide
          />

          {usedAddresses.length > 0 ? (
            <div style={{ paddingTop: '3%' }}>
              <DataView
                entries={usedAddresses.reverse()}
                fields={['used']}
                entriesPerPage={5}
                renderEntry={(address) => [
                  <LinkBase onClick={() => {
                    setWatchAddress(address);
                    checkAddressAndAddToStorage(address);
                  }}
                  >
                    {/* <IdentityBadge entity={address} /> */}
                    <EthIdenticon
                      address={address}
                      scale={1.3}
                      radius={5}
                    />
                    <span style={{ paddingLeft: 8, fontSize: 15, fontFamily: 'aragon-ui-monospace' }}>{address}</span>
                  </LinkBase>,
                ]}
              />
            </div>
          ) : <></>}
        </div>
        <div style={{ width: '8%', paddingLeft: '1%', paddingRight: '1%' }}>
          <Button
            label="Watch Address"
            onClick={async () => {
              if (isAddress(InAddress)) {
                setWatchAddress(InAddress);
                checkAddressAndAddToStorage(InAddress);
              } else {
                try {
                  const address = await resolveENS(InAddress);
                  setWatchAddress(address);
                  checkAddressAndAddToStorage(address);
                } catch (error) {
                  toast('Invalid Address');
                }
              }
            }}
          />
        </div>
      </div>
    </>
  );
}

PleaseLogin.propTypes = {
  // watchAddres: PropTypes.string.isRequired,
  setWatchAddress: PropTypes.func.isRequired,
};

export default PleaseLogin;
