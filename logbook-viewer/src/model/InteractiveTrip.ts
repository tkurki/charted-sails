import TripDataProvider from './DataProvider';
import TimeSelection from './TimeSelection'
import Trip from './Trip'

export default class InteractiveTrip {
  private trip : Trip
  private dataProvider: TripDataProvider
  private selection: TimeSelection

  constructor(trip : Trip, dataProvider : TripDataProvider) {
    this.trip = trip
    this.selection = new TimeSelection(this.trip.getStartTime())
    this.dataProvider = dataProvider
  }
}