import { SKDelta } from "../model";
import { HistoryBuilder } from "./HistoryBuilder";

const signalkdelta = `
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
        }
      ]
    }
  ]
}
`

describe('Building SKHistory from delta', () => {
  it('refuses to build an empty history', () => {
    const hb = new HistoryBuilder()
    expect(() => hb.retrieve()).toThrowError('Cannot build empty history')
    hb.addDelta(new SKDelta([], 'vessels.urn:mrn:ohmonbateau'))
    expect(() => hb.retrieve()).toThrowError('Cannot build empty history')
  })

  it('can build a very simple history', () => {
    const hb = new HistoryBuilder()
    hb.addDelta(SKDelta.fromJSON(signalkdelta))
    const history = hb.retrieve()

    expect(history.objects).toHaveLength(1)
    expect(history.startDate).toEqual(new Date("2010-01-07T07:18:44Z"))
    expect(history.endDate).toEqual(new Date("2010-01-07T07:18:44Z"))
    expect(history.objects[0].context).toEqual("vessels.urn:mrn:imo:mmsi:234567890")
    expect(history.objects[0].timestamps).toEqual([new Date("2010-01-07T07:18:44Z")])

    expect(history.objects[0].properties).toHaveLength(2)

    expect(history.objects[0].properties[0].path).toBe('navigation.speedOverGround')
    expect(history.objects[0].properties[0].values).toHaveLength(1)
    expect(history.objects[0].properties[0].values).toEqual([16.341667])

    expect(history.objects[0].properties[1].path).toBe('navigation.courseOverGround')
    expect(history.objects[0].properties[1].values).toHaveLength(1)
    expect(history.objects[0].properties[1].values).toEqual([3.1])
  })

  it('can generate history for multiple vessels', () => {})
  it('can combine two deltas that refer to the same vessel', () => {})
  it('calculates startDate and endDate over different objects', () => {})

})