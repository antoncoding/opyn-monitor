import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';

import { Bar, BackButton, LinkBase } from '@aragon/ui';
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
              title="My Vaults"
              onClick={() => {
                history.push('/myvaults/');
              }}
            />
            <LinkButton
              title="All Contracts"
              onClick={() => {
                history.push('/options/');
              }}
            />
            <LinkButton
              title="Trade"
              onClick={() => {
                history.push('/trade/');
              }}
            />
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

function LinkButton({ title, onClick }) {
  return (
    <div style={{ paddingLeft: 40 }}>
      <LinkBase onClick={onClick}>
        <div style={{ padding: '1%', opacity: 0.5, fontSize: 17 }}>{title}</div>
      </LinkBase>
    </div>
  );
}

LinkButton.propTypes = {
  title: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default NavBar;
