import React, { useState, useEffect } from 'react';

import { addETHCollateral, liquidate, getAccounts } from '../../utils/web3';
import { getMaxLiquidatable, getDecimals } from '../../utils/infura';

import { createTag } from './common';

import {
  Header,
  Button,
  Modal,
  Box,
  Split,
  TextInput,
  IdentityBadge,
  IconEthereum,
  IconFundraising,
  DataView,
} from '@aragon/ui';

function PositionModal({ oToken, owner, collateral, isSafe, oTokensIssued, ratio }) {
  const [opened, setOpened] = useState(false);
  const [decimals, setTokenDecimals] = useState(0);
  const [addValue, setAddValue] = useState(0);
  const [liquidateAmt, setLiquidateAmt] = useState(0);
  const open = () => setOpened(true);
  const close = () => setOpened(false);

  useEffect(() =>{
    let isCancelled = false
    async function getData(){    
      const accounts = await getAccounts();
      const maxLiquidatable = await getMaxLiquidatable(oToken, owner, accounts[0]);
      const _decimals = await getDecimals(oToken);
      if(!isCancelled){
        setTokenDecimals(_decimals);
        setLiquidateAmt(maxLiquidatable / 10 ** _decimals);
      }
    }
    getData()

    // clean up function
    return ()=>{
      isCancelled = true
    }
  }, [oToken, owner]);

  return (
    <>
      <Button onClick={open} label='More'></Button>
      <Modal width={800} padding={50} visible={opened} onClose={close}>
        <Header primary={'Access Position'}/>
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
        <Box heading={'Add Collateral'}>
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
                label='Add Collateral'
                wide={true}
                onClick={() => {
                  addETHCollateral(oToken, owner, addValue);
                }}
              />
            }
          />
        </Box>

        <br></br>
        <Box heading={'Liquidate'}>
          <Split
            primary={
              <TextInput
                wide={true}
                type='number'
                adornment={<IconFundraising />}
                adornmentPosition='end'
                value={liquidateAmt}
                onChange={(event) => {
                  setLiquidateAmt(event.target.value);
                }}
              />
            }
            secondary={
              <Button
                wide={true}
                disabled={isSafe}
                label='Liquidate'
                onClick={() => {
                  liquidate(oToken, owner, liquidateAmt * 10 ** decimals);
                }}
              />
            }
          />
        </Box>
      </Modal>
    </>
  );
}

export default PositionModal;
