import { SKValueType, TripDataProvider } from '@aldis/strongly-signalk';
import * as utils from '@signalk/nmea0183-utilities';
import * as React from 'react';
import { isNullOrUndefined, isNumber } from 'util';
import TimeSelection from '../model/TimeSelection';
import './DataPanel.css';


/**
 * FIXME: This does not belong here but it will do for now.
 */
const signalKSchema : {
  [path: string]: {
    unit: string
    type: 'angle'|'direction'|'position'|'number'|'string'|'timestamp'
  }
} = {
  'navigation.speedOverGround': { type: 'number', unit: 'ms'},
  'navigation.speedThroughWater': { type: 'number', unit: 'ms'},
  'navigation.courseOverGround': { type: 'direction', unit: 'rad'},
  'navigation.headingMagnetic': { type: 'direction', unit: 'rad' },
  'navigation.headingTrue': { type: 'direction', unit: 'rad' },
  'environment.wind.angleTrueGround': { type: 'angle', unit: 'rad'},
  'environment.wind.angleApparent': { type: 'angle', unit: 'rad'},
  'environment.wind.speedOverGround': { type: 'number', unit: 'ms'},
  'environment.wind.speedApparent': { type: 'number', unit: 'ms'},
}

const fieldConfiguration : { [index:string]: { label: string, unit: string, fractionDigits?: number }} = {
  'navigation.speedOverGround': { label: 'SOG', unit: 'knots' },
  'navigation.courseOverGround': { label: 'COG', fractionDigits: 0, unit: 'deg' },
  'navigation.headingMagnetic': { label: 'HDGm', fractionDigits: 0, unit: 'deg' },
  'navigation.headingTrue': { label: 'HDGt', fractionDigits: 0, unit: 'deg' },
  'navigation.speedThroughWater': { label: 'BSP', unit: 'knots' },
  'environment.wind.angleTrueGround': { label: 'TWA', fractionDigits: 0, unit: 'deg' },
  'environment.wind.angleApparent': { label: 'AWA', fractionDigits: 0, unit: 'deg' },
  'environment.wind.speedOverGround': { label: 'TWS', unit: 'knots' },
  'environment.wind.speedApparent': { label: 'AWS', unit: 'knots' },
}

const fieldOrder = [
  'navigation.speedOverGround', 'navigation.courseOverGround',
  'navigation.speedThroughWater', 'navigation.headingTrue',
  'environment.wind.speedApparent', 'environment.wind.angleApparent',
  'environment.wind.speedOverGround', 'environment.wind.angleTrueGround'
]

export interface DataPanelProps {
  selection: TimeSelection
  dataProvider: TripDataProvider
  hoveringMode: boolean
  style?: React.CSSProperties
}

export default function DataPanel(props : DataPanelProps) {
  const availableFields = props.dataProvider.getAvailableValues()
  const values = props.dataProvider.getValuesAtTime(props.selection.getCenter())
  const convertedValues : { [path:string]: SKValueType } = {}

  // Convert unit to a format appropriate for display
  Object.keys(values).map(path => {
    if (path in signalKSchema && path in fieldConfiguration) {
      convertedValues[path] = values[path]
      if (signalKSchema[path].type === 'number' && typeof values[path] === 'number') {
        convertedValues[path] = utils.transform(values[path] as number, signalKSchema[path].unit, fieldConfiguration[path].unit)
      }
      if ((signalKSchema[path].type === 'angle'||signalKSchema[path].type === 'direction')
          && typeof values[path] === 'number') {
            convertedValues[path] = utils.transform(values[path] as number, signalKSchema[path].unit, fieldConfiguration[path].unit)

        if (signalKSchema[path].type === 'direction') {
          convertedValues[path] = (values[path] as number + 360)%360
        }
      }
    }
  })

  // Show ordered fields first and then anything else we have.
  let shownFields = fieldOrder.filter(x => availableFields.includes(x) && x in fieldConfiguration)

  shownFields = shownFields.concat(availableFields.filter(x => !fieldOrder.includes(x) && x in fieldConfiguration))

  const panelItems = shownFields.map( (path) => (
    <DataPanelItem
      key={ path } value={convertedValues[path]}
      { ...fieldConfiguration[path] }
    />
  ))

  return (
    <div className="pt-card pt-elevation-2 data-panel" style={ props.style }>
        <DataPanelItem label="Time" unit="Locale" value={ props.selection.getCenter() } large={true} />
        { panelItems }
    </div>
  );
}

interface DataPanelItemProps {
  /**
   * Make this a wider field.
   */
  large?: boolean

  /**
   * Label to show next to the value.
   */
  label: string

  /**
   * The unit to display next to the value.
   */
  unit?: string

  /**
   * The actual value to show.
   */
  value: SKValueType

  /**
   * How many digits to show on a number.
   */
  fractionDigits?: number
}

export function DataPanelItem({label, value, unit, fractionDigits, large} : DataPanelItemProps) {
  if (value instanceof Date) {
    value = value.toLocaleTimeString();
    unit = new Date().toLocaleTimeString('en-us',{timeZoneName:'short'}).split(' ')[2];
  }
  else if (isNumber(value)) {
    if (isNullOrUndefined(fractionDigits)) {
      fractionDigits = 1
    }
    value = value.toFixed(fractionDigits);
  }
  else if (isNullOrUndefined(value)) {
    value = "-";
  }
  return (
    <div className={ large ? "data-panel-item data-panel-item-large" : "data-panel-item" }>
      <span className="data">{label}</span>
      <span className="value">{value}</span>
      <span className="unit">{unit}</span>
    </div>
  )
}

