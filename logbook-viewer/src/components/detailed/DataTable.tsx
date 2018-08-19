import { BetterDataProvider, IntelligibleSignalK, TripDataProvider } from '@aldis/strongly-signalk';
import { Cell, Column, IRegion, Regions, SelectionModes, Table } from "@blueprintjs/table";
import * as React from 'react';
import TimeSelection from '../../model/TimeSelection';
import './DataTable.css';

export interface DataTableProps {
  dataProvider: TripDataProvider
  selection: TimeSelection
  onSelectionChange?: (timeSelection: TimeSelection) => void
}

export default class DataTable extends React.Component<DataTableProps> {
  private intelligibleSK: IntelligibleSignalK
  private tableRef: Table|null = null

  constructor(props:DataTableProps) {
    super(props)
    this.intelligibleSK = new IntelligibleSignalK()
    this.setTableRef = this.setTableRef.bind(this)
    this.onSelection = this.onSelection.bind(this)
  }

  public componentDidMount() {
    // Seems that the table needs a bit of time to be ready to scroll.
    setTimeout( () => {
      this.scrollToSelection()
    }, 1)
  }

  public componentDidUpdate() {
    this.scrollToSelection()
  }

  public render() {
    const delta = this.props.dataProvider.getTripData()
    const availableValues = this.props.dataProvider.getAvailableValues()

    const columns = [
      <Column key="time" name={`Time (${this.intelligibleSK.getUsedTimezoneShortName()})`} cellRenderer={ (rowIndex) => (
        <Cell tooltip={this.intelligibleSK.formatDateTime(delta.updates[rowIndex].timestamp)}>
          { this.intelligibleSK.formatTime(delta.updates[rowIndex].timestamp) }
        </Cell>
      )
    }/>
    ]
    columns.push(...availableValues.map(f => {
      const formatter = this.intelligibleSK.getFormatterForPath(f)
      return (
        <Column key={ f } name={ `${formatter.label} (${formatter.unit})` } cellRenderer={ (rowIndex) => {
          const update = delta.updates[rowIndex]
          const value = update.values.filter(v => v.path === f)

          if (value.length === 0) {
            return (<Cell/>)
          }
          else if (value.length === 1) {
            return (<Cell>{ "" + formatter.format(value[0].value) }</Cell>)
          }
          else {
            return (<Cell>(multiple values)</Cell>)
          }
        } } />
      )
    }
    ))

    return (
      <Table
        ref={ this.setTableRef }
        numRows={ delta.updates.length }
        enableRowHeader={false} enableRowResizing={false}
        enableRowReordering={false}
        numFrozenColumns={1}
        onSelection={this.onSelection}
        selectionModes={SelectionModes.ROWS_AND_CELLS}
        >
        { columns }
      </Table>
    );
  }

  public setTableRef(ref: Table) {
    this.tableRef = ref
  }

  private onSelection(selectedRegions: IRegion[]) {
    if (!this.props.onSelectionChange) {
      return
    }

    if (selectedRegions.length > 0) {
      if ('rows' in selectedRegions[0] && selectedRegions[0].rows !== undefined && selectedRegions[0].rows !== null) {
        const begin = selectedRegions[0].rows![0]
        const delta = this.props.dataProvider.getTripData()
        const ts = new TimeSelection(delta.updates[begin].timestamp)
        this.props.onSelectionChange(ts)
      }
    }
  }

  private scrollToSelection() {
    if (this.props.dataProvider instanceof BetterDataProvider) {
      // This API is not part of DataProvider interface so gotta hack a bit.
      // FIXME: Will need to rethink all this
      const index = this.props.dataProvider.indexInDeltaForTimestamp(this.props.selection.getCenter())
      const region = Regions.row(index)
      this.tableRef!.scrollToRegion(region)
    }
  }
}