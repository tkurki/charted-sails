import {
  aggregateTimedDataValues, convertExpeditionLineToTimedData, convertTimedDataToSegments,
  TimedData,
} from './Trip'

describe('Conversion of Expedition lines to TimedData', () => {
  it('Converts time format', () => {
    const expedition = {'Utc': 38249.70139}
    const timedData = convertExpeditionLineToTimedData(expedition)

    expect(timedData.time.getTime()).toEqual(new Date('2004-09-21T16:50:00.096Z').getTime())
  })

  it('Converts coordinates', () => {
    const expedition = {'Utc': 38249.70139, 'Lat': 42.0, 'Lon': 117.1}
    const timedData = convertExpeditionLineToTimedData(expedition)

    expect('coordinates' in timedData).toBeTruthy()
    expect(timedData.coordinates).toHaveProperty("length", 2)
    expect(timedData.coordinates).toEqual([117.1, 42.0])
  })

  it('Converts values to their SignalK representation', () => {
    // TODO: Many more tests to add here

    const expedition = {'Utc': 38249.70139, 'Lat': 42.0, 'Lon': 117.1, 'Sog': 42, 'Bsp': 4.0}
    const timedData = convertExpeditionLineToTimedData(expedition)

    expect(timedData.values).toHaveProperty('Sog', 42)
    expect(timedData.values).toHaveProperty('Bsp', 4.0)
    expect(timedData.values).not.toHaveProperty('Utc')
    expect(timedData.values).not.toHaveProperty('Lat')
    expect(timedData.values).not.toHaveProperty('Lon')
  })
})

describe('Transforming time data into segments', () => {
  const someTimePlusX = (x : number) => new Date(1528489854697 + x*1000)
  const sampleTimedData : TimedData[] = [
    {
      coordinates: [ 42.0, 100.0 ],
      time: someTimePlusX(0),
      values: {
        'awa': 179,
        'bsp': 3,
        'sog': 2
      }
    },
    {
      coordinates: [ 42.5, 101.0 ],
      time: someTimePlusX(1),
      values: {
        'awa': -179,
        'bsp': 5,
        'sog': 3
      }
    },
    {
      coordinates: [ 43.0, 102.0 ],
      time: someTimePlusX(2),
      values: {
        'awa': -179,
        'bsp': 6,
        'sog': 4
      }
    },
    {
      time: someTimePlusX(3),
      values: {
        'awa': -179,
        'bsp': 5,
        'sog': 3
      }
    },
    {
      coordinates: [ 43.1, 102.1 ],
      time: someTimePlusX(4),
      values: {
        'awa': 179,
        'bsp': 6,
        'sog': 4
      }
    },

  ]
  const pointFromTimeData = ({time, coordinates} : TimedData) => ({time, coordinates})

  /*
   * Helper function to process some TimedData and compare the returned segments
   * to what we are expecting.
   */
  function expectDataToConvertToSegments(data : TimedData[], expectedSegments : Object[]) {
    const results = convertTimedDataToSegments(data)

    expect(results.length).toEqual(expectedSegments.length)
    for (const index of Object.keys(results)) {
      expect(results[index]).toMatchObject(expectedSegments[index])
    }
  }

  test('edge case with 0 point', () => {
    expectDataToConvertToSegments([], [])
  })

  test('edge case with 1 point', () => {
    expectDataToConvertToSegments(sampleTimedData.slice(0, 1), [])
  })

  test('simplest case with two points', () => {
    expectDataToConvertToSegments(
      sampleTimedData.slice(0, 2),
      [ {
        start: pointFromTimeData(sampleTimedData[0]),
        end: pointFromTimeData(sampleTimedData[1])
      }
    ])
  })

  test('case with three points', () => {
    expectDataToConvertToSegments(
      sampleTimedData.slice(0, 3),
      [
        {
          start: pointFromTimeData(sampleTimedData[0]),
          end: pointFromTimeData(sampleTimedData[1])
        },
        {
          start: pointFromTimeData(sampleTimedData[1]),
          end: pointFromTimeData(sampleTimedData[2])
        }
      ]
    )
  })

  test('skip points that do not have coordinates', () => {
    expectDataToConvertToSegments(
      sampleTimedData.slice(2, 5),
      [
        {
          start: pointFromTimeData(sampleTimedData[2]),
          end: pointFromTimeData(sampleTimedData[4])
        }
      ]
    )
  })

  test('first segment should not include measures of first point', () => {
    expectDataToConvertToSegments(
      sampleTimedData.slice(0, 2),
      [
        {
          values: sampleTimedData[1].values
        }
      ]
    )
  })

  test('segment should have values of the measures at end of segment', () => {
    expectDataToConvertToSegments(
      sampleTimedData.slice(1, 3),
      [
        {
          values: sampleTimedData[2].values
        }
      ]
    )
  })

  test('segment should average numerical values if multiple TimedData are used', () => {
    expectDataToConvertToSegments(
      sampleTimedData.slice(2, 5),
      [
        {
          values: {
            'bsp': 5.5,
            'sog': 3.5
          }
        }
      ]
    )
  })

  test('averaging angles properly', () => {
    expectDataToConvertToSegments(
      sampleTimedData.slice(2, 5),
      [
        {
          values: {
            'awa': 180
          }
        }
      ]
    )
  })

})

describe('Aggregation of values', () => {
  function makeValidTimedDataFromListOfValues(values: Object[]) : TimedData[] {
    return values.map((v) : TimedData => {return { time: new Date(), values: v}})
  }

  test('aggregating numerical values', () => {
    const result = aggregateTimedDataValues(makeValidTimedDataFromListOfValues([{'bsp': 3}, {'bsp': 4}]))
    expect(result['bsp']).toBeCloseTo(3.5)
  })

  test('aggregating angles', () => {
    const result = aggregateTimedDataValues(makeValidTimedDataFromListOfValues([{'awa': -30}, {'awa': 10}]))
    expect(result['awa']).toBeCloseTo(-10)
  })

  test('aggregating angles - the crucial edge case', () => {
    const result = aggregateTimedDataValues(makeValidTimedDataFromListOfValues([{'awa': -179}, {'awa': 179}]))
    expect(result['awa']).toBeCloseTo(180)
  })

  test('aggregating directions', () => {
    const result = aggregateTimedDataValues(makeValidTimedDataFromListOfValues([{'twd': 358}, {'twd': 8}]))
    expect(result['twd']).toBeCloseTo(3)
  })
  test('aggregating directions - gt 180', () => {
    const result = aggregateTimedDataValues(makeValidTimedDataFromListOfValues([{'twd': 0}, {'twd': 300}]))
    expect(result['twd']).toBeCloseTo(330)
  })
  test('aggregating directions - gt 180b', () => {
    const result = aggregateTimedDataValues(makeValidTimedDataFromListOfValues([{'twd': 359}, {'twd': 339}]))
    expect(result['twd']).toBeCloseTo(349)
  })
})