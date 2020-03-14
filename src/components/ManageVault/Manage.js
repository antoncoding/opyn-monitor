import React, { useState, useEffect } from 'react';

import { getVaults, getTokenBalance, getBalance, getPrice } from '../../utils/infura';

import { Header, Tabs } from '@aragon/ui';

import CollateralManagement from './CollateralManagement';
import IssuedTokenManagement from './IssuedTokenManagement';
import LiquidationHistory from './Liquidation';

import { options } from '../../constants/options';
import { formatDigits, fromWei, toTokenUnits } from '../../utils/number';

import HeaderDashboard from './HeaderDashboard';

function ManageVault({ token, owner, user }) {
  const option = options.find((option) => option.addr === token);
  const { decimals, symbol, oracle, strike, strikePrice, minRatio } = option;

  const [tabSelected, setTabSelected] = useState(0);

  const [vault, setVault] = useState({});
  const [lastETHValueInStrike, setLastETHValue] = useState(0);

  const [ratio, setRatio] = useState(0);

  const [ownerTokenBalance, setOwnerTokenBalance] = useState(0);
  const [userTokenBalance, setUserTokenBalance] = useState(0)
  const [userETHBalance, setUserETHBalance] = useState(0);

  // status
  const [noVault, setNoVault] = useState(true);
  const [newRatio, setNewRatio] = useState(ratio);

  useEffect(() => {
    let isCancelled = false;

    async function updateInfo() {
      const vault = (await getVaults([owner], token))[0];
      // vault.collateral here in unit of eth.
      if (vault === undefined) {
        return;
      }
      setNoVault(false);
      let [_ownerTokenBalance, _userTokenBalance, userETHBalance] = await Promise.all([
        getTokenBalance(token, owner),
        getTokenBalance(token, user),
        getBalance(user),
      ]);

      _ownerTokenBalance = toTokenUnits(_ownerTokenBalance, decimals);
      _userTokenBalance = toTokenUnits(_userTokenBalance, decimals)

      const lastStrikeValue = fromWei(await getPrice(oracle, strike));
      const ethValueInStrike = 1 / lastStrikeValue;
      const valueProtectingInEth = parseFloat(strikePrice) * vault.oTokensIssued;
      const ratio = formatDigits(
        (parseFloat(vault.collateral) * ethValueInStrike) / valueProtectingInEth,
        5
      );

      if (!isCancelled) {
        setLastETHValue(ethValueInStrike);
        setVault(vault);
        setOwnerTokenBalance(_ownerTokenBalance);
        setUserTokenBalance(_userTokenBalance)
        setUserETHBalance(userETHBalance);
        setRatio(ratio);
      }
    }
    updateInfo();
    const id = setInterval(updateInfo, 10000);

    return () => {
      isCancelled = true;
      clearInterval(id);
    };
  }, [decimals, oracle, owner, strike, strikePrice, token, user]);

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
          ethBalance={userETHBalance}
          token={token}
          owner={owner}
          lastETHValueInStrike={lastETHValueInStrike}
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
          lastETHValueInStrike={lastETHValueInStrike}
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
        <LiquidationHistory
          userTokenBalance={userTokenBalance}
          isOwner={isOwner}
          owner={owner}
          token={token}
          tokenDecimals={decimals}
        />
      ) : (
        <></>
      )}
    </>
  );
}

export default ManageVault;
