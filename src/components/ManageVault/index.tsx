import React, { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
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
import { allOptions } from '../../constants/options';
import * as types from '../../types'
import tracker from '../../utils/tracker';

function ManageVault({ user }) {
  const { token, owner } = useParams();
  useEffect(() => {
    tracker.pageview(`/manage/${token}`);
  }, [token]);

  const option = allOptions.find((o) => o.addr === token);
  

  const {
    decimals, symbol, oracle, strike, strikePrice, minRatio,
    collateral, expiry, underlying
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
            // user={user}
            ratio={ratio}
            minRatio={minRatio}
            vault={vault}
            decimals={decimals}
            symbol={symbol}
            newRatio={newRatio}
            useCollateral={vaultUsesCollateral}
            // collateralIsETH={collateralIsETH}
            collateralDecimals={collateral.decimals}
          />

          <Tabs
            items={['Collateral Management', 'Token Issuance', 'Liquidation', 'Exercise', 'Underlying Redemption']}
            selected={tabSelected}
            onChange={setTabSelected}
          />

          {tabSelected === 0 ? (
            <CollateralManagement
              isOwner={isOwner}
              vault={vault}
              collateralAssetBalance={userCollateralAssetBalance}
              collateral={collateral}
              token={token}
              owner={owner}
              strikeValue={strikeValueInCollateral}
              strikePrice={strikePrice}
              minRatio={minRatio}
              setNewRatio={setNewRatio}
            />
          ) : (
            <></>
          )}

          {tabSelected === 1 ? (
            <IssuedTokenManagement
              isOwner={isOwner}
              vault={vault}
              tokenBalance={ownerTokenBalance}
              token={token}
              strikeValue={strikeValueInCollateral}
              strikePrice={strikePrice}
              minRatio={minRatio}
              decimals={decimals}
              symbol={symbol}
              setNewRatio={setNewRatio}
              // for call heler text
              strikePriceInUSD={option!.strikePriceInUSD}
              collateralSymbol={collateral.symbol}
            />
          ) : (
            <></>
          )}

          {tabSelected === 2 ? (
            vaultUsesCollateral ? (
              <LiquidationHistory
                userTokenBalance={userTokenBalance}
                isOwner={isOwner}
                owner={owner}
                token={token}
                tokenDecimals={decimals}
              />
            ) : (
              <Box> This vault cannot be liquidated </Box>
            )
          ) : (
            <></>
          )}

          {tabSelected === 3 ? (
            <ExerciseHistory
              owner={owner}
              token={token}
              tokenDecimals={decimals}
              collateralDecimals={collateral.decimals}
            />
          ) : (
            <></>
          )}

          {tabSelected === 4 ? (
            <UnderlyingManagement
              owner={owner}
              token={token}
              underlyingDecimals={underlying.decimals}
              underlyingAmount={vault.underlying}
            />
          ) : <> </>}
        </>
    );
}

ManageVault.propTypes = {
  user: PropTypes.string.isRequired,
};

export default ManageVault;
