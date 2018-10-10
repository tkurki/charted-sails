import { SKSource, SKSourceJSON } from "../SKSource";
import { parseSKValueType, SKValueType } from "../SKValue";

export interface SKPropertyHistoryJSON {
  path: string
  source: SKSourceJSON
  values: SKValueType[]
}

export class SKPropertyHistory {
  path: string
  source: SKSource
  values: (SKValueType|null)[]

  constructor(path: string, source: SKSource) {
    this.path = path
    this.source = source
    this.values = []
  }

  static fromJSON(json: string|SKPropertyHistoryJSON): SKPropertyHistory {
    if (typeof json === 'string') {
      return JSON.parse(json, SKPropertyHistory.reviver)
    }
    else {
      let history : SKPropertyHistory = Object.create(SKPropertyHistory.prototype)
      history.path = json.path
      history.source = SKSource.fromJSON(json.source)
      history.values = json.values.map(v => parseSKValueType(history.path, v))
      return history
    }
  }

  static reviver(key: string, value: any): any {
    return key === "" ? SKPropertyHistory.fromJSON(value) : value;
  }
}