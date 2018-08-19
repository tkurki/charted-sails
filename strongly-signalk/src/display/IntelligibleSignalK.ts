import * as utils from '@signalk/nmea0183-utilities';
import { isNullOrUndefined } from "util";
import { SKPosition, SKValueType } from "../model";

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
  private speedUnit = "knots"
  private speedDecimals = 1

  constructor() {
    // In the future, we should allow users of this class to pass options to change
    // how we will convert the data. For example, preferred units, preferred fields, etc.
  }

  /**
   * Returns a string with time formatted to users preferences.
   * @param d a Date object
   */
  public formatTime(d:Date) {
    return d.toLocaleTimeString()
  }

  /**
   * Returns a string with date/time formatted to users preferences.
   * @param d a Date object
   */
  public formatDateTime(d:Date) {
    return d.toLocaleString()
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
      intelligibleValue.unit = fieldConfig.unit || ''
      intelligibleValue.label = fieldConfig.label

      if (signalKSchema[path].type === 'speed') {
        intelligibleValue.format = (x) => {
          if (typeof x !== 'number') return "-"
          const convertedValue = utils.transform(x, "ms", this.speedUnit)
          return convertedValue.toFixed(this.speedDecimals)
        }
      }
      if ((signalKSchema[path].type === 'angle'||signalKSchema[path].type === 'direction')) {
        intelligibleValue.format = (x) => {
          if (typeof x !== 'number') return "-"
          let angleInDegrees = utils.transform(x, 'rad', 'deg')
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
      if (signalKSchema[path].type === 'temperature') {
        intelligibleValue.unit = "ºC"
        intelligibleValue.format = (x) => {
          if (typeof x !== 'number') return "-"

          let temp = x - 273.15
          return temp.toFixed(fieldConfig.fractionDigits)
        }
      }
      if (signalKSchema[path].type === 'distance') {
        intelligibleValue.unit = 'nm'
        intelligibleValue.format = (x) => {
          if (typeof x !== 'number') return "-"

          return (x/1852).toFixed(2)
        }
      }
      if (signalKSchema[path].type === 'depth') {
        intelligibleValue.unit = 'm'
        intelligibleValue.format = (x) => {
          if (typeof x !== 'number') return "-"

          return x.toFixed(1)
        }
      }
      if (signalKSchema[path].type === 'position') {
        intelligibleValue.format = (x) => {
          if (!(x instanceof SKPosition)) return "-"
          return x.asDMSString()
        }
      }
    }
    return intelligibleValue
  }
}

const preferredFieldOrder = [
  'navigation.speedOverGround', 'navigation.courseOverGround', 'navigation.courseOverGroundTrue',
  'navigation.speedThroughWater', 'navigation.headingMagnetic', 'navigation.headingTrue',
  'navigation.position',
  'environment.wind.speedApparent', 'environment.wind.angleApparent',
  'environment.wind.angleTrueWater', 'environment.wind.speedTrue',
  'environment.wind.speedOverGround', 'environment.wind.angleTrueGround',
  'environment.depth.belowTransducer', 'environment.water.temperature',
  'navigation.log', 'navigation.trip.log'
]

const signalKSchema : {
  [path: string]: {
    type: 'angle'|'depth'|'direction'|'distance'|'position'|'speed'|'string'|'timestamp'|'temperature'
    unit?: string
  }
} = {
  'environment.depth.belowTransducer': { type: 'depth' },
  'environment.water.temperature': { type: 'temperature' },

  'environment.wind.angleTrueGround': { type: 'angle' },
  'environment.wind.angleTrueWater': { type: 'angle' },
  'environment.wind.angleApparent': { type: 'angle' },

  'environment.wind.speedApparent': { type: 'speed' },
  'environment.wind.speedTrue': { type: 'speed' },
  'environment.wind.speedOverGround': { type: 'speed' },

  'navigation.courseOverGround': { type: 'direction' },
  'navigation.courseOverGroundTrue': { type: 'direction' },

  'navigation.headingMagnetic': { type: 'direction' },
  'navigation.headingTrue': { type: 'direction' },

  'navigation.log': { type: 'distance' },

  'navigation.position': { type: 'position' },

  'navigation.trip.log': { type: 'distance'},

  'navigation.speedOverGround': { type: 'speed' },
  'navigation.speedThroughWater': { type: 'speed' },
}

const fieldConfiguration : { [index:string]: { label: string, unit?: string, fractionDigits?: number }} = {
  'environment.depth.belowTransducer': { label: 'DPT', unit: 'm' },
  'environment.water.temperature': { label: 'TMP', unit: 'CELCIUS', fractionDigits: 1 },

  'environment.wind.angleApparent': { label: 'AWA', fractionDigits: 0, unit: 'deg' },
  'environment.wind.angleTrueGround': { label: 'TWAg', fractionDigits: 0, unit: 'deg' },
  'environment.wind.angleTrueWater': { label: 'TWAw', fractionDigits: 0, unit: 'deg' },

  'environment.wind.speedApparent': { label: 'AWS', unit: 'knots' },
  'environment.wind.speedTrue': { label: 'TWSw', unit: 'knots' },
  'environment.wind.speedOverGround': { label: 'TWSg', unit: 'knots' },

  'navigation.courseOverGround': { label: 'COGm', fractionDigits: 0, unit: 'deg' },
  'navigation.courseOverGroundTrue': { label: 'COGt', fractionDigits: 0, unit: 'deg' },

  'navigation.headingMagnetic': { label: 'HDGm', fractionDigits: 0, unit: 'deg' },
  'navigation.headingTrue': { label: 'HDGt', fractionDigits: 0, unit: 'deg' },

  'navigation.log': { label: 'LOG', fractionDigits: 0, unit: 'nm' },

  'navigation.position': { label: 'POS' },

  'navigation.trip.log': { label: 'TRIP', fractionDigits: 0, unit: 'nm' },

  'navigation.speedOverGround': { label: 'SOG', unit: 'knots' },
  'navigation.speedThroughWater': { label: 'BSP', unit: 'knots' }
}
