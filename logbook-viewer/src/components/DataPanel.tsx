import * as React from 'react';
import { isNullOrUndefined, isNumber } from 'util';

import { SKValueType } from '@aldis/strongly-signalk';

import TimeSelection from '../model/TimeSelection';
import TripDataProvider from '../model/TripDataProvider';

import './DataPanel.css'

const fieldConfiguration : { [index:string]: { label: string, unit?: string, fractionDigits?: number }} = {
  'navigation.speedOverGround': { label: 'SOG', unit: 'kts' },
  'navigation.speedThroughWater': { label: 'BSP', unit: 'kts' },
  'environment.wind.angleTrueGround': { label: 'TWA', fractionDigits: 0, unit: 'kts' },
  'navigation.courseOverGround': { label: 'COG', fractionDigits: 0, unit: 'deg' },
  'environment.wind.angleApparent': { label: 'AWA', fractionDigits: 0, unit: 'deg' },
  'environment.wind.speedOverGround': { label: 'TWS', unit: 'kts' },
  'environment.wind.speedApparent': { label: 'AWS', unit: 'kts' },
}

export interface DataPanelProps {
  selection: TimeSelection
  dataProvider: TripDataProvider
  hoveringMode: boolean
}

export default function DataPanel(props : DataPanelProps) {
  const availableFields = props.dataProvider.getAvailableValues()
  const values = props.dataProvider.getValuesAtTime(props.selection.getCenter())

  const shownFields = availableFields.filter(x => x in fieldConfiguration)

  const panelItems = shownFields.sort().map( (key) => (
    <DataPanelItem
      key={ key } value={values[key]}
      { ...fieldConfiguration[key] }
    />
  ))

  return (
    <div className="data-window">
      <div className="data-panel">
        <DataPanelItem label="Time" unit="Locale" value={ props.selection.getCenter() } large={true} />
        { panelItems }
      </div>
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

