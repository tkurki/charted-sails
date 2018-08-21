import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './App';
import './index.css';

ReactDOM.render(
  <App />,
  document.getElementById('root') as HTMLElement
);

// Disable service worker. They do not work without HTTPS on Chrome anyway.
// registerServiceWorker();
