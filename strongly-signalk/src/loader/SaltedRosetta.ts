import { readFileSync } from "fs";
import { SKDelta } from "../model";
import { CSVConversionOption, CSVLoader } from "./CSVLoader";
import { ExpeditionFormatConversion } from "./ExpeditionFormatConversion";
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

    // FIXME: Would be much better to stream the data instead of loading it in memory.
    return r.text().then(data => {
      if (contentType && contentType.includes('text/csv') || filename.toLowerCase().endsWith('.csv')) {
        return [ CSVLoader.fromString(data) ]
      }
      if (filename.toLowerCase().endsWith('.vcc')) {
        return [ VCCLoader.fromString(data) ]
      }
      // default to sklog
      return SKLogLoader.fromString(data)
    })
  }
}