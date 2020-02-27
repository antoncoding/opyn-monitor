import React, {useEffect, useState} from 'react';
import { useHistory } from 'react-router-dom';

import ConnectButton from './ConnectButton';
import ChangeModeButton from './SettingsButton'
import { Bar, BackButton } from '@aragon/ui';

function NavBar({theme, updateTheme}) {
  const history = useHistory();
  const [isHome, updateIsHome] = useState(true)
  
  useEffect(()=>{
    const home = history.location.pathname === '/';
    updateIsHome(home)
  }, [history.location.pathname]);
  
  const handleBack = (addr) => {
    history.push(`/`);
  };

  return (
    
    <Bar 
      primary={
        isHome ?
        <></> :
        <BackButton onClick={handleBack}/>
      }
      secondary={
        <>
        {/* <Switch
          checked={theme==='dark'}
          onChange={handleChangeTheme}
        ></Switch> */}
        <ConnectButton/>
        <ChangeModeButton theme={theme} updateTheme={updateTheme} />
        </>
      }
    >
      
    </Bar>
  );
}

export default NavBar;
