/**
 * Position in SignalK
 *
 * Altitude is optional
 */
export interface SKPositionJSON {
  latitude: number
  longitude: number
  altitude?: number
}

/**
 * Position in SignalK
 *
 * Altitude is optional
 */
export class SKPosition {
  latitude: number
  longitude: number
  altitude?: number

  static fromJSON(json:string|SKPositionJSON) {
    if (typeof json === 'string') {
      return JSON.parse(json, SKPosition.reviver)
    }
    else {
      const p = Object.create(SKPosition.prototype)
      p.latitude = json.latitude
      p.longitude = json.longitude
      p.altitude = json.altitude
      return p
    }
  }

  static reviver(key: string, value: any): any {
    return key === "" ? SKPosition.fromJSON(value) : value;
  }
}