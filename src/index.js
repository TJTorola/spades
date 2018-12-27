import React from 'react';
import ReactDOM from 'react-dom';

import * as App from 'app.jsx'
import 'index.css';
import * as serviceWorker from 'serviceWorker.js';

window.App = App;

ReactDOM.render(<App.Spades />, document.getElementById('root'));

serviceWorker.unregister();
