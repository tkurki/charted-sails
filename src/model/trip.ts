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

export class Trip {
  segments: Segment[]

  getStartTime() : Date {
    if (this.segments.length > 0) {
      return this.segments[0].start.time;
    }
    return null
  }

  getEndTime() : Date {
    if (this.segments.length > 0) {
      return this.segments[-1].end.time;
    }
    return null
  }
}

export function loadExpeditionLog(data : Object[]) : Trip {
  let t : Trip;

  // TODO: We may want to reduce the number of segments here.

  let timedData : TimedData[] = data.map(d => convertExpeditionLineToTimedData(d))
  t.segments = convertExpeditionLogToSegments(timedData);
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
function convertExpeditionLogToSegments(timedDatas : TimedData[]) : Segment[] {
  let segments : Segment[];

  let currentSegmentData = [];
  let lastPoint = null;
  timedDatas.forEach(timedData => {
    currentSegmentData.push(timedData);

    if ('coordinates' in timedData && timedData.coordinates.length > 0) {
      if (lastPoint !== null) {
        let s : Segment;
        s.start = lastPoint;
        s.end = {coordinates: timedData.coordinates, time: timedData.time};


        segments.push(s);
      }

      lastPoint = {coordinates: timedData.time, time: timedData.time}
    }
    // We produce one segment whenever we have a starting/end point

  });

  return segments;
}