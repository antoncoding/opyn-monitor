import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import {
  Bar, BackButton, LinkBase,
  Tag,
} from '@aragon/ui';
import ConnectButton from './ConnectButton';
import ChangeModeButton from './SwitchTheme';

type NavbarProps = {
  theme:string,
  updateTheme: Function,
  user: string,
  setUser: Function
}

function NavBar({
  theme, updateTheme, user, setUser,
}:NavbarProps) {
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
              <BackButton
                onClick={() => {
                  history.goBack();
                }}
              />
            </div>
            <LinkButton
              title="Home"
              onClick={() => {
                history.push('/');
              }}
              isSelected={history.location.pathname === '/'}
            />
            <LinkButton
              title="My Vaults"
              onClick={() => {
                history.push('/myvaults/');
              }}
              isSelected={history.location.pathname === '/myvaults/'}
            />
            <LinkButton
              title="All Contracts"
              onClick={() => {
                history.push('/options/');
              }}
              isSelected={history.location.pathname === '/options/'}
            />
            <LinkButton
              title="Uniswap"
              onClick={() => {
                history.push('/uniswap/');
              }}
              isSelected={history.location.pathname.includes('/uniswap/')}
            />
            <LinkButton
              title="Trade"
              onClick={() => {
                history.push('/trade/oeth-usdc');
              }}
              isSelected={history.location.pathname.includes('/trade/')}
            />
            <Tag> beta </Tag>
          </>
        )
      }
      secondary={(
        <>
          <ConnectButton user={user} setUser={setUser} />
          <ChangeModeButton theme={theme} updateTheme={updateTheme} />
        </>
      )}
    />
  );
}


type linkButtonProps = {
  title:string,
  onClick: Function,
  isSelected?:boolean
}

function LinkButton({ title, onClick, isSelected = false }:linkButtonProps) {
  return (
    <div style={{ paddingLeft: 40 }}>
      <LinkBase onClick={onClick}>
        <div style={{ padding: '1%', opacity: isSelected ? 1 : 0.5, fontSize: 16 }}>{title}</div>
      </LinkBase>
    </div>
  );
}

export default NavBar;
