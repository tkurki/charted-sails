import parser from 'fast-xml-parser';
import { SKDelta, SKPosition, SKSource, SKUpdate, SKValue } from "../model";

interface VelocitekTrackpoint {
  a_latitude: number
  a_longitude: number
  a_heading: number
  a_speed: number
  a_dateTime: string
}

export class VCCLoader {
  public static fromString(data: string): SKDelta {
    var jsonObj = parser.parse(data, { ignoreAttributes: false, attributeNamePrefix: 'a_', parseAttributeValue: true })

    if (!jsonObj || !jsonObj['VelocitekControlCenter']
      || !jsonObj['VelocitekControlCenter']['CapturedTrack']
      || !jsonObj['VelocitekControlCenter']['CapturedTrack']['Trackpoints']
      || !jsonObj['VelocitekControlCenter']['CapturedTrack']['Trackpoints']['Trackpoint'] ) {
      throw new Error('Invalid Velocitek file')
    }

    const points = jsonObj['VelocitekControlCenter']['CapturedTrack']['Trackpoints']['Trackpoint'] as VelocitekTrackpoint[]
    const updates = points.map(trackpoint => {
      const values = [
        new SKValue('navigation.speedOverGround', trackpoint.a_speed * 1852 / 3600),
        new SKValue('navigation.headingTrue', trackpoint.a_heading * 2 * Math.PI / 360),
        new SKValue('navigation.position', new SKPosition(trackpoint.a_latitude, trackpoint.a_longitude))
      ]
      return new SKUpdate(new SKSource('velocitek'), new Date(trackpoint.a_dateTime), values)
    })

    return new SKDelta(updates)
  }

  static fromFile(f: File): Promise<SKDelta> {
    const p = new Promise<SKDelta>((resolve,reject) => {
      const fileReader = new FileReader()
      fileReader.onload = () => {
        if (fileReader.readyState == 2 && typeof fileReader.result === 'string') {
          resolve(VCCLoader.fromString(fileReader.result))
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