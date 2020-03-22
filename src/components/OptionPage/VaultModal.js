import React, { useState, useEffect } from 'react';

import { liquidate, addERC20Collateral, addETHCollateral } from '../../utils/web3';
import { getMaxLiquidatable } from '../../utils/infura';
import { toTokenUnitsBN, toBaseUnitBN, formatDigits } from '../../utils/number';
import { RatioTag } from '../common';

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

/**
 * 
 * @param {{collateral: string, oTokensIssued: string collateralDecimals:Number, decimals:Number}} param0 
 */
function VaultModal({ useCollateral, oToken, owner, collateral, isSafe, oTokensIssued, ratio, decimals, collateralAsset, collateralIsETH, collateralDecimals }) {
  const [opened, setOpened] = useState(false);
  const [addValue, setAddValue] = useState(0);
  const [liquidateAmt, setLiquidateAmt] = useState(0);
  const open = () => setOpened(true);
  const close = () => setOpened(false);

  useEffect(() => {
    let isCancelled = false;
    async function getData() {
      if (!opened) return;
      const maxLiquidatable = await getMaxLiquidatable(oToken, owner);
      if (!isCancelled) {
        setLiquidateAmt(toTokenUnitsBN(maxLiquidatable, decimals).toNumber());
      }
    }
    getData();

    return () => {
      isCancelled = true;
    };
  }, [decimals, oToken, opened, owner]);

  return (
    <>
      <Button onClick={open} label='More'></Button>
      <Modal width={800} padding={50} visible={opened} onClose={close}>
        <Header primary={'Access Position'} />
        <Box heading={'Owner'}>
          <IdentityBadge entity={owner} shorten={false} />
        </Box>
        <DataView
          fields={['Collateral', 'Issued', 'ratio', 'Status']}
          entries={[{ collateral, isSafe, oTokensIssued, ratio }]}
          entriesPerPage={1}
          renderEntry={({ collateral, isSafe, oTokensIssued, ratio }) => {
            return [
              formatDigits(toTokenUnitsBN(collateral, collateralDecimals), 5), 
              formatDigits(toTokenUnitsBN(oTokensIssued, decimals), 5),
              ratio, 
              RatioTag({ isSafe, ratio, useCollateral })
            ];
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
                  collateralIsETH 
                  ? addETHCollateral(oToken, owner, addValue)
                  : addERC20Collateral(collateralAsset, oToken, owner, toBaseUnitBN(addValue, collateralDecimals).toString())}}
              />
            }
          />
        </Box>

        <br></br>
        { useCollateral ? <Box heading={'Liquidate'}>
          <Split
            primary={
              <>
                {/* <BalanceBlock /> */}
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
              </>
            }
            secondary={
              <Button
                wide={true}
                disabled={isSafe}
                label='Liquidate'
                onClick={() => {
                  liquidate(
                    oToken, 
                    owner, 
                    toBaseUnitBN(liquidateAmt,decimals)
                  );
                }}
              />
            }
          />
        </Box>  : <></>}
        
      </Modal>
    </>
  );
}

export default VaultModal;
