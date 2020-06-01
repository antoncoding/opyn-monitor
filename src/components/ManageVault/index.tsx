import React, { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import {
  Header, Tabs, Box, Timer, Button,
} from '@aragon/ui';

import BigNumber from 'bignumber.js';
import HeaderDashboard from './HeaderDashboard';
import CollateralManagement from './CollateralManagement';
import IssuedTokenManagement from './IssuedTokenManagement';
import LiquidationHistory from './Liquidation';
import ExerciseHistory from './Exercise';
import UnderlyingManagement from './UnderlyingManagement';

import { Comment } from '../common/index';

import { toTokenUnitsBN } from '../../utils/number';
import { calculateRatio, calculateStrikeValueInCollateral } from '../../utils/calculation';
import { getTokenBalance, getBalance } from '../../utils/infura';
import { getVault } from '../../utils/graph';
import { redeem } from '../../utils/web3';

import { ETH_ADDRESS } from '../../constants/contracts';
import { defaultOption } from '../../constants/options';
import * as types from '../../types'
import tracker from '../../utils/tracker';
// import { optionWithStat } from '../../types';

function ManageVault({ user, options }: { user: string, options: types.option[] }) {
  const { token, owner } = useParams();
  useEffect(() => {
    tracker.pageview(`/manage/${token}`);
  }, [token]);
  
  const [option, setOption] = useState<types.option>(defaultOption)

  const multiplier = option.type === 'call' ? new BigNumber((option as types.ETHOption).strikePriceInUSD) : new BigNumber(1)

  useEffect(()=>{
    const option = options.find((o) => o.addr === token);
    if (option) setOption(option)
  }, [options, token])

  const {
    decimals, oracle, strike, strikePrice,
    collateral, expiry
  } = option!;

  const [isLoading, setIsLoading] = useState(true);

  // Tab Navigation
  const [tabSelected, setTabSelected] = useState(0);

  const [vault, setVault] = useState<types.vault>({
    collateral: '0',
    oTokensIssued: '0',
    owner,
    underlying: '0'
  });
  const [strikeValueInCollateral, setStrikeValue] = useState(new BigNumber(0));
  const [ratio, setRatio] = useState(0);

  const [ownerTokenBalance, setOwnerTokenBalance] = useState(new BigNumber(0));
  const [userTokenBalance, setUserTokenBalance] = useState(new BigNumber(0));
  const [userCollateralAssetBalance, setUserCollateralAssetBalance] = useState(new BigNumber(0));

  // status
  const [noVault, setNoVault] = useState(true);
  const [newRatio, setNewRatio] = useState(ratio);

  const collateralIsETH = collateral.addr === ETH_ADDRESS;
  const vaultUsesCollateral = collateral.addr !== strike.addr;

  useMemo(() => {
    let isCancelled = false;

    async function updateInfo() {
      if (option.addr === '') return 
      const vaultToManage = await getVault(owner, token);
      if (vaultToManage === null) {
        setIsLoading(false);
        return;
      }

      setNoVault(false);
      const [_ownerTokenBalance, _userTokenBalance] = await Promise.all([
        getTokenBalance(token, owner),
        getTokenBalance(token, user),
      ]);

      // SetUserCollateralAmount
      let collateralBalance = new BigNumber(0);
      // let colltDecimals = 18;

      if (collateralIsETH) {
        collateralBalance = new BigNumber(await getBalance(user));
      } else {
        const userColltBalance = await getTokenBalance(collateral.addr, user);
        collateralBalance = toTokenUnitsBN(userColltBalance, collateral.decimals);
      }

      const ownerTokenBalanceBN = toTokenUnitsBN(_ownerTokenBalance, decimals);
      const userTokenBalanceBN = toTokenUnitsBN(_userTokenBalance, decimals);

      const strikeValInCollt = await calculateStrikeValueInCollateral(
        collateral.addr,
        strike.addr,
        oracle,
        collateral.decimals,
      );
      const currentRatio = calculateRatio(
        vaultToManage.collateral,
        vaultToManage.oTokensIssued,
        strikePrice,
        strikeValInCollt,
      );

      if (!isCancelled) {
        setStrikeValue(strikeValInCollt);
        setVault(vaultToManage);
        setOwnerTokenBalance(ownerTokenBalanceBN);
        setUserTokenBalance(userTokenBalanceBN);
        setRatio(currentRatio);
        setUserCollateralAssetBalance(collateralBalance);
        setIsLoading(false);
      }
    }
    updateInfo();
    const id = setInterval(updateInfo, 60000);

    return () => {
      isCancelled = true;
      clearInterval(id);
    };
  }, [
    collateral,
    collateralIsETH,
    decimals,
    oracle,
    owner,
    strike,
    strikePrice,
    token,
    user,
    option.addr
  ]);

  const isOwner = user === owner;

  return noVault
    ? isLoading ? (
      <Comment text="Loading..." />
    )
      : (
        <Comment text="No Vault Found for this user under this contract" />
      ) : (
      <>
        <Header
          primary={isOwner ? 'Manage My Vault' : 'Vault Detail'}
          secondary={
            expiry * 1000 > Date.now() ? (
              <Timer end={new Date(expiry * 1000)} />
            ) : (
                <Button onClick={() => redeem(token)} label="Redeem" />
              )
          }
        />

        <HeaderDashboard
          option={option}
          ratio={ratio}
          vault={vault}
          newRatio={newRatio}
          useCollateral={vaultUsesCollateral}
          multiplier={multiplier}
        />

        <Tabs
          items={['Collateral Management', 'Token Issuance', 'Liquidation', 'Exercise', 'Underlying Redemption']}
          selected={tabSelected}
          onChange={setTabSelected}
        />

        {tabSelected === 0 &&
          <CollateralManagement
            option={option}
            isOwner={isOwner}
            vault={vault}
            collateralAssetBalance={userCollateralAssetBalance}
            owner={owner}
            strikeValue={strikeValueInCollateral}
            setNewRatio={setNewRatio}
          />
        }

        {tabSelected === 1 &&
          <IssuedTokenManagement
            option={option}
            isOwner={isOwner}
            multiplier={multiplier}
            vault={vault}
            tokenBalance={ownerTokenBalance}
            strikeValue={strikeValueInCollateral}
            setNewRatio={setNewRatio}
          />
        }

        {tabSelected === 2 &&
          (vaultUsesCollateral ? (
            <LiquidationHistory
              userTokenBalance={userTokenBalance}
              isOwner={isOwner}
              owner={owner}
              option={option}
            />
          ) : (
              <Box> This vault cannot be liquidated </Box>
            ))
        }

        {tabSelected === 3 &&
          <ExerciseHistory
            owner={owner}
            multiplier={multiplier}
            option={option}
          />
        }

        {tabSelected === 4 &&
          <UnderlyingManagement
            owner={owner}
            option={option as types.option}
            underlyingAmount={vault.underlying}
          />
        }
      </>
    );
}



export default ManageVault;
