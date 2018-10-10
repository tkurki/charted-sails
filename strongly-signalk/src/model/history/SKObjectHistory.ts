import { SKPropertyHistory, SKPropertyHistoryJSON } from "./SKPropertyHistory";

export interface SKObjectHistoryJSON {
  context: string
  timestamps: string[]
  properties: SKPropertyHistoryJSON[]
}

export class SKObjectHistory {
  context: string
  timestamps: Date[]
  properties: SKPropertyHistory[]

  constructor(context: string) {
    this.context = context
    this.timestamps = []
    this.properties = []
  }

  static fromJSON(json: string|SKObjectHistoryJSON): SKObjectHistory {
    if (typeof json === 'string') {
      return JSON.parse(json, SKObjectHistory.reviver)
    }
    else {
      let history : SKObjectHistory = Object.create(SKObjectHistory.prototype)
      history.context = json.context
      history.timestamps = json.timestamps.map(d => new Date(d))
      history.properties = json.properties.map(p => SKPropertyHistory.fromJSON(p))
      return history
    }
  }

  static reviver(key: string, value: any): any {
    return key === "" ? SKObjectHistory.fromJSON(value) : value;
  }
}