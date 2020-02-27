import React, { useState, useEffect } from 'react';

import { addETHCollateral, liquidate, getAccounts } from '../../utils/web3';
import { getMaxLiquidatable, getDecimals } from '../../utils/infura';

import {
  Button,
  Modal,
  Box,
  TextInput,
  IdentityBadge,
  IconEthereum,
  IconFundraising,
} from '@aragon/ui';

function PositionModal({ tokenAddress, vaultOwner, collateral, isSafe, oTokensIssued, ratio }) {
  const [opened, setOpened] = useState(false);
  const [decimals, setTokenDecimals] = useState(0)
  const [addValue, setAddValue] = useState(0);
  const [liquidateAmt, setLiquidateAmt] = useState(0);
  const open = () => setOpened(true);
  const close = () => setOpened(false);

  useEffect(
    () =>
      async function() {
        const accounts = await getAccounts();
        const maxLiquidatable = await getMaxLiquidatable(tokenAddress, vaultOwner, accounts[0]);
        const _decimals = await getDecimals(tokenAddress)
        setTokenDecimals(_decimals)
        setLiquidateAmt(maxLiquidatable / 10 ** _decimals );
      }
  );

  return (
    <>
      <Button onClick={open} label='Manage'></Button>
      <Modal 
        width={Math.min(window.innerWidth - 48, 750)}
      padding={50} visible={opened} onClose={close}>
        <Box heading={'Owner'}>
          <IdentityBadge entity={vaultOwner} shorten={false} />
        </Box>
        <br></br>
        <Box heading={'Add Collateral'}>
          <TextInput
            type='number'
            adornment={<IconEthereum />}
            adornmentPosition='end'
            value={addValue}
            onChange={(event) => {
              setAddValue(event.target.value);
            }}
          />
          <Button
            label='Add Collateral'
            onClick={() => {
              addETHCollateral(tokenAddress, vaultOwner, addValue);
            }}
          />
        </Box>

        <br></br>
        <Box heading={'Liquidate'}>
          <TextInput
            type='number'
            adornment={<IconFundraising />}
            adornmentPosition='end'
            value={ liquidateAmt }
            onChange={(event) => {
              setLiquidateAmt(event.target.value);
            }}
          />
          <Button
            disabled={isSafe}
            label='Liquidate'
            onClick={() => {
              liquidate(tokenAddress, vaultOwner, liquidateAmt * (10 ** decimals) );
            }}
          />
        </Box>
      </Modal>
    </>
  );
}

export default PositionModal;
