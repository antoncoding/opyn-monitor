import React from 'react';
import PropTypes from 'prop-types';

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

MaxButton.propTypes = {
  onClick: PropTypes.func.isRequired,
};

export default MaxButton;
