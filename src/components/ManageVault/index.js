import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getTokenBalance, getBalance, getPrice, getDecimals } from '../../utils/infura';

import { getAllVaultsForUser } from '../../utils/graph';

import { Header, Tabs, Box } from '@aragon/ui';

import CollateralManagement from './CollateralManagement';
import IssuedTokenManagement from './IssuedTokenManagement';
import LiquidationHistory from './Liquidation';

import { options, ETH_ADDRESS } from '../../constants/options';
import { formatDigits, calculateRatio, toTokenUnits } from '../../utils/number';

import HeaderDashboard from './HeaderDashboard';

function ManageVault({ user }) {
  let { token, owner } = useParams();

  const option = options.find((option) => option.addr === token);
  const { decimals, symbol, oracle, strike, strikePrice, minRatio, collateral } = option;

  // Tab Navigation
  const [tabSelected, setTabSelected] = useState(0);

  const [vault, setVault] = useState({});
  const [strikeVauleInWei, setStrikeValue] = useState(0);
  const [ratio, setRatio] = useState(0);

  const [ownerTokenBalance, setOwnerTokenBalance] = useState(0);
  const [userTokenBalance, setUserTokenBalance] = useState(0);
  const [userCollateralAssetBalance, setUserCollateralAssetBalance] = useState(0);

  // status
  const [noVault, setNoVault] = useState(true);
  const [newRatio, setNewRatio] = useState(ratio);

  const [collateralDecimals, setCollateralDecimals] = useState(0);
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
      let collateralBalance,
        _collateralDecimals = 0;
      if (collateralIsETH) {
        collateralBalance = await getBalance(user);
      } else {
        const _tokenBalance = await getTokenBalance(collateral, user);
        _collateralDecimals = await getDecimals(collateral);
        collateralBalance = toTokenUnits(_tokenBalance, _collateralDecimals);
      }

      _ownerTokenBalance = toTokenUnits(_ownerTokenBalance, decimals);
      _userTokenBalance = toTokenUnits(_userTokenBalance, decimals);

      const lastStrikeValue = await getPrice(oracle, strike);
      const ratio = calculateRatio(
        vault.collateral,
        vault.oTokensIssued,
        strikePrice,
        lastStrikeValue
      );

      if (!isCancelled) {
        setStrikeValue(lastStrikeValue);
        setVault(vault);
        setCollateralDecimals(_collateralDecimals);
        setOwnerTokenBalance(_ownerTokenBalance);
        setUserTokenBalance(_userTokenBalance);
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
  }, [collateral, collateralIsETH, decimals, oracle, owner, strike, strikePrice, token, user]);

  const isOwner = user === owner;

  return noVault ? (
    <div style={{ padding: 100, textAlign: 'center' }}> No Vault Found for this user </div>
  ) : (
    <>
      <Header primary={isOwner ? 'Manage Your Vault' : 'Vault Detail'} />

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
        items={['Collateral Management', 'Token Issuance', 'Liquidation']}
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
          strikeValue={strikeVauleInWei}
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
          strikeValue={strikeVauleInWei}
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
    </>
  );
}

export default ManageVault;
