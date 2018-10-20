/**
 * @jest-environment jsdom
 */

import * as React from 'react';
import { ApolloProvider } from 'react-apollo';
import * as ReactDOM from 'react-dom';
import App from './App';
import { graphqlClient } from './backend/graphql';

jest.mock('./backend/firebase')
jest.mock('./backend/graphql')

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<ApolloProvider client={graphqlClient}><App /></ApolloProvider>, div);
  ReactDOM.unmountComponentAtNode(div);
});
