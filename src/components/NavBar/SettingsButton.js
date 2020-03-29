import React from 'react';
import PropTypes from 'prop-types';
import { Button, IconStarFilled, IconStar } from '@aragon/ui';

function ChangeMode({ theme, updateTheme }) {
  const handleChangeTheme = () => {
    if (theme === 'light') updateTheme('dark');
    else updateTheme('light');
  };

  return (
    <Button
      icon={theme === 'dark' ? <IconStar /> : <IconStarFilled />}
      onClick={handleChangeTheme}
      label="Theme"
    />
  );
}

ChangeMode.propTypes = {
  theme: PropTypes.string.isRequired,
  updateTheme: PropTypes.func.isRequired,
};

export default ChangeMode;
