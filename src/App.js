import React, {useState} from 'react';

import { HashRouter as Router, Switch, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import Dashboard from './components/Dashboard';
import TokenView from './components/TokenView';
import { Main } from '@aragon/ui';
import './App.css';

function App() {
  const storedTheme = window.localStorage.getItem('theme') || 'light'
  const [theme, setTheme] = useState(storedTheme)
  
  const updateTheme = (theme) => {
    setTheme(theme)
    window.localStorage.setItem('theme', theme)
  }
  return (
    <Router>
      <Main theme={theme}>
        <NavBar theme={theme} updateTheme={updateTheme}/>

        <Switch>
          <Route path='/token/:addr' children={<TokenView />} />
          <Route path='/' children={<Dashboard />} />
        </Switch>
      </Main>
    </Router>
  );
}

export default App;
