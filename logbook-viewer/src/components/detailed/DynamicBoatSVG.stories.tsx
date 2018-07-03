import { SKPosition } from '@aldis/strongly-signalk';
import { boolean, number, withKnobs } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react';
import * as React from 'react';
import '../../index.css';
import { DynamicBoatSVG } from './DynamicBoatSVG';

const directionKnobOptions = {
  range: true,
  min: 0,
  max: 360,
  step: 1
}

storiesOf("Components/DynamicBoatSVG", module)
  .addDecorator(withKnobs)
  .add('boat with cog', () => {
    const toggle = boolean('show alignment grid', true)
    return (
      <svg height={200} width={200}>
        <line x1={0} y1={100} x2={200} y2={100} stroke='black' opacity={ toggle ? 1 : 0 }/>
        <line x1={100} y1={0} x2={100} y2={200} stroke='black' opacity={ toggle ? 1 : 0 }/>
        <DynamicBoatSVG data={ {
          'navigation.position': new SKPosition(42, 42),
          'navigation.courseOverGround': number('COG', 0, directionKnobOptions)*(2*Math.PI)/360
        }} project={ () => ([100, 100]) }/>
      </svg>
    )
  })
  .add('boat with hdgt', () => {
    const toggle = boolean('show alignment grid', true)
    return (
      <svg height={200} width={200}>
        <line x1={0} y1={100} x2={200} y2={100} stroke='black' opacity={ toggle ? 1 : 0 }/>
        <line x1={100} y1={0} x2={100} y2={200} stroke='black' opacity={ toggle ? 1 : 0 }/>
        <DynamicBoatSVG data={ {
          'navigation.position': new SKPosition(42, 42),
          'navigation.headingTrue': number('HDGt', 0, directionKnobOptions)*(2*Math.PI)/360
        }} project={ () => ([100, 100]) }/>
      </svg>
    )
  })
  .add('boat with cog and headingtrue', () => {
    const toggle = boolean('show alignment grid', true)
    return (
      <svg height={200} width={200}>
        <line x1={0} y1={100} x2={200} y2={100} stroke='black' opacity={ toggle ? 1 : 0 }/>
        <line x1={100} y1={0} x2={100} y2={200} stroke='black' opacity={ toggle ? 1 : 0 }/>
        <DynamicBoatSVG data={ {
          'navigation.position': new SKPosition(42, 42),
          'navigation.courseOverGround': number('COG', 0, directionKnobOptions)*(2*Math.PI)/360,
          'navigation.headingTrue': number('HDGt', 0, directionKnobOptions)*(2*Math.PI)/360
        }} project={ () => ([100, 100]) }/>
      </svg>
    )
  })


