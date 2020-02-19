import React from 'react';
import { getAllVaultOwners } from './utils/graph'
import './App.css';

function App() {

  const onClickSearch = async () => {
    const owners = await getAllVaultOwners()
    console.log(`owners = ${owners}`)
  }

  return (
    <div className="App">
      <header className="App-header">
        <h3>
          Opyn Liquidator
        </h3>
        <button onClick = {onClickSearch}> Search </button>
      </header>
    </div>
  );
}

export default App;
