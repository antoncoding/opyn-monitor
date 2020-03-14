import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import ConnectButton from './ConnectButton';
import ChangeModeButton from './SettingsButton';
import { Bar, BackButton, LinkBase } from '@aragon/ui';

function NavBar({ theme, updateTheme, user, setUser }) {
  const history = useHistory();
  const [isHome, updateIsHome] = useState(true);

  useEffect(() => {
    const home = history.location.pathname === '/';
    updateIsHome(home);
  }, [history.location.pathname]);

  return (
    <Bar
      primary={
        isHome ? (
          <></>
        ) : (
          <>
            <div style={{ height: '100%' }}>
              <BackButton onClick={()=>{
                history.goBack();
              }} />
            </div>
            <LinkButton title='My Vaults' onClick={()=>{history.push('/myvaults/')}} />
            <LinkButton title='All Contracts' onClick={()=>{history.push('/options/')}} />
            <LinkButton title='Trade' onClick={()=>{history.push('/trade/')}} />
          </>
        )
      }
      secondary={
        <>
          <ConnectButton user={user} setUser={setUser} />
          <ChangeModeButton theme={theme} updateTheme={updateTheme} />
        </>
      }
    ></Bar>
  );
}

function LinkButton ({title, onClick}){
  return(
    <div style={{ paddingLeft: 40 }}>
      <LinkBase onClick={onClick}> 
        <div style={{padding: '1%', opacity:0.5, fontSize: 17}}>
            {title}
        </div>
        </LinkBase>
    </div>
  )
}

export default NavBar;
