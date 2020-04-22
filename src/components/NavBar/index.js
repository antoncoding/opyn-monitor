import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';

import {
  Bar, BackButton, LinkBase,
  // Tag,
} from '@aragon/ui';
import ConnectButton from './ConnectButton';
import ChangeModeButton from './SettingsButton';

function NavBar({
  theme, updateTheme, user, setUser,
}) {
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
            {/* <LinkButton
              title="Trade"
              onClick={() => {
                history.push('/trade/oeth-usdc');
              }}
              isSelected={history.location.pathname.includes('/trade/')}
            />
            <Tag> beta </Tag> */}
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


NavBar.propTypes = {
  theme: PropTypes.string.isRequired,
  updateTheme: PropTypes.func.isRequired,
  user: PropTypes.string.isRequired,
  setUser: PropTypes.func.isRequired,
};

function LinkButton({ title, onClick, isSelected = false }) {
  return (
    <div style={{ paddingLeft: 40 }}>
      <LinkBase onClick={onClick}>
        <div style={{ padding: '1%', opacity: isSelected ? 1 : 0.5, fontSize: 17 }}>{title}</div>
      </LinkBase>
    </div>
  );
}

LinkButton.propTypes = {
  title: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  isSelected: PropTypes.bool.isRequired,
};

export default NavBar;
