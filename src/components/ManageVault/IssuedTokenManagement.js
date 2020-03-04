import React, { useState } from 'react';

import { burnOToken, issueOToken, } from '../../utils/web3';

import { BalanceBlock, MaxButton } from '../common';

import { handleDecimals } from '../../utils/number'

import { Box, TextInput, Button, IconCirclePlus, IconCircleMinus } from '@aragon/ui';

function IssuedTokenManagement({
  vault,
  tokenBalance,
  token,
  lastETHValueInStrike,
  strikePrice,
  minRatio,
  decimals,
  symbol
}) {
  const [issueAmt, setIssueAmt] = useState(0);
  const [burnAmt, setBurnAmt] = useState(0);

  return (
    <Box heading={'Total Issued'}>
        <div style={{ display: 'flex' }}>
          {/* total Issued */}
          <div style={{ width: '30%' }}>
          <BalanceBlock
            asset={symbol}
            balance={vault.oTokensIssued ? vault.oTokensIssued / 10 ** decimals : 0}
          />
            {/* {balanceBlock(symbol, )} */}
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
                      const issued = Number(vault.oTokensIssued) / 10 ** decimals;
                      setBurnAmt(Math.min(tokenBalance, issued));
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
  );
}


export default IssuedTokenManagement