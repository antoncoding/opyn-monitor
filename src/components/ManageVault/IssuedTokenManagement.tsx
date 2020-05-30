import React, { useState } from 'react';
import BigNumber from 'bignumber.js';

import {
  Box, TextInput, Button, IconCirclePlus, IconCircleMinus,
} from '@aragon/ui';
import { burnOToken, issueOToken } from '../../utils/web3';
import { BalanceBlock, MaxButton, WarningText } from '../common/index';
import { toBaseUnitBN, toTokenUnitsBN } from '../../utils/number';
import { calculateRatio } from '../../utils/calculation';

import * as types from '../../types';


type IssueTokenProps = {
  option: types.option
  isOwner: boolean,
  multiplier: BigNumber,
  vault: types.vault,
  tokenBalance: BigNumber,
  strikeValue: BigNumber,
  setNewRatio: Function,
}

function IssuedTokenManagement({
  option,
  isOwner,
  multiplier,
  vault,
  tokenBalance,
  strikeValue,
  setNewRatio,
}: IssueTokenProps) {
  const [issueAmt, setIssueAmt] = useState(new BigNumber(0));
  const [burnAmt, setBurnAmt] = useState(new BigNumber(0));

  const updateNewRatio = (newAmt: BigNumber) => {
    if (newAmt.lte(new BigNumber(0))) return;
    const newRatio = calculateRatio(vault.collateral, newAmt, option.strikePrice, strikeValue);
    setNewRatio(newRatio);
  };

  const onChangeIssueAmt = (intputAmt: number) => {
    if (!intputAmt) {
      setIssueAmt(new BigNumber(0));
      return;
    }
    const amountBN = new BigNumber(intputAmt);
    setIssueAmt(amountBN);
    updateNewRatio(
      new BigNumber(vault.oTokensIssued).plus(
        toBaseUnitBN(amountBN, option.decimals).times(multiplier)
      )
    );
  };

  const onClickIssueToken = () => {
    issueOToken(
      option.addr,
      toBaseUnitBN(issueAmt, option.decimals).times(multiplier).toString(),
    );
  };

  const onChangeBurnAmt = (intputAmt: number) => {
    if (!intputAmt) {
      setBurnAmt(new BigNumber(0));
      return;
    }
    const amountBN = new BigNumber(intputAmt);
    updateNewRatio(new BigNumber(vault.oTokensIssued).minus(
      toBaseUnitBN(amountBN, option.decimals).times(multiplier)
    ));
    setBurnAmt(amountBN);
  };

  const onClickBurnToken = () => {
    burnOToken(
      option.addr,
      toBaseUnitBN(burnAmt, option.decimals).times(multiplier).toString(),
    );
  };

  return (
    <Box heading="Total Issued">
      <div style={{ display: 'flex' }}>
        {/* total Issued */}
        <div style={{ width: '30%' }}>
          <BalanceBlock
            asset={`Owner ${option.symbol} Balance `}
            balance={tokenBalance.div(multiplier).toString()}
          />
        </div>
        {/* Issue More Token */}
        <div style={{ width: '32%', paddingTop: '2%' }}>
          <div style={{ display: 'flex' }}>
            <div style={{ width: '60%' }}>
              <>
                <TextInput
                  type="number"
                  wide
                  value={issueAmt}
                  onChange={(event) => onChangeIssueAmt(event.target.value)}
                />
                <MaxButton
                  onClick={() => {
                    if (option.strikePrice <= 0) return;
                    const maxTotal = new BigNumber(vault.collateral).div(
                      new BigNumber(option.minRatio)
                        .times(new BigNumber(option.strikePrice))
                        .times(strikeValue),
                    );
                    const maxToIssueRaw = maxTotal.minus(new BigNumber(vault.oTokensIssued));
                    const maxToIssue = toTokenUnitsBN(maxToIssueRaw, option.decimals)
                      .div(multiplier); // convert 250 soETH Call => 1 oETH 
                    setIssueAmt(maxToIssue);
                    setNewRatio(option.minRatio);
                  }}
                />
              </>
            </div>
            <div style={{ width: '40%' }}>
              <Button
                disabled={!isOwner}
                wide
                icon={<IconCirclePlus />}
                label="Issue"
                onClick={onClickIssueToken}
              />
            </div>
          </div>
        </div>
        <div style={{ width: '6%' }} />
        
        {/* Burn Tokens */}
        <div style={{ width: '32%', paddingTop: '2%' }}>
          <div style={{ display: 'flex' }}>
            <div style={{ width: '60%' }}>
              <>
                <TextInput
                  type="number"
                  wide
                  value={burnAmt}
                  onChange={(event) => onChangeBurnAmt(event.target.value)}
                />
                <MaxButton
                  onClick={() => {
                    const issued = toTokenUnitsBN(vault.oTokensIssued, option.decimals);
                    const maxToBurn = tokenBalance.lt(issued) ? tokenBalance : issued; // in base token unit
                    setBurnAmt(maxToBurn.div(multiplier));
                    updateNewRatio(issued.minus(maxToBurn));
                  }}
                />
              </>
            </div>
            <div style={{ width: '40%' }}>
              <Button
                disabled={!isOwner}
                wide
                icon={<IconCircleMinus />}
                label="Burn"
                onClick={onClickBurnToken}
              />
            </div>
          </div>
        </div>
      </div>
      {option.type === 'call' &&
        <WarningText 
          text={`1 ${option.symbol} gives you the right to buy 1 ${option.collateral.symbol} with ${(option as types.ETHOption).strikePriceInUSD} ${option.underlying.symbol}`} />
      }
    </Box>
  );
}



export default IssuedTokenManagement;
