/**
 * Position of a point on the globe [Lon,Lat].
 *
 * By react-map-gl/deck.gl convention, this is [Lon,Lat].
 */
export type GPSCoordinates = [Number, Number]

/**
 * Very simplified definition of a list of SignalK values.
 *
 * The key is a signalk path.
 */
export type SKValues = Object

/**
 * A point in time with a some data measured at this point. Nothing required here.
 *
 * Properties represent values measured at this specific time.
 */
export interface TimedData {
  time: Date
  coordinates?: GPSCoordinates
  values: SKValues
}

/**
 * One point in space and time.
 */
export interface Point {
  time: Date
  coordinates: GPSCoordinates
}

/**
 * Trip is made of segments that go from point (coordinate/time) to another.
 *
 * We associate measurements that are valid for the duration of this segment.
 */
export interface Segment {
  start: Point
  end: Point
  values: SKValues
}

export default class Trip {
  public segments: Segment[]

  public getStartTime() : Date | null {
    if (this.segments.length > 0) {
      return this.segments[0].start.time;
    }
    return null
  }

  public getEndTime() : Date | null {
    if (this.segments.length > 0) {
      return this.segments[-1].end.time;
    }
    return null
  }
}

export function loadExpeditionLog(data : Object[]) : Trip {
  let t = new Trip();

  // TODO: We may want to reduce the number of segments here.

  let timedData : TimedData[] = data.map(d => convertExpeditionLineToTimedData(d))
  t.segments = convertTimedDataToSegments(timedData)
  return t;
}

export function convertExpeditionLineToTimedData(logLine : Object) : TimedData {
  return {
    coordinates: [ Number(logLine['Lon']), Number(logLine['Lat']) ],
    time: new Date(new Date("1900-01-01T00:00:00Z").getTime() + logLine['Utc'] * 24 * 3600 * 1000),
    values: convertExpeditionFieldsToSignalKValues(logLine)
  };
}

function convertExpeditionFieldsToSignalKValues(expeditionFields : Object) : SKValues {
  const excludedProperties = ['Utc', 'Lat', 'Lon'];
  let values : SKValues = {}

  // TODO: Convert units
  // TODO: Convert complex types (string, objects)
  for (let key in expeditionFields) {
    if (!excludedProperties.includes(key)) {
      values[key] = expeditionFields[key]
    }
  }
  return values
}

/**
 *
 * @param data Takes a list of TimedData and generates segment
 * that have start/end points (with coordinates) and an average of all data points
 * available during that segment.
 */
export function convertTimedDataToSegments(timedDatas : TimedData[]) : Segment[] {
  let segments : Segment[] = [];

  let currentSegmentData : TimedData[]
  let lastPoint : Point|null = null;
  timedDatas.forEach(timedData => {
    if (timedData.coordinates && timedData.coordinates.length > 0) {
      if (lastPoint !== null) {
        currentSegmentData.push(timedData)
        const s : Segment = {
          start: lastPoint,
          end: {coordinates: timedData.coordinates, time: timedData.time},
          values: aggregateTimedDataValues(currentSegmentData)
        }
        segments.push(s);
        currentSegmentData = []
      }

      lastPoint = {coordinates: timedData.coordinates, time: timedData.time}
    }
    else {
      currentSegmentData.push(timedData);
    }
    // We produce one segment whenever we have a starting/end point

  })

  return segments
}

/**
 * Aggregate multiple timeddata point values into one set of values.
 * @param timedDatas
 */
export function aggregateTimedDataValues(timedDatas : TimedData[]) : SKValues {
  let values : SKValues = {}

  let valuesArray = {};
  for (let sample of timedDatas) {
    // tslint:disable-next-line:forin
    for (const key of Object.keys(sample.values)) {
      if (!(key in valuesArray)) {
        valuesArray[key] = []
      }
      valuesArray[key].push(sample.values[key])
    }
  }

  const angleFields = ['awa', 'twa']
  const directionFields = ['twd', 'cog']

  for (const key of Object.keys(valuesArray)) {
    if (angleFields.includes(key) || directionFields.includes(key)) {
      values[key] = aggregateByAveragingAngles(valuesArray[key])
      if (directionFields.includes(key)) {
        values[key] = values[key] < 0 ? 360 + values[key] : values[key]
      }
    }
    else {
      values[key] = aggregateByAveraging(valuesArray[key])
    }
  }
  return values
}

function aggregateByAveraging(values : number[]) : number {
  return values.reduce((sum:number, x:number) => sum + x, 0) / values.length
}

function aggregateByAveragingAngles(values : number[]) : number {
  // We take the (x,y) cartesian coordinates of each angle and average them.
  // See https://stackoverflow.com/questions/491738/how-do-you-calculate-the-average-of-a-set-of-circular-data
  const x = values.reduce((sum, a) => sum + Math.cos(a / 360 * 2 * Math.PI), 0)
  const y = values.reduce((sum, a) => sum + Math.sin(a / 360 * 2 * Math.PI), 0)

  return Math.atan2(y, x) * 360 / (2*Math.PI)
}
