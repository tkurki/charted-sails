import n2kSignalk from '@signalk/n2k-signalk';
import NMEA0183Parser from '@signalk/nmea0183-signalk';
import { FromPgn } from 'canboatjs';
import { SKDelta, SKSource, SKUpdate } from "../model";

export class SKLogLoader {
  // Ignore all AIS and DSC messages because we do not know how to distinguish them
  // from boat data at the moment. In the future we should return one SKDelta for each
  // object on the water.
  private static ignoredPGNs = [129038, 129039, 129040, 129041, 129792, 129793,
  129794, 129795, 129796, 129797, 129798, 129800, 129801, 129802, 129803, 129804,
  129805, 129806, 129807, 129808, 129809, 129810, 129811, 129812, 129813 ]

  static fromFile(f: File): Promise<SKDelta[]> {
    const p = new Promise<SKDelta[]>((resolve,reject) => {
      const fileReader = new FileReader()
      fileReader.onload = () => {
        if (fileReader.readyState == 2 && typeof fileReader.result === 'string') {
          resolve(SKLogLoader.fromString(fileReader.result))
        }
        else {
          reject("Unable to read file: " + fileReader.error)
        }
      }
      fileReader.readAsText(f)
    })
    return p
  }

  static fromString(data: string): SKDelta[] {
    const lines = data.split(/\r?\n/)

    /*
    const updates = lines.reduce<SKUpdate[]>( (allUpdates, line) => {
      const d = SKLogLoader.fromLine(line)
      if (d !== null) {
        allUpdates.push(...d.updates)
      }
      return allUpdates
    }, [])
    return [ { updates: updates } ]
    */

    const deltas = lines.map(line => {
      try {
        return SKLogLoader.fromLine(line)
      }
      catch (e) {
        // FIXME: Find a better way to do warning reporting
        console.warn(`Warning: error parsing line ${line}: ${e.message}`)
        return null
      }
    }).filter(d => d !== null) as SKDelta[]

    // Very naive implementation of SKDelta[] consolidation - see below for better to enable
    // when we have AIS sentences.
    if (deltas.length > 0) {
      deltas[0].updates = deltas.reduce<SKUpdate[]>( (allUpdates, d) => {
        allUpdates.push(...d.updates)
        return allUpdates
      }, [])
      return [ deltas[0] ]
    }
    else {
      return []
    }

    /* TODO: Write some tests for this and then restore it.
    // Consolidate delta per context so we only return one SKDelta for each context
    let deltasPerContext : { [key: string]: SKDelta} = {}
    deltas.forEach(d => {
      if (d.context) {
        if (d.context in deltasPerContext) {
          deltasPerContext[d.context].updates =
            deltasPerContext[d.context].updates.concat(d.updates)
        }
        else {
          deltasPerContext[d.context] = d
        }
      }
    })
    return Object.keys(deltasPerContext).map(key => deltasPerContext[key])
      .sort((d1, d2) => (d1.updates.length - d2.updates.length))
      */
  }

  static fromLine(line: string): SKDelta|null {
    const logLineRegexp = /(\d+);([\w-]+);(.*)/
    let results = line.match(logLineRegexp)
    if (results && results.length === 4) {
      let time = new Date(Number.parseInt(results[1]))
      let type = results[2]
      let data = results[3]

      if (type === 'I' || type === 'derived-data') {
        let delta = SKDelta.fromJSON(data)
        delta.updates.forEach( u => {
          u.timestamp = time
        })
        return delta
      }
      else if (type === 'N') {
        // FIXME: Ignore AIS for now because we do not know how to handle different context properly
        if (data.startsWith("!")) {
          return null
        }

        const jsonDelta = new NMEA0183Parser().parse(data)
        if (jsonDelta !== null) {
          let delta = SKDelta.fromJSON(jsonDelta)
          // By default, assume we are referring to 'self'
          // AIS parsers will set context properly when refering to other vessels.
          if (!delta.context) {
            delta.context = 'vessels.self'
          }
          delta.updates.forEach(u => {
            u.source = new SKSource('nmea')
            u.timestamp = time
          })
          return delta
        }
        else {
          return null
        }
      }
      else if (type === 'P' || type === 'A') {
        const canboatParser = new FromPgn({format: 1})
        let pgnData:any = null
        canboatParser.on('pgn', pgn => {
          pgnData = pgn
        })
        canboatParser.parse(data)

        if (pgnData) {
          if (SKLogLoader.ignoredPGNs.includes(pgnData.pgn)) {
            return null
          }
          let jsonDelta = n2kSignalk.toDelta(pgnData);
          let delta = SKDelta.fromJSON(jsonDelta)
          // By default, assume we are referring to 'self'
          // AIS parsers will set context properly when refering to other vessels.
          if (!delta.context) {
            delta.context = 'vessels.self'
          }
          delta.updates.forEach(u => {
            u.timestamp = time

            if (u.source === undefined) {
              u.source = new SKSource('NMEA2000')
            }
            u.source.label = "NMEA2000"
            u.source.pgn = pgnData.pgn
            u.source.src = pgnData.src.toString()
            u.source.type = "NMEA2000"
          })
          return delta
        }
      }
    }
    return null
  }
}
