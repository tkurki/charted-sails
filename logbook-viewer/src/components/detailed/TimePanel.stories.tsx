import { number, withKnobs } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react';
import * as React from 'react';
import TimePanel from './TimePanel'

import '../index.css'

const myDateKnob = (name:string, start:Date, end:Date, defaultValue:Date) => {
  const numberTimestamp = number(name, defaultValue.getTime(), {
    range: true,
    min: start.getTime(),
    max: end.getTime(),
    step: 1
  })
  return new Date(numberTimestamp)
}

/**
 * @param duration trip duration in milliseconds
 * @param progress where to initialize the time panel. Number from 0 to 1.
 */

const buildTimePanelWithKnob = (start:Date, duration:number, progress: number) => {
  const end = new Date(start.getTime() + duration)
  const current = new Date(start.getTime() + duration * progress)

  return <TimePanel
            endTime={end}
            startTime={start}
            selectedTime={myDateKnob('time', start, end, current)}
            onSelectedTimeChange={ () => true }
          />
}

storiesOf("Components/TimePanel", module)
  .addDecorator(withKnobs)
  .add('Showing a super short log (3 sec)', () => {
    return buildTimePanelWithKnob(new Date("2018-06-23T09:03:12"), 3*1000, 0)
  })
  .add('Showing a short log (10 min)', () => {
    return buildTimePanelWithKnob(new Date("2018-06-23T09:03:12"), 10*60*1000, 0)
  })
  .add('Showing a day sail', () => {
    return buildTimePanelWithKnob(new Date("2018-06-23T09:03:12"), 8.23*3600*1000, 0)
  })
  .add('Showing a medium log (3 days)', () => {
    return buildTimePanelWithKnob(new Date("2018-06-23T09:03:12"), 3.7*24*3600*1000, 0)
  })
  .add('Showing a long race (28 days)', () => {
    return buildTimePanelWithKnob(new Date("2018-06-23T09:03:12"), 28.23*24*3600*1000, 0)
  })
  .add('Showing a super long log (3 years - moitessier style)', () => {
    return buildTimePanelWithKnob(new Date("2018-06-23T09:03:12"), 3*365*24*3600*1000, 0)
  })


