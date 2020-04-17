import React, { useState, useMemo } from 'react';
import BigNumber from 'bignumber.js';
import PropTypes from 'prop-types';

import {
  Modal, Button, TextInput, Split,
} from '@aragon/ui';
import { BalanceBlock, SectionTitle } from '../common';

import { getBalance } from '../../utils/infura';
import { wrapETH, unwrapETH } from '../../utils/web3';
import { toBaseUnitBN, toTokenUnitsBN } from '../../utils/number';

function WrapETHModal({ wethBalance, user }) {
  const [opened, setOpen] = useState(false);
  const [wrapAmount, setWrapAmount] = useState(BigNumber(0));
  const [unWrapAmount, setUnwrapAmount] = useState(BigNumber(0));
  const [userETHBalance, setUserETHBalance] = useState(BigNumber(0));

  useMemo(async () => {
    if (user === '') return;
    const balance = await getBalance(user);
    setUserETHBalance(new BigNumber(balance));
  }, user);

  const onChangeWrapAmount = (event) => {
    const amount = event.target.value;
    if (!amount) {
      setWrapAmount(new BigNumber(0));
      return;
    }
    setWrapAmount(new BigNumber(amount));
  };

  const onChangeUnWrapAmount = (event) => {
    const amount = event.target.value;
    if (!amount) {
      setUnwrapAmount(new BigNumber(0));
      return;
    }
    setUnwrapAmount(new BigNumber(amount));
  };

  return (
    <>
      <Button label="Wrap ETH!" onClick={() => setOpen(true)} />
      <Modal width={600} padding={50} visible={opened} onClose={() => { setOpen(false); }}>
        <SectionTitle title="Wrap ETH to WETH" />
        {/* <div style={{ display: 'flex' }}> */}
        <div style={{ padding: '2%' }}>
          <BalanceBlock asset="ETH Balance" balance={userETHBalance.toNumber()} />
        </div>

        {/* </div> */}
        <Split
          primary={<TextInput wide type="number" value={wrapAmount.toNumber()} onChange={onChangeWrapAmount} />}
          secondary={(
            <Button
              onClick={() => {
                wrapETH(toBaseUnitBN(wrapAmount, 18).toString());
              }}
              label="Wrap"
            />
          )}
        />
        <br />
        <SectionTitle title="Unwrap WETH" />
        {/* <div style={{ width: '40%' }}> */}
        <div style={{ padding: '2%' }}>
          <BalanceBlock asset="WETH Balance" balance={toTokenUnitsBN(wethBalance, 18).toNumber()} />
        </div>
        <Split
          primary={<TextInput wide type="number" value={unWrapAmount.toNumber()} onChange={onChangeUnWrapAmount} />}
          secondary={(
            <Button
              onClick={() => {
                unwrapETH(toBaseUnitBN(unWrapAmount, 18).toString());
              }}
              label="Unwrap"
            />
          )}
        />
      </Modal>
    </>
  );
}


WrapETHModal.propTypes = {
  wethBalance: PropTypes.instanceOf(BigNumber).isRequired,
  user: PropTypes.string.isRequired,
};

export default WrapETHModal;
