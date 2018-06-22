import { SKDelta, SKUpdate, SKSource } from '@aldis/strongly-signalk'
import * as Papa from 'papaparse';
import { ExpeditionFormatConversion } from './ExpeditionFormatConversion';
import { isNull } from 'util';
import { CSVConversion, columnConvertersForLine } from './CSVConversion';

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

export function signalKFromCSV(data: string,
                              options: ConversionOption = {conversion: 'expedition' })
                              : Promise<SKDelta> {
  let conversion : CSVConversion
  if (typeof options.conversion === 'string') {
    conversion = new ExpeditionFormatConversion()
  }
  else {
    conversion = options.conversion
  }

  // Create a source name with the filename, url or "csvdata"
  const skSource = new SKSource(data.length > 1000 ? 'csvdata' : data)

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
      const time = conversion.timeConverter(csvLine)

      // Reject lines that do not have a timestamp
      if (time === null) {
        return null
      }
      let update = new SKUpdate(skSource)
      update.timestamp = time
      update.values = []

      columnConvertersForLine(csvLine, conversion).forEach(colConverter => {
        let value = colConverter.convert(csvLine)
        if (value !== null) {
          update.values.push(value)
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