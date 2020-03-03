import React, { useState, useEffect } from 'react';

import { getVaults, getTokenBalance, getBalance, getPrice } from '../../utils/infura';

import {
  ButtonBase,
  IconCirclePlus,
  IconCircleMinus,
  Button,
  TextInput,
  Header,
  Box,
} from '@aragon/ui';

import { addETHCollateral, removeETHCollateral, burnOToken, issueOToken } from '../../utils/web3';
import { options } from '../../constants/options';
import { formatDigits } from '../../utils/common';
import { createTag } from '../TokenView/common';

function ManageVault({ token, owner, user }) {
  const option = options.find((option) => option.addr === token);
  const { decimals, symbol, oracle, strike, strikePrice, minRatio } = option;

  const [vault, setVault] = useState({});
  const [lastETHValueInStrike, setLastETHValue] = useState(0);

  const [ratio, setRatio] = useState(0);

  const [tokenBalance, setTokenBalance] = useState(0);
  const [ethBalance, setETHBalance] = useState(0);

  const [addCollateralAmt, setAddCollateralAmt] = useState(0);
  const [removeCollateralAmt, setRemoveCollateralAmt] = useState(0);

  const [issueAmt, setIssueAmt] = useState(0);
  const [burnAmt, setBurnAmt] = useState(0);

  // status
  const [noVault, setNoVault] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    async function updateInfo() {
      console.debug('Updating Page...');
      const vault = (await getVaults([owner], token))[0];
      if (vault === undefined) {
        return;
      }
      setNoVault(false);
      const [ownerBalance, ethBalance] = await Promise.all([
        getTokenBalance(token, owner),
        getBalance(owner),
      ]);

      const tokenBalance = ownerBalance / 10 ** decimals;

      const lastStrikeValue = await getPrice(oracle, strike);
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

      <div style={{ padding: '2%', display: 'flex', alignItems: 'center' }}>
        <div style={{ width: '30%' }}>{balanceBlock('Owner ETH Balance', ethBalance)}</div>
        <div style={{ width: '50%' }}>{balanceBlock(`${symbol} Balance`, tokenBalance)}</div>
        <div style={{ width: '20%' }}>
          <>
            <div style={{ fontSize: 14, padding: 3 }}>
              Current Ratio {ratio > 0 ? createTag(ratio >= minRatio, ratio) : ''}
            </div>
            <div style={{ fontSize: 24, padding: 3 }}>
              <span style={{ fontSize: 24 }}>{ratio.toString().split('.')[0]}</span>.
              <span style={{ fontSize: 18 }}>{ratio.toString().split('.')[1]} </span>
              {minRatio > 0 ? <span style={{ fontSize: 16 }}> / {minRatio} </span> : ''}
              {/* {balance} */}
            </div>
          </>
        </div>
      </div>

      <Box heading={'Collateral'}>
        <div style={{ display: 'flex' }}>
          {/* balance */}
          <div style={{ width: '30%' }}>{balanceBlock('ETH', vault.collateral)}</div>
          {/* Add collateral */}
          <div style={{ width: '32%', paddingTop: '2%' }}>
            <div style={{ display: 'flex' }}>
              <div style={{ width: '60%' }}>
                <>
                  <TextInput
                    type='number'
                    wide={true}
                    value={addCollateralAmt}
                    onChange={(event) => {
                      setAddCollateralAmt(event.target.value);
                    }}
                  />
                  <MaxButton
                    onClick={() => {
                      setAddCollateralAmt(ethBalance);
                    }}
                  />
                </>
              </div>
              <div style={{ width: '40%' }}>
                <Button
                  wide={true}
                  icon={<IconCirclePlus />}
                  label='Add'
                  onClick={() => {
                    addETHCollateral(token, owner, addCollateralAmt);
                  }}
                />
              </div>
            </div>
          </div>
          <div style={{ width: '6%' }}></div>
          {/* Remove collateral */}
          <div style={{ width: '32%', paddingTop: '2%' }}>
            <div style={{ display: 'flex' }}>
              <div style={{ width: '60%' }}>
                <>
                  <TextInput
                    type='number'
                    wide={true}
                    value={removeCollateralAmt}
                    onChange={(event) => {
                      setRemoveCollateralAmt(event.target.value);
                    }}
                  />
                  <MaxButton
                    onClick={() => {
                      if (lastETHValueInStrike <= 0) return;
                      const minValueInStrike = strikePrice * vault.oTokensIssued * minRatio;
                      const minCollateral = minValueInStrike / lastETHValueInStrike;
                      const maxToRemove = vault.collateral - minCollateral;
                      setRemoveCollateralAmt(maxToRemove.toPrecision(18));
                    }}
                  />
                </>
              </div>
              <div style={{ width: '40%' }}>
                <Button
                  wide={true}
                  icon={<IconCircleMinus />}
                  label='Remove'
                  onClick={() => {
                    removeETHCollateral(token, removeCollateralAmt);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </Box>

      <Box heading={'Total Issued'}>
        <div style={{ display: 'flex' }}>
          {/* total Issued */}
          <div style={{ width: '30%' }}>
            {balanceBlock(symbol, vault.oTokensIssued ? vault.oTokensIssued / 10 ** decimals : 0)}
          </div>
          {/* Issue More Token */}
          <div style={{ width: '32%', paddingTop: '2%' }}>
            <div style={{ display: 'flex' }}>
              <div style={{ width: '60%' }}>
                <>
                  <TextInput
                    type='number'
                    wide={true}
                    value={issueAmt}
                    onChange={(event) => {
                      setIssueAmt(event.target.value);
                    }}
                  />
                  <MaxButton
                    onClick={() => {
                      if (strikePrice <= 0) return;

                      const maxTotal =
                        (vault.collateral * lastETHValueInStrike) / (minRatio * strikePrice);
                      const maxToIssueRaw = maxTotal - vault.oTokensIssued;
                      const maxToIssue = maxToIssueRaw / 10 ** decimals;
                      setIssueAmt(maxToIssue);
                    }}
                  />
                </>
              </div>
              <div style={{ width: '40%' }}>
                <Button
                  wide={true}
                  icon={<IconCirclePlus />}
                  label='Issue'
                  onClick={() => {
                    issueOToken(token, handleDecimals(issueAmt, decimals));
                  }}
                />
              </div>
            </div>
          </div>
          <div style={{ width: '6%' }}></div>
          {/* Remove collateral */}
          <div style={{ width: '32%', paddingTop: '2%' }}>
            <div style={{ display: 'flex' }}>
              <div style={{ width: '60%' }}>
                <>
                  <TextInput
                    type='number'
                    wide={true}
                    value={burnAmt}
                    onChange={(event) => {
                      setBurnAmt(event.target.value);
                    }}
                  />
                  <MaxButton
                    onClick={() => {
                      setBurnAmt(tokenBalance);
                    }}
                  />
                </>
              </div>
              <div style={{ width: '40%' }}>
                <Button
                  wide={true}
                  icon={<IconCircleMinus />}
                  label='Burn'
                  onClick={() => {
                    burnOToken(token, handleDecimals(burnAmt, decimals));
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </Box>
    </>
  );
}

function MaxButton({ onClick }) {
  return (
    <div style={{ padding: 3 }}>
      <ButtonBase onClick={onClick}>
        <span style={{ opacity: 0.5 }}> Max </span>
      </ButtonBase>
    </div>
  );
}

const handleDecimals = (rawAmt, decimal) => {
  return parseInt(rawAmt) * 10 ** decimal;
};

const balanceBlock = (asset, balance) => {
  let integer = '0',
    digits = '0';
  if (balance > 0) {
    const str = balance.toString();
    const split = str.split('.');
    integer = split[0];
    digits = split.length > 1 ? str.split('.')[1] : '0';
  }

  return (
    <>
      <div style={{ fontSize: 14, padding: 3 }}> {asset} </div>
      <div style={{ padding: 3 }}>
        <span style={{ fontSize: 24 }}>{integer}</span>.
        <span style={{ fontSize: 18 }}> {digits} </span>
        {/* {balance} */}
      </div>
    </>
  );
};

export default ManageVault;
