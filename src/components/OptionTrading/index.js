/* eslint-disable no-underscore-dangle */
import React, { useEffect } from 'react';
// import BigNumber from 'bignumber.js';
import { Header } from '@aragon/ui';
import OptionBoard from './OptionBoard';
import { mock_eth_puts as eth_puts, mock_eth_calls as eth_calls } from '../../constants/options';
// import OptionBoard from './OptionBoard';
// import { toTokenUnitsBN, formatDigits } from '../../utils/number';
// import { getBasePairAskAndBids } from '../../utils/0x';

function OptionTrading() {
  // const [optionStats, setOptionStats] = useState([]);

  useEffect(() => {
    // let isCancelled = false;
    // const updateBoardStats = async () => {
    //   if (!isCancelled) {
    //     setOptionStats(allStats);
    //   }
    // };
    // updateBoardStats();
    // const id = setInterval(updateBoardStats, 1000);

    // return () => {
    //   isCancelled = true;
    //   clearInterval(id);
    // };
  }, []);

  return (
    <>
      <Header
        primary="Trade ETH Options"
      />
      <OptionBoard
        puts={eth_puts}
        calls={eth_calls}
      />
    </>
  );
}

export default OptionTrading;
