import React from 'react';
import PropTypes from 'prop-types';

function HelperText({ label, amt }) {
  if (parseFloat(amt) > 0) {
    return (
      <div style={{ padding: 3, opacity: 0.5 }}>
        <span style={{ fontSize: 13 }}>
          {label}
        </span>
        <span style={{ fontSize: 13 }}>
          {parseFloat(amt).toFixed(5)}
        </span>
      </div>
    );
  } return <div style={{ padding: 3, opacity: 0.5 }} />;
}

HelperText.propTypes = {
  label: PropTypes.string.isRequired,
  amt: PropTypes.string.isRequired,
};

export default HelperText;
