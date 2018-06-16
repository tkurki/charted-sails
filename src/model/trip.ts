/**
 * Position of a point on the globe [Lon,Lat].
 *
 * By react-map-gl/deck.gl convention, this is [Lon,Lat].
 */
export type GPSCoordinates = [number, number]

/**
 * Very simplified definition of a list of SignalK values.
 *
 * The key is a signalk path.
 */
export type SKValues = object

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

/**
 * Represents a trip.
 *
 * A trip always has at least one segment.
 */
export default class Trip {
  public static fromExpeditionData(data:object[]) : Trip|null {
    const timedData : TimedData[] = []
    data.forEach(d => {
      try {
        const td = convertExpeditionLineToTimedData(d)
        timedData.push(td)
      }
      catch (e) {
        // ignoring e
        console.log("Ignoring error with line", d, e)
      }
    })

    if (timedData.length > 0) {
      return Trip.fromTimedData(timedData)
    }
    else {
      return null
    }
  }

  public static fromTimedData(timedData:TimedData[]) : Trip {
    if (timedData.length === 0) {
      throw new Error('Cannot create trip without at least one point!')
    }
    const tripSegments = convertTimedDataToSegments(timedData)

    return new Trip(tripSegments);
  }

  public segments: Segment[]

  private constructor(segments : Segment[]) {
    this.segments = segments
  }

  public getStartTime() : Date {
    return this.segments[0].start.time;
  }

  public getEndTime() : Date {
    return this.segments[this.segments.length - 1].end.time;
  }

  public getSegmentAtTime(time : Date) : Segment|null {
    for (const segment of this.segments) {
      if (segment.start.time <= time && time < segment.end.time) {
        return segment
      }
    }
    return null
  }

  /**
   * Return a set of coordinates that bound this trip.
   *
   * @return [ GPSCoordinate(NW corner), GPSCoordinate(SE corner)]
   */
  public getBoundingCoordinates() : [GPSCoordinates, GPSCoordinates] {
    const points = this.getPoints()
    // (always returns at least one point)

    const nwPoint : GPSCoordinates = [ points[0][0], points[0][1] ]
    const sePoint : GPSCoordinates = [ points[0][0], points[0][1] ]

    points.forEach(point => {
      // West most longitude
      nwPoint[0] = Math.min(nwPoint[0], point[0])
      // North most latitude
      nwPoint[1] = Math.max(nwPoint[1], point[1])
      // East most longitude
      sePoint[0] = Math.max(sePoint[0], point[0])
      // South most latitude
      sePoint[1] = Math.min(sePoint[1], point[1])
    })

    return [nwPoint, sePoint]
  }

  /**
   * Returns a list of points that this trip visits (in order).
   */
  public getPoints() : GPSCoordinates[] {
    const points = this.segments.map(s => s.start.coordinates)
    points.push(this.segments[this.segments.length-1].end.coordinates)
    return points
  }
}


export function convertExpeditionLineToTimedData(logLine : object) : TimedData {
  const LONGITUDE_FIELD = 'Lon'
  const LATITUDE_FIELD = 'Lat'
  const TIME_FIELD = 'Utc'

  if (!Object.keys(logLine).includes(TIME_FIELD) || logLine[TIME_FIELD] === "") {
    throw new Error('Invalid line')
  }

  const d = new Date(new Date("1900-01-01T00:00:00Z").getTime() + logLine[TIME_FIELD] * 24 * 3600 * 1000)
  // Check that the date is valid
  if (isNaN(d.getTime())) {
    throw new Error('Invalid Date')
  }

  const td : TimedData = {
    time: d,
    values: convertExpeditionFieldsToSignalKValues(logLine)
  }

  if (logLine[LONGITUDE_FIELD] !== "" && logLine[LATITUDE_FIELD] !== "") {
    td.coordinates = [ Number(logLine[LONGITUDE_FIELD]), Number(logLine[LATITUDE_FIELD]) ]
  }
  return td
}

function convertExpeditionFieldsToSignalKValues(expeditionFields : object) : SKValues {
  const excludedProperties = ['Utc', 'Lat', 'Lon'];
  const values : SKValues = {}

  // TODO: Convert units
  // TODO: Convert complex types (string, objects)
  for (const key in expeditionFields) {
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
  const segments : Segment[] = [];

  let currentSegmentData : TimedData[] = []
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
  const values : SKValues = {}

  const valuesArray = {};
  for (const sample of timedDatas) {
    // tslint:disable-next-line:forin
    for (const key of Object.keys(sample.values)) {
      if (!(key in valuesArray)) {
        valuesArray[key] = []
      }
      valuesArray[key].push(sample.values[key])
    }
  }

  const angleFields = ['Awa', 'Twa']
  const directionFields = ['Twd', 'Cog']

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
