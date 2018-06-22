import {ColumnConverter} from './CSVConversion'
import { SKValue } from '@aldis/strongly-signalk';

/**
 * Configuration for a simple conversion.
 */
export interface SimpleCSVColumnConversion {
  /**
   * Name of the column used for the conversion
   */
  columnName: string

  /**
   * Ratio to apply to the input value to get the output value.
   *
   * output = input * ratio
   */
  ratio: number

  /**
   * Name of the output SignalK value path.
   */
  path: string
}

export class SimpleCSVColumnConverter implements ColumnConverter {
  public requiredColumns: string[]
  public convert : (csvLine: any) => SKValue|null

  constructor(config : SimpleCSVColumnConversion) {
    this.requiredColumns = [config.columnName]

    this.convert = (csvLine) => {
      return ({
        'path': config.path,
        'value': csvLine[config.columnName] * config.ratio
      })
    }
  }
}