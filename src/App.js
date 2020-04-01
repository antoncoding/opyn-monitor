import React, { useState } from 'react';

import { HashRouter as Router, Switch, Route } from 'react-router-dom';
import { Main } from '@aragon/ui';
import { updateModalMode } from './utils/web3';
import NavBar from './components/NavBar';
import HomePage from './components/HomePage';
import AllOptoins from './components/AllContracts';
import Trade from './components/Trade';
import OptionTrading from './components/OptionTrading';
import MyVaults from './components/MyVaults';
import OptionPage from './components/OptionPage';
import ManageVault from './components/ManageVault';
import ManagePool from './components/ManagePool';
import Footer from './components/Footer';

function App() {
  const storedTheme = window.localStorage.getItem('theme') || 'light';

  const [user, setUser] = useState(''); // the current connected user
  const [theme, setTheme] = useState(storedTheme);

  const updateTheme = (newTheme) => {
    setTheme(newTheme);
    updateModalMode(newTheme);
    window.localStorage.setItem('theme', newTheme);
  };

  return (
    <Router>
      <Main assetsUrl={`${process.env.PUBLIC_URL}/aragon-ui/`} theme={theme}>
        <NavBar user={user} setUser={setUser} theme={theme} updateTheme={updateTheme} />

        <Switch>
          {/* All Options */}
          <Route path="/option/:token">
            <OptionPage user={user} />
          </Route>
          <Route path="/options/">
            <AllOptoins />
          </Route>
          {/* My Vaults */}
          <Route path="/myvaults">
            <MyVaults user={user} />
          </Route>
          <Route path="/manage/:token/:owner">
            <ManageVault user={user} />
          </Route>
          {/* Trade */}
          <Route path="/trades/eth/"><OptionTrading user={user} /></Route>
          <Route path="/trade/:token/"><ManagePool user={user} /></Route>
          <Route path="/trade/">
            <Trade />
          </Route>
          {/* HomePage */}
          <Route path="/"><HomePage /></Route>
        </Switch>
        <Footer theme={theme} />
      </Main>
    </Router>
  );
}


export default App;
