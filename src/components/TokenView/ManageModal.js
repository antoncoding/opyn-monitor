import React, { useState, useEffect } from 'react';

import {  addETHCollateral, burnOToken } from '../../utils/web3';

import { getDecimals } from '../../utils/infura';
import { createTag } from './common'

import {
  Button,
  Modal,
  Box,
  TextInput,
  IdentityBadge,
  IconEthereum,
  IconCirclePlus,
  IconCircleMinus,
  Header,
  DataView,
  Split
} from '@aragon/ui';

function ManageModal({ oToken, owner, collateral, isSafe, oTokensIssued, ratio }) {
  const [opened, setOpened] = useState(false);
  const [addValue, setAddValue] = useState(0);

  const [decimals, setTokenDecimals] = useState(0)
  const [burnAmt, setBurnAmt] = useState(0);
  const open = () => setOpened(true);
  const close = () => setOpened(false);

  useEffect(
    () =>
      async function() {
        const _decimals = await getDecimals(oToken)
        setTokenDecimals(_decimals)
      }
  );

  return (
    <>
    <Button onClick={open} label='Manage'></Button>
    <Modal width={800} padding={50} visible={opened} onClose={close}>
      <Header> Manage My Position </Header>
        <Box heading={'Owner'}>
          <IdentityBadge entity={owner} shorten={false} />
        </Box>
        <DataView
          fields={['Collateral', 'Issued', 'ratio', 'Status']}
          entries={[{ collateral, isSafe, oTokensIssued, ratio }]}
          entriesPerPage={1}
          renderEntry={({ collateral, isSafe, oTokensIssued, ratio }) => {
            return [collateral, oTokensIssued, ratio, createTag(isSafe, ratio)];
          }}
        />
        <br></br>
        <Box heading={ <> Increase Ratio <IconCirclePlus/>  </> }>
        <Split
          primary={
            <TextInput
            type='number'
            wide={true}
            adornment={<IconEthereum />}
            adornmentPosition='end'
            value={addValue}
            onChange={(event) => {
              setAddValue(event.target.value);
            }}
          />
          }
          secondary={
            <Button
            wide={true}
            label= {'Add Collateral'}
            onClick={() => {
              addETHCollateral(oToken, owner, addValue);
            }}
          />
          }
        />

        <Split
          primary={
            <TextInput
            type='number'
            wide={true}
            adornment={<IconCircleMinus />}
            adornmentPosition='end'
            value={burnAmt}
            onChange={(event) => {
              setBurnAmt(event.target.value);
            }}
          />
          }
          secondary={
            <Button
            wide={true}
            label='Burn oToken'
            onClick={() => {
              burnOToken(oToken, burnAmt*10**decimals);
            }}
          />
          }
        />
          
        </Box>
        
      </Modal>
    </>
  );
}

export default ManageModal;
