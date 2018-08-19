
import { isNull } from "util"
import { SignalKTripAnalyzer } from "./SignalKTripAnalyzer"
import { TripDataProvider } from "./TripDataProvider"
import { SKValueType, SKDelta } from "../model";

export class SKDeltaDataProvider implements TripDataProvider {
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

  constructor(delta: SKDelta) {
    this.delta = delta
  }

  public getTripData() {
    return this.delta
  }

  public getAvailableValues() : string[] {
    const paths : {[index:string]: boolean} = {}
    this.delta.updates.forEach(update => {
      update.values.forEach(value => {
        paths[value.path] = true
      })
    })
    return Object.keys(paths)
  }

  public getValueAtTime(path: string, time: Date) : SKValueType|null {
    const values = SignalKTripAnalyzer.getValuesForPath(this.delta, path)

    let beforeIndex = -1
    let afterIndex = -1
    for (let i = 0; i < values.length; i++) {
      const ts = values[i][0]
      if (ts <= time) {
        beforeIndex = i
      }
      if (ts >= time) {
        afterIndex = i
        break
      }
    }

    if (beforeIndex === -1) {
      return null
    }
    else {
      if (afterIndex !== -1 && afterIndex !== beforeIndex) {
        return SKDeltaDataProvider.interpolate(path, time, values[beforeIndex][0],
          values[beforeIndex][1], values[afterIndex][0], values[afterIndex][1])
      }
      else {
        return values[beforeIndex][1]
      }
    }
  }

  public getValuesAtTime(time: Date) : {[path:string]: SKValueType} {
    const data : {[index:string]: SKValueType} = {}
    this.getAvailableValues().forEach(path => {
      const v = this.getValueAtTime(path, time)
      if (!isNull(v)) {
        data[path] = v
      }
    })
    return data
  }

}