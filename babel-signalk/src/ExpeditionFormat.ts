import { CSVConversion } from "./CSVLoader"
import { SKValue} from '@aldis/strongly-signalk'
import * as utils from '@signalk/nmea0183-utilities'

const excelStartOfTime = new Date("1900-01-01T00:00:00Z").getTime()

export const ExpeditionFormatConversion : CSVConversion = {
  timeConverter: (csvLine) => {
    // Time in Expedition log file is provided in Excel format - Fractional
    // number of days since Jan 1st 1970 00:00 - And they are always in UTC.
    const excelTime = Number(csvLine['Utc'])

    if (isNaN(excelTime) || excelTime == 0) {
      return null
    }
    const date = new Date(excelStartOfTime + Number(excelTime) * 24 * 3600 * 1000)
    if (isNaN(date.getTime())) {
      return null
    }
    return date
  },
  columns: [
    { requiredColumn: 'Bsp', path: 'navigation.speedThroughWater', ratio: utils.transform(1, 'knots', 'ms')},
    { requiredColumn: 'Sog', path: 'navigation.speedOverGround', ratio: utils.transform(1, 'knots', 'ms')},
    { requiredColumn: 'Cog', path: 'navigation.courseOverGround', ratio: utils.transform(1, 'deg', 'rad')},
    { requiredColumn: 'Aws', path: 'environment.wind.speedApparent', ratio: utils.transform(1, 'knots', 'ms')},
    { requiredColumn: 'Awa', path: 'environment.wind.angleApparent', ratio: utils.transform(1, 'deg', 'rad')},
    { requiredColumn: 'Tws', path: 'environment.wind.speedOverGround', ratio: utils.transform(1, 'knots', 'ms')},
    { requiredColumn: 'Twa', path: 'environment.wind.angleTrueGround', ratio: utils.transform(1, 'deg', 'rad')},
    { requiredColumn: 'Twd', path: 'environment.wind.directionTrue', ratio: utils.transform(1, 'deg', 'rad')},
    // FIXME: True or magnetic heading??
    { requiredColumn: 'Hdg', path: 'navigation.headingTrue', ratio: utils.transform(1, 'deg', 'rad')},
    // FIXME: In meter? BelowSurface?
    { requiredColumn: 'Depth', path: 'environment.depth.belowSurface', ratio: 1},

    //Rudder2,Leeway,Set,Drift,AirTmp,SeaTmp,Baro,Depth,Heel,Trim,Rudder,Tab,Forestay,Downhaul,MastAng,FrstyLen,MastButt,StbJmpr,PrtJmpr,Rake,Volts,ROT,GpsQual,PDOP,GpsNum,GpsAge,GpsGeoHt,GpsAntHt,GpsPosFx,Cog
    {
      requiredColumns: ['Lat', 'Lon'],
      convert: (csvLine) : SKValue => (
        {
          'path': "navigation.position",
          'value': { 'latitude': Number(csvLine['Lat']), 'longitude': Number(csvLine['Lon']) }
        }
      )
    }

  ]
}
