import { SKDelta } from "@aldis/strongly-signalk";
import InteractiveTrip from "./InteractiveTrip";
import TripDataProvider from "./TripDataProvider";

const mockDataProvider : TripDataProvider = {
  getAvailableValues: () => [],
  getValueAtTime: () => null,
  getValuesAtTime: () => ({})
}

describe('constructor', () => {
  it('refuses to instantiate an interactive trip without at least one update', () => {
    const delta = SKDelta.fromJSON(`{ "updates": [] }`)
    expect (() => new InteractiveTrip(delta, mockDataProvider) ).toThrowError("Trip should have *at least* one update!")
  })
})
describe('Extracting segments', () => {

  it('handles trip with one position', () => {
    const trip = new InteractiveTrip(SKDelta.fromJSON(`
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
    `), mockDataProvider)
    expect(trip.getPathSegments()).toMatchObject([
      {
        startPosition:  { "longitude": -122, "latitude": 42},
        endPosition: { "longitude": -122, "latitude": 42},
        startTime: new Date("2010-01-07T07:18:44Z"),
        endTime: new Date("2010-01-07T07:18:44Z")
      }
    ])
  })

  it('handles trip with many positions', () => {
    const trip = new InteractiveTrip(SKDelta.fromJSON(`
    {
      "context": "vessels.urn:mrn:imo:mmsi:234567890",
      "updates": [
        {
          "timestamp": "2010-01-07T07:18:44Z", "source": { "label": "" },
          "values": [ {
            "path": "navigation.position", "value": { "longitude": -122, "latitude": 42}
          } ]
        },
        {
          "timestamp": "2010-01-07T07:18:45Z", "source": { "label": "" },
          "values": [ {
            "path": "navigation.position", "value": { "longitude": -122, "latitude": 43}
          } ]
        },
        {
          "timestamp": "2010-01-07T07:18:46Z", "source": { "label": "" },
          "values": [ {
            "path": "navigation.position", "value": { "longitude": -122, "latitude": 44}
          } ]
        },
        {
          "timestamp": "2010-01-07T07:18:47Z", "source": { "label": "" },
          "values": [ {
            "path": "navigation.position", "value": { "longitude": -121, "latitude": 42}
          } ]
        }
      ]
    }
    `), mockDataProvider)
    expect(trip.getPathSegments()).toMatchObject([
      {
        startPosition:  { "longitude": -122, "latitude": 42},
        endPosition: { "longitude": -122, "latitude": 43},
        startTime: new Date("2010-01-07T07:18:44Z"),
        endTime: new Date("2010-01-07T07:18:45Z")
      },
      {
        startPosition:  { "longitude": -122, "latitude": 43},
        endPosition: { "longitude": -122, "latitude": 44},
        startTime: new Date("2010-01-07T07:18:45Z"),
        endTime: new Date("2010-01-07T07:18:46Z")
      },
      {
        startPosition:  { "longitude": -122, "latitude": 44},
        endPosition: { "longitude": -121, "latitude": 42},
        startTime: new Date("2010-01-07T07:18:46Z"),
        endTime: new Date("2010-01-07T07:18:47Z")
      }
    ])
  })
})