import { IntelligibleSignalK, SKValueFormatter, TripDataProvider } from '@aldis/strongly-signalk';
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
      value={ path in values ? skFormatters[path].format(values[path]) : '-' }
      unit={skFormatters[path].unit} label={skFormatters[path].label}
    />
  ))

  return (
    <div className="pt-card pt-elevation-2 data-panel" style={ props.style }>
        <DataPanelItem label="Time" unit={skFormatter.getUsedTimezoneShortName()} value={ props.selection.getCenter().toLocaleTimeString() } large={true} />
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
  unit: string

  /**
   * The actual value to show.
   */
  value: string
}

export function DataPanelItem({label, value, unit, large} : DataPanelItemProps) {
  return (
    <div className={ large ? "data-panel-item data-panel-item-large" : "data-panel-item" }>
      <span className="data">{label}</span>
      <span className="value">{value}</span>
      <span className="unit">{unit}</span>
    </div>
  )
}

