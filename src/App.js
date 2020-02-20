import React from 'react';

import { Main, Header } from '@aragon/ui'
import VaultOwnerList from './components/VaultOwnerList'
import Overview from './components/VaultInfoBox'
import ConnectButton from './components/ConnectButton'
import './App.css';

import { mainnet } from './constants/addresses'

function App() {
  return (
    <Main>
      <Header
        primary={ "Opyn ocDai Monitor"}
        secondary={<ConnectButton />}
      />
      <Overview
        tokenAddress={mainnet.ocDAI}
      />
      <VaultOwnerList/>
    </Main>
  );
}

export default App;
