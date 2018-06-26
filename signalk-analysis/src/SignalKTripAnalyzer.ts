import { SKDelta, SKPosition, SKValueType } from "@aldis/strongly-signalk";

/**
 * Exposes a set of functions to look at a SKDelta like a complete trip.
 */
export class SignalKTripAnalyzer {
  /**
   * Return a list of tuple [time, value] for a given key.
   * @param path
   */
  static getValuesForPath(trip: SKDelta, path: string): [Date, SKValueType][] {
    let values: [Date,SKValueType][] = []
    trip.updates.forEach(update => {
      update.values.forEach(value => {
        if (value.path === path) {
          values.push([update.timestamp, value.value])
        }
      })
    })
    return values
  }

  /**
   * Returns a list of points included in this trip.
   *
   * @param trip
   */
  static getPath(trip: SKDelta): SKPosition[] {
    return this.getValuesForPath(trip, "navigation.position").map(([,value]) => {
      return value as SKPosition
    })
  }

  /**
   * Return a set of coordinates that bound this trip.
   *
   * @return [ GPSCoordinate(NW corner), GPSCoordinate(SE corner)] or null
   *   if there is not enough data to define a trip.
   */
  static getBounds(trip: SKDelta): null|[SKPosition, SKPosition] {
    const points = this.getPath(trip)

    if (points.length < 1)
      return null

    const nwPoint = new SKPosition(points[0].latitude, points[0].longitude)
    const sePoint = new SKPosition(points[0].latitude, points[0].longitude)

    points.forEach(point => {
      // West most longitude
      nwPoint.longitude = Math.min(nwPoint.longitude, point.longitude)
      // North most latitude
      nwPoint.latitude = Math.max(nwPoint.latitude, point.latitude)
      // East most longitude
      sePoint.longitude = Math.max(sePoint.longitude, point.longitude)
      // South most latitude
      sePoint.latitude = Math.min(sePoint.latitude, point.latitude)
    })

    return [nwPoint, sePoint]
  }

  /**
   * Return the smallest timestamp of this trip.
   */
  static getStartTime(trip: SKDelta): null|Date {
    if (trip.updates.length == 0)
      return null

    return trip.updates.map(update => update.timestamp).reduce((min, current) => {
      return current.getTime() < min.getTime() ? current : min
    }, trip.updates[0].timestamp)
  }

  /**
   * Return the biggest timestamp of this trip.
   */
  static getEndTime(trip: SKDelta): null|Date {
    if (trip.updates.length == 0)
      return null

    return trip.updates.map(update => update.timestamp).reduce((max, current) => {
      return current.getTime() > max.getTime() ? current : max
    }, trip.updates[0].timestamp)
  }
}
