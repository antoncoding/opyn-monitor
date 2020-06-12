import React, { useState, useMemo, useEffect, ChangeEvent } from 'react';
import { useHistory } from 'react-router-dom';

import {
  Header,
  Button,
  Modal,
  Card,
  TextInput,
  useToast,
} from '@aragon/ui';

import BigNumber from 'bignumber.js';
import {
  SectionTitle, OpenVaultButton, Comment, HelperText, WarningText,
} from '../common';
import * as types from '../../types';

import { openVaultAddCollateralAndMint } from '../../utils/web3';
import { toBaseUnitBN } from '../../utils/number';
import { calculateStrikeValueInCollateral, calculateRatio } from '../../utils/calculation';

type openVaultModalProps = {
  user: string,
  option: types.option
}

function OpenVaultModal({ user, option }: openVaultModalProps) {
  const toast = useToast();
  const history = useHistory();

  const [opened, setOpened] = useState(false);

  // for Open vault, add collateral and mint tokens
  const [collateralAmt, setCollateralAmt] = useState(new BigNumber(0));
  const [mintTokenAmt, setMintTokenAmt] = useState(new BigNumber(0));

  const [strikeValueInCollateral, setStrikeValueInCollateral] = useState(new BigNumber(0));
  const [ratio, setRatio] = useState(1);

  useMemo(async () => {
    if (!opened) return;
    const strikeValueInColltrl = await calculateStrikeValueInCollateral(
      option.collateral.addr,
      option.strike.addr,
      option.oracle,
      option.collateral.decimals,
    );
    setStrikeValueInCollateral(strikeValueInColltrl);
  },
  [option, opened]);

  //  when input changed
  useEffect(() => {
    // calculate new ratio
    const newRatio = calculateRatio(
      toBaseUnitBN(collateralAmt, option.collateral.decimals),
      toBaseUnitBN(mintTokenAmt, option.decimals),
      option.strikePrice,
      strikeValueInCollateral,
    );
    setRatio(newRatio);
  },
  [collateralAmt, mintTokenAmt, strikeValueInCollateral, option]);

  const onCollateralChange = (value) => {
    if (!value) {
      setCollateralAmt(new BigNumber(0));
      return;
    }
    const amtBn = new BigNumber(value);
    setCollateralAmt(amtBn);
  };

  const onMintTokenAmtChange = (value) => {
    if (!value) {
      setMintTokenAmt(new BigNumber(0));
      return;
    }
    setMintTokenAmt(new BigNumber(value));
  };

  // update mint token amount when collateral change
  useEffect(()=>{
    if(option.title === 'insurance') return 
    if(option.type === 'put') {
      const newAmountMinted = collateralAmt.div((option as types.ETHOption).strikePriceInUSD)
      setMintTokenAmt(newAmountMinted)
    } else {
      const newAmountMinted = collateralAmt.times((option as types.ETHOption).strikePriceInUSD)
      setMintTokenAmt(newAmountMinted)
    }
  }, [option, collateralAmt])

  const mint = async () => {
    if (ratio < option.minRatio) {
      toast(`Collateral ratio must > ${option.minRatio}`);
      return;
    }
    await openVaultAddCollateralAndMint(
      option.addr,
      option.collateral.addr,
      toBaseUnitBN(collateralAmt, option.collateral.decimals).toString(),
      toBaseUnitBN(mintTokenAmt, option.decimals).toString(),
    );
    history.push(`/manage/${option.addr}/${user}`);
  };

  const open = () => setOpened(true);
  const close = () => setOpened(false);

  return (
    <>
      {/* Button */}
      <Button onClick={open} label="Open Vault" />

      {/* Modal */}
      <Modal width={800} padding={50} visible={opened} onClose={close}>
        <Header primary="Open Vault" />
        <Comment text="Select how you want to open a vault." />
        {/* <div style={{ display: 'flex' }}> */}
        {/* <div style={{ width: '30%' }}> */}
        <Card height="300" width="729">
          <SectionTitle title="Open Empty Vault" />
          <Comment text="You can add collateral and mint tokens later." />
          <br />
          <OpenVaultButton oToken={option.addr} user={user} goToMangePage />
          <br />
        </Card>
        <br />

        {/* Option C, Create, add and mint */}
        <Card height="300" width="729">
          <SectionTitle title="Add Collateral and Mint Tokens" />
          <Comment text="Open vault, add collateral and mint some options in one transaction." />
          <div style={{ display: 'flex', paddingBottom: 15 }}>
            <TextInput
              type="number"
              value={collateralAmt.toNumber()}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => onCollateralChange(event.target.value)}
              adornmentPosition="end"
              adornment={option.collateral.symbol}
            />
            <div style={{ paddingLeft: 15 }}>
              <TextInput
                type="number"
                value={mintTokenAmt.toNumber()}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => onMintTokenAmtChange(event.target.value)}
                adornmentPosition="end"
                adornment={option.symbol.length > 10 ? option.symbol.split(' ')[0] : option.symbol}
              />
            </div>
          </div>
          { option.type === 'call'
            ? <WarningText text={`1 ${option.collateral.symbol} can create ${(option as types.ETHOption).strikePriceInUSD} ${option.symbol}`} />
            : <></>}
          <Button label="Mint" onClick={mint} />
          { ratio === Infinity
            ? <> </>
            : <HelperText label="Collateral Ratio " amt={ratio.toString()} />}

          <br />
        </Card>
      </Modal>
    </>
  );
}

export default OpenVaultModal;
