import Trip from './Trip'
import TimeSelection from './TimeSelection'

export default class InteractiveTrip {
  private trip : Trip
  private dataProvider: DataProvider
  private selection: TimeSelection

  constructor(trip : Trip, dataProvider : DataProvider) {
    this.trip = trip
    this.selection = new TimeSelection(this.trip.getStartTime())
    this.dataProvider = dataProvider
  }
}