import React, { useState, useMemo } from 'react';
import {
  Box, DataView, Button, TransactionBadge,
} from '@aragon/ui';
import { BalanceBlock } from '../common/index';
import { removeUnderlying } from '../../utils/web3';
import { getRemoveUnderlyingHistory } from '../../utils/graph';
import { formatDigits, toTokenUnitsBN, timeSince } from '../../utils/number';
import { option } from '../../types';

type RemoveUnderlyingHistoryEntry = {
  amount: string;
  timestamp: string;
  transactionHash: string;
}

type RemoveUnderlyingProps = {
  owner: string,
  option: option
  underlyingAmount: string,
}

function RemoveUnderlying({
  owner, option, underlyingAmount
}: RemoveUnderlyingProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [entries, setEntries] = useState<RemoveUnderlyingHistoryEntry[]>([]);
  const [page, setPage]= useState(0)
  useMemo(async () => {
    const actions = await getRemoveUnderlyingHistory(owner, option.addr);
    setEntries(actions);
    setIsLoading(false);
  }, [owner, option]);

  return (
    <>
      <Box heading="Underlying">
        <div style={{ display: 'flex' }}>
          {/* balance */}
          <div style={{ width: '30%' }}>
            {BalanceBlock({
              asset: 'Redeemable',
              balance: formatDigits(toTokenUnitsBN(underlyingAmount, option.underlying.decimals), 6),
            })}
          </div>
          <div style={{ width: '70%', padding: '2%' }}>
            <Button
              label="Redeem Underlying"
              onClick={() => { removeUnderlying(option.addr); }}
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
                toTokenUnitsBN(amount, option.underlying.decimals).toNumber(),
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
