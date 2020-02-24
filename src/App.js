import React from 'react';

import { Main } from '@aragon/ui'
import VaultOwnerList from './components/VaultOwnerList'
import Overview from './components/VaultInfoBox'
// import ConnectButton from './components/ConnectButton'
import './App.css';

import { mainnet } from './constants/addresses'
import { mainnet as mainnetParams } from './constants/parameters'
function App() {
  return (
    <Main>
      <Overview
        oToken={mainnet.ocDAI}
        tokenName={mainnetParams.ocDAI.tokenName}
      />
      <VaultOwnerList
        oToken={mainnet.ocDAI}
        decimals={mainnetParams.ocDAI.decimals}
        underlying={mainnetParams.ocDAI.underlying}
        minRatio={mainnetParams.ocDAI.minCollateralizationRatio}
        oracle={mainnetParams.ocDAI.oracle}
      />
    </Main>
  );
}

export default App;
