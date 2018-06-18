import { storiesOf } from '@storybook/react';
import * as React from 'react';
import DataPanel from './DataPanel'

import { number, withKnobs } from '@storybook/addon-knobs';

import '../index.css'
import { Segment } from '../model/Trip';

const stories = storiesOf('Components/DataPanel', module)
stories.addDecorator(withKnobs)

stories.add('Showing the time only', () => {
    const segment : Segment = {
      start: { coordinates: [ 1, 2], time: new Date("2017-06-12T09:30:01") },
      end: { coordinates: [ 1, 2], time: new Date("2017-06-12T09:30:02") },
      values: {}
    }
    return <DataPanel segment={segment}/>
  })

stories.add('Showing time and basic infos', () => {
    const segment : Segment = {
      start: { coordinates: [ 1, 2], time: new Date("2017-06-12T09:30:01") },
      end: { coordinates: [ 1, 2], time: new Date("2017-06-12T09:30:02") },
      values: {
        Sog: number('Sog', 12),
        Cog: number('Cog', 122),
        Twa: number('Twa', 30),
        Tws: number('Tws', 4)
      }
    }
    return <DataPanel segment={segment}/>
  })
