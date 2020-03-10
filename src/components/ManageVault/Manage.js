import React, { useState, useEffect } from 'react';

import {
  getVaults,
  getTokenBalance,
  getBalance,
  getPrice,
} from '../../utils/infura';

import {
  Header,
} from '@aragon/ui';

import CollateralManagement from './CollateralManagement'
import IssuedTokenManagement from './IssuedTokenManagement'

import { options } from '../../constants/options';
import { formatDigits, fromWei } from '../../utils/number';

import HeaderDashboard from './HeaderDashboard'

function ManageVault({ token, owner, user }) {
  const option = options.find((option) => option.addr === token);
  const { decimals, symbol, oracle, strike, strikePrice, minRatio } = option;

  const [vault, setVault] = useState({});
  const [lastETHValueInStrike, setLastETHValue] = useState(0);

  const [ratio, setRatio] = useState(0);

  const [tokenBalance, setTokenBalance] = useState(0);
  const [ethBalance, setETHBalance] = useState(0);
 

  // status
  const [noVault, setNoVault] = useState(true);
  const [newRatio, setNewRatio] = useState(ratio)
  

  useEffect(() => {
    let isCancelled = false;

    async function updateInfo() {
      const vault = (await getVaults([owner], token))[0];
      // vault.collateral here in unit of eth.
      if (vault === undefined) {
        return;
      }
      setNoVault(false);
      const [ownerBalance, ethBalance] = await Promise.all([
        getTokenBalance(token, owner),
        getBalance(owner),
      ]);

      const tokenBalance = ownerBalance / 10 ** decimals;

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
        setTokenBalance(tokenBalance);
        setETHBalance(ethBalance);
        setRatio(ratio);
      }
    }
    updateInfo();
    const id = setInterval(updateInfo, 10000);

    return () => {
      isCancelled = true;
      clearInterval(id);
    };
  }, [decimals, oracle, owner, strike, strikePrice, token]);

  const isOwner = user === owner;

  return noVault ? (
    <div style={{ padding: 100, textAlign: 'center' }}> No Vault Found for this user </div>
  ) : (
    <>
      <Header primary={isOwner ? 'Manage Your Vault' : 'Vault Detail'} />

      <HeaderDashboard
        owner={owner} user={user} ratio={ratio} minRatio={minRatio} 
        symbol={symbol} ethBalance={ethBalance} tokenBalance={tokenBalance}
        newRatio={newRatio}
      />

      <CollateralManagement
        vault={vault}
        ethBalance={ethBalance}
        token={token}
        owner={owner}
        lastETHValueInStrike={lastETHValueInStrike}
        strikePrice={strikePrice}
        minRatio={minRatio}
        setNewRatio={setNewRatio}
      />

      <IssuedTokenManagement
        vault={vault}
        tokenBalance={tokenBalance}
        token={token}
        lastETHValueInStrike={lastETHValueInStrike}
        strikePrice={strikePrice}
        minRatio={minRatio}
        decimals={decimals}
        symbol={symbol}
        setNewRatio={setNewRatio}
      />
      
    </>
  );
}


export default ManageVault;
