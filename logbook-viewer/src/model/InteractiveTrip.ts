import { SignalKTripAnalyzer, SKDelta, SKPosition, TripDataProvider } from '@aldis/strongly-signalk';
import TimeSelection from './TimeSelection';

export interface InteractiveTripSegment {
  startPosition: SKPosition
  endPosition: SKPosition
  startTime: Date
  endTime: Date
}

export default class InteractiveTrip {
  private trip : SKDelta
  private dataProvider: TripDataProvider
  private selection: TimeSelection
  private segments: InteractiveTripSegment[]
  private startTime: Date
  private endTime: Date

  constructor(trip : SKDelta, dataProvider: TripDataProvider) {
    if (trip.updates.length < 1) {
      throw new Error("Trip should have *at least* one update!")
    }

    this.trip = trip
    this.dataProvider = dataProvider
    this.selection = new TimeSelection(SignalKTripAnalyzer.getStartTime(this.trip)!)
    this.segments = this.calculateSegments()
    this.startTime = SignalKTripAnalyzer.getStartTime(this.trip)!
    this.endTime = SignalKTripAnalyzer.getEndTime(this.trip)!
  }

  public getPathSegments(): InteractiveTripSegment[] {
    return this.segments
  }

  public getBounds(): [SKPosition, SKPosition] {
    return SignalKTripAnalyzer.getBounds(this.trip)!
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

  private calculateSegments() {
    const segments:InteractiveTripSegment[] = []

    const positionValues = SignalKTripAnalyzer.getValuesForPath(this.trip, "navigation.position")
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
}