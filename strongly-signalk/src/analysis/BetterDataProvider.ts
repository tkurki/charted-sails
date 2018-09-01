import { isNull } from "util";
import { SKDelta, SKDeltaJSON, SKPosition, SKPositionJSON, SKValueType } from "../model";
import { SignalKTripAnalyzer } from "./SignalKTripAnalyzer";
import { TripDataProvider } from "./TripDataProvider";

interface BetterDataProviderJSON {
  delta: SKDeltaJSON
  availableValues:string[]
  valuesPerPath:{[path:string]: [Date,SKValueType][]}
}

export class BetterDataProvider implements TripDataProvider {
  public static interpolate(path: string, time: Date, timeA: Date, valueA: SKValueType,
    timeB: Date, valueB: SKValueType): SKValueType
  {
    if (typeof valueA !== typeof valueB) {
      throw new Error(`Values for path ${path} should have the same type (${typeof valueA} vs ${typeof valueB})`)
    }
    if (time < timeA || time > timeB) {
      throw new Error(`Cannot interpolate for a time outside given bounds (${timeA.toISOString()} ${time.toISOString()} ${timeB.toISOString()}`)
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

  /**
   * Re-hydrate a betterDataProvider from just the fields in an Object.
   *
   * This is useful when reloading data that was serialized.
   * @param jsonObject
   */
  static fromJSON(jsonObject: BetterDataProviderJSON) {
    const provider = new BetterDataProvider(new SKDelta())
    provider.delta = SKDelta.fromJSON(jsonObject.delta)
    provider.availableValues = jsonObject.availableValues
    provider.valuesPerPath = jsonObject.valuesPerPath

    // We need to "re-hydrate" SKPosition objects in the cache.
    // The other values are primitive types and do not need special treatment.
    Object.keys(provider.valuesPerPath).map(path => {
      if (provider.valuesPerPath[path].length > 0) {
        const aValue = provider.valuesPerPath[path][0][1]

        if (typeof aValue === 'object' && 'latitude' in aValue && 'longitude' in aValue) {
          provider.valuesPerPath[path] = provider.valuesPerPath[path].map<[Date, SKValueType]>(element => {
            return [element[0], SKPosition.fromJSON(element[1] as SKPositionJSON)]
          })
        }
      }
    })
    return provider
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

  public getTripData() {
    return this.delta
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

  /**
   * Given a time t, return the index of the update with latest timestamp and
   * timestamp < t.
   * @param time
   */
  public indexInDeltaForTimestamp(time: Date) {
    // binary search inspired by
    // http://rosettacode.org/wiki/Binary_search

    let low  = 0
    let high   = this.delta.updates.length - 1

    while (low <= high) {
      let middle = Math.floor((low + high)/2)

      if (this.delta.updates[middle].timestamp > time) {
        high = middle - 1
      }
      else if (this.delta.updates[middle].timestamp < time) {
        low = middle + 1
      }
      else {
        return middle
      }
    }
    if (low < high && this.delta.updates[low].timestamp < time) {
      return low
    }
    else if (high >= 0 && high < low && this.delta.updates[high].timestamp < time) {
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

  /**
   * Returns the smallest timestamp that has all the paths existing in this
   * dataset defined.
   *
   * This is useful when displaying data to select the first point that is fully defined.
   */
  public getSmallestTimestampWithAllPathsDefined() : Date {
    const firstDateOfPaths = Object.keys(this.valuesPerPath)
      .map(path => this.valuesPerPath[path])
      // [Date, SKValueType][] => [Date, SKValueType][0]
      .map(value => value[0])
      // [Date, SKValueType] => Date
      .map(value => value[0])
      .sort()

    return firstDateOfPaths[firstDateOfPaths.length - 1]
  }
}
