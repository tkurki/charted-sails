import { SKDelta, SKUpdate, SKValue} from '@aldis/strongly-signalk'
import * as Papa from 'papaparse';
import { ExpeditionFormatConversion } from './ExpeditionFormat';
import { isNull } from 'util';

interface ConversionOption {
  /**
   * SignalK Context of the data we are reading.
   */
  context?: string,

  /**
   * Is the data really a URL to the data? Set true to download.
   */
  download?: boolean,

  /**
   * Should CSV parsing happen in a separate worker?
   */
  worker?: boolean,

  /**
   * Conversion to run on the file. You can use one of the named type
   * or provide your own.
   */
  conversion: CSVConversion | 'expedition'
}

export interface CSVConversion {
  timeConverter: TimeConverter
  columns: (ColumnConverter|RatioColumn)[]
}

/**
 * Type of a function that can extract a timestamp from a line of the logfile.
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
 * For very simple ratio based conversion.
 */
export interface RatioColumn {
  /**
   * Input column
   */
  requiredColumn: string

  /**
   * Path
   */
  path: string

  /**
   * The CSV value will be multiplied by this number to get the SK value.
   */
  ratio: number
}

function isRatioConverter(columnConverter: RatioColumn|ColumnConverter) : columnConverter is RatioColumn {
  return 'ratio' in columnConverter
}

class RatioColumnConverter implements ColumnConverter {
  private config : RatioColumn
  public requiredColumns: string[]

  constructor(config: RatioColumn) {
    this.config = config
    this.requiredColumns = [config.requiredColumn]
  }

  convert(csvLine: any) : SKValue|null {
    return {
      'path': this.config.path,
      'value': this.config.ratio * csvLine[this.config.requiredColumn]
    }
  }
}

export function signalKFromCSV(data: string,
                              options: ConversionOption = {conversion: 'expedition' })
                              : Promise<SKDelta> {
  let converter : CSVConversion
  if (typeof options.conversion === 'string') {
    converter = ExpeditionFormatConversion
  }
  else {
    converter = options.conversion
  }
  // Replace RatioConverter by a ColumnConverter
  let conversions : ColumnConverter[] = converter.columns.map(converter => {
    if (isRatioConverter(converter)) {
      return new RatioColumnConverter(converter)
    }
    else {
      return converter
    }
  })

  const promise = new Promise<Papa.ParseResult>((resolve, reject) => {
    Papa.parse(data, {
      download: options.download,
      header: true,
      worker: options.worker,
      complete: (results) => {
        resolve(results)
      },
      error: (error) => {
        reject(error)
      }
    })
  })
  .then((data : Papa.ParseResult) => {
    // Map each line to a SKUpdate
    let updates = data.data.map((csvLine) => {
      const time = converter.timeConverter(csvLine)

      // Reject lines that do not have a timestamp
      if (time === null) {
        return null
      }
      let update = new SKUpdate()
      update.timestamp = time
      update.values = []

      conversions.forEach(colConverter => {
        // Check if converter is applicable to this line
        let applicable = colConverter.requiredColumns.every(requiredColumn => {
          return requiredColumn in csvLine && csvLine[requiredColumn] !== ''
        })
        if (applicable) {
          let value = colConverter.convert(csvLine)
          if (value !== null) {
            update.values.push(value)
          }
        }
      });
      return update
    })
    // Remove lines that we were not able to convert
    .filter(x => !isNull(x))

    let delta = new SKDelta()
    delta.context = options.context
    delta.updates = <SKUpdate[]>updates
    return delta
  })

  return promise
}