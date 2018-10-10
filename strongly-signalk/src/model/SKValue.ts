import { SKPosition } from "./SKPosition";

/**
 * SignalK specifies that timestamps should be serialized as ISO8601 timestamps.
 */
export type Timestamp = string

export type SKValueType = number|string|SKPosition|Date

export function parseSKValueType(path: string, value: any): SKValueType {
  // FIXME: This should use the schema to know what is the expected type for
  // a given path.
  if (path === 'navigation.position' && typeof value === 'object'
      && 'latitude' in value && 'longitude' in value) {
    return SKPosition.fromJSON(value)
  }
  else if (path === 'navigation.datetime' && typeof value === 'string') {
    return new Date(value)
  }
  else if (typeof value === 'number' || typeof value === 'string') {
    return value
  }
  else {
    throw new Error(`Invalid value ${JSON.stringify(value)} for path ${path}.`)
  }
}

export interface SKValueJSON {
  path: string
  value: any
}

/**
 * One generic signalk value.
 */
export class SKValue {
  path: string
  value: SKValueType

  constructor(path: string, value: SKValueType) {
    this.path = path
    this.value = value
  }

  static fromJSON(json: string|SKValueJSON): SKValue {
    if (typeof json === 'string') {
      return JSON.parse(json, SKValue.reviver)
    }
    else {
      let v : SKValue = Object.create(SKValue.prototype)
      v.path = json.path
      v.value = parseSKValueType(json.path, json.value)
      return v
    }
  }

  static reviver(key: string, value: any): any {
    return key === "" ? SKValue.fromJSON(value) : value;
  }
}