import React from 'react';

import { Main, Header } from '@aragon/ui'
import VaultOwnerList from './components/VaultOwnerList'
import ConnectButton from './components/ConnectButton'
import './App.css';

function App() {
  return (
    <Main>
      <Header
        primary="Opyn Liquidator"
        secondary={<ConnectButton />}
      />
      <VaultOwnerList/>
    </Main>
  );
}

export default App;
