import React, { useState, useMemo, useEffect } from 'react';

import { Box, DataView, IdentityBadge, TransactionBadge, TextInput, Button } from '@aragon/ui';

import { BalanceBlock, MaxButton } from '../common';
import { liquidate } from '../../utils/web3';
import { getMaxLiquidatable } from '../../utils/infura';
import { getLiquidationHistory } from '../../utils/graph';
import { formatDigits, fromWei, toTokenUnits, timeSince, toBaseUnitString } from '../../utils/number';

function LiquidationHistory({ owner, token, isOwner, tokenDecimals, userTokenBalance }) {
  const [maxLiquidatable, setMaxLiquidatable] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [entries, setEntries] = useState([]);

  const [amountToLiquidate, setAmtToLiquidate] = useState(0);

  useEffect(() => {
    async function updateLiquidatable() {
      const maxToLiquidate = await getMaxLiquidatable(token, owner);
      setMaxLiquidatable(toTokenUnits(maxToLiquidate, tokenDecimals));
    }

    updateLiquidatable();
  });

  useMemo(async () => {
    async function updateList() {
      const actions = await getLiquidationHistory(owner);
      const actionsForThisVault = actions.filter(
        (entry) => entry.vault.optionsContract.address === token
      );
      setEntries(actionsForThisVault);
      setIsLoading(false);
    }
    updateList();
  }, [owner, token]);

  return (
    <>
      {isOwner ? <></> : (
        <Box heading={'Liquidate'}>
          <>
            <div style={{ display: 'flex' }}>
              {/* balance */}
              <div style={{ width: '30%' }}>
                <BalanceBlock asset={`Max To Liquidate`} balance={maxLiquidatable} />
              </div>
              <div style={{ width: '70%', paddingTop: '2%' }}>
                <div style={{ display: 'flex' }}>
                  <div style={{ width: '60%' }}>
                    <>
                      <TextInput
                        type='number'
                        wide={true}
                        value={amountToLiquidate}
                        onChange={(event) => {
                          setAmtToLiquidate(event.target.value);
                        }}
                      />
                      <MaxButton
                        onClick={() => {
                          const maximum = Math.min(userTokenBalance, maxLiquidatable);
                          setAmtToLiquidate(maximum);
                        }}
                      />
                    </>
                  </div>
                  <div style={{ width: '40%' }}>
                    <Button
                      disabled={maxLiquidatable <= 0}
                      label='Liquidate'
                      onClick={() => {
                        const amtToLiquidate = toBaseUnitString(amountToLiquidate, tokenDecimals);
                        liquidate(token, owner, amtToLiquidate);
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        </Box>
      )}

      {/* History Section */}
      <Box heading={'History'}>
        <DataView
          status={isLoading ? 'loading' : 'default'}
          fields={['Tx', 'Amount', 'Liquidator', 'Time']}
          entries={entries}
          entriesPerPage={4}
          renderEntry={({ collateralToPay, liquidator, timestamp, transactionHash }) => {
            return [
              <TransactionBadge transaction={transactionHash} />,
              formatDigits(fromWei(collateralToPay), 5),
              <IdentityBadge entity={liquidator} />,
              timeSince(parseInt(timestamp * 1000)),
            ];
          }}
        />
      </Box>
    </>
  );
}

export default LiquidationHistory;
