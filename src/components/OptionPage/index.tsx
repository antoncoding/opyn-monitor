import React, { useMemo, useState, useEffect } from 'react';

import { useParams } from 'react-router-dom';
import { Header } from '@aragon/ui';

import ExerciseModal from './ExerciseModal';
import VaultsList from './VaultsList';
import OptionInfoBox from './OptionInfoBox';

import { getAllVaultsForOption } from '../../utils/graph';
import tracker from '../../utils/tracker';

import { useOptions } from '../../hooks'

import { ETH_ADDRESS } from '../../constants/contracts';
import { defaultOption } from '../../constants/options';

import * as types from '../../types'

function OptionPage() {
  const { token } = useParams();
  useEffect(() => {
    tracker.pageview(`/option/${token}`);
  }, [token]);

  const { options, isInitializing } = useOptions()

  const [option, setOption] = useState<types.optionWithStat>(defaultOption)
  const [isLoadigVaults, setIsLoadingVaults] = useState(true)
  const [vaults, setVaults] = useState<types.vaultWithoutUnderlying[]>([]);

  const collateralIsETH = option!.collateral.addr === ETH_ADDRESS;

  useEffect(()=>{
    const option = options.find((o) => o.addr === token);
    if (option) setOption(option)
  }, [options, token])

  useMemo(async () => {
    // Get All vaults once
    const allVaults = await getAllVaultsForOption(token);
    setVaults(allVaults);
    setIsLoadingVaults(false)
  }, [token]);

  return (
    <>
      <Header
        primary={option && option!.name}
        secondary={(
          <ExerciseModal
            option={option}
            vaults={vaults}
          />
        )}
      />
      {/* Basic Info Header */}
      <OptionInfoBox
        option={option!}
      />
      {/* List of Vaults */}
      <VaultsList
        isInitializing={isInitializing && isLoadigVaults}
        option={option!}
        vaults={vaults}
        collateralIsETH={collateralIsETH}
      />
    </>
  );
}

export default OptionPage;
