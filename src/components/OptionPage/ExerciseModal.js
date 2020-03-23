import React, { useState, useMemo } from 'react';

import { exercise } from '../../utils/web3';
import { PriceSection } from '../common';
import { getUnderlyingRequiredToExercise, getBalance, getTokenBalance } from '../../utils/infura';
import { toTokenUnitsBN, toBaseUnitBN, formatDigits, compareVaultIssued } from '../../utils/number';

import {
  Header,
  Button,
  Modal,
  Box,
  Split,
  TextInput,
  IdentityBadge,
  DataView,
} from '@aragon/ui';
import BigNumber from 'bignumber.js';

/**
 *
 * @param {{
 * oToken: string,
 * option: { decimals: number, underlying:string }
 * collateralDecimals: Number
 * underlyingDecimals: Number
 * underlyingSymbol: string
 * vaults: { collateral:string, oTokensIssued: string, owner:string, symbol:string }[]
 * underlyingIsETH: boolean
 * }} param0
 */
function ExerciseModal({
  user,
  oToken,
  option,
  vaults,
  collateralDecimals,
  underlyingDecimals,
  underlyingSymbol,
  underlyingIsETH,
}) {
  const [userUnderlyingBalance, setUserUnderlyingBalance] = useState(new BigNumber(0));
  const [userOTokenBalance, setUserOTokenBalance] = useState(new BigNumber(0));

  const [opened, setOpened] = useState(false);

  const [exerciseAmount, setExerciseAmount] = useState(new BigNumber(0));
  const [underlyringRequired, setUnderlyringRequired] = useState(new BigNumber(0));

  const nonEmptyVaults = vaults
    .filter((vault) => parseInt(vault.collateral) > 0)
    .sort(compareVaultIssued);

  const [selectedIndexes, setSelectedIndexes] = useState([]);
  const [selectedHasEnoughCollateral, setHasEnoughCollateral] = useState(false);

  const open = () => setOpened(true);
  const close = () => setOpened(false);

  // Update user balance
  useMemo(async () => {
    if (!user) return;
    let userUnderlying;
    if (underlyingIsETH) {
      userUnderlying = new BigNumber(await getBalance(user));
    } else {
      userUnderlying = toTokenUnitsBN(
        await getTokenBalance(option.underlying, user),
        underlyingDecimals
      );
    }
    const userOTokenBalance = toTokenUnitsBN(await getTokenBalance(oToken, user), option.decimals);

    setUserUnderlyingBalance(userUnderlying);
    setUserOTokenBalance(userOTokenBalance);
  }, [oToken, option.decimals, option.underlying, underlyingDecimals, underlyingIsETH, user]);

  const onSelectEntries = (entries, indexes) => {
    setSelectedIndexes(indexes);
    checkHasEnoughToken(entries);
  };

  /**
   * Set selectedHasEnoughCollateral according to selected entries
   * @param {{oTokenIssued: string}[]} entries
   */
  const checkHasEnoughToken = (entries) => {
    const sumIssued = entries.reduce((accumulator, current) => {
      return accumulator.plus(new BigNumber(current.oTokensIssued));
    }, new BigNumber(0));
    if (sumIssued.gt(new BigNumber(0)) && sumIssued.gte(toBaseUnitBN(exerciseAmount, option.decimals))) {
      setHasEnoughCollateral(true);
    } else {
      setHasEnoughCollateral(false);
    }
  };

  const onChangeExerciseAmt = async (amount) => {
    if (!amount) {
      setExerciseAmount(new BigNumber(0));
      setUnderlyringRequired(new BigNumber(0));
      return;
    }
    const exerciseAmount = new BigNumber(amount);
    setExerciseAmount(exerciseAmount);
    const underlyingRawAmt = await getUnderlyingRequiredToExercise(
      oToken,
      toBaseUnitBN(exerciseAmount, option.decimals).toString()
    );
    const underlyingRequired = toTokenUnitsBN(underlyingRawAmt, underlyingDecimals);
    setUnderlyringRequired(underlyingRequired);

    // check current selection has enought tokens
    const entries = selectedIndexes.map((index) => nonEmptyVaults[index]);
    checkHasEnoughToken(entries);
  };

  return (
    <>
      {/* Button */}
      <Button onClick={open} label='Claim'></Button>

      {/* Modal */}
      <Modal width={800} padding={50} visible={opened} onClose={close}>
        <Header
          primary={'Exercise Option'}
          secondary={
            <div style={{ display: 'flex' }}>
              <PriceSection
                label={`Balance:`}
                amt={userOTokenBalance}
                symbol={option.symbol}
                forceDisplay={true}
              />
              <PriceSection label={' +'} amt={userUnderlyingBalance} symbol={underlyingSymbol} />
            </div>
          }
        />
        <Box heading={'Amount to Exercise'}>
          <Split
            primary={
              <>
                <TextInput
                  type='number'
                  wide={true}
                  adornment={option.symbol}
                  adornmentPosition='end'
                  value={exerciseAmount.toNumber()}
                  onChange={(event)=>onChangeExerciseAmt(event.target.value)}
                />
              </>
            }
            secondary={
              <div style={{ paddingTop: 5 }}>
                <PriceSection
                  label={'+ Underlyring'}
                  amt={underlyringRequired.toNumber()}
                  symbol={underlyingSymbol}
                />
              </div>
            }
          />
        </Box>
        <DataView
          mode='table'
          renderSelectionCount={(count) => `${count} vaults selected`}
          fields={['Owner', 'Issued', 'collateral']}
          entries={nonEmptyVaults}
          entriesPerPage={5}
          selection={selectedIndexes}
          onSelectEntries={onSelectEntries}
          renderEntry={({ owner, collateral, oTokensIssued }) => {
            return [
              <IdentityBadge entity={owner} />,
              formatDigits(toTokenUnitsBN(oTokensIssued, option.decimals).toNumber(), 5),
              formatDigits(toTokenUnitsBN(collateral, collateralDecimals).toNumber(), 5),
            ];
          }}
        />
        <br></br>
        <Button
          label='Exercise'
          disabled={!selectedHasEnoughCollateral}
          wide={true}
          onClick={async () => {
            const vaultowners = selectedIndexes.map((index) => vaults[index].owner);
            exercise(
              oToken,
              option.underlying,
              toBaseUnitBN(exerciseAmount, option.decimals).toString(),
              vaultowners
            );
          }}
        />
      </Modal>
    </>
  );
}

export default ExerciseModal;
