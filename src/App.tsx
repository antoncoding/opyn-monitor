import React, { useState, useEffect } from 'react';
import BigNumber from 'bignumber.js'

import { getETHPrice } from './utils/etherscan'

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
import PositionManagement from './components/PositionManagement'
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

  const [spotPrice, setSpot] = useState<BigNumber>(new BigNumber(0))

  useEffect(() => {
    let canceled = false
    async function getSpotPrice() {
      const spot = await getETHPrice()
      if (!canceled) {
        setSpot(new BigNumber(spot))
      }
    }
    getSpotPrice()
    const id = setInterval(getSpotPrice, 10000)
    return () => {
      clearInterval(id)
    }
  }, [])

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
          <Route path="/positions/">
           <PositionManagement user={"0xeb919adce5908185a6f6c860ab42812e83ed355a"} spotPrice={spotPrice} />
          </Route>
          {/* <Route path="/trades/test/"><ZEROXTest /></Route> */}
          <Route path="/uniswap/:token/"><Uniswap user={user} spotPrice={spotPrice} /></Route>
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
