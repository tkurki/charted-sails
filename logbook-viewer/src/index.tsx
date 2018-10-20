import * as React from 'react';
import { ApolloProvider } from 'react-apollo';
import * as ReactDOM from 'react-dom';
import App from './App';
import { graphqlClient } from './backend/graphql';
import './index.css';

ReactDOM.render(
  <ApolloProvider client={graphqlClient}>
    <App />
  </ApolloProvider>,
  document.getElementById('root') as HTMLElement
);

// Disable service worker. They do not work without HTTPS on Chrome anyway.
// registerServiceWorker();
