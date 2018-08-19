import { BetterDataProvider, SKDelta, SKSource, SKUpdate, SKValue } from '@aldis/strongly-signalk';
import { storiesOf } from '@storybook/react';
import * as React from 'react';
import '../../index.css';
import TimeSelection from '../../model/TimeSelection';
import DataTable from './DataTable';

const stories = storiesOf('Components/DataTable', module)

stories.add('Showing an empty table', () => {
  const dataProvider = new BetterDataProvider(new SKDelta())
  return <DataTable dataProvider={dataProvider} selection={ new TimeSelection(new Date()) }/>
})

stories.add('Showing three columns and three lines', () => {
  const delta = new SKDelta()
  delta.updates.push(new SKUpdate(new SKSource(''), new Date("2018-08-08T16:20:01"), [
    new SKValue('navigation.speedOverGround', 10*1852/3600),
    new SKValue('navigation.courseOverGround', 22/360*2*Math.PI),
    new SKValue('environment.wind.angleApparent', -20/360*2*Math.PI)
  ]))
  delta.updates.push(new SKUpdate(new SKSource(''), new Date("2018-08-08T16:20:34"), [
    new SKValue('navigation.speedOverGround', 12*1852/3600),
    new SKValue('navigation.courseOverGround', 21/360*2*Math.PI),
    new SKValue('environment.wind.angleApparent', -19/360*2*Math.PI)
  ]))
  delta.updates.push(new SKUpdate(new SKSource(''), new Date("2018-08-08T16:21:01"), [
    new SKValue('navigation.speedOverGround', 15*1852/3600),
    new SKValue('navigation.courseOverGround', 23/360*2*Math.PI),
    new SKValue('environment.wind.angleApparent', -18/360*2*Math.PI)
  ]))
  return <DataTable dataProvider={new BetterDataProvider(delta)} selection={ new TimeSelection(new Date("2018-08-08T16:21:01")) }/>
})

stories.add('Showing three columns and three lines with some missing data', () => {
  const delta = new SKDelta()
  delta.updates.push(new SKUpdate(new SKSource(''), new Date("2018-08-08T16:20:01"), [
    new SKValue('navigation.courseOverGround', 22/360*2*Math.PI),
    new SKValue('environment.wind.angleApparent', -20/360*2*Math.PI)
  ]))
  delta.updates.push(new SKUpdate(new SKSource(''), new Date("2018-08-08T16:20:34"), [
    new SKValue('navigation.speedOverGround', 12*1852/3600),
    new SKValue('environment.wind.angleApparent', -19/360*2*Math.PI)
  ]))
  delta.updates.push(new SKUpdate(new SKSource(''), new Date("2018-08-08T16:21:01"), [
    new SKValue('navigation.speedOverGround', 15*1852/3600),
  ]))
  return <DataTable dataProvider={new BetterDataProvider(delta)} selection={ new TimeSelection(new Date("2018-08-08T16:21:01")) }/>
})
