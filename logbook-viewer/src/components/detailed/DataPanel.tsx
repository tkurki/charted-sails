import { IntelligibleSignalK, SKValueFormatter, TripDataProvider } from '@aldis/strongly-signalk';
import { Card } from '@blueprintjs/core';
import * as React from 'react';
import TimeSelection from '../../model/TimeSelection';
import './DataPanel.css';

export interface DataPanelProps {
  selection: TimeSelection
  dataProvider: TripDataProvider
  hoveringMode: boolean
  style?: React.CSSProperties
}

export default function DataPanel(props : DataPanelProps) {
  const skFormatter = new IntelligibleSignalK()

  const availableFieldsSorted = props.dataProvider.getAvailableValues().sort(skFormatter.getSignalKPathComparator())
  const values = props.dataProvider.getValuesAtTime(props.selection.getCenter())

  const skFormatters : {[key:string]: SKValueFormatter} = {}
  availableFieldsSorted.forEach(field => {
    skFormatters[field] = skFormatter.getFormatterForPath(field)
  })

  const shownFields = availableFieldsSorted.filter(f => skFormatters[f].display)

  const panelItems = shownFields.map( (path) => (
    <DataPanelItem
      key={ path }
      value={
        path in values ? skFormatters[path].format(values[path]) : '-'
      }
      unit={skFormatters[path].unit} label={skFormatters[path].label}
      special={ path === 'navigation.position' ? 'position' : undefined }
    />
  ))

  return (
    <Card elevation={2} style={ props.style } className="data-panel">
      <DataPanelItem
        label="Time"
        unit={skFormatter.getUsedTimezoneShortName()}
        value={ skFormatter.formatTime(props.selection.getCenter()) }
        special='time' />
      { panelItems }
  </Card>
  );
}

interface DataPanelItemProps {
  /**
   * Request special treatment
   */
  special?: 'time' | 'position'

  /**
   * Label to show next to the value.
   */
  label: string

  /**
   * The unit to display next to the value.
   */
  unit: string

  /**
   * The actual value to show.
   */
  value: string
}

export function DataPanelItem({label, value, unit, special} : DataPanelItemProps) {
  if (special === 'time') {
    return (
      <div className={ "data-panel-item data-panel-item-time" }>
        <span className="data">{label}</span>
        <span className="value">{value}</span>
      </div>
    )
  }
  if (special === 'position') {
    const fields = value.split(' ')
    if (fields.length === 4) {
      return (
        <div className={ "data-panel-item data-panel-item-position" }>
          <span className="data">{label}</span>
          <span className="value">
            {`${fields[0]} ${fields[1]}`} <br/>
            {`${fields[2]} ${fields[3]}`}
          </span>
        </div>
      )
    }
    else {
      return (
        <div className={ "data-panel-item data-panel-item-position" }>
          <span className="data">{label}</span>
          <span className="value">
            { value }
          </span>
        </div>
      )
    }
  }
  return (
    <div className={ "data-panel-item" }>
      <span className="data">{label}</span>
      <span className="value">{value}</span>
      <span className="unit">{unit}</span>
    </div>
  )
}

