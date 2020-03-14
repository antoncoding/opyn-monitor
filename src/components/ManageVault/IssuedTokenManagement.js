import React, { useState } from 'react';
import { burnOToken, issueOToken } from '../../utils/web3';
import { BalanceBlock, MaxButton } from '../common';
import { handleDecimals, formatDigits } from '../../utils/number';
import { Box, TextInput, Button, IconCirclePlus, IconCircleMinus } from '@aragon/ui';

function IssuedTokenManagement({
  isOwner,
  vault,
  tokenBalance,
  token,
  lastETHValueInStrike,
  strikePrice,
  minRatio,
  decimals,
  symbol,
  setNewRatio,
}) {
  const [issueAmt, setIssueAmt] = useState(0);
  const [burnAmt, setBurnAmt] = useState(0);

  const updateNewRatio = (newAmt) => {
    const newRatio = formatDigits(
      (vault.collateral * lastETHValueInStrike) / (strikePrice * newAmt),
      5
    );
    setNewRatio(newRatio);
  };

  const onChangeIssueAmt = (event) => {
    const amt = event.target.value;
    setIssueAmt(amt);
    updateNewRatio(parseInt(vault.oTokensIssued) + handleDecimals(amt, decimals));
  }

  const onClickIssueToken = () => {
    issueOToken(token, handleDecimals(issueAmt, decimals));
  }

  const onChangeBurnAmt = (event) => {
    const amt = event.target.value;
    updateNewRatio(parseInt(vault.oTokensIssued) - handleDecimals(amt, decimals));
    setBurnAmt(amt);
  }

  const onClickBurnToken = () => {
    burnOToken(token, handleDecimals(burnAmt, decimals));
  }

  return (
    <Box heading={'Total Issued'}>
      <div style={{ display: 'flex' }}>
        {/* total Issued */}
        <div style={{ width: '30%' }}>
          <BalanceBlock
            asset={`Owner ${symbol} Balance `}
            balance={tokenBalance}
          />
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
                  onChange={onChangeIssueAmt}
                />
                <MaxButton
                  onClick={() => {
                    if (strikePrice <= 0) return;

                    const maxTotal =
                      (vault.collateral * lastETHValueInStrike) / (minRatio * strikePrice);
                    const maxToIssueRaw = maxTotal - vault.oTokensIssued;
                    const maxToIssue = maxToIssueRaw / 10 ** decimals;
                    setIssueAmt(maxToIssue);
                    setNewRatio(minRatio);
                  }}
                />
              </>
            </div>
            <div style={{ width: '40%' }}>
              <Button
                disabled={!isOwner}
                wide={true}
                icon={<IconCirclePlus />}
                label='Issue'
                onClick={onClickIssueToken}
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
                  onChange={onChangeBurnAmt}
                />
                <MaxButton
                  onClick={() => {
                    const issued = Number(vault.oTokensIssued) / 10 ** decimals;
                    setBurnAmt(Math.min(tokenBalance, issued));
                  }}
                />
              </>
            </div>
            <div style={{ width: '40%' }}>
              <Button
                disabled={!isOwner}
                wide={true}
                icon={<IconCircleMinus />}
                label='Burn'
                onClick={onClickBurnToken}
              />
            </div>
          </div>
        </div>
      </div>
    </Box>
  );
}

export default IssuedTokenManagement;
