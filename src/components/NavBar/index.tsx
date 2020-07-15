import React, { useEffect, useState, useCallback } from 'react';
import styled from 'styled-components'
import { useHistory } from 'react-router-dom';

import {
  Bar, BackButton, LinkBase,
} from '@aragon/ui';
import ConnectButton from './ConnectButton';
import ChangeModeButton from './SwitchTheme';

type NavbarProps = {
  theme: string,
  updateTheme: Function,
}

function MyBar({
  theme, updateTheme,
}: NavbarProps) {
  const history = useHistory();
  const [isHome, updateIsHome] = useState(true);

  const goBack = useCallback(()=>{
    history.goBack();
  }, [history])

  useEffect(() => {
    const home = history.location.pathname === '/';
    updateIsHome(home);
  }, [history.location.pathname]);
  return (
    <Bar
      primary={
        !isHome &&
          <>
            <MaxHeightDiv>
              <BackButton
                onClick={goBack}
              />
            </MaxHeightDiv>
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
            {/* <LinkButton
              title="Exchanges"
              onClick={() => {
                history.push('/uniswap/');
              }}
              isSelected={history.location.pathname.includes('/uniswap/') && !history.location.pathname.includes('/trade/')}
            /> */}
            <LinkButton
              title="Uniswap Trade"
              onClick={() => {
                history.push('/trade/uniswap');
              }}
              isSelected={history.location.pathname.includes('/trade/uniswap')}
            />
            
            <LinkButton
              title="0x Trade"
              onClick={() => {
                history.push('/trade/0x');
              }}
              isSelected={history.location.pathname.includes('/trade/0x')}
            />
          </>
        
      }
      secondary={
        <>
          <ConnectButton />
          <ChangeModeButton theme={theme} updateTheme={updateTheme} />
        </>
      }
    />

  );
}


type linkButtonProps = {
  title: string,
  onClick: Function,
  isSelected?: boolean
}

function LinkButton({ title, onClick, isSelected = false }: linkButtonProps) {
  return (
    <div style={{ paddingLeft: 40 }}>
      <LinkBase onClick={onClick}>
        <Link isSelected={isSelected}> {title} </Link>
      </LinkBase>
    </div>
  );
}

const MaxHeightDiv = styled.div`
  height: 100%;
`

const Link = styled.div`
  padding: '1%';
  opacity: ${ props => props.isSelected ? 1 : 0.5 };
  font-size: 16px;
`

export default MyBar;
