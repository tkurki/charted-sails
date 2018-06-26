import { storiesOf } from '@storybook/react';
import * as React from 'react';
import DataPanel from './DataPanel'

import { number, withKnobs } from '@storybook/addon-knobs';

import '../index.css'
import TimeSelection from '../model/TimeSelection';
import TripDataProvider from '../model/TripDataProvider';

const stories = storiesOf('Components/DataPanel', module)
stories.addDecorator(withKnobs)

stories.add('Showing the time only', () => {
  const testSelection = new TimeSelection(new Date())
  const testDataProvider : TripDataProvider = {
    getAvailableValues: () => ([ ]),
    getValueAtTime: () => null,
    getValuesAtTime: () => ({})
  }
  return <DataPanel dataProvider={testDataProvider} hoveringMode={false} selection={testSelection}/>
})

stories.add('Showing time and basic infos', () => {
  const testSelection = new TimeSelection(new Date())
  const testDataProvider : TripDataProvider = {
    getAvailableValues: () => (['navigation.speedOverGround', 'navigation.courseOverGround' ]),
    getValueAtTime: () => null,
    getValuesAtTime: () => ({
      'navigation.speedThroughWater': number('Sog', 3), /* m/s */
      'navigation.courseOverGround': number('Cog', 30)/360*2*Math.PI
    })
  }
  return <DataPanel dataProvider={testDataProvider} hoveringMode={false} selection={testSelection}/>
  })
