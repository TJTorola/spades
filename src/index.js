import React from 'react';
import ReactDOM from 'react-dom';

import { Root } from 'app.jsx'
import 'index.css';
import * as serviceWorker from 'serviceWorker.js';

ReactDOM.render(<Root />, document.getElementById('root'));

serviceWorker.unregister();
