import { TripDataProvider } from "./TripDataProvider";
import { SKValueType, SKDelta } from "../model";

export class CachingDataProvider implements TripDataProvider {
  private dataProvider: TripDataProvider
  private cacheAvailableValues:string[]|null = null
  private valuesAtTime: {[key:number]: {[path:string]: SKValueType}}
  private cachingResolution: number

  constructor(realThing: TripDataProvider, cachingResolution: number) {
    this.dataProvider = realThing
    this.cachingResolution = cachingResolution
    this.valuesAtTime = {}
  }

  public getTripData(): SKDelta {
    return this.dataProvider.getTripData()
  }

  public getAvailableValues() : string[] {
    if (!this.cacheAvailableValues) {
      this.cacheAvailableValues = this.dataProvider.getAvailableValues()
    }
    return this.cacheAvailableValues
  }

  public getValueAtTime(path: string, time: Date) : SKValueType|null {
    const values = this.getValuesAtTime(time)
    if (path in values) {
      return values[path]
    }
    else {
      return null
    }
  }

  public getValuesAtTime(time: Date) : {[path:string]: SKValueType} {
    const cacheKey = Math.round(time.getTime() / this.cachingResolution) * this.cachingResolution
    if (! (cacheKey in this.valuesAtTime)) {
      this.valuesAtTime[cacheKey] = this.dataProvider.getValuesAtTime(new Date(cacheKey))
    }
    return this.valuesAtTime[cacheKey]
  }
}