import React from 'react'

function PriceSection({ label, amt, symbol = '' }) {
  if (parseFloat(amt) > 0) {
    return (
      <div style={{ padding: 3, opacity: 0.5 }}>
        <span style={{ fontSize: 13 }}> {label} </span>{' '}
        <span style={{ fontSize: 13 }}> {parseFloat(amt).toFixed(5)} </span>{' '}
        <span style={{ fontSize: 13 }}> {symbol} </span>
      </div>
    );
  } else return <div style={{ padding: 3, opacity: 0.5 }}></div>;
}

export default PriceSection