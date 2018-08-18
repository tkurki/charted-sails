import { SKValueType, SKPosition } from "../model";
import * as utils from '@signalk/nmea0183-utilities';
import { isNullOrUndefined } from "util";

export interface SKValueFormatter {
  /**
   * The path of the value.
   */
  path: string

  /**
   * A user friendly label for this value. Will default to path.
   */
  label:string

  /**
   * Should this value be displayed to the user
   */
  display:boolean

  /**
   * A function to format the value to a string.
   */
  format: (x:SKValueType) => string

  /**
   * A string representing the unit to which the value has been converted.
   */
  unit: string
}

/**
 * This class includes a set of functions that can be used to take raw SK data
 * and present it to the user in a friendly way.
 */
export class IntelligibleSignalK {
  constructor() {
    // In the future, we should allow users of this class to pass options to change
    // how we will convert the data. For example, preferred units, preferred fields, etc.
  }

  /**
   * Return a short string representing the timezone used to display dates. For example "GMT+2".
   */
  public getUsedTimezoneShortName() {
    return new Date().toLocaleTimeString('en-us',{timeZoneName:'short'}).split(' ')[2];
  }

  /**
   * Return a comparator function that can be used to sort a list of SignalK paths.
   */
  public getSignalKPathComparator() {
    return this.compareSignalKPaths.bind(this)
  }

  /**
   * Compare functions to use when sorting a list of SignalK paths.
   *
   * Fields that have a pre-defined orders will come first, in the pre-defined orders, followed
   * by all other fields in alphabetical orders.
   * @param a
   * @param b
   */
  private compareSignalKPaths(a:string, b:string) {
    if (preferredFieldOrder.includes(a)) {
      if (preferredFieldOrder.includes(b)) {
        return preferredFieldOrder.indexOf(a) < preferredFieldOrder.indexOf(b) ? -1 : 1
      }
      else {
        return -1
      }
    }
    else {
      if (preferredFieldOrder.includes(b)) {
        return 1
      }
      else {
        return a < b ? -1 : 1
      }
    }
  }

  /**
   * Take a SKValue object and return a SKValueFormatter object that contains a user friendly label,
   * a unit and and a function to format a value of this path to a string.
   * @param v a SKValue object
   */
  public getFormatterForPath(path:string) {
    const intelligibleValue:SKValueFormatter = {
      path: path, unit: '', label: path, display: false,
      format: (x:SKValueType) => {
        if (isNullOrUndefined(x)) {
          return "-"
        }
        if (x instanceof SKPosition) {
          return x.latitude.toFixed(3) + " / " + x.longitude.toFixed(3)
        }
        if (x instanceof Date) {
          return x.toLocaleString()
        }
        if (typeof x === 'number') {
          return x.toString()
        }
        return x
      }
     }

    // To properly display the data we need to know how it is stored in signalK and
    // how we want it displayed. These are respectively the roles of signalKSchema and fieldConfiguration
    if (path in signalKSchema && path in fieldConfiguration) {
      const fieldConfig = fieldConfiguration[path]
      intelligibleValue.display = true
      intelligibleValue.unit = fieldConfig.unit
      intelligibleValue.label = fieldConfig.label

      if (signalKSchema[path].type === 'number') {
        intelligibleValue.format = (x) => {
          if (typeof x !== 'number') return "-"
          const convertedValue = utils.transform(x, signalKSchema[path].unit, fieldConfig.unit)

          const digits = fieldConfig.fractionDigits !== undefined ? fieldConfig.fractionDigits : 1
          return convertedValue.toFixed(digits)
        }
      }
      if ((signalKSchema[path].type === 'angle'||signalKSchema[path].type === 'direction')) {
        intelligibleValue.format = (x) => {
          if (typeof x !== 'number') return "-"
          let angleInDegrees = utils.transform(x, signalKSchema[path].unit, fieldConfig.unit)
          if (signalKSchema[path].type === 'direction') {
            angleInDegrees = (angleInDegrees + 360) %360
          }
          if (signalKSchema[path].type === 'angle') {
            angleInDegrees = (angleInDegrees % 360)
            if (angleInDegrees > 180) {
              angleInDegrees -= 360
            }
          }
          return angleInDegrees.toFixed(fieldConfig.fractionDigits)
        }
      }
    }
    return intelligibleValue
  }
}



const preferredFieldOrder = [
  'navigation.speedOverGround', 'navigation.courseOverGround',
  'navigation.speedThroughWater', 'navigation.headingTrue',
  'environment.wind.speedApparent', 'environment.wind.angleApparent',
  'environment.wind.speedOverGround', 'environment.wind.angleTrueGround'
]

const signalKSchema : {
  [path: string]: {
    unit: string
    type: 'angle'|'direction'|'position'|'number'|'string'|'timestamp'
  }
} = {
  'navigation.speedOverGround': { type: 'number', unit: 'ms'},
  'navigation.speedThroughWater': { type: 'number', unit: 'ms'},
  'navigation.courseOverGround': { type: 'direction', unit: 'rad'},
  'navigation.headingMagnetic': { type: 'direction', unit: 'rad' },
  'navigation.headingTrue': { type: 'direction', unit: 'rad' },
  'environment.wind.angleTrueGround': { type: 'angle', unit: 'rad'},
  'environment.wind.angleApparent': { type: 'angle', unit: 'rad'},
  'environment.wind.speedOverGround': { type: 'number', unit: 'ms'},
  'environment.wind.speedApparent': { type: 'number', unit: 'ms'},
}

const fieldConfiguration : { [index:string]: { label: string, unit: string, fractionDigits?: number }} = {
  'navigation.speedOverGround': { label: 'SOG', unit: 'knots' },
  'navigation.courseOverGround': { label: 'COG', fractionDigits: 0, unit: 'deg' },
  'navigation.headingMagnetic': { label: 'HDGm', fractionDigits: 0, unit: 'deg' },
  'navigation.headingTrue': { label: 'HDGt', fractionDigits: 0, unit: 'deg' },
  'navigation.speedThroughWater': { label: 'BSP', unit: 'knots' },
  'environment.wind.angleTrueGround': { label: 'TWA', fractionDigits: 0, unit: 'deg' },
  'environment.wind.angleApparent': { label: 'AWA', fractionDigits: 0, unit: 'deg' },
  'environment.wind.speedOverGround': { label: 'TWS', unit: 'knots' },
  'environment.wind.speedApparent': { label: 'AWS', unit: 'knots' },
}
