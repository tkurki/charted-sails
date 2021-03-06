import { readFileSync } from "fs";
import { SKDelta } from "../model";
import { CSVConversionOption, CSVLoader } from "./CSVLoader";
import { ExpeditionFormatConversion } from "./ExpeditionFormatConversion";
import { GPXLoader } from "./GPXLoader";
import { SKLogLoader } from "./SKLogLoader";
import { VCCLoader } from "./VCCLoader";

export class SaltedRosetta {
  public static fromFilename(filename:string): SKDelta[] {
    if (filename.endsWith('.csv')) {
      let options: CSVConversionOption = {
        "sourceLabel": filename,
        "conversion": new ExpeditionFormatConversion()
      }
      let data = readFileSync(filename, { 'encoding': 'utf8'})
      return [ CSVLoader.fromString(data, options) ]
    }
    else if (filename.endsWith('.vcc')) {
      let data = readFileSync(filename, { 'encoding': 'utf8'})
      return [ VCCLoader.fromString(data) ]
    }
    else if (filename.endsWith('.gpx')) {
      let data = readFileSync(filename, { 'encoding': 'utf8'})
      return [ GPXLoader.fromString(data) ]
    }
    else if (filename.endsWith('.log')) {
      let data = readFileSync(filename, { 'encoding': 'utf8'})
      return SKLogLoader.fromString(data)
    }
    throw new Error(`Unrecognized file format (${filename})`)
  }

  public static fromFile(f:File): Promise<SKDelta[]> {
    if (f.name.endsWith('.log')) {
      return SKLogLoader.fromFile(f)
    }
    else if (f.name.endsWith('.csv')) {
      return CSVLoader.fromFile(f).then((delta) => ([delta]))
    }
    else if (f.name.endsWith('.vcc')) {
      return VCCLoader.fromFile(f).then((delta) => ([delta]))
    }
    else if (f.name.endsWith('.gpx')) {
      return GPXLoader.fromFile(f).then((delta) => ([delta]))
    }

    return Promise.reject(`Unrecognized file extension (${f.name})`)
  }

  public static fromResponse(r: Response) {
    const contentType = r.headers.get('Content-Type')
    const contentDisposition = r.headers.get('Content-Disposition')
    let filename = ''
    if (contentDisposition) {
      const matches = contentDisposition.match(/filename="(.*)"/)
      if (matches) {
        filename = matches[1]
      }
    }

    // Try to read the filename in URL if it was not in headers
    if (filename === '' && typeof r.url === 'string') {
      // nice: https://stackoverflow.com/questions/511761/js-function-to-get-filename-from-url#comment61576914_17143667
      // we can add the '!' here because we have made sure the url is a string. split and shift will always return.
      filename = r.url.split('#').shift()!.split('?').shift()!.split('/').pop()!
    }

    // FIXME: Would be much better to stream the data instead of loading it in memory.
    return r.text().then(data => {
      if (contentType && contentType.includes('text/csv') || filename.toLowerCase().endsWith('.csv')) {
        return [ CSVLoader.fromString(data) ]
      }
      if (filename.toLowerCase().endsWith('.vcc')) {
        return [ VCCLoader.fromString(data) ]
      }
      if (filename.toLowerCase().endsWith('.gpx')) {
        return [ GPXLoader.fromString(data) ]
      }
      // default to sklog
      return SKLogLoader.fromString(data)
    })
  }
}