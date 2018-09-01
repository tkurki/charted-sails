import parser from 'fast-xml-parser';
import { SKDelta, SKPosition, SKSource, SKUpdate, SKValue } from '../model';

interface GPXPoint {
  a_lat: number
  a_lon: number
  time: string
  course?: number
  speed?: number
}

interface GPXBounds {
  a_minlat: number
  a_maxlat: number
  a_minlon: number
  a_maxlon: number
}

interface GPXSegment {
  trkpt: GPXPoint | GPXPoint[]
}

interface GPXTrack {
  name?: string
  trkseg: GPXSegment | GPXSegment[]
}

/**
 * This is what comes out of fast-xml-parser.
 *
 * Depending on whether there is one element or multiple, the parser will make
 * arrays. Having a type definition makes things easier to work with ...
 */
interface GPXFile {
  bounds: GPXBounds
  a_creator?: string
  trk: GPXTrack | GPXTrack[]
}

export class GPXLoader {
  private static gpxPointToUpdate(p: GPXPoint): SKUpdate {
    const values = [
      new SKValue('navigation.position', new SKPosition(p.a_lat, p.a_lon))
    ]
    if (p.course !== undefined) {
      values.push(new SKValue('navigation.courseOverGround', p.course * 2 * Math.PI / 360))
    }
    if (p.speed !== undefined) {
      values.push(new SKValue('navigation.speedOverGround', p.speed))
    }
    return new SKUpdate(new SKSource('velocitek'), new Date(p.time), values)
  }

  public static fromString(data: string): SKDelta {
    const jsonObj = parser.parse(data, { ignoreAttributes: false, attributeNamePrefix: 'a_', parseAttributeValue: true })

    if (!jsonObj || !jsonObj['gpx'] || !jsonObj['gpx']['trk']) {
      throw new Error('Invalid GPX file')
    }
    const gpxFile : GPXFile = jsonObj['gpx']

    // Normalize the data - we want one array of tracks containing arrays of segments containing arrays of points
    if (!Array.isArray(gpxFile.trk)) {
      gpxFile.trk = [ gpxFile.trk ]
    }
    gpxFile.trk = gpxFile.trk.map((track : GPXTrack) => {
      if (!Array.isArray(track.trkseg)) {
        track.trkseg = [ track.trkseg ]
        return track
      }
      else {
        return track
      }
    })

    let updates : SKUpdate[] = []
    gpxFile.trk.forEach(track => {
      (track.trkseg as GPXSegment[]).forEach(segment => {
        if (Array.isArray(segment.trkpt)) {
          segment.trkpt.forEach((point:GPXPoint) => {
            updates.push(GPXLoader.gpxPointToUpdate(point))
          })
        }
        else {
          updates.push(GPXLoader.gpxPointToUpdate(segment.trkpt))
        }
      })
    });

    return new SKDelta(updates)
  }

  static fromFile(f: File): Promise<SKDelta> {
    const p = new Promise<SKDelta>((resolve,reject) => {
      const fileReader = new FileReader()
      fileReader.onload = () => {
        if (fileReader.readyState == 2 && typeof fileReader.result === 'string') {
          resolve(GPXLoader.fromString(fileReader.result))
        }
        else {
          reject("Unable to read file: " + fileReader.error)
        }
      }
      fileReader.readAsText(f)
    })
    return p
  }
}