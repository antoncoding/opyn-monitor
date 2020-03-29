import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import { Header } from '@aragon/ui';

import ExerciseModal from './ExerciseModal';
import VaultsList from './VaultsList';
import OptionInfoBox from './OptionInfoBox';

import { getDecimals, getERC20Symbol } from '../../utils/infura';
import { getAllVaultsForOption } from '../../utils/graph';

import { options, ETH_ADDRESS } from '../../constants/contracts';

function OptionPage({ user }) {
  const { token } = useParams();
  const option = options.find((o) => o.addr === token);

  const [vaults, setVaults] = useState([]);

  const [collateralDecimals, setCollateralDecimals] = useState(18);
  const [underlyingDecimals, setUnderlyingDecimals] = useState(18);
  const [underlyingSymbol, setUnderlyingSymbol] = useState('ETH');

  const collateralIsETH = option.collateral === ETH_ADDRESS;
  const underlyingIsETH = option.underlying === ETH_ADDRESS;

  useMemo(async () => {
    if (!collateralIsETH) {
      const colltDecimals = await getDecimals(option.collateral);
      setCollateralDecimals(colltDecimals);
    }
    if (!underlyingIsETH) {
      const [_decimals, _symbol] = await Promise.all([
        getDecimals(option.underlying),
        getERC20Symbol(option.underlying),
      ]);
      setUnderlyingDecimals(_decimals);
      setUnderlyingSymbol(_symbol);
    }

    // Get All vaults once
    const allVaults = await getAllVaultsForOption(token);
    setVaults(allVaults);
  }, [collateralIsETH, option.collateral, option.underlying, token, underlyingIsETH]);

  return (
    <>
      <Header
        primary={option.name}
        secondary={(
          <ExerciseModal
            user={user}
            oToken={token}
            option={option}
            collateralDecimals={collateralDecimals}
            underlyingDecimals={underlyingDecimals}
            underlyingSymbol={underlyingSymbol}
            underlyingIsETH={underlyingIsETH}
            vaults={vaults}
          />
        )}
      />
      {/* Basic Info Header */}
      <OptionInfoBox
        tokenSymbol={option.symbol}
        oToken={token}
        user={user}
        vaults={vaults}
        option={option}
        collateralDecimals={collateralDecimals}
        collateralIsETH={collateralIsETH}
      />
      {/* List of Vaults */}
      <VaultsList
        oToken={token}
        user={user}
        vaults={vaults}
        collateralDecimals={collateralDecimals}
        collateralIsETH={collateralIsETH}
        option={option}
      />
    </>
  );
}

OptionPage.propTypes = {
  user: PropTypes.string.isRequired,
};

export default OptionPage;
