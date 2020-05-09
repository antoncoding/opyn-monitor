import React from 'react';
import { Button, IconStarFilled, IconStar } from '@aragon/ui';

type switchThemeProps = {
  theme: string,
  updateTheme: Function
}

function SwitchMode({ theme, updateTheme }: switchThemeProps) {
  const handleChangeTheme = () => {
    if (theme === 'light') updateTheme('dark');
    else updateTheme('light');
  };

  return (
    <Button
      icon={theme === 'dark' ? <IconStar /> : <IconStarFilled />}
      onClick={handleChangeTheme}
    />
  );
}


export default SwitchMode;
