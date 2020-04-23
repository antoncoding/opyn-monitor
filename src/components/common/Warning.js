import React from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '@aragon/ui';

function WarningText({ text }) {
  const theme = useTheme();
  return (
    <div style={{ color: theme.warning, fontSize: 12, padding: '3px' }}>
      {text}
    </div>
  );
}

WarningText.propTypes = {
  text: PropTypes.string.isRequired,
};

export default WarningText;
