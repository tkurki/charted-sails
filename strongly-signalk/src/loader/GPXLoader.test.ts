import { SKDelta, SKPosition } from "../model";
import { GPXLoader } from "./GPXLoader";

const gpxExampleVelocitek = `<gpx version="1.0" creator="Velocitek - http://www.velocitek.com" d1p1:schemaLocation="http://www.topografix.com/GPX/1/0 http://www.topografix.com/GPX/1/0/gpx.xsd" xmlns:d1p1="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.topografix.com/GPX/1/0">
<name>xxx</name>
<time>2017-11-11T11:11:11Z</time>
<bounds minlat="21.4164352416992" minlon="-157.784393310547" maxlat="21.4382266998291" maxlon="-157.764984130859" />
<trk>
  <name>xxx</name>
  <trkseg>
    <trkpt lat="21.4169731140137" lon="-157.765182495117">
      <time>2017-11-11T11:11:24Z</time>
    </trkpt>
    <trkpt lat="21.4169921875" lon="-157.765151977539">
      <time>2017-11-11T11:11:26Z</time>
    </trkpt>
    <trkpt lat="21.4170112609863" lon="-157.76513671875">
      <time>2017-11-11T11:11:28Z</time>
    </trkpt>
  </trkseg>
</trk>
`
const gpxExampleINavX = `<?xml version="1.0" encoding="utf-8"?>
<gpx version="1.1" creator="GPSNavX"
xmlns="http://www.topografix.com/GPX/1/1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">
<trk>
<trkseg>
<trkpt lat="37.860050" lon="-122.480110">
<time>2016-11-13T19:11:52Z</time>
<course>307.3</course>
<speed>0.0</speed>
</trkpt>
<trkpt lat="37.859871" lon="-122.480164">
<time>2016-11-13T19:18:57Z</time>
<course>204.2</course>
<speed>0.6</speed>
</trkpt>
<trkpt lat="37.860008" lon="-122.479660">
<time>2016-11-13T19:20:43Z</time>
<course>64.7</course>
<speed>1.1</speed>
</trkpt>
</trkseg></trk></gpx>`

const gpxMultipleSegments = `<?xml version="1.0" encoding="utf-8"?>
<gpx version="1.1" creator="GPSNavX"
xmlns="http://www.topografix.com/GPX/1/1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">
<trk>
<trkseg>
<trkpt lat="37.860085" lon="-122.480034">
<time>2017-10-15T15:18:05Z</time>
<course>0.0</course>
<speed>0.0</speed>
</trkpt>
<trkpt lat="37.859932" lon="-122.480171">
<time>2017-10-15T15:29:14Z</time>
<course>0.0</course>
<speed>0.1</speed>
</trkpt>
</trkseg>
<trkseg>
<trkpt lat="37.860001" lon="-122.479630">
<time>2017-10-15T15:30:36Z</time>
<course>66.2</course>
<speed>1.5</speed>
</trkpt>
</trkseg>
</trk></gpx>`

const gpxMultipleTracks = `<?xml version="1.0" encoding="utf-8"?>
<gpx version="1.1" creator="GPSNavX"
xmlns="http://www.topografix.com/GPX/1/1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">
<trk>
<trkseg>
<trkpt lat="37.860085" lon="-122.480034">
<time>2017-10-15T15:18:05Z</time>
<course>0.0</course>
<speed>0.0</speed>
</trkpt>
<trkpt lat="37.859932" lon="-122.480171">
<time>2017-10-15T15:29:14Z</time>
<course>0.0</course>
<speed>0.1</speed>
</trkpt>
</trkseg>
</trk>
<trk>
<trkseg>
<trkpt lat="37.860001" lon="-122.479630">
<time>2017-10-15T15:30:36Z</time>
<course>66.2</course>
<speed>1.5</speed>
</trkpt>
</trkseg>
</trk>`

describe('parsing GPX file without SOG/COG', () => {
  let delta:SKDelta

  beforeEach(() => {
    delta = GPXLoader.fromString(gpxExampleVelocitek)
  })
  it('can read trackpoints', () => {
    expect(delta.updates).toHaveLength(3)
  })

  it('can parse timestamps', () => {
    expect(delta.updates[0].timestamp).toEqual(new Date('2017-11-11T11:11:24Z'))
    expect(delta.updates[1].timestamp).toEqual(new Date('2017-11-11T11:11:26Z'))
    expect(delta.updates[2].timestamp).toEqual(new Date('2017-11-11T11:11:28Z'))
  })

  it('can convert position to SKPosition', () => {
    const positionValues = delta.updates[0].values.filter(v => v.path === 'navigation.position')
    expect(positionValues).toHaveLength(1)
    expect(positionValues[0].value instanceof SKPosition).toBeTruthy()
    expect(positionValues[0].value).toEqual(new SKPosition(21.4169731140137, -157.765182495117))
  })

  it('does not generate other path/value', () => {
    const otherValues = delta.updates[0].values.filter(v => v.path !== 'navigation.position')
    expect(otherValues).toHaveLength(0)
  })
})


describe('parsing GPX file with SOG/COG', () => {
  let delta:SKDelta

  beforeEach(() => {
    delta = GPXLoader.fromString(gpxExampleINavX)
  })

  it('can read trackpoints', () => {
    expect(delta.updates).toHaveLength(3)
  })

  it('can parse timestamps', () => {
    expect(delta.updates[0].timestamp).toEqual(new Date('2016-11-13T19:11:52Z'))
    expect(delta.updates[1].timestamp).toEqual(new Date('2016-11-13T19:18:57Z'))
    expect(delta.updates[2].timestamp).toEqual(new Date('2016-11-13T19:20:43Z'))
  })

  it('can convert position to SKPosition', () => {
    const positionValues = delta.updates[0].values.filter(v => v.path === 'navigation.position')
    expect(positionValues).toHaveLength(1)
    expect(positionValues[0].value instanceof SKPosition).toBeTruthy()
    expect(positionValues[0].value).toEqual(new SKPosition(37.860050, -122.480110))
  })

  it('can parse speed', () => {
    const speedValues = delta.updates[2].values.filter(v => v.path === 'navigation.speedOverGround')
    expect(speedValues).toHaveLength(1)
    expect(speedValues[0].value).toBeCloseTo(1.1)
  })

  it('can parse course', () => {
    const cogValues = delta.updates[2].values.filter(v => v.path === 'navigation.courseOverGround')
    expect(cogValues).toHaveLength(1)
    expect(cogValues[0].value).toBeCloseTo(64.7 / 360 * 2 * Math.PI)
  })
})

describe('it can parse one track with multiple segment', () => {
  it('can read trackpoints', () => {
    const delta = GPXLoader.fromString(gpxMultipleSegments)
    expect(delta.updates).toHaveLength(3)
  })
})

describe('it can parse a file with multiple tracks', () => {
  it('can read trackpoints', () => {
    const delta = GPXLoader.fromString(gpxMultipleTracks)
    expect(delta.updates).toHaveLength(3)
  })
})