import React, { useState, useMemo } from 'react';

import {
  Box, DataView, TransactionBadge,
} from '@aragon/ui';

import { CustomIdentityBadge } from '../common'

import { getExerciseHistory } from '../../utils/graph';
import { formatDigits, toTokenUnitsBN, timeSince } from '../../utils/number';

type exerciseEntry = {
  amtCollateralToPay: string;
  exerciser: string;
  oTokensToExercise: string;
  timestamp: string;
  transactionHash: string;
}

function ExerciseHistory({
  owner, token, collateralDecimals, tokenDecimals,
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [entries, setEntries] = useState<exerciseEntry[]>([]);

  const [page, setPage] = useState(0)

  useMemo(async () => {
    const actions = await getExerciseHistory(owner, token);
    setEntries(actions);
    setIsLoading(false);
  }, [owner, token]);

  return (
    <>
      {/* History Section */}
      <Box heading="History">
        <DataView
          status={isLoading ? 'loading' : 'default'}
          fields={['Tx', 'Collateral', 'oToken', 'Exerciser', 'Time']}
          entries={entries}
          entriesPerPage={4}
          page={page}
          onPageChange={setPage}
          renderEntry={({
            amtCollateralToPay, oTokensToExercise, exerciser, timestamp, transactionHash,
          }: exerciseEntry) => [
              <TransactionBadge transaction={transactionHash} />,
              formatDigits(
                toTokenUnitsBN(amtCollateralToPay, collateralDecimals).toNumber(),
                5,
              ),
              formatDigits(
                toTokenUnitsBN(oTokensToExercise, tokenDecimals).toNumber(),
                5,
              ),
              <CustomIdentityBadge entity={exerciser} />,
              timeSince(parseInt(timestamp, 10) * 1000),
            ]}
        />
      </Box>
    </>
  );
}

export default ExerciseHistory;
