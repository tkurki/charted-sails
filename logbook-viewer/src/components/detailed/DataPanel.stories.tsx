import { SKDelta, SKPosition, TripDataProvider } from '@aldis/strongly-signalk';
import { number, withKnobs } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react';
import * as React from 'react';
import '../../index.css';
import TimeSelection from '../../model/TimeSelection';
import DataPanel from './DataPanel';

const stories = storiesOf('Components/DataPanel', module)
stories.addDecorator(withKnobs)

stories.add('Showing the time only', () => {
  const testSelection = new TimeSelection(new Date())
  const testDataProvider : TripDataProvider = {
    getAvailableValues: () => ([ ]),
    getValueAtTime: () => null,
    getValuesAtTime: () => ({}),
    getTripData: () => new SKDelta()
  }
  return <DataPanel dataProvider={testDataProvider} hoveringMode={false} selection={testSelection}/>
})

stories.add('Showing time and basic infos', () => {
  const testSelection = new TimeSelection(new Date())
  const testDataProvider : TripDataProvider = {
    getAvailableValues: () => (['navigation.speedOverGround', 'navigation.courseOverGround', 'environment.wind.angleApparent' ]),
    getValueAtTime: () => null,
    getValuesAtTime: () => ({
      'navigation.speedOverGround': number('Sog (kts)', 3)*1852/3600, /* m/s */
      'navigation.courseOverGround': number('Cog (deg)', 30)/360*2*Math.PI,
      'environment.wind.angleApparent': number('AWA (deg)', -35)/360*2*Math.PI,
    }),
    getTripData: () => (new SKDelta())
  }
  return <DataPanel dataProvider={testDataProvider} hoveringMode={false} selection={testSelection}/>
  })

stories.add('Showing heading true', () => {
  const testSelection = new TimeSelection(new Date())
  const testDataProvider : TripDataProvider = {
    getAvailableValues: () => (['navigation.headingTrue', 'navigation.courseOverGround' ]),
    getValueAtTime: () => null,
    getValuesAtTime: () => ({
      'navigation.courseOverGround': number('Cog (deg)', 30)/360*2*Math.PI,
      'navigation.headingTrue': number('HDGt (deg)', 30)/360*2*Math.PI,
    }),
    getTripData: () => (new SKDelta())
  }
  return <DataPanel dataProvider={testDataProvider} hoveringMode={false} selection={testSelection}/>
  })

stories.add('Showing position', () => {
  const testSelection = new TimeSelection(new Date())
  const testDataProvider : TripDataProvider = {
    getAvailableValues: () => (['navigation.position', 'navigation.courseOverGround' ]),
    getValueAtTime: () => null,
    getValuesAtTime: () => ({
      'navigation.courseOverGround': number('Cog (deg)', 30)/360*2*Math.PI,
      'navigation.position': new SKPosition(number('Lat', 43.3333), number('Lon', 78.3))
    }),
    getTripData: () => (new SKDelta())
  }
  return <DataPanel dataProvider={testDataProvider} hoveringMode={false} selection={testSelection}/>
})

stories.add('Showing undefined position', () => {
  const testSelection = new TimeSelection(new Date())
  const testDataProvider : TripDataProvider = {
    getAvailableValues: () => (['navigation.position', 'navigation.courseOverGround' ]),
    getValueAtTime: () => null,
    getValuesAtTime: () => ({
      'navigation.courseOverGround': number('Cog (deg)', 30)/360*2*Math.PI
    }),
    getTripData: () => (new SKDelta())
  }
  return <DataPanel dataProvider={testDataProvider} hoveringMode={false} selection={testSelection}/>
})
