import { SKObjectHistory, SKObjectHistoryJSON } from "./SKObjectHistory";


interface SKHistoryJSON {
  startDate: Date
  endDate: Date
  objects: SKObjectHistoryJSON[]
}


export class SKHistory {
  startDate: Date
  endDate: Date
  objects: SKObjectHistory[]

  constructor() {
    this.startDate = new Date()
    this.endDate = new Date()
    this.objects = []
  }

  static fromJSON(json: string|SKHistoryJSON): SKHistory {
    if (typeof json === 'string') {
      return JSON.parse(json, SKHistory.reviver)
    }
    else {
      let history : SKHistory = Object.create(SKHistory.prototype)
      history.startDate = new Date(json.startDate)
      history.endDate = new Date(json.endDate)
      history.objects = json.objects.map(o => SKObjectHistory.fromJSON(o))
      return history
    }
  }

  static reviver(key: string, value: any): any {
    return key === "" ? SKHistory.fromJSON(value) : value;
  }

}