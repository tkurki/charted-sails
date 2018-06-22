import { SKValue, SKPosition} from '@aldis/strongly-signalk'
import * as utils from '@signalk/nmea0183-utilities'
import { CSVConversion, ColumnConverter } from './CSVConversion';
import { SimpleCSVColumnConversion, SimpleCSVColumnConverter } from './SimpleCSVColumnConverter';

const excelStartOfTime = new Date("1900-01-01T00:00:00Z").getTime()

export class ExpeditionFormatConversion implements CSVConversion {
  public columns: ColumnConverter[]

  public constructor() {
    this.columns = this._otherConversions
    this.columns = this.columns.concat(this._ratioConversion.map(x => new SimpleCSVColumnConverter(x)))
  }

  public timeConverter(csvLine: any) {
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
  }

  private _ratioConversion : SimpleCSVColumnConversion[] = [
    { columnName: 'Bsp', path: 'navigation.speedThroughWater', ratio: utils.transform(1, 'knots', 'ms')},
    { columnName: 'Sog', path: 'navigation.speedOverGround', ratio: utils.transform(1, 'knots', 'ms')},
    { columnName: 'Cog', path: 'navigation.courseOverGround', ratio: utils.transform(1, 'deg', 'rad')},
    { columnName: 'Aws', path: 'environment.wind.speedApparent', ratio: utils.transform(1, 'knots', 'ms')},
    { columnName: 'Awa', path: 'environment.wind.angleApparent', ratio: utils.transform(1, 'deg', 'rad')},
    { columnName: 'Tws', path: 'environment.wind.speedOverGround', ratio: utils.transform(1, 'knots', 'ms')},
    { columnName: 'Twa', path: 'environment.wind.angleTrueGround', ratio: utils.transform(1, 'deg', 'rad')},
    { columnName: 'Twd', path: 'environment.wind.directionTrue', ratio: utils.transform(1, 'deg', 'rad')},
    // FIXME: True or magnetic heading??
    { columnName: 'Hdg', path: 'navigation.headingTrue', ratio: utils.transform(1, 'deg', 'rad')},
    // FIXME: In meter? BelowSurface?
    { columnName: 'Depth', path: 'environment.depth.belowSurface', ratio: 1}
  ]

    //Rudder2,Leeway,Set,Drift,AirTmp,SeaTmp,Baro,Depth,Heel,Trim,Rudder,Tab,Forestay,Downhaul,MastAng,FrstyLen,MastButt,StbJmpr,PrtJmpr,Rake,Volts,ROT,GpsQual,PDOP,GpsNum,GpsAge,GpsGeoHt,GpsAntHt,GpsPosFx,Cog

  private _otherConversions : ColumnConverter[] = [
    {
      requiredColumns: ['Lat', 'Lon'],
      convert: (csvLine) : SKValue => (
        {
          'path': "navigation.position",
          'value': SKPosition.fromJSON({
            'latitude': Number(csvLine['Lat']),
            'longitude': Number(csvLine['Lon'])
          })
        }
      )
    }
  ]
}
