import React from 'react';
import PropTypes from 'prop-types';
import BigNumber from 'bignumber.js';

function PriceSection({
  label, amt, symbol = '', forceDisplay = false,
}) {
  const amtBN = new BigNumber(amt);
  if (amtBN.gt(new BigNumber(0)) || forceDisplay) {
    return (
      <div style={{ padding: 3, opacity: 0.5 }}>
        <span style={{ fontSize: 13 }}>{label}</span>
        <span style={{ fontSize: 13 }}>{amtBN.toNumber().toFixed(5)}</span>
        <span style={{ fontSize: 13 }}>{symbol}</span>
      </div>
    );
  }
  return <div style={{ padding: 3, opacity: 0.5 }} />;
}

PriceSection.propTypes = {
  label: PropTypes.string.isRequired,
  symbol: PropTypes.string,
  amt: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.instanceOf(BigNumber),
  ]).isRequired,
  forceDisplay: PropTypes.bool,
};

PriceSection.defaultProps = {
  symbol: '',
  forceDisplay: false,
};

export default PriceSection;
