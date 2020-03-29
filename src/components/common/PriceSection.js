import React from 'react';
import PropTypes from 'prop-types';

function PriceSection({
  label, amt, symbol = '', forceDisplay = false,
}) {
  if (parseFloat(amt) > 0 || forceDisplay) {
    return (
      <div style={{ padding: 3, opacity: 0.5 }}>
        <span style={{ fontSize: 13 }}>{label}</span>
        <span style={{ fontSize: 13 }}>{parseFloat(amt).toFixed(5)}</span>
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
  ]).isRequired,
  forceDisplay: PropTypes.bool,
};

PriceSection.defaultProps = {
  symbol: '',
  forceDisplay: false,
};

export default PriceSection;
