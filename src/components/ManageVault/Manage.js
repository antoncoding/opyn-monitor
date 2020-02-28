import React, { useState, useEffect } from 'react';

import {
  getVaults,
  getVaultsWithLiquidatable,
  getTokenBalance,
  getBalance,
  getOptionContractDetail,
  getPrice,
} from '../../utils/infura';

import { Split, IconCirclePlus, IconCircleMinus, Button, TextInput, Header, Box } from '@aragon/ui';

import { addETHCollateral, removeETHCollateral, burnOToken, issueOToken } from '../../utils/web3';

import { formatDigits } from '../../utils/common'
import { createTag } from '../TokenView/common'

function ManageVault ({token, owner, user}) {

  const [vault, setVault] = useState({})
  const [tokenDecimals, setTokenDecimals] = useState(0)
  const [tokenSymbol, setTokenSymbol] = useState('oToken')

  const [ratio, setRatio] = useState(0)
  const [minRatio, setMinRatio] = useState(1.6)

  const [tokenBalance, setTokenBalance] = useState(0)
  const [ethBalance, setETHBalance] = useState(0)

  const [collateralAmt, setCollateralAmt] = useState(0)
  const [issueOrBurnAmt,  setIssueOrBurAmt] = useState(0)

  useEffect(()=>{

    let isCancelled = false

    async function updateInfo () {

      const vaults = await getVaults([owner], token);
      const vault = (await getVaultsWithLiquidatable(vaults))[0];
      const [ownerBalance, optionInfo, ethBalance] = await Promise.all([
        getTokenBalance(token, owner),
        getOptionContractDetail(token),
        getBalance(owner),
      ]);
  
      const { decimals, symbol, strikePrice, strike, oracle, minRatio } = optionInfo;
  
      const tokenBalance = ownerBalance / 10 ** optionInfo.decimals;
      const ethValueInStrike = 1 / (await getPrice(oracle, strike));
      const valueProtectingInEth = parseFloat(strikePrice) * vault.oTokensIssued;
      const ratio = formatDigits((parseFloat(vault.collateral) * ethValueInStrike) / valueProtectingInEth, 5);
  
      if (!isCancelled) {
        setVault(vault);
        setTokenBalance(tokenBalance)
        setETHBalance(ethBalance)
        setTokenDecimals(decimals)
        setTokenSymbol(symbol)
        setMinRatio(minRatio)
        setRatio(ratio)
      }
    };
    updateInfo()
    const id = setInterval(updateInfo, 15000)

    // clean up function
    return ()=>{
      isCancelled = true
      clearInterval(id)
    }
  })

  const isOwner = user === owner;


    return (
      <>
        <Header primary={isOwner ? 'Manage Your Vault' : 'Vault Detail'} />

        <div style={{ padding: '2%', display: 'flex', alignItems: 'center' }}>
          <div style={{ width: '30%' }}>
            {balanceBlock('Owner ETH Balance', ethBalance)}
          </div>
          <div style={{ width: '50%' }}>
            {balanceBlock(`${tokenSymbol} Balance`, tokenBalance)}
          </div>
          <div style={{ width: '20%', }}>
            <>
              <div style={{ fontSize: 14, padding: 3 }}> 
                Current Ratio {
                  ratio > 0 ?
                  createTag(ratio >= minRatio, ratio) : ''
                } 
              </div>
              <div style={{ fontSize: 24, padding: 3 }}>
                <span style={{ fontSize: 24 }}>{ratio.toString().split('.')[0]}</span>.
                <span style={{ fontSize: 18 }}>{ratio.toString().split('.')[1]} </span>
                { minRatio > 0 ? <span style={{ fontSize: 16 }}> / {minRatio} </span> : '' }
                
                {/* {balance} */}
              </div>
            </>
          </div>
        </div>
        {/* </Box> */}

        <Box heading={'Collateral'}>
          <Split
            primary={
              <div style={{ paddingTop: '3%' }}>
                <Split
                  primary={
                    <TextInput
                      type='number'
                      wide={true}
                      value={collateralAmt}
                      onChange={(event) => {
                        setCollateralAmt(event.target.value)
                      }}
                    />
                  }
                  secondary={
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Button
                        wide={true}
                        icon={<IconCirclePlus />}
                        label='Add'
                        onClick={() => {
                          addETHCollateral(
                            token,
                            owner,
                            collateralAmt
                          );
                        }}
                      />
                      <Button
                        wide={true}
                        icon={<IconCircleMinus />}
                        label='Remove'
                        disabled={!isOwner}
                        onClick={() => {
                          removeETHCollateral(token, collateralAmt);
                        }}
                      />
                    </div>
                  }
                />
              </div>
            }
            secondary={balanceBlock('ETH', vault.collateral)}
            invert='horizontal'
          />
        </Box>

        <Box heading={'Issued'}>
          <Split
            primary={
              <div style={{ paddingTop: '3%' }}>
                <Split
                  primary={
                    <TextInput
                      type='number'
                      wide={true}
                      value={issueOrBurnAmt}
                      onChange={(event) => {
                        setIssueOrBurAmt(event.target.value)
                      }}
                    />
                  }
                  secondary={
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Button
                        wide={true}
                        icon={<IconCirclePlus />}
                        label='Issue'
                        disabled={!isOwner}
                        onClick={() => {
                          issueOToken(
                            token,
                            handleDecimals(issueOrBurnAmt, tokenDecimals)
                          );
                        }}
                      />
                      <Button
                        wide={true}
                        icon={<IconCircleMinus />}
                        disabled={!isOwner}
                        label='Burn'
                        onClick={() => {
                          burnOToken(
                            token,
                            handleDecimals(issueOrBurnAmt, tokenDecimals)
                          );
                        }}
                      />
                    </div>
                  }
                />
              </div>
            }
            secondary={balanceBlock(
              tokenSymbol,
              vault.oTokensIssued
                ? vault.oTokensIssued / 10 ** tokenDecimals
                : 0
            )}
            invert='horizontal'
          />
        </Box>
      </>
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
