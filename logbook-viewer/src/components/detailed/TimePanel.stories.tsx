import { action } from '@storybook/addon-actions';
import { number, withKnobs } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react';
import * as React from 'react';
import '../../index.css';
import TimePanel from './TimePanel';

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
            playSpeed={0} onPlaySpeedChange={ (speed) => action(`new speed: ${speed}`) }
          />
}

storiesOf("Components/TimePanel", module)
  .addDecorator(withKnobs)
  .add('Showing a super short log (3 sec)', () => {
    return buildTimePanelWithKnob(new Date("2018-06-23T09:03:12"), 3*1000, 0)
  })
  .add('Showing a short log (2 min)', () => {
    return buildTimePanelWithKnob(new Date("2018-06-23T09:03:12"), 2*60*1000, 0)
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

  .add('Showing an editable time panel', () => {
    return <TimePanel
      startTime={new Date("2018-06-23T09:03:12")}
      endTime={new Date("2018-06-23T19:03:12")}
      selectedTime={myDateKnob('selected', new Date("2018-06-23T12:00:00"), new Date("2018-06-23T19:03:12"), new Date("2018-06-23T10:03:12"))}
      onSelectedTimeChange={ () => true }
      editableBounds={true}
      startBoundTime={myDateKnob('startBound', new Date("2018-06-23T09:03:12"), new Date("2018-06-23T19:03:12"), new Date("2018-06-23T10:03:12")) }
      endBoundTime={myDateKnob('endBound', new Date("2018-06-23T09:03:12"), new Date("2018-06-23T19:03:12"), new Date("2018-06-23T18:03:12")) }
      onBoundsChanged={ () => true }
      playSpeed={ 0 } onPlaySpeedChange={ () => true }
    />
  })

  .add('Speed controls', () => {
    let speed = 0
    return <TimePanel
      startTime={new Date("2018-06-23T09:03:12")}
      endTime={new Date("2018-06-23T19:03:12")}
      selectedTime={myDateKnob('selected', new Date("2018-06-23T12:00:00"), new Date("2018-06-23T19:03:12"), new Date("2018-06-23T10:03:12"))}
      onSelectedTimeChange={ () => true }
      editableBounds={false}
      startBoundTime={myDateKnob('startBound', new Date("2018-06-23T09:03:12"), new Date("2018-06-23T19:03:12"), new Date("2018-06-23T10:03:12")) }
      endBoundTime={myDateKnob('endBound', new Date("2018-06-23T09:03:12"), new Date("2018-06-23T19:03:12"), new Date("2018-06-23T18:03:12")) }
      onBoundsChanged={ () => true }
      playSpeed={ number('playSpeed', speed, {
        range: true,
        min: 0,
        max: 7200,
        step: 1
      }) } onPlaySpeedChange={ (s) => { speed = s } }
    />
  })

