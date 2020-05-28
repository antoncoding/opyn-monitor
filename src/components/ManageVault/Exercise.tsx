import React, { useState, useMemo } from 'react';

import {
  Box, DataView, TransactionBadge,
} from '@aragon/ui';

import { CustomIdentityBadge } from '../common'

import { getExerciseHistory } from '../../utils/graph';
import { formatDigits, toTokenUnitsBN, timeSince } from '../../utils/number';
import { option } from '../../types';

type exerciseEntry = {
  amtCollateralToPay: string;
  exerciser: string;
  oTokensToExercise: string;
  timestamp: string;
  transactionHash: string;
}

type ExerciseHistoryProps = {
  owner: string
  option: option
}

function ExerciseHistory({
  owner, option,
}:ExerciseHistoryProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [entries, setEntries] = useState<exerciseEntry[]>([]);

  const [page, setPage] = useState(0)

  useMemo(async () => {
    const actions = await getExerciseHistory(owner, option.addr);
    setEntries(actions);
    setIsLoading(false);
  }, [owner, option.addr]);

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
                toTokenUnitsBN(amtCollateralToPay, option.collateral.decimals).toNumber(),
                5,
              ),
              formatDigits(
                toTokenUnitsBN(oTokensToExercise, option.decimals).toNumber(),
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
