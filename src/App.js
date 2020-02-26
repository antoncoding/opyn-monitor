import React, {useState} from 'react';

import { HashRouter as Router, Switch, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import Dashboard from './components/Dashboard';
import TokenView from './components/TokenView';
import { Main } from '@aragon/ui';
import './App.css';

function App() {
  const [theme, setTheme] = useState('light')
  return (
    <Router>
      <Main theme={theme}>
        <NavBar theme={theme} updateTheme={setTheme}/>

        <Switch>
          <Route path='/token/:addr' children={<TokenView />} />
          <Route path='/' children={<Dashboard />} />
        </Switch>
      </Main>
    </Router>
  );
}

export default App;
