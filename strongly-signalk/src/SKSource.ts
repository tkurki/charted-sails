export interface SKSourceJSON {
  label: string
}

/**
 * Source of data in delta format, a record of where the data was received from.
 * An object containing at least the properties defined in 'properties', but can contain anything beyond that.
 */
export class SKSource {
  /**
   * A label to identify the source bus, eg serial-COM1, eth-local,etc .
   * Can be anything but should follow a predicatable format.
   */
  label: string

  static fromJSON(json: string|SKSourceJSON): SKSource {
    if (typeof json === 'string') {
      return JSON.parse(json, SKSource.reviver)
    }
    else {
      const s = Object.create(SKSource)
      s.label = json.label
      return s
    }
  }

  static reviver(key: string, value: any): any {
    return key === "" ? SKSource.fromJSON(value) : value;
  }
}