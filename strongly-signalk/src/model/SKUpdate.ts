import { SKSource, SKSourceJSON } from "./SKSource";
import { SKValue, SKValueJSON } from "./SKValue";

export interface SKUpdateJSON {
  timestamp: string
  source: SKSourceJSON
  values: SKValueJSON[]
}

/**
 * One update to the values of an object.
 *
 * This includes the time of the update, the source and a list of values that
 * at the given timestamp.
 */
export class SKUpdate {
  timestamp: Date
  source?: SKSource
  values: SKValue[]

  constructor(timestamp: Date = new Date(), values: SKValue[] = [], source?: SKSource) {
    this.timestamp = timestamp
    this.values = values
    this.source = source
  }

  static fromJSON(json: string|SKUpdateJSON): SKUpdate {
    if (typeof json === 'string') {
      return JSON.parse(json, SKUpdate.reviver)
    }
    else {
      let update : SKUpdate = Object.create(SKUpdate.prototype)
      update.timestamp = new Date(json.timestamp)
      update.values = json.values.map(v => SKValue.fromJSON(v))
      if (json.source) {
        update.source = SKSource.fromJSON(json.source)
      }
      return update
    }
  }

  static reviver(key: string, value: any): any {
    return key === "" ? SKUpdate.fromJSON(value) : value;
  }
}