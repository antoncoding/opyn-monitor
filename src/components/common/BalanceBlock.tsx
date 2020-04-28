import React from 'react';
// import PropTypes from 'prop-types';

import BigNumber from 'bignumber.js';

type BlanceBlockProps = {
  asset: string,
  balance: BigNumber | string | number
}

function BalanceBlock({ asset, balance }: BlanceBlockProps) {
  let integer = '0';
  let digits = '0';
  if (new BigNumber(balance).gt(new BigNumber(0))) {
    const str = new BigNumber(balance).toString();
    const split = str.split('.');
    integer = split[0];
    digits = split.length > 1 ? str.split('.')[1] : '0';
  }

  return (
    <>
      <div style={{ fontSize: 14, padding: 3 }}>{asset}</div>
      <div style={{ padding: 3 }}>
        <span style={{ fontSize: 24 }}>{integer}</span>
        .
        <span style={{ fontSize: 18 }}>
          {' '}
          {digits}
          {' '}
        </span>
      </div>
    </>
  );
}

export default BalanceBlock;
