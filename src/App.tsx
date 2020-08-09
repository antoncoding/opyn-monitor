import React, { useState } from 'react';

import { HashRouter as Router, Switch, Route } from 'react-router-dom';
import { Main, Layout } from '@aragon/ui';
import { updateModalMode } from './utils/web3';
import { storePreference, getPreference } from './utils/storage';

import { userContext } from './contexts/userContext'
import { useConnectedUser } from './hooks/useConnectedUser'

import NavBar from './components/NavBar';
import HomePage from './components/HomePage';

import OptionLists from './components/AllContracts';
import OptionDetail from './components/OptionPage';
import MyVaults from './components/MyVaults';
import ManageVault from './components/ManageVault';
import ExchangeList from './components/ExchangeList/index';
import UniswapExchanges from './components/UniswapExchange';
import TradeOnUniswap from './components/TradeUniswap'
import TradeOn0x from './components/Trade0x';
import Footer from './components/Footer';

function App() {
  const storedTheme = getPreference('theme', 'light');

  const [theme, setTheme] = useState(storedTheme);

  const updateTheme = (newTheme: string) => {
    setTheme(newTheme);
    updateModalMode(newTheme);
    storePreference('theme', newTheme);
  };

  const userInfo = useConnectedUser()

  return (
    <Router>
      <Main assetsUrl={`${process.env.PUBLIC_URL}/aragon-ui/`} theme={theme} layout={false}>
      <userContext.Provider value={userInfo}>
        <NavBar theme={theme} updateTheme={updateTheme} />

        <Switch>

          {/* All Options */}
          <Route path="/option/:token">
            <Layout>
              <OptionDetail/>
            </Layout>
          </Route>
          
          <Route path="/options/">
            <Layout>
              <OptionLists />
            </Layout>
          </Route>
          
          {/* My Vaults */}
          <Route path="/myvaults">
            <Layout>
              <MyVaults/>
            </Layout>
          </Route>
          
          <Route path="/manage/:token/:owner">
            <Layout>
              <ManageVault/>
            </Layout>
          </Route>

          {/* Not Using Layout */}
          <Route path="/trade/0x/"><TradeOn0x/></Route>

          <Route path="/trade/uniswap">
            <Layout>
              <TradeOnUniswap />
            </Layout>
          </Route>
          {/* <Route path="/trades/test/"><ZEROXTest /></Route> */}
          <Route path="/uniswap/:token/"><Layout><UniswapExchanges /></Layout></Route>

          <Route path="/uniswap/"><Layout><ExchangeList/></Layout></Route>

          {/* HomePage */}
          <Route path="/"><Layout><HomePage /></Layout></Route>
          {/* </Layout> */}

        </Switch>

        <Footer theme={theme} />
        </userContext.Provider>
      </Main>
    </Router>
  );
}


export default App;
