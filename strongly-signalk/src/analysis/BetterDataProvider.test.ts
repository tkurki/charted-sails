import { SKDelta, SKPosition } from '../model';
import { BetterDataProvider } from "./BetterDataProvider";

describe('getAvailableValues()', () => {
  it('with one update and one path', () => {
    const dataProvider = new BetterDataProvider(SKDelta.fromJSON(`
      {
        "context": "vessels.urn:mrn:imo:mmsi:234567890",
        "updates": [
          {
            "timestamp": "2010-01-07T07:18:44Z", "source": { "label": "" },
            "values": [ {
              "path": "navigation.position", "value": { "longitude": -122, "latitude": 42}
            } ]
          }
        ]
      }
      `))
    expect(dataProvider.getAvailableValues()).toMatchObject(['navigation.position'])
  })

  it('with two updates and two path', () => {
    const dataProvider = new BetterDataProvider(SKDelta.fromJSON(`
      {
        "context": "vessels.urn:mrn:imo:mmsi:234567890",
        "updates": [
          {
            "timestamp": "2010-01-07T07:18:44Z", "source": { "label": "" },
            "values": [
              { "path": "navigation.position", "value": { "longitude": -122, "latitude": 42} },
              { "path": "navigation.courseOverGround", "value": 2 }
            ]
          },
          {
            "timestamp": "2010-01-07T07:18:45Z", "source": { "label": "" },
            "values": [
              { "path": "navigation.speedThroughWater", "value": 1 },
              { "path": "navigation.speedOverGround", "value": 2 }
            ]
          }
        ]
      }
      `))
    const availableValues = dataProvider.getAvailableValues()
    const expectedValues = ['navigation.position', 'navigation.courseOverGround', 'navigation.speedThroughWater', 'navigation.speedOverGround']
    expect(availableValues).toHaveLength(4)
    expect(availableValues.sort()).toMatchObject(expectedValues.sort())
  })
})

describe('getValueAtTime()', () => {
  it('should return null when value does not exist in dataset', () => {
    const dataProvider = new BetterDataProvider(SKDelta.fromJSON(`
    {
      "context": "vessels.urn:mrn:imo:mmsi:234567890",
      "updates": [
        {
          "timestamp": "2010-01-07T07:18:44Z", "source": { "label": "" },
          "values": [
            { "path": "navigation.courseOverGround", "value": 2 }
          ]
        }
      ]
    }`))
    expect(dataProvider.getValueAtTime("navigation.speedOverGround", new Date("2010-01-07T07:18:44Z")))
      .toBeNull()
  })

  it('should return null when value has not been defined yet at time t', () => {
    const dataProvider = new BetterDataProvider(SKDelta.fromJSON(`
    {
      "context": "vessels.urn:mrn:imo:mmsi:234567890",
      "updates": [
        {
          "timestamp": "2010-01-07T07:18:44Z", "source": { "label": "" },
          "values": [
            { "path": "navigation.courseOverGround", "value": 2 }
          ]
        }
      ]
    }`))
    expect(dataProvider.getValueAtTime("navigation.courseOverGround", new Date("2010-01-07T07:18:43Z")))
      .toBeNull()
  })

  it('should return the value when the value is defined at time t', () => {
    const dataProvider = new BetterDataProvider(SKDelta.fromJSON(`
    {
      "context": "vessels.urn:mrn:imo:mmsi:234567890",
      "updates": [
        {
          "timestamp": "2010-01-07T07:18:44Z", "source": { "label": "" },
          "values": [
            { "path": "navigation.courseOverGround", "value": 2 }
          ]
        }
      ]
    }`))
    expect(dataProvider.getValueAtTime("navigation.courseOverGround", new Date("2010-01-07T07:18:44Z")))
      .toEqual(2)
  })

  it('should return an interpolation of the value when t is between two known values and the value is continuous', () => {
    const dataProvider = new BetterDataProvider(SKDelta.fromJSON(`
    {
      "context": "vessels.urn:mrn:imo:mmsi:234567890",
      "updates": [
        {
          "timestamp": "2010-01-07T07:18:44Z", "source": { "label": "" },
          "values": [
            { "path": "navigation.speedOverGround", "value": 2 }
          ]
        },
        {
          "timestamp": "2010-01-07T07:18:46Z", "source": { "label": "" },
          "values": [
            { "path": "navigation.speedOverGround", "value": 4 }
          ]
        },
        {
          "timestamp": "2010-01-07T07:18:49Z", "source": { "label": "" },
          "values": [
            { "path": "navigation.speedOverGround", "value": 8 }
          ]
        }
      ]
    }`))
    expect(dataProvider.getValueAtTime("navigation.speedOverGround", new Date("2010-01-07T07:18:44Z")))
      .toEqual(2)
    expect(dataProvider.getValueAtTime("navigation.speedOverGround", new Date("2010-01-07T07:18:45Z")))
      .toEqual(3)
    expect(dataProvider.getValueAtTime("navigation.speedOverGround", new Date("2010-01-07T07:18:46Z")))
      .toEqual(4)
    expect(dataProvider.getValueAtTime("navigation.speedOverGround", new Date("2010-01-07T07:18:47Z")))
      .toBeCloseTo(4+4/3)
    expect(dataProvider.getValueAtTime("navigation.speedOverGround", new Date("2010-01-07T07:18:48Z")))
      .toBeCloseTo(4+2*4/3)
    expect(dataProvider.getValueAtTime("navigation.speedOverGround", new Date("2010-01-07T07:18:49Z")))
      .toEqual(8)
    expect(dataProvider.getValueAtTime("navigation.speedOverGround", new Date("2010-01-07T07:18:50Z")))
      .toEqual(8)
  })

  it('should return the last known value of the value when t is between two known values and the value is not continuous', () => {
    const dataProvider = new BetterDataProvider(SKDelta.fromJSON(`
    {
      "context": "vessels.urn:mrn:imo:mmsi:234567890",
      "updates": [
        {
          "timestamp": "2010-01-07T07:18:44Z", "source": { "label": "" },
          "values": [
            { "path": "navigation.destination.waypoint", "value": "ABCD" }
          ]
        },
        {
          "timestamp": "2010-01-07T07:18:46Z", "source": { "label": "" },
          "values": [
            { "path": "navigation.destination.waypoint", "value": "ABCD" }
          ]
        },
        {
          "timestamp": "2010-01-07T07:18:49Z", "source": { "label": "" },
          "values": [
            { "path": "navigation.destination.waypoint", "value": "DEFG" }
          ]
        }
      ]
    }`))
    expect(dataProvider.getValueAtTime("navigation.destination.waypoint", new Date("2010-01-07T07:18:43Z")))
      .toBeNull()
    expect(dataProvider.getValueAtTime("navigation.destination.waypoint", new Date("2010-01-07T07:18:44Z")))
      .toEqual("ABCD")
    expect(dataProvider.getValueAtTime("navigation.destination.waypoint", new Date("2010-01-07T07:18:45Z")))
      .toEqual("ABCD")
    expect(dataProvider.getValueAtTime("navigation.destination.waypoint", new Date("2010-01-07T07:18:46Z")))
      .toEqual("ABCD")
    expect(dataProvider.getValueAtTime("navigation.destination.waypoint", new Date("2010-01-07T07:18:47Z")))
      .toEqual("ABCD")
    expect(dataProvider.getValueAtTime("navigation.destination.waypoint", new Date("2010-01-07T07:18:49Z")))
      .toEqual("DEFG")
    expect(dataProvider.getValueAtTime("navigation.destination.waypoint", new Date("2010-01-07T07:18:50Z")))
      .toEqual("DEFG")
  })

  it('should be able to find the first time with all paths set', () => {
    const dataProvider = new BetterDataProvider(SKDelta.fromJSON(`
    {
      "context": "vessels.urn:mrn:imo:mmsi:234567890",
      "updates": [
        {
          "timestamp": "2010-01-07T07:18:44Z", "source": { "label": "" },
          "values": [
            { "path": "navigation.speedOverGround", "value": 2 }
          ]
        },
        {
          "timestamp": "2010-01-07T07:18:46Z", "source": { "label": "" },
          "values": [
            { "path": "navigation.speedOverGround", "value": 4 },
            { "path": "navigation.courseOverGround", "value": 4 }
          ]
        },
        {
          "timestamp": "2010-01-07T07:18:49Z", "source": { "label": "" },
          "values": [
            { "path": "navigation.speedOverGround", "value": 8 }
          ]
        }
      ]
    }`))
    expect(dataProvider.getSmallestTimestampWithAllPathsDefined()).toEqual(new Date('2010-01-07T07:18:46Z'))
  })

  // For now we just return the last known position.
  // TODO: Interpolate positions.
  it('does not interpolate positions (yet)', () => {
    const dataProvider = new BetterDataProvider(SKDelta.fromJSON(`
    {
      "context": "vessels.urn:mrn:imo:mmsi:234567890",
      "updates": [
        {
          "timestamp": "2010-01-07T07:18:44Z", "source": { "label": "" },
          "values": [
            { "path": "navigation.position", "value": { "longitude": -122, "latitude": 42} }
          ]
        },
        {
          "timestamp": "2010-01-07T07:18:46Z", "source": { "label": "" },
          "values": [
            { "path": "navigation.position", "value": { "longitude": -122, "latitude": 43} }
          ]
        },
        {
          "timestamp": "2010-01-07T07:18:49Z", "source": { "label": "" },
          "values": [
            { "path": "navigation.position", "value": { "longitude": -119, "latitude": 43} }
          ]
        }
      ]
    }`))
    expect(dataProvider.getValueAtTime("navigation.position", new Date("2010-01-07T07:18:44Z")))
      .toEqual(new SKPosition(42, -122))
    expect(dataProvider.getValueAtTime("navigation.position", new Date("2010-01-07T07:18:45Z")))
      .toEqual(new SKPosition(42, -122))
    expect(dataProvider.getValueAtTime("navigation.position", new Date("2010-01-07T07:18:46Z")))
      .toEqual(new SKPosition(43, -122))
    expect(dataProvider.getValueAtTime("navigation.position", new Date("2010-01-07T07:18:47Z")))
      .toEqual(new SKPosition(43, -122))
    expect(dataProvider.getValueAtTime("navigation.position", new Date("2010-01-07T07:18:48Z")))
      .toEqual(new SKPosition(43, -122))
    expect(dataProvider.getValueAtTime("navigation.position", new Date("2010-01-07T07:18:49Z")))
      .toEqual(new SKPosition(43, -119))
    expect(dataProvider.getValueAtTime("navigation.position", new Date("2010-01-07T07:18:50Z")))
      .toEqual(new SKPosition(43, -119))
  })

  /*
  it('should interpolate times', () => {
    expect(false).toBeTruthy()
  })

  it('should interpolate angles properly', () => {
    expect(false).toBeTruthy()
  })

function aggregateByAveragingAngles(values : number[]) : number {
  // We take the (x,y) cartesian coordinates of each angle and average them.
  // See https://stackoverflow.com/questions/491738/how-do-you-calculate-the-average-of-a-set-of-circular-data
  const x = values.reduce((sum, a) => sum + Math.cos(a / 360 * 2 * Math.PI), 0)
  const y = values.reduce((sum, a) => sum + Math.sin(a / 360 * 2 * Math.PI), 0)

  return Math.atan2(y, x) * 360 / (2*Math.PI)
}
*/
})

/*
 Re-hydrating is important. It's what we use to do the maths in the WebWorker
 and pass the result back to the browser.
 */
describe('rehydrating BetterDataProvider', () => {
  it('properly re-hydrates SKPosition', () => {
    const dataProvider = new BetterDataProvider(SKDelta.fromJSON(`
    {
      "context": "vessels.urn:mrn:imo:mmsi:234567890",
      "updates": [
        {
          "timestamp": "2010-01-07T07:18:44Z", "source": { "label": "" },
          "values": [
            { "path": "navigation.position", "value": { "longitude": -122, "latitude": 42} }
          ]
        }
      ]
    }`))
    let rehydratedProvider = BetterDataProvider.fromJSON(JSON.parse(JSON.stringify(dataProvider)))
    expect(rehydratedProvider.getValueAtTime("navigation.position", new Date("2010-01-07T07:18:45Z")) instanceof SKPosition)
      .toBeTruthy()
  })
})