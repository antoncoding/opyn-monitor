import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  Box, DataView, Button, TransactionBadge,
} from '@aragon/ui';
import { BalanceBlock } from '../common';
import { getDecimals } from '../../utils/infura';
import { removeUnderlying } from '../../utils/web3';
import { getRemoveUnderlyingHistory } from '../../utils/graph';
import { formatDigits, toTokenUnitsBN, timeSince } from '../../utils/number';

function RemoveUnderlying({
  owner, token, underlying, underlyingAmount,
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [entries, setEntries] = useState([]);
  const [underlyingDecimals, setUnderlyingDecimals] = useState(18);

  useMemo(async () => {
    const [actions, uDecimals] = await Promise.all([
      getRemoveUnderlyingHistory(owner, token),
      getDecimals(underlying),
    ]);
    setEntries(actions);
    setIsLoading(false);
    setUnderlyingDecimals(uDecimals);
  }, [owner, token, underlying]);

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
          renderEntry={({
            transactionHash, amount, timestamp,
          }) => [
            <TransactionBadge shorten={false} transaction={transactionHash} />,
            formatDigits(
              toTokenUnitsBN(amount, underlyingDecimals).toNumber(),
              5,
            ),
            timeSince(parseInt(timestamp * 1000, 10)),
          ]}
        />
      </Box>
    </>
  );
}

RemoveUnderlying.propTypes = {
  owner: PropTypes.string.isRequired,
  token: PropTypes.string.isRequired,
  underlying: PropTypes.string.isRequired,
  underlyingAmount: PropTypes.string.isRequired,
};

export default RemoveUnderlying;
