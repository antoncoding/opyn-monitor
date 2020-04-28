import React from 'react';

function HelperText({ label, amt }: { label: string, amt: string }) {
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


export default HelperText;
