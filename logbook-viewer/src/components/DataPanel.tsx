import * as React from 'react';
import { isNullOrUndefined, isNumber } from 'util';

import { Segment, SKValues } from '../model/Trip'

import './DataPanel.css'

const alwaysOnFields = ['Sog', 'Cog', 'Twa', 'Tws', 'Awa', 'Aws']
const hiddenFields = ['time', 'coordinates', 'previousCoordinates']
const fieldConfiguration : { [index:string]: { 'unit'?: string, fractionDigits?: number }} = {
  'Sog': { unit: 'kts' },
  'Bsp': { unit: 'kts' },
  'Twa': { fractionDigits: 0, unit: 'kts' },
  'Cog': { fractionDigits: 0 },
  'Awa': { fractionDigits: 0 }
}
export interface DataPanelProps {
  segment: Segment | null
}

export default function DataPanel(props : DataPanelProps) {
  const segment = props.segment
  const emptyValues : { [index:string]: number } = {}
  const values : SKValues = segment ? segment.values : emptyValues

  // Make sure default fields appear - with null by default
  alwaysOnFields.forEach(key => {
    if (! (key in values)) {
      values[key] = null
    }
  })

  const alwaysOnItems = alwaysOnFields.reduce( (p : JSX.Element[], key) => {
    p.push(
      <DataPanelItem
        key={ key }
        data={ key }
        unit="-"
        value={values[key]}
        { ...(key in fieldConfiguration ? fieldConfiguration[key] : {}) }
      />
    )
    return p
  }, [])

  const otherPanelItems = Object.keys(values).sort().reduce( (p : JSX.Element[], key) => {
    if (!alwaysOnFields.includes(key) && !hiddenFields.includes(key)) {
      p.push(
        <DataPanelItem
          key={ key } data={ key } unit="-" value={values[key]}
          { ...(key in fieldConfiguration ? fieldConfiguration[key] : {}) }
        />
      )
    }
    return p
  }, [])

  return (
    <div className="data-window">
      <DataPanelGrid>
        <DataPanelItem data="Time" unit="Locale" value={segment ? segment.end.time : '-' } type="date" large={true} />
        { alwaysOnItems }
        { otherPanelItems }
      </DataPanelGrid>
    </div>
  );
}

export function DataPanelGrid(props : any) {
  return (
    <div className="data-panel">
      {props.children}
    </div>
  )
}

export function DataPanelItem(props : any) {
  let value = props.value;
  let unit = props.unit;
  const data = props.data;

  if (value instanceof Date) {
    value = props.value.toLocaleTimeString();
    unit = new Date().toLocaleTimeString('en-us',{timeZoneName:'short'}).split(' ')[2];
  }
  else if (isNumber(value)) {
    const fractionDigits = 'fractionDigits' in props ? props.fractionDigits : 1;
    value = props.value.toFixed(fractionDigits);
  }
  else {
    if (isNullOrUndefined(value)) {
      value = "-";
    }
  }
  return (
    <div className={ props.large ? "data-panel-item data-panel-item-large" : "data-panel-item" }>
      <span className="data">{data}</span>
      <span className="value">{value}</span>
      <span className="unit">{unit}</span>
    </div>
  )
}

