# Strongly SignalK

A strongly typed SignalK library written in TypeScript. Can be used in
JavaScript and TypeScript projects.

This library is designed for developers writing interactive marine apps and
need to manipulate data in SignalK format.

A strong design decision is that the in-memory representation should be
directly compatible with SignalK via `JSON.serialize()` calls.

Inversely, any valid SignalK file can be parsed and loaded by strongly-signalk.

However, another strong design decision is to not implement all the subtle and less used
attributes of the SignalK specification which means that some signalK files
that are valid may lose some information when they are parsed into
strongly-signalk.

## How to use

### Load files

`SaltedRosetta` provides different methods to load files from their filename (on
disk, in a node context), from a `File` object (browser), from a `Response` object
(node and browser) or from a string.

The format of the file will be automatically detected.

```javascript
import { SaltedRosetta } from strongly-signalk;

let skDeltas = SaltedRosetta.fromFilename('myfile.log')
let myBoatDelta = skDeltas[0]
```

`SaltedRosetta` returns a list of `SKDelta` objects. By convention, the first one
is always the "main" delta (the delta of your boat). If the log includes information
about other boats, there will be additional `SKDelta` objects.

### Analyze files

```javascript
import { BetterDataProvider } from strongly-signalk;

const dataProvider = new BetterDataProvider(myBoatDelta)

const availablePaths = dataProvider.getAvailableValues()

// Return an object { [path:string]: SKValueType }
// Values are interpolated to provide a continuous representation over time.
const values = dataProvider.getValuesAtTime(aDateObject)
console.log(`SOG was: ${ values['navigation.speedOverGround'] }`)
console.log(`Position was: ${ values['navigation.position'].asDMSString() }`)
```

And also:
```javascript
import { SignalKTripAnalyzer } from strongly-signalk;

// Returns a list of positions - the trace included in the delta
SignalKTripAnalyzer.getPath(myBoatDelta)

// Returns the bounds of the trace
SignalKTripAnalyzer.getBounds(myBoatDelta)

// Returns time bounds of data in a delta object
SignalKTripAnalyzer.getStartTime(myBoatDelta)
SignalKTripAnalyzer.getEndTime(myBoatDelta)
```

### Command Line Interface

Convert a supported file to SignalK data
```sh
$ node dist/cli/CLI.js some-supported-file.log
{
  "context": "vessels.self",
  "updates": [
    {
      "timestamp": "2018-07-10T08:00:00.012Z",
      "source": {
        "label": "NMEA2000",
        "pgn": 130306,
        "src": "105",
        "type": "NMEA2000"
...
```

Show a summary of a file:
 - List of included SignalK path/values
 - Bounds
 - Time bounds
 - Simplified path

```sh
$  node dist/cli/CLI.js --summary some-supported-file.log
Context: vessels.self - 1846570 updates and 2533140 values
Included SignalK paths: electrical.batteries.dc3.voltage,electrical.batteries.engine.voltage,electrical.batteries.house.voltage,electrical.batteries.kbox-supply.voltage,environment.depth.belowTransducer,environment.inside.engineRoom.temperature,environment.outside.pressure,environment.water.temperature,environment.wind.angleApparent,environment.wind.speedApparent,navigation.attitude,navigation.courseGreatCircle.bearingTrackTrue,navigation.courseGreatCircle.nextPoint.bearingTrue,navigation.courseGreatCircle.nextPoint.distance,navigation.courseGreatCircle.nextPoint.position,navigation.courseGreatCircle.nextPoint.timeToGo,navigation.courseGreatCircle.nextPoint.velocityMadeGood,navigation.courseOverGroundMagnetic,navigation.courseOverGroundTrue,navigation.courseRhumbline.nextPoint.position,navigation.currentRoute.name,navigation.currentRoute.waypoints,navigation.datetime,navigation.gnss.antennaAltitude,navigation.gnss.differentialAge,navigation.gnss.differentialReference,navigation.gnss.geoidalSeparation,navigation.gnss.horizontalDilution,navigation.gnss.integrity,navigation.gnss.methodQuality,navigation.gnss.positionDilution,navigation.gnss.satellites,navigation.gnss.type,navigation.headingMagnetic,navigation.log,navigation.magneticVariation,navigation.magneticVariationAgeOfService,navigation.position,navigation.rateOfTurn,navigation.speedOverGround,navigation.speedThroughWater,navigation.speedThroughWaterReferenceType,navigation.trip.log,notifications.instrument.NoFix,steering.rudderAngle
Bounds: -117.37541216666668,32.83565016666667 -117.20893,32.6481391
Start: 2018-05-11T02:02:42.625Z
End: 2018-05-11T07:10:04.703Z
Path: [[-117.37541216666668,32.83565016666667],[-117.2915456,32.6891026],[-117.2450925,32.6513145],[-117.2258069,32.6529853],[-117.2298686,32.7026236],[-117.2089823,32.7264535]]
```

## License

MIT