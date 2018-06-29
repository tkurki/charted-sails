import { isNull } from "util";
import { SignalKTripAnalyzer } from "./SignalKTripAnalyzer";
import { TripDataProvider } from "./TripDataProvider";
import { SKValueType, SKDelta } from "../model";

export class BetterDataProvider implements TripDataProvider {
  public static interpolate(path: string, time: Date, timeA: Date, valueA: SKValueType,
    timeB: Date, valueB: SKValueType): SKValueType
  {
    if (typeof valueA !== typeof valueB) {
      throw new Error(`Values for path ${path} should have the same type (${typeof valueA} vs ${typeof valueB})`)
    }
    if (time < timeA || time > timeB) {
      throw new Error(`Cannot interpolate for a time outside given bounds (${timeA} ${time} ${timeB}`)
    }
    if (typeof valueA === 'number' && typeof valueB === 'number') {
      return valueA
        + (valueB - valueA) / (timeB.getTime() - timeA.getTime())
          * (time.getTime() - timeA.getTime())
    }
    else {
      return valueA
    }
  }

  private delta: SKDelta
  private availableValues:string[]
  private valuesPerPath:{[path:string]: [Date,SKValueType][]}

  constructor(delta: SKDelta) {
    this.delta = delta

    const paths : {[index:string]: boolean} = {}
    this.delta.updates.forEach(update => {
      update.values.forEach(value => {
        paths[value.path] = true
      })
    })
    this.availableValues = Object.keys(paths)

    this.valuesPerPath = {}
    this.availableValues.forEach(path => {
      this.valuesPerPath[path] = SignalKTripAnalyzer.getValuesForPath(this.delta, path)
    })
  }

  public getAvailableValues() : string[] {
    return this.availableValues
  }

  /**
   * Given a time t, return the index of the largest element with timestamp<t
   * @param time
   */
  private indexForTimestamp(time: Date, items: [Date, SKValueType][]) {
    // binary search inspired by
    // http://rosettacode.org/wiki/Binary_search

    let low  = 0
    let high   = items.length - 1

    while (low <= high) {
      let middle = Math.floor((low + high)/2)

      if (items[middle][0] > time) {
        high = middle - 1
      }
      else if (items[middle][0] < time) {
        low = middle + 1
      }
      else {
        return middle
      }
    }
    if (low < high && items[low][0] < time) {
      return low
    }
    else if (high >= 0 && high < low && items[high][0] < time) {
      return high
    }
    else {
      return -1
    }
  }

  public getValueAtTime(path: string, time: Date) : SKValueType|null {
    if (!(path in this.valuesPerPath)) {
      return null
    }
    const values = this.valuesPerPath[path]

    let beforeIndex = this.indexForTimestamp(time, values)
    let afterIndex = -1
    if (beforeIndex != -1 && beforeIndex + 1 < values.length) {
      afterIndex = beforeIndex + 1
    }

    if (beforeIndex === -1) {
      return null
    }
    else {
      if (afterIndex !== -1 && afterIndex !== beforeIndex) {
        return BetterDataProvider.interpolate(path, time, values[beforeIndex][0],
          values[beforeIndex][1], values[afterIndex][0], values[afterIndex][1])
      }
      else {
        return values[beforeIndex][1]
      }
    }
  }

  public getValuesAtTime(time: Date) : {[path:string]: SKValueType} {
    const data : {[index:string]: SKValueType} = {}
    this.availableValues.forEach(path => {
      const v = this.getValueAtTime(path, time)
      if (!isNull(v)) {
        data[path] = v
      }
    })
    return data
  }

}
