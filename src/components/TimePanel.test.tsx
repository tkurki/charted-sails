import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Segment } from '../model/Trip';
import TimePanel from './TimePanel';

it('renders without crashing', () => {
  const div = document.createElement('div');
  const testSegment : Segment = {
    end: { time: new Date("2018-06-12T12:32:00"), coordinates: [0,0] },
    start: { time: new Date("2018-06-12T12:31:00"), coordinates: [0,0] },
    values: {}
  }
  ReactDOM.render(<TimePanel startTime={new Date()} endTime={new Date()} selectedSegment={ testSegment } onSelectedTimeChange={ x => true }/>, div);
  ReactDOM.unmountComponentAtNode(div);
});
