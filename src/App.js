import React, {useState} from 'react';

import { HashRouter as Router, Switch, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import Dashboard from './components/Dashboard';
import TokenView from './components/TokenView';
import Footer from './components/Footer'
import { Main } from '@aragon/ui';
import './App.css';

function App() {
  const storedTheme = window.localStorage.getItem('theme') || 'light'

  const [user, setUser] = useState('') // the current connected user  
  const [theme, setTheme] = useState(storedTheme)
  
  const updateTheme = (theme) => {
    setTheme(theme)
    window.localStorage.setItem('theme', theme)
  }
  return (
    <Router>
      <Main theme={theme}>
        <NavBar 
          user = {user}
          setUser = {setUser}
          theme={theme} 
          updateTheme={updateTheme}
        />

        <Switch>
          <Route path='/token/:addr' children={<TokenView user={user} />} />
          <Route path='/' children={<Dashboard />} />
        </Switch>

        <Footer/>
      </Main>
    </Router>
  );
}

export default App;
