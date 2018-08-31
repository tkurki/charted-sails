import { readFileSync } from "fs";
import { SKDelta } from "../model";
import { CSVConversionOption, CSVLoader } from "./CSVLoader";
import { ExpeditionFormatConversion } from "./ExpeditionFormatConversion";
import { SKLogLoader } from "./SKLogLoader";

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

    return Promise.reject(`Unrecognized file extension (${f.name})`)
  }

  public static fromResponse(r: Response) {
    const contentType = r.headers.get('Content-Type')

    // FIXME: Would be much better to stream the data instead of loading it in memory.
    return r.text().then(data => {
      if (contentType && contentType.includes('text/csv')) {
        return [ CSVLoader.fromString(data) ]
      }
      return SKLogLoader.fromString(data)
    })
  }
}