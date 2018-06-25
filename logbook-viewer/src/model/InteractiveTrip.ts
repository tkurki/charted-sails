import {SignalKTripAnalyzer} from '@aldis/signalk-analysis'
import { SKDelta } from '@aldis/strongly-signalk';
import TripDataProvider from './DataProvider';
import TimeSelection from './TimeSelection'

export default class InteractiveTrip {
  private trip : SKDelta
  private dataProvider: TripDataProvider
  private selection: TimeSelection

  constructor(trip : SKDelta, dataProvider : TripDataProvider) {
    if (trip.updates.length < 1) {
      throw new Error("Trip should have *at least* one update!")
    }

    this.trip = trip
    this.selection = new TimeSelection(SignalKTripAnalyzer.getStartTime(this.trip)!)
    this.dataProvider = dataProvider
  }
}