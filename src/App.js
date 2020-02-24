import React from 'react';

import {
  BrowserRouter as Router,
  Switch,
  Route
} from 'react-router-dom'
import TokenView from './components/TokenView'
import { Main } from '@aragon/ui'
import './App.css';

function App() {
  return (
    <Main>
      <Router>
        <Switch>
          <Route path='/token/:addr' children={<TokenView/>}/>
        </Switch>
      </Router>
    </Main>
  );
}

export default App;

