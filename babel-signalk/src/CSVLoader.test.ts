import { signalKFromCSV } from "./CSVLoader";

const expeditionCsvData =
`Utc,Bsp,Awa,Aws,Twa,Tws,Twd,Rudder2,Leeway,Set,Drift,Hdg,AirTmp,SeaTmp,Baro,Depth,Heel,Trim,Rudder,Tab,Forestay,Downhaul,MastAng,FrstyLen,MastButt,StbJmpr,PrtJmpr,Rake,Volts,ROT,GpsQual,PDOP,GpsNum,GpsAge,GpsGeoHt,GpsAntHt,GpsPosFx,Lat,Lon,Cog,Sog
38249.70139,0.67,-62,,,,,,,,,317,,,,,,,,,,,,,,,,,,,,,,,,,,37.806633,-122.445967,,
38249.7014,0.92,-63,11.4,-159.9,11.5,249,,25.9,229,51.81,318,,16,,1.8,1.1,,-7,,,,,,,,,,12.75,,,,,,,,,37.806633,-122.445967,145.8,0
38249.70141,1.07,-64,,,,,,,,,319,,,,,,,,,,,,,,,,,,,,,,,,,,37.806633,-122.445967,,
38249.70142,1.23,-65,11.6,-100.9,11.4,247,,5,229,49.9,319,,16,,1.92,1.1,,,,,,,,,,,,12.89,,,,,,,,,37.806633,-122.44595,145.8,0
`

it('skips line with invalid timestamps', async () => {
  const bogusData = `Utc,Bsp,Awa,Aws\n,0.67,0,1`
  const skdelta = await signalKFromCSV(bogusData)
  expect(skdelta.updates).toHaveLength(0)
})

it('can load a CSV from a string', async () => {
  const skdelta = await signalKFromCSV(expeditionCsvData)
  expect(skdelta.updates).toHaveLength(4)
})

it('converts data units to SignalK SI units', async () => {
  const skdelta = await signalKFromCSV(expeditionCsvData)
  const sogValues = skdelta.updates[0].values.filter(x => x.path === 'navigation.speedThroughWater')
  expect(sogValues).toHaveLength(1)
  expect(sogValues[0]).toHaveProperty('value')
  expect(sogValues[0].value).toBeCloseTo(0.3446778)
})

it('does not include SKValues that have no values', async () => {
  const skdelta = await signalKFromCSV(expeditionCsvData)
  const sogValues = skdelta.updates[0].values.filter(x => x.path === 'navigation.speedOverGround')
  expect(sogValues).toHaveLength(0)
})

it('converts Lat/Lon', async () => {
  const skdelta = await signalKFromCSV(expeditionCsvData)
  const positionValues = skdelta.updates[0].values.filter(x => x.path === 'navigation.position')
  expect(positionValues).toHaveLength(1)
  expect(positionValues[0]).toHaveProperty('value.latitude', 37.806633)
  expect(positionValues[0]).toHaveProperty('value.longitude', -122.445967)
})
