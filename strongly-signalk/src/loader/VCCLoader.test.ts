import { SKPosition } from "../model";
import { VCCLoader } from "./VCCLoader";

const vccExample = `<?xml version="1.0" encoding="utf-8"?>
<VelocitekControlCenter xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" createdOn="2017-11-11T11:11:11-04:00" xmlns="http://www.velocitekspeed.com/VelocitekControlCenter">
  <CapturedTrack name="xxx" downloadedOn="2017-11-11T11:11:11.1195378-04:00" numberTrkpts="11599">
    <MinLatitude>21.416435241699219</MinLatitude>
    <MaxLatitude>21.4382266998291</MaxLatitude>
    <MinLongitude>-157.78439331054688</MinLongitude>
    <MaxLongitude>-157.76498413085938</MaxLongitude>
    <DeviceInfo ftdiSerialNumber="VT006195" />
    <Trackpoints>
      <Trackpoint dateTime="2017-10-16T15:42:24-04:00" heading="39.16" speed="2.858" latitude="21.416973114013672" longitude="-157.76518249511719" />
      <Trackpoint dateTime="2017-10-16T15:42:26-04:00" heading="39.95" speed="2.954" latitude="21.4169921875" longitude="-157.76515197753906" />
      <Trackpoint dateTime="2017-10-16T15:42:28-04:00" heading="43.36" speed="3.345" latitude="21.417011260986328" longitude="-157.76513671875" />
    </Trackpoints>
    </CapturedTrack>
  </VelocitekControlCenter>`

describe('parsing basic VCC file', () => {
  const delta = VCCLoader.fromString(vccExample)

  it('can read trackpoints', () => {
    expect(delta.updates).toHaveLength(3)
  })

  it('can parse timestamps', () => {
    expect(delta.updates[0].timestamp).toEqual(new Date('2017-10-16T19:42:24Z'))
    expect(delta.updates[1].timestamp).toEqual(new Date('2017-10-16T19:42:26Z'))
    expect(delta.updates[2].timestamp).toEqual(new Date('2017-10-16T19:42:28Z'))
  })

  it('can convert position to SKPosition', () => {
    const positionValues = delta.updates[0].values.filter(v => v.path === 'navigation.position')
    expect(positionValues).toHaveLength(1)
    expect(positionValues[0].value instanceof SKPosition).toBeTruthy()
    expect(positionValues[0].value).toEqual(new SKPosition(21.416973114013672, -157.76518249511719))
  })

  it('can parse heading', () => {
    const headingValues = delta.updates[0].values.filter(v => v.path === 'navigation.headingTrue')
    expect(headingValues).toHaveLength(1)
    expect(headingValues[0].value).toBeCloseTo(39.16 / 360 * 2 * Math.PI)
  })

  it('can parse speed', () => {
    const speedValues = delta.updates[0].values.filter(v => v.path === 'navigation.speedOverGround')
    expect(speedValues).toHaveLength(1)
    expect(speedValues[0].value).toBeCloseTo(2.858 * 1852 / 3600)
  })
})
