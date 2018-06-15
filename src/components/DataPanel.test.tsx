import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Segment } from '../model/Trip';
import DataPanel from './DataPanel';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<DataPanel segment={null}/>, div)
  ReactDOM.unmountComponentAtNode(div);
});

it('can render an actual segment', () => {
  const segment : Segment = {
    start: { coordinates: [ 1, 2], time: new Date() },
    end: { coordinates: [ 1, 2], time: new Date() },
    values: {
      sog: 12,
      cog: 122,
      twa: 30,
      tws: 4
    }
  }

  const div = document.createElement('div')
  ReactDOM.render(<DataPanel segment={ segment }/>, div)
  ReactDOM.unmountComponentAtNode(div)
})