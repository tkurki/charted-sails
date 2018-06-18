import { SKValue } from '@aldis/strongly-signalk'

export default interface TripDataProvider {
  /**
   * Returns the list of all available values in this trip.
   */
  getAvailableValues() : string[]

  /**
   * Return a specific value at a specific time
   */
  getValueAtTime(path: string, time: Date) : SKValue

  /**
   * Return a list of values at a specific time
   */
  getValuesAtTime(path: string[], time: Date) : SKValue[]
}