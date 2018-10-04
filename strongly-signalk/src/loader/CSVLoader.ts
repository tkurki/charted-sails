import * as Papa from 'papaparse';
import { isNull } from 'util';
import { SKDelta, SKSource, SKUpdate } from '../model';
import { columnConvertersForLine, CSVConversion } from './CSVConversion';
import { ExpeditionFormatConversion } from './ExpeditionFormatConversion';

export interface CSVConversionOption {
  /**
   * SignalK Context of the data we are reading.
   */
  context?: string,

  /**
   * How should the source be defined in the SignalK data.
   */
  sourceLabel?: string

  /**
   * Conversion to run on the file. You can use one of the named type
   * or provide your own.
   */
  conversion: CSVConversion | 'expedition'
}

export class CSVLoader {
  static defaultOptions: CSVConversionOption = {
    conversion: 'expedition'
  }

  static papaParsingOptions = {
    header: true
  }

  /**
   * Parse from a string.
   *
   * @param data
   * @param options
   */
  static fromString(data: string, options: CSVConversionOption = this.defaultOptions): SKDelta {
    let result = Papa.parse(data, this.papaParsingOptions)
    return this.fromParseResult(result, options)
  }

  /**
   * Parse from a DOM File object (in the browser).
   *
   * @param file
   * @param options
   */
  static fromFile(file: File, options: CSVConversionOption = this.defaultOptions): Promise<SKDelta>  {
    let p = new Promise<Papa.ParseResult>((resolve, reject) => {
      const papaOptions = {
        ...this.papaParsingOptions,
        download: true,
        complete: resolve,
        error: reject
      }
      Papa.parse(file, papaOptions)
    })
    return this.fromParseResultPromise(p, {
      sourceLabel: file.name,
      ...options
    })
  }

  /**
   * Parse from an URL.
   *
   * @param url
   * @param options
   */
  static fromURL(url: string, options: CSVConversionOption = this.defaultOptions): Promise<SKDelta> {
    let p = new Promise<Papa.ParseResult>((resolve, reject) => {
      const papaOptions = {
        ...this.papaParsingOptions,
        download: true,
        complete: resolve,
        error: reject
      }
      Papa.parse(url, papaOptions)
    })
    return this.fromParseResultPromise(p, {
      sourceLabel: url,
      ...options
    })
  }


  static fromParseResultPromise(promise: Promise<Papa.ParseResult>, options: CSVConversionOption = this.defaultOptions)
            : Promise<SKDelta> {
    return promise.then((data : Papa.ParseResult) => {
      return this.fromParseResult(data, options)
    })
  }

  static fromParseResult(data: Papa.ParseResult, options: CSVConversionOption = this.defaultOptions): SKDelta {
    let conversion : CSVConversion
    if (typeof options.conversion === 'string') {
      conversion = new ExpeditionFormatConversion()
    } else {
      conversion = options.conversion
    }

    let skSource = new SKSource(options.sourceLabel ? options.sourceLabel : 'signalk-babel/csvloader')

    // Map each line to a SKUpdate
    let updates = data.data.map((csvLine) => {
      const time = conversion.timeConverter(csvLine)

      // Reject lines that do not have a timestamp
      if (time === null) {
        return null
      }
      let update = new SKUpdate(time, [], skSource)

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
  }
}