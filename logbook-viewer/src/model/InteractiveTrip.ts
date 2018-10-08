import { BetterDataProvider, SignalKTripAnalyzer, SKDelta, SKPosition, TripDataProvider } from '@aldis/strongly-signalk';
import TimeSelection from './TimeSelection';

export interface InteractiveTripSegment {
  startPosition: SKPosition
  endPosition: SKPosition
  startTime: Date
  endTime: Date
}

export default class InteractiveTrip {
  private trip : SKDelta
  private dataProvider: BetterDataProvider
  private selection: TimeSelection
  private segments: InteractiveTripSegment[]
  private bounds: [SKPosition, SKPosition]
  private startTime: Date
  private endTime: Date
  private title: string

  constructor(trip : SKDelta, dataProvider: BetterDataProvider, title: string) {
    if (trip.updates.length < 1) {
      throw new Error("Trip should have *at least* one update!")
    }

    this.trip = trip
    this.dataProvider = dataProvider
    this.selection = new TimeSelection(this.dataProvider.getSmallestTimestampWithAllPathsDefined())
    this.bounds =  SignalKTripAnalyzer.getBounds(this.trip)!
    this.startTime = this.findStartTime()
    this.endTime = SignalKTripAnalyzer.getEndTime(this.trip)!
    this.segments = this.calculateSegments()
    this.title = title

    if (this.segments.length === 0 || this.bounds === null) {
      throw new Error("Logfile does not include enough data to build a trace.")
    }
  }

  public getPathSegments(): InteractiveTripSegment[] {
    return this.segments
  }

  public getBounds(): [SKPosition, SKPosition] {
    return this.bounds
  }

  public getStartTime(): Date {
    return this.startTime
  }

  public getEndTime(): Date {
    return this.endTime
  }

  public getDataProvider(): TripDataProvider {
    return this.dataProvider
  }

  public getSelection(): TimeSelection {
    return this.selection
  }

  public setSelection(ts: TimeSelection) {
    this.selection = ts
  }

  public getTitle() {
    return this.title
  }

  public trimBounds(newStartTime: Date, newEndTime: Date) {
    this.startTime = newStartTime
    this.endTime = newEndTime
    // Recalculate segments
    this.segments = this.calculateSegments()
  }

  private calculateSegments() {
    const segments:InteractiveTripSegment[] = []

    // Get all position values and only keep them if they are within time bounds.
    const positionValues = SignalKTripAnalyzer.getValuesForPath(this.trip, "navigation.position")
      .filter(value => value[0] >= this.getStartTime() && value[0] <= this.getEndTime() )

    if (positionValues.length === 0) {
      return []
    }
    else if (positionValues.length === 1) {
      segments.push({
        startPosition: positionValues[0][1] as SKPosition,
        endPosition: positionValues[0][1] as SKPosition,
        startTime: positionValues[0][0],
        endTime: positionValues[0][0]
      })
    }
    else {
      for (let i = 1; i < positionValues.length; i++) {
        segments.push({
          startPosition: positionValues[i-1][1] as SKPosition,
          endPosition: positionValues[i][1] as SKPosition,
          startTime: positionValues[i-1][0],
          endTime: positionValues[i][0]
        })
      }
    }
    return segments
  }

  private findStartTime() {
    const firstDate = SignalKTripAnalyzer.getStartTime(this.trip)
    const lastDate = SignalKTripAnalyzer.getEndTime(this.trip)

    if (firstDate && lastDate) {
      // Very custom and hacky way to detect when initial samples are not properly
      // timestamped: If the beginning is before 1980 and the trip lasts more than 10y then:
      if (firstDate.getUTCFullYear() < 1980 && lastDate.getUTCFullYear() - firstDate.getUTCFullYear() > 10) {
        // Use the first date that is less than 3yrs before the end, as the start date.
        // In effect this limits the duration of trips we can show to 3y if they were started before 1980
        // I think we can revisit if that is ever a problem.
        const firstRealisticUpdate = this.trip.updates.find(update => {
          return (lastDate.getTime() - update.timestamp.getTime() < 3 * 365 * 24 * 3600 * 1000)
        })
        if (firstRealisticUpdate) {
          return firstRealisticUpdate.timestamp
        }
      }
      return firstDate
    }
    else {
      throw new Error('This trip does not have a beginning (probably no data).')
    }
  }
}