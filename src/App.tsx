import React, { useState, useEffect, useMemo } from 'react';
import BigNumber from 'bignumber.js'

import { getETHPrice } from './utils/etherscan'

import { HashRouter as Router, Switch, Route } from 'react-router-dom';
import { Main, Layout } from '@aragon/ui';
import { updateModalMode } from './utils/web3';
import { storePreference, getPreference } from './utils/storage';
import { initOptions } from './utils/init'

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
import CreateOption from './components/CreateOption'
import BalancerDemo from './components/Balancer'
import Footer from './components/Footer';

import { optionWithStat, ethOptionWithStat } from './types'

function App() {
  const storedTheme = getPreference('theme', 'light');

  const [isInitializing, setInitializing] = useState(true)

  const [user, setUser] = useState(''); // the current connected user
  const [theme, setTheme] = useState(storedTheme);

  const [options, setOptions] = useState<optionWithStat[]>([])
  const [insurances, setInsurances] = useState<optionWithStat[]>([])
  const [puts, setPuts] = useState<ethOptionWithStat[]>([])
  const [calls, setCalls] = useState<ethOptionWithStat[]>([])

  const updateTheme = (newTheme: string) => {
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

  // Get all options
  useMemo(async()=>{
    const options = await initOptions()
    setOptions(options.insurances.concat(options.calls).concat(options.puts))
    setInsurances(options.insurances)
    setCalls(options.calls)
    setPuts(options.puts)
    setInitializing(false)
  }, [])

  return (
    <Router>
      <Main assetsUrl={`${process.env.PUBLIC_URL}/aragon-ui/`} theme={theme} layout={false}>
        <NavBar user={user} setUser={setUser} theme={theme} updateTheme={updateTheme} />

        <Switch>

          {/* All Options */}
          <Route path="/option/:token">
            <Layout>
              <OptionDetail isInitializing={isInitializing} user={user} options={options}/>
            </Layout>
          </Route>
          
          <Route path="/options/">
            <Layout>
              <OptionLists isInitializing={isInitializing} insurances={insurances} puts={puts} calls={calls} />
            </Layout>
          </Route>
          
          {/* My Vaults */}
          <Route path="/myvaults">
            <Layout>
              <MyVaults isInitializing={isInitializing} user={user} options={options} />
            </Layout>
          </Route>
          
          <Route path="/manage/:token/:owner">
            <Layout>
              <ManageVault options={options} user={user} />
            </Layout>
          </Route>

          {/* Not Using Layout */}
          <Route path="/trade/0x/">
            <TradeOn0x
              puts={puts}
              calls={calls}
              user={user}
            />
          </Route>

          <Route path="/trade/uniswap">
            <Layout>
              <TradeOnUniswap 
                puts={puts}
                calls={calls}
                user={user}
                spotPrice={spotPrice}
              />
            </Layout>
          </Route>
          {/* <Route path="/trades/test/"><ZEROXTest /></Route> */}
          <Route path="/uniswap/:token/">
            <Layout>
              <UniswapExchanges 
                allOptions={options}
                user={user} 
                spotPrice={spotPrice}
              />
            </Layout>
          </Route>

          <Route path="/uniswap/">
            <Layout>
            <ExchangeList 
              isInitializing={isInitializing}
              insurances={insurances}
              eth_options={calls.concat(puts)}  
            />
            </Layout>
          </Route>

          <Route path="/balancer/"><Layout><BalancerDemo /></Layout></Route>
          <Route path="/create/"><Layout><CreateOption user={user} /></Layout></Route>
          {/* HomePage */}
          <Route path="/"><Layout><HomePage /></Layout></Route>
          {/* </Layout> */}

        </Switch>

        <Footer theme={theme} />
      </Main>
    </Router>
  );
}


export default App;
