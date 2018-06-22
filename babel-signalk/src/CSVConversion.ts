import { SKValue } from "@aldis/strongly-signalk";


/**
 * Type of a function that can extract a timestamp from a line of the logfile.
 *
 * Returns null if there is no valid timestamp in that line.
 */
export type TimeConverter = (csvLine:any) => Date|null

/**
 * Generic conversion interface.
 */
export interface ColumnConverter {
  /**
   * List of columns required for this conversion to work.
   */
  requiredColumns: string[]

  /**
   * Actually perform one conversion
   */
  convert: (csvLine: any) => SKValue|null
}

/**
 * Interface used to convert a CSV file to SignalK data.
 *
 * timeConverter is called once for every line to generate a timestamp. If no
 * timestamp is available, the line will be ignored.
 *
 * Column converters are called for every line that has the required columns.
 */
export interface CSVConversion {
  timeConverter: TimeConverter
  columns: ColumnConverter[]
}

export function columnConvertersForLine(csvLine: any, conversion: CSVConversion): ColumnConverter[] {
  return conversion.columns.filter(converter =>
    converter.requiredColumns.every(requiredColumn => {
      return Object.keys(csvLine).includes(requiredColumn)
        && csvLine[requiredColumn] !== ''
    })
  )
}