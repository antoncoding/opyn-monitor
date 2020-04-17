import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';

import {
  Header,
  Button,
  Modal,
} from '@aragon/ui';
// import BigNumber from 'bignumber.js';

import * as myType from '../types';
// import { exercise } from '../../utils/web3';
// import { PriceSection } from '../common';
// import { getUnderlyingRequiredToExercise, getBalance, getTokenBalance } from '../../utils/infura';
// import {
//   toTokenUnitsBN, toBaseUnitBN, formatDigits, compareVaultIssued,
// } from '../../utils/number';


/**
 *
 * @param {{
 * oToken: string,
 * option: { decimals: number, underlying:string, collateralDecimals: Number }
 * underlyingDecimals: Number
 * underlyingSymbol: string
 * vaults: { collateral:string, oTokensIssued: string, owner:string, symbol:string }[]
 * underlyingIsETH: boolean
 * }} param0
 */
function OpenVaultModal({
  user,
  oToken,
  option,
}) {
  // const [userUnderlyingBalance, setUserUnderlyingBalance] = useState(new BigNumber(0));
  // const [userOTokenBalance, setUserOTokenBalance] = useState(new BigNumber(0));

  const [opened, setOpened] = useState(false);

  // const [exerciseAmount, setExerciseAmount] = useState(new BigNumber(0));
  // const [underlyringRequired, setUnderlyringRequired] = useState(new BigNumber(0));

  // const nonEmptyVaults = vaults
  //   .filter((vault) => parseInt(vault.collateral, 10) > 0)
  //   .sort(compareVaultIssued);

  // const [selectedIndexes, setSelectedIndexes] = useState([]);
  // const [selectedHasEnoughCollateral, setHasEnoughCollateral] = useState(false);

  const open = () => setOpened(true);
  const close = () => setOpened(false);

  // Update user balance
  // useMemo(async () => {
  //   if (!user) return;
  //   if (!opened) return;
  //   let userUnderlying;
  //   if (underlyingIsETH) {
  //     userUnderlying = new BigNumber(await getBalance(user));
  //   } else {
  //     userUnderlying = toTokenUnitsBN(
  //       await getTokenBalance(option.underlying, user),
  //       underlyingDecimals,
  //     );
  //   }
  //   const userOTkns = toTokenUnitsBN(await getTokenBalance(oToken, user), option.decimals);

  //   setUserUnderlyingBalance(userUnderlying);
  //   setUserOTokenBalance(userOTkns);
  // }, [oToken, option.decimals, option.underlying, underlyingDecimals, underlyingIsETH, user, opened]);


  return (
    <>
      {/* Button */}
      <Button onClick={open} label="OpenVault New" />

      {/* Modal */}
      <Modal width={800} padding={50} visible={opened} onClose={close}>
        <Header
          primary="Open Vault"
        />
      </Modal>
    </>
  );
}

OpenVaultModal.propTypes = {
  user: PropTypes.string.isRequired,
  oToken: PropTypes.string.isRequired,
  option: myType.option.isRequired,
};

export default OpenVaultModal;
