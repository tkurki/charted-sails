import { SKValueType } from '@aldis/strongly-signalk'

export default interface TripDataProvider {
  /**
   * Returns the list of all available values in this trip.
   */
  getAvailableValues() : string[]

  /**
   * Return a specific value at a specific time
   */
  getValueAtTime(path: string, time: Date) : SKValueType|null

  /**
   * Return a list of values at a specific time.
   *
   * Note that we return an object here with only one value per key
   * so the data adapter has to handle cases where multiple sources provide
   * a value for the same path.
   */
  getValuesAtTime(time: Date) : {[path:string]: SKValueType}
}