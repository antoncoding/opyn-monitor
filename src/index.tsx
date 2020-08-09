import React from 'react';
import ReactDOM from 'react-dom';
// import 'react-widgets/dist/css/react-widgets.css';
// import 'bootstrap/dist/css/bootstrap-grid.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

// import Moment from 'moment'
// import momentLocalizer from 'react-widgets-moment';

// Moment.locale('en')
// momentLocalizer()

ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
