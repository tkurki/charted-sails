import { SKDelta, SKPosition, SKSource, SKUpdate, SKValue } from "../model";
import { SKLogLoader } from "./SKLogLoader";

it('can parse a line in JSON format', () => {
  const delta = SKLogLoader.fromLine(`1526237642929;I;{"context":"vessels.self","updates":[{"source":{"label":"KBox.Barometer"},"values":[{"path":"environment.outside.pressure","value":101892.4}]}]}`)

  expect(delta).not.toBeNull()
  expect(delta).toMatchObject(
    new SKDelta([ new SKUpdate(new Date(1526237642929), [ new SKValue('environment.outside.pressure', 101892.4)], new SKSource('KBox.Barometer')) ], 'vessels.self')
  )
})

it('can parse \'derived-data\' in JSON format', () => {
  const delta = SKLogLoader.fromLine(`1538139600485;derived-data;{"context":"vessels.urn:mrn:signalk:uuid:10ce5c19-541d-44ea-8810-094d1bafbe3c","updates":[{"timestamp":"2018-09-28T13:00:00.485Z","values":[{"path":"environment.wind.directionMagnetic","value":1.1919}]}]}`)

  expect(delta).not.toBeNull()

  const expected = new SKDelta([ new SKUpdate(new Date(1538139600485), [ new SKValue('environment.wind.directionMagnetic', 1.1919)], new SKSource('xx')) ], 'vessels.urn:mrn:signalk:uuid:10ce5c19-541d-44ea-8810-094d1bafbe3c')
  delete(expected.updates[0].source)

  expect(delta).toMatchObject(expected)
})

it('can parse a line in NMEA0183 format', () => {
  const delta = SKLogLoader.fromLine(`1367256704816;N;$GPRMC,185404.000,A,3243.5881,N,11712.5391,W,0.20,0.00,130518,,,A*74`)
  expect(delta).not.toBeNull()
  /**
   * {"updates":[{"source":{"sentence":"RMC","talker":"GP","type":"NMEA0183"},
   *  "timestamp":"2018-05-13T18:54:04.000Z",
   *  "values":[
   *    {"path":"navigation.position",
   *    "value":{"longitude":-117.208985,"latitude":32.72646833333334}},
   * {"path":"navigation.courseOverGroundTrue","value":0},
   * {"path":"navigation.speedOverGround","value":0.10288891495408069},
   * {"path":"navigation.magneticVariation","value":0},
   * {"path":"navigation.magneticVariationAgeOfService","value":1526237644},
   * {"path":"navigation.datetime","value":"2018-05-13T18:54:04.000Z"}]}]}
   */
  expect(delta).toMatchObject(
    new SKDelta([
      // The timestamp of the data - and the timestamp in the data are different on purpose
      new SKUpdate(new Date(1367256704816),
      [
        new SKValue('navigation.position', new SKPosition(32.72646833333334, -117.208985)),
        new SKValue('navigation.courseOverGroundTrue', 0),
        new SKValue('navigation.speedOverGround', 0.10288891495408069),
        new SKValue('navigation.magneticVariation', 0),
        new SKValue('navigation.magneticVariationAgeOfService', 1526237644),
        new SKValue('navigation.datetime', new Date('2018-05-13T18:54:04.000Z'))
      ], new SKSource('nmea')) ], 'vessels.self')
  )
})

it('can parse a line in PCDIN format', () => {
  const delta = SKLogLoader.fromLine(`1526239612483;P;$PCDIN,01F802,5AF8917C,7F,00FD65300000FFFF*28`)
  expect(delta).not.toBeNull()
  /*
{"updates":[{"source":{"label":"","type":"NMEA2000","pgn":129026,"src":"127"},
  "timestamp":"1970-01-18T15:57:19.612Z","values":[
      {"path":"navigation.speedOverGround","value":0},{"path":"navigation.courseOverGroundMagnetic","value":1.2389}]}]}
  */
  expect(delta).toMatchObject(
    new SKDelta([
      new SKUpdate(new Date(1526239612483),
        [
          new SKValue('navigation.speedOverGround', 0),
          new SKValue('navigation.courseOverGroundMagnetic', 1.2389)
        ],
        new SKSource('NMEA2000', { pgn: 129026, src: "127", type: "NMEA2000"})) ],
      'vessels.self')
  )
})

it('can parse a line in Actisense format', () => {
  const delta = SKLogLoader.fromLine(`1531209600910;A;2018-07-10T08:00:00.909Z,2,130306,105,255,8,00,f4,02,bf,03,fa,ff,ff`)
  expect(delta).not.toBeNull()
  /*
{"updates":[{"source":{"label":"","type":"NMEA2000","pgn":129026,"src":"127"},
  "timestamp":"1970-01-18T15:57:19.612Z","values":[
      {"path":"navigation.speedOverGround","value":0},{"path":"navigation.courseOverGroundMagnetic","value":1.2389}]}]}
  */
  expect(delta).toMatchObject(
    new SKDelta([
      new SKUpdate(new Date(1531209600910),
      [
        new SKValue('environment.wind.speedApparent', 7.56),
        new SKValue('environment.wind.angleApparent', 0.0959)
      ],
      new SKSource('NMEA2000', { pgn: 130306, src: "105", type: "NMEA2000"})) ],
    'vessels.self')
  )
})

it('generates an appropriate context for NMEA0183 AIS sentences', () => {
  const delta = SKLogLoader.fromLine(`1526239612483;N;!AIVDM,1,1,,A,ENk\`tRI16h@@@@@@@@@@@@@@@@@=@Mg<9q;jP00003vP000,2*63`)

  // Should ignore AIS for now
  expect(delta).toBeNull()
/*
  expect(delta).not.toBeNull()

// {"context":"atons.urn:mrn:imo:mmsi:993672329",
// "updates":[
//   {"source":{"sentence":"VDM","talker":"AI","type":"NMEA0183"},
//   "timestamp":"2018-07-30T16:58:15.401Z",
//   "values":[
//       {"path":"","value":{"mmsi":"993672329"}},
//       {"path":"","value":{"name":"BM"}},
//       {"path":"navigation.position","value":{"longitude":-76.69256666666666,"latitude":34.5803}},
//       {"path":"atonType","value":{"id":18,"name":"Beacon, Safe Water"}}]}]}
  expect(delta).toMatchObject(
    new SKDelta([
      new SKUpdate(
        new SKSource('nmea', { talker: "AI", sentence: "VDM", type: "NMEA0183"}),
        new Date(1526239612483),
        [
          new SKValue(''),
          new SKValue(''),
          new SKValue('navigation.position', new SKPosition(34.5803, -76.69256666666666)),
          new SKValue('navigation.courseOverGroundMagnetic', 1.2389),
          new SKValue("atonType", {"id":18,"name":"Beacon, Safe Water"})
        ])
      ],
      'atons.urn:mrn:imo:mmsi:993672329')
  )*/
})
/*
it('generates an appropriate context for NMEA2000 AIS sentences', () => {
  // TODO: create an example
  const delta = SKLogLoader.fromLine(`1526239612483;P;$PCDIN*xx`)
  expect(delta).not.toBeNull()
})
*/