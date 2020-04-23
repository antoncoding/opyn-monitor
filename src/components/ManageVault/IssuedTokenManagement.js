import React, { useState } from 'react';
import BigNumber from 'bignumber.js';
import PropTypes from 'prop-types';
import {
  Box, TextInput, Button, IconCirclePlus, IconCircleMinus,
} from '@aragon/ui';
import { burnOToken, issueOToken } from '../../utils/web3';
import { BalanceBlock, MaxButton, WarningText } from '../common';
import { toBaseUnitBN, toTokenUnitsBN } from '../../utils/number';
import { calculateRatio } from '../../utils/calculation';
import * as MyPTypes from '../types';
/**
 *
 * @param {{
 * strikeValue: BigNumber,
 * tokenBalance: BigNumber,
 * strikePrice: Number,
 * decimals: Number
 * }} param0
 */
function IssuedTokenManagement({
  isOwner,
  vault,
  tokenBalance,
  token,
  strikeValue,
  strikePrice,
  minRatio,
  decimals,
  symbol,
  setNewRatio,
  strikePriceInUSD,
  collateralSymbol,
}) {
  const [issueAmt, setIssueAmt] = useState(new BigNumber(0));
  const [burnAmt, setBurnAmt] = useState(new BigNumber(0));

  /**
   *
   * @param {BigNumber} newAmt in raw amt
   */
  const updateNewRatio = (newAmt) => {
    if (newAmt.lte(new BigNumber(0))) return;
    const newRatio = calculateRatio(vault.collateral, newAmt, strikePrice, strikeValue);
    setNewRatio(newRatio);
  };

  const onChangeIssueAmt = (intputAmt) => {
    if (!intputAmt) {
      setIssueAmt(new BigNumber(0));
      return;
    }
    const amountBN = new BigNumber(intputAmt);
    setIssueAmt(amountBN);
    updateNewRatio(new BigNumber(vault.oTokensIssued).plus(toBaseUnitBN(amountBN, decimals)));
  };

  const onClickIssueToken = () => {
    issueOToken(
      token,
      toBaseUnitBN(issueAmt, decimals).toString(),
    );
  };

  const onChangeBurnAmt = (intputAmt) => {
    if (!intputAmt) {
      setBurnAmt(new BigNumber(0));
      return;
    }
    const amountBN = new BigNumber(intputAmt);
    updateNewRatio(new BigNumber(vault.oTokensIssued).minus(toBaseUnitBN(amountBN, decimals)));
    setBurnAmt(amountBN);
  };

  const onClickBurnToken = () => {
    burnOToken(
      token,
      toBaseUnitBN(burnAmt, decimals).toString(),
    );
  };

  return (
    <Box heading="Total Issued">
      <div style={{ display: 'flex' }}>
        {/* total Issued */}
        <div style={{ width: '30%' }}>
          <BalanceBlock
            asset={`Owner ${symbol} Balance `}
            balance={tokenBalance.toString()}
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
                    if (strikePrice <= 0) return;
                    const maxTotal = new BigNumber(vault.collateral).div(
                      new BigNumber(minRatio).times(new BigNumber(strikePrice)).times(strikeValue),
                    );
                    const maxToIssueRaw = maxTotal.minus(new BigNumber(vault.oTokensIssued));
                    const maxToIssue = toTokenUnitsBN(maxToIssueRaw, decimals);
                    setIssueAmt(maxToIssue);
                    setNewRatio(minRatio);
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
        {/* Remove collateral */}
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
                    const issued = toTokenUnitsBN(vault.oTokensIssued, decimals);
                    const maxToBurn = tokenBalance.lt(issued) ? tokenBalance : issued; // min (issued, tokenBalance)
                    setBurnAmt(maxToBurn);
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
      { symbol.toLowerCase().includes('call')
        ? <WarningText text={`1 ${collateralSymbol} can create ${strikePriceInUSD} ${symbol}`} />
        : <></>}
    </Box>
  );
}

IssuedTokenManagement.propTypes = {
  isOwner: PropTypes.bool.isRequired,
  vault: MyPTypes.vault.isRequired,
  tokenBalance: PropTypes.instanceOf(BigNumber).isRequired,
  token: PropTypes.string.isRequired,
  strikeValue: PropTypes.instanceOf(BigNumber).isRequired,
  strikePrice: PropTypes.number.isRequired,
  minRatio: PropTypes.number.isRequired,
  decimals: PropTypes.number.isRequired,
  symbol: PropTypes.string.isRequired,
  setNewRatio: PropTypes.func.isRequired,
  //
  strikePriceInUSD: PropTypes.number.isRequired,
  collateralSymbol: PropTypes.string.isRequired,
};

export default IssuedTokenManagement;
