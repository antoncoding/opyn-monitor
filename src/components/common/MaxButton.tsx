import React from 'react';

import {
  ButtonBase,
} from '@aragon/ui';

function MaxButton({ onClick }:{ onClick: Function }) {
  return (
    <div style={{ padding: 3 }}>
      <ButtonBase onClick={onClick}>
        <span style={{ opacity: 0.5 }}> Max </span>
      </ButtonBase>
    </div>
  );
}

export default MaxButton;
