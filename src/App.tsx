import React, { useState } from 'react';

import { HashRouter as Router, Switch, Route } from 'react-router-dom';
import { Main } from '@aragon/ui';
import { updateModalMode } from './utils/web3';
import { storePreference, getPreference } from './utils/storage';
import NavBar from './components/NavBar';
import HomePage from './components/HomePage';
import AllOptoins from './components/AllContracts';
import Trade from './components/Trade/index';
import OptionTrading from './components/OptionTrading';
import MyVaults from './components/MyVaults';
import OptionPage from './components/OptionPage';
import ManageVault from './components/ManageVault';
import Uniswap from './components/UniswapTrade';
import CreateOption from './components/CreateOption'
import Footer from './components/Footer';

function App() {
  const storedTheme = getPreference('theme', 'light');

  const [user, setUser] = useState(''); // the current connected user
  const [theme, setTheme] = useState(storedTheme);

  const updateTheme = (newTheme:string) => {
    setTheme(newTheme);
    updateModalMode(newTheme);
    storePreference('theme', newTheme);
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
          {/* Trading */}
          <Route path="/trade/oeth-usdc/">
            <OptionTrading
              user={user}
            />
          </Route>
          {/* <Route path="/trades/test/"><ZEROXTest /></Route> */}
          <Route path="/uniswap/:token/"><Uniswap user={user} /></Route>
          <Route path="/uniswap/">
            <Trade />
          </Route>
          <Route path="/create/"><CreateOption user={user}/></Route>
          {/* HomePage */}
          <Route path="/"><HomePage /></Route>
        </Switch>
        <Footer theme={theme} />
      </Main>
    </Router>
  );
}


export default App;
