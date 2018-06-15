import * as React from 'react';
import * as ReactDOM from 'react-dom';
import TimePanel from './TimePanel';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<TimePanel startTime={new Date()} endTime={new Date()}/>, div);
  ReactDOM.unmountComponentAtNode(div);
});
