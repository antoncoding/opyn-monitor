import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';

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

import * as myType from '../types';
import { exercise } from '../../utils/web3';
import { PriceSection } from '../common/index.ts';
import { getUnderlyingRequiredToExercise, getBalance, getTokenBalance } from '../../utils/infura';
import {
  toTokenUnitsBN, toBaseUnitBN, formatDigits, compareVaultIssued,
} from '../../utils/number';

import { ETH_ADDRESS } from '../../constants/contracts';
import { allOptions } from '../../constants/options';

function ExerciseModal({
  user,
  token,
  vaults,
}) {
  const option = allOptions.find((o) => o.addr === token);
  const underlyingIsETH = option.underlying.addr === ETH_ADDRESS;
  const [userUnderlyingBalance, setUserUnderlyingBalance] = useState(new BigNumber(0));
  const [userOTokenBalance, setUserOTokenBalance] = useState(new BigNumber(0));

  const [opened, setOpened] = useState(false);

  const [exerciseAmount, setExerciseAmount] = useState(new BigNumber(0));
  const [underlyringRequired, setUnderlyringRequired] = useState(new BigNumber(0));

  const nonEmptyVaults = vaults
    .filter((vault) => parseInt(vault.collateral, 10) > 0)
    .sort(compareVaultIssued);

  const [selectedIndexes, setSelectedIndexes] = useState([]);
  const [selectedHasEnoughCollateral, setHasEnoughCollateral] = useState(false);

  const open = () => setOpened(true);
  const close = () => setOpened(false);

  // Update user balance
  useMemo(async () => {
    if (!user) return;
    if (!opened) return;
    let userUnderlying;
    if (underlyingIsETH) {
      userUnderlying = new BigNumber(await getBalance(user));
    } else {
      userUnderlying = toTokenUnitsBN(
        await getTokenBalance(option.underlying.addr, user),
        option.underlying.decimals,
      );
    }
    const userOTkns = toTokenUnitsBN(await getTokenBalance(option.addr, user), option.decimals);

    setUserUnderlyingBalance(userUnderlying);
    setUserOTokenBalance(userOTkns);
  }, [option, underlyingIsETH, user, opened]);

  const onSelectEntries = (entries, indexes) => {
    setSelectedIndexes(indexes);
    checkHasEnoughToken(entries);
  };

  /**
   * Set selectedHasEnoughCollateral according to selected entries
   * @param {{oTokenIssued: string}[]} entries
   */
  const checkHasEnoughToken = (entries) => {
    const sumIssued = entries.reduce(
      (accumulator, current) => accumulator.plus(new BigNumber(current.oTokensIssued)), new BigNumber(0),
    );
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
    const exeAmtBN = new BigNumber(amount);
    setExerciseAmount(exeAmtBN);
    const underlyingRawAmt = await getUnderlyingRequiredToExercise(
      option.addr,
      toBaseUnitBN(exeAmtBN, option.decimals).toString(),
    );
    const underlyingRequired = toTokenUnitsBN(underlyingRawAmt, option.underlying.decimals);
    setUnderlyringRequired(underlyingRequired);

    // check current selection has enought tokens
    const entries = selectedIndexes.map((index) => nonEmptyVaults[index]);
    checkHasEnoughToken(entries);
  };

  return (
    <>
      {/* Button */}
      <Button onClick={open} label="Claim" />

      {/* Modal */}
      <Modal width={800} padding={50} visible={opened} onClose={close}>
        <Header
          primary="Exercise Option"
          secondary={(
            <div style={{ display: 'flex' }}>
              <PriceSection
                label="Balance:"
                amt={userOTokenBalance.toNumber()}
                symbol={option.symbol}
                forceDisplay
              />
              <PriceSection label=" +" amt={userUnderlyingBalance.toNumber()} symbol={option.underlying.symbol} />
            </div>
          )}
        />
        <Box heading="Amount to Exercise">
          <Split
            primary={(
              <>
                <TextInput
                  type="number"
                  wide
                  adornment={option.symbol}
                  adornmentPosition="end"
                  value={exerciseAmount.toNumber()}
                  onChange={(event) => onChangeExerciseAmt(event.target.value)}
                />
              </>
            )}
            secondary={(
              <div style={{ paddingTop: 5 }}>
                <PriceSection
                  label="+ Underlyring"
                  amt={underlyringRequired.toNumber()}
                  symbol={option.underlying.symbol}
                />
              </div>
            )}
          />
        </Box>
        <DataView
          mode="table"
          renderSelectionCount={(count) => `${count} vaults selected`}
          fields={['Owner', 'Issued', 'collateral']}
          entries={nonEmptyVaults}
          entriesPerPage={5}
          selection={selectedIndexes}
          onSelectEntries={onSelectEntries}
          renderEntry={({ owner, collateral, oTokensIssued }) => [
            <IdentityBadge entity={owner} />,
            formatDigits(toTokenUnitsBN(oTokensIssued, option.decimals).toNumber(), 5),
            formatDigits(toTokenUnitsBN(collateral, option.collateral.decimals).toNumber(), 5),
          ]}
        />
        <br />
        <Button
          label="Exercise"
          disabled={!selectedHasEnoughCollateral}
          wide
          onClick={async () => {
            const vaultowners = selectedIndexes.map((index) => vaults[index].owner);
            exercise(
              option.addr,
              option.underlying.addr,
              toBaseUnitBN(exerciseAmount, option.decimals).toString(),
              vaultowners,
            );
          }}
        />
      </Modal>
    </>
  );
}

ExerciseModal.propTypes = {
  user: PropTypes.string.isRequired,
  token: PropTypes.string.isRequired,
  vaults: PropTypes.arrayOf(myType.vault).isRequired,
};

export default ExerciseModal;
