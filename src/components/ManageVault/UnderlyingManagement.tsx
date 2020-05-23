import React, { useState, useMemo } from 'react';
import {
  Box, DataView, Button, TransactionBadge,
} from '@aragon/ui';
import { BalanceBlock } from '../common/index';
import { removeUnderlying } from '../../utils/web3';
import { getRemoveUnderlyingHistory } from '../../utils/graph';
import { formatDigits, toTokenUnitsBN, timeSince } from '../../utils/number';

type RemoveUnderlyingHistoryEntry = {
  amount: string;
  timestamp: string;
  transactionHash: string;
}

type RemoveUnderlyingProps = {
  owner: string,
  token: string,
  underlyingDecimals: number,
  underlyingAmount: string,
}

function RemoveUnderlying({
  owner, token, underlyingDecimals, underlyingAmount,
}: RemoveUnderlyingProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [entries, setEntries] = useState<RemoveUnderlyingHistoryEntry[]>([]);
  const [page, setPage]= useState(0)
  useMemo(async () => {
    const actions = await getRemoveUnderlyingHistory(owner, token);
    setEntries(actions);
    setIsLoading(false);
  }, [owner, token]);

  return (
    <>
      <Box heading="Underlying">
        <div style={{ display: 'flex' }}>
          {/* balance */}
          <div style={{ width: '30%' }}>
            {BalanceBlock({
              asset: 'Redeemable',
              balance: formatDigits(toTokenUnitsBN(underlyingAmount, underlyingDecimals), 6),
            })}
          </div>
          <div style={{ width: '70%', padding: '2%' }}>
            <Button
              label="Redeem Underlying"
              onClick={() => { removeUnderlying(token); }}
            />
          </div>
        </div>
        <br />
        <DataView
          status={isLoading ? 'loading' : 'default'}
          fields={['Tx', 'Amount', 'Timestamp']}
          entries={entries}
          entriesPerPage={4}
          page={page}
          onPageChange={setPage}
          renderEntry={({
            transactionHash, amount, timestamp,
          }: RemoveUnderlyingHistoryEntry) => [
              <TransactionBadge shorten={false} transaction={transactionHash} />,
              formatDigits(
                toTokenUnitsBN(amount, underlyingDecimals).toNumber(),
                5,
              ),
              timeSince(parseInt(timestamp, 10) * 1000),
            ]}
        />
      </Box>
    </>
  );
}

export default RemoveUnderlying;
