import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { Header, Tabs, Box, Timer, Button } from '@aragon/ui';

import HeaderDashboard from './HeaderDashboard';
import CollateralManagement from './CollateralManagement';
import IssuedTokenManagement from './IssuedTokenManagement';
import LiquidationHistory from './Liquidation';
import ExerciseHistory from './Exercise';

import { formatDigits, toTokenUnitsBN } from '../../utils/number';
import { calculateRatio, calculateStrikeValueInCollateral } from '../../utils/calculation';
import { getTokenBalance, getBalance, getDecimals } from '../../utils/infura';
import { getAllVaultsForUser } from '../../utils/graph';
import { redeem } from '../../utils/web3';

import { options, ETH_ADDRESS } from '../../constants/contracts';
import BigNumber from 'bignumber.js';

function ManageVault({ user }) {
  let { token, owner } = useParams();

  const option = options.find((option) => option.addr === token);
  const { decimals, symbol, oracle, strike, strikePrice, minRatio, collateral, expiry } = option;

  // Tab Navigation
  const [tabSelected, setTabSelected] = useState(0);

  const [vault, setVault] = useState({});
  const [strikeValueInCollateral, setStrikeValue] = useState(new BigNumber(0));
  const [ratio, setRatio] = useState(0);

  const [ownerTokenBalance, setOwnerTokenBalance] = useState(new BigNumber(0));
  const [userTokenBalance, setUserTokenBalance] = useState(new BigNumber(0));
  const [userCollateralAssetBalance, setUserCollateralAssetBalance] = useState(new BigNumber(0));

  // status
  const [noVault, setNoVault] = useState(true);
  const [newRatio, setNewRatio] = useState(ratio);

  const [collateralDecimals, setCollateralDecimals] = useState(18);
  const collateralIsETH = collateral === ETH_ADDRESS;

  const vaultUsesCollateral = collateral !== strike;

  useEffect(() => {
    let isCancelled = false;

    async function updateInfo() {
      const vault = (await getAllVaultsForUser(owner)).find(
        (vault) => vault.optionsContract.address === token
      );
      if (vault === undefined) {
        return;
      }
      setNoVault(false);
      let [_ownerTokenBalance, _userTokenBalance] = await Promise.all([
        getTokenBalance(token, owner),
        getTokenBalance(token, user),
      ]);

      // SetUserCollateralAmount
      let collateralBalance = new BigNumber(0)
      let _collateralDecimals = 18;

      if (collateralIsETH) {
        collateralBalance = new BigNumber(await getBalance(user));
      } else {
        const _tokenBalance = await getTokenBalance(collateral, user);
        _collateralDecimals = await getDecimals(collateral);
        collateralBalance = toTokenUnitsBN(_tokenBalance, _collateralDecimals);
      }

      const _ownerTokenBalanceBN = toTokenUnitsBN(_ownerTokenBalance, decimals);
      const _userTokenBalanceBN = toTokenUnitsBN(_userTokenBalance, decimals);

      const strikeValueInCollateral = await calculateStrikeValueInCollateral(
        collateral,
        strike,
        oracle
      );
      const ratio = calculateRatio(
        vault.collateral,
        vault.oTokensIssued,
        strikePrice,
        strikeValueInCollateral
      );

      if (!isCancelled) {
        setStrikeValue(strikeValueInCollateral);
        setVault(vault);
        setCollateralDecimals(_collateralDecimals);
        setOwnerTokenBalance(_ownerTokenBalanceBN);
        setUserTokenBalance(_userTokenBalanceBN);
        setRatio(formatDigits(ratio, 5));
        setUserCollateralAssetBalance(collateralBalance);
      }
    }
    updateInfo();
    const id = setInterval(updateInfo, 10000);

    return () => {
      isCancelled = true;
      clearInterval(id);
    };
  }, [
    collateral,
    collateralDecimals,
    collateralIsETH,
    decimals,
    oracle,
    owner,
    strike,
    strikePrice,
    token,
    user,
    vaultUsesCollateral,
  ]);

  const isOwner = user === owner;

  return noVault ? (
    <div style={{ padding: 100, textAlign: 'center' }}> No Vault Found for this user </div>
  ) : (
    <>
      <Header
        primary={isOwner ? 'Manage Your Vault' : 'Vault Detail'}
        secondary={
          expiry * 1000 > Date.now() ? (
            <Timer end={new Date(expiry * 1000)} />
          ) : (
            <Button onClick={() => redeem(token)} label={'Redeem'} />
          )
        }
      />

      <HeaderDashboard
        owner={owner}
        user={user}
        ratio={ratio}
        minRatio={minRatio}
        vault={vault}
        decimals={decimals}
        symbol={symbol}
        newRatio={newRatio}
        useCollateral={vaultUsesCollateral}
        collateralIsETH={collateralIsETH}
        collateralDecimals={collateralDecimals}
      />

      <Tabs
        items={['Collateral Management', 'Token Issuance', 'Liquidation', 'Exercise']}
        selected={tabSelected}
        onChange={setTabSelected}
      />

      {tabSelected === 0 ? (
        <CollateralManagement
          isOwner={isOwner}
          vault={vault}
          collateralAssetBalance={userCollateralAssetBalance}
          collateralAsset={option.collateral}
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
          collateralDecimals={collateralDecimals}
        />
      ) : (
        <></>
      )}
    </>
  );
}

export default ManageVault;
