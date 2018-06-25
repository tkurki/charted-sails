import { SKDelta } from "@aldis/strongly-signalk";
import { SignalKTripAnalyzer } from "./SignalKTripAnalyzer";

it(`returns null when there is no data`, () => {
  const skdelta = SKDelta.fromJSON('{"updates":[]}')

  expect(SignalKTripAnalyzer.getStartTime(skdelta)).toBeNull()
  expect(SignalKTripAnalyzer.getEndTime(skdelta)).toBeNull()
  expect(SignalKTripAnalyzer.getBounds(skdelta)).toBeNull()
})

it('can extract info from super small delta', () => {
  const skdelta = SKDelta.fromJSON(`
  {
    "context": "vessels.urn:mrn:imo:mmsi:234567890",
    "updates": [
      {
        "source": {
          "label": "N2000-01",
          "type": "NMEA2000",
          "src": "017",
          "pgn": 127488
        },
        "timestamp": "2010-01-07T07:18:44Z",
        "values": [
          {
            "path": "navigation.speedOverGround",
            "value": 16.341667
          },
          {
            "path": "navigation.courseOverGround",
            "value": 3.1
          },
          {
            "path": "navigation.position",
            "value": { "longitude": -122, "latitude": 42}
          }
        ]
      }
    ]
  }
  `)
  expect(SignalKTripAnalyzer.getStartTime(skdelta)).toEqual(new Date('2010-01-07T07:18:44Z'))
  expect(SignalKTripAnalyzer.getEndTime(skdelta)).toEqual(new Date('2010-01-07T07:18:44Z'))
  expect(SignalKTripAnalyzer.getPath(skdelta)).toMatchObject([
    {'latitude': 42, 'longitude': -122}
  ])
  expect(SignalKTripAnalyzer.getBounds(skdelta)).toMatchObject([
    {'latitude': 42, 'longitude': -122},
    {'latitude': 42, 'longitude': -122}
  ])
})

it('can extract bounds from trip with multiple points', () => {
  const skdelta = SKDelta.fromJSON(`
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
        "timestamp": "2010-01-07T07:18:44Z", "source": { "label": "" },
        "values": [ {
          "path": "navigation.position", "value": { "longitude": -122, "latitude": 43}
        } ]
      },
      {
        "timestamp": "2010-01-07T07:18:44Z", "source": { "label": "" },
        "values": [ {
          "path": "navigation.position", "value": { "longitude": -122, "latitude": 44}
        } ]
      },
      {
        "timestamp": "2010-01-07T07:18:44Z", "source": { "label": "" },
        "values": [ {
          "path": "navigation.position", "value": { "longitude": -121, "latitude": 42}
        } ]
      }
    ]
  }
  `)
  expect(SignalKTripAnalyzer.getBounds(skdelta)).toMatchObject([
    {'latitude': 44, 'longitude': -122},
    {'latitude': 42, 'longitude': -121}
  ])
})

