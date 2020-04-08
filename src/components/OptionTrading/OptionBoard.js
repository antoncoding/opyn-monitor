import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { DataView } from '@aragon/ui';
import { getBasePairAskAndBids } from '../../utils/0x';
import { option as OptionType } from '../types';

function OptionBoard({ calls, puts }) {
  const [putStats, setPutStats] = useState([]);
  const [callStats, setCallStats] = useState([]);

  // get option status
  useMemo(() => {
    let isCancelled = false;
    const updateBoardStats = async () => {
      const [callData, putData] = await Promise.all([
        getBasePairAskAndBids(calls),
        getBasePairAskAndBids(puts),
      ]);

      if (!isCancelled) {
        setCallStats(callData);
        setPutStats(putData);
      }
    };
    updateBoardStats();
    const id = setInterval(updateBoardStats, 1000);

    return () => {
      isCancelled = true;
      clearInterval(id);
    };
  }, []);

  return (
    <>
      <DataView
        fields={['addr', 'bid', 'ask']}
        entries={putStats}
        entriesPerPage={5}
        renderEntry={({ option, bestBid, bestAsk }) => [
          <>{option}</>,
          <>{bestBid.toFixed(5)}</>,
          <>{bestAsk.toFixed(5)}</>,
        ]}
      />
      <DataView
        fields={['addr', 'bid', 'ask']}
        entries={callStats}
        entriesPerPage={5}
        renderEntry={({ option, bestBid, bestAsk }) => [
          <>{option}</>,
          <>{bestBid.toFixed(5)}</>,
          <>{bestAsk.toFixed(5)}</>,
        ]}
      />
    </>
  );
}

OptionBoard.propTypes = {
  calls: PropTypes.arrayOf(OptionType).isRequired,
  puts: PropTypes.arrayOf(OptionType).isRequired,
};

export default OptionBoard;
