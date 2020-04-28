import React, { useMemo, useState, useEffect } from 'react';

import { useParams } from 'react-router-dom';
import { Header } from '@aragon/ui';

import ExerciseModal from './ExerciseModal';
import VaultsList from './VaultsList';
import OptionInfoBox from './OptionInfoBox';

import { getAllVaultsForOption } from '../../utils/graph';
import tracker from '../../utils/tracker';

import { ETH_ADDRESS } from '../../constants/contracts';
import { allOptions } from '../../constants/options';

import * as types from '../../types'

function OptionPage({ user }: { user: string }) {
  const { token } = useParams();
  useEffect(() => {
    tracker.pageview(`/option/${token}`);
  }, [token]);

  const option = allOptions.find((o) => o.addr === token);

  const [vaults, setVaults] = useState<types.vaultWithoutUnderlying[]>([]);

  const collateralIsETH = option!.collateral.addr === ETH_ADDRESS;

  useMemo(async () => {
    // Get All vaults once
    const allVaults = await getAllVaultsForOption(token);
    setVaults(allVaults);
  }, [token]);

  return (
    <>
      <Header
        primary={option!.name}
        secondary={(
          <ExerciseModal
            user={user}
            option={option!}
            vaults={vaults}
          />
        )}
      />
      {/* Basic Info Header */}
      <OptionInfoBox
        option={option!}
        collateralIsETH={collateralIsETH}
      />
      {/* List of Vaults */}
      <VaultsList
        option={option!}
        user={user}
        vaults={vaults}
        collateralIsETH={collateralIsETH}
      />
    </>
  );
}

export default OptionPage;
