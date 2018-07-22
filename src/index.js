// Libraries
import React from 'react'
import ReactDOM from 'react-dom'

// Javascript
import App from './app/App'
import registerServiceWorker from './registerServiceWorker'

// Stylesheets
import './index.css'
import 'bootstrap/dist/css/bootstrap.min.css';

ReactDOM.render(<App />, document.getElementById('root'))
registerServiceWorker()
