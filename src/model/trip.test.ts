import Trip, { aggregateTimedDataValues, convertExpeditionLineToTimedData, convertTimedDataToSegments, TimedData, } from './Trip'

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

  it('Should throw an exception on invalid lines', () => {
    const expedition = {'Utc': ''}

    expect(() => convertExpeditionLineToTimedData(expedition)).toThrow('Invalid line')
  })
})

describe('Transforming time data into segments', () => {
  const pointFromTimeData = ({time, coordinates} : TimedData) => ({time, coordinates})

  /*
   * Helper function to process some TimedData and compare the returned segments
   * to what we are expecting.
   */
  function expectDataToConvertToSegments(data : TimedData[], expectedSegments : object[]) {
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
            'Bsp': 5.5,
            'Sog': 3.5
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
            'Awa': 180
          }
        }
      ]
    )
  })

})

describe("Fabric functions", () => {
  expect(() => Trip.fromTimedData([])).toThrow("Cannot create trip without at least one point!")
})

describe("Convenience accessors", () => {
  it('knows its start time', () => {
    expect(Trip.fromTimedData(sampleTimedData).getStartTime()).toEqual(sampleTimedData[0].time)
  })

  it('knows its end time', () => {
    expect(Trip.fromTimedData(sampleTimedData).getEndTime()).toEqual(sampleTimedData[sampleTimedData.length-1].time)
  })
})

describe('Aggregation of values', () => {
  const BSP = 'Bsp'
  const AWA = 'Awa'
  const TWD = 'Twd'

  function makeValidTimedDataFromListOfValues(keyName: string, values: number[]) : TimedData[] {
    return values.map((v) : TimedData => ({
      time: new Date(),
      values: { [keyName]: v }
    }))
  }

  test('aggregating numerical values', () => {
    const result = aggregateTimedDataValues(makeValidTimedDataFromListOfValues(BSP, [3, 4]))
    expect(result).toHaveProperty(BSP)
    expect(result[BSP]).toBeCloseTo(3.5)
  })

  test('aggregating angles', () => {
    const result = aggregateTimedDataValues(makeValidTimedDataFromListOfValues(AWA, [-30, 10]))
    expect(result).toHaveProperty(AWA)
    expect(result[AWA]).toBeCloseTo(-10)
  })

  test('aggregating angles - the crucial edge case', () => {
    const result = aggregateTimedDataValues(makeValidTimedDataFromListOfValues(AWA, [-179, 179]))
    expect(result).toHaveProperty(AWA)
    expect(result[AWA]).toBeCloseTo(180)
  })

  test('aggregating directions', () => {
    const result = aggregateTimedDataValues(makeValidTimedDataFromListOfValues(TWD, [358, 8]))
    expect(result[TWD]).toBeCloseTo(3)
  })
  test('aggregating directions - gt 180', () => {
    const result = aggregateTimedDataValues(makeValidTimedDataFromListOfValues(TWD, [0, 300]))
    expect(result[TWD]).toBeCloseTo(330)
  })
  test('aggregating directions - gt 180b', () => {
    const result = aggregateTimedDataValues(makeValidTimedDataFromListOfValues(TWD, [359, 339]))
    expect(result[TWD]).toBeCloseTo(349)
  })
})

describe("Obtain list of points for a given trip", () => {
  it('works with only one segment', () => {
    const points = Trip.fromTimedData(sampleTimedData.slice(0, 2)).getPoints()
    expect(points).toEqual([sampleTimedData[0].coordinates, sampleTimedData[1].coordinates])
  })

  it ('works with 3', () => {
    const points = Trip.fromTimedData(sampleTimedData.slice(0, 3)).getPoints()
    expect(points).toEqual([sampleTimedData[0].coordinates, sampleTimedData[1].coordinates, sampleTimedData[2].coordinates])
  })
})

describe("It knows how to calcukate its bounds", () => {
  it ("when there is only one segment", () => {
    const bounds = Trip.fromTimedData(sampleTimedData.slice(0, 2)).getBoundingCoordinates()
    expect(bounds).toEqual([[100,42.5], [101, 42]])
  })

  it ("always returns coordinates in the same order", () => {
    const bounds = Trip.fromTimedData(sampleTimedData.slice(0, 2).reverse()).getBoundingCoordinates()
    expect(bounds).toEqual([[100,42.5], [101, 42]])
  })

  it ("when the segment is over the +180/-179 longitude line", () => {
    const bounds = Trip.fromTimedData(sampleTimedDataOverDateChangeLine).getBoundingCoordinates()
    expect(bounds).toEqual([[-179.5, -35], [179.5, -37]])
  })

  it ("When segment is over the north pole", () => {
    const bounds = Trip.fromTimedData(sampleTimedDataOverNorthPole).getBoundingCoordinates()
    expect(bounds).toEqual([[-175, 89.5], [5, 89]])
  })
})


const someTimePlusX = (x : number) => new Date(1528489854697 + x*1000)
const sampleTimedData : TimedData[] = [
  {
    coordinates: [ 100.0, 42.0 ],
    time: someTimePlusX(0),
    values: {
      'Awa': 179,
      'Bsp': 3,
      'Sog': 2
    }
  },
  {
    coordinates: [ 101, 42.5 ],
    time: someTimePlusX(1),
    values: {
      'Awa': -179,
      'Bsp': 5,
      'Sog': 3
    }
  },
  {
    coordinates: [ 102, 43 ],
    time: someTimePlusX(2),
    values: {
      'Awa': -179,
      'Bsp': 6,
      'Sog': 4
    }
  },
  {
    time: someTimePlusX(3),
    values: {
      'Awa': -179,
      'Bsp': 5,
      'Sog': 3
    }
  },
  {
    coordinates: [ 102.1, 43.1 ],
    time: someTimePlusX(4),
    values: {
      'Awa': 179,
      'Bsp': 6,
      'Sog': 4
    }
  },
]

const sampleTimedDataOverDateChangeLine : TimedData[] = [
  {
    coordinates: [ 179.5, -35 ],
    time: someTimePlusX(0),
    values: {
      'Awa': 179,
      'Bsp': 6,
      'Sog': 4
    }
  },
  {
    coordinates: [ -179.5, -37 ],
    time: someTimePlusX(4),
    values: {
      'Awa': 179,
      'Bsp': 6,
      'Sog': 4
    }
  },
]

const sampleTimedDataOverNorthPole : TimedData[] = [
  {
    coordinates: [ 5, 89 ],
    time: someTimePlusX(0),
    values: {
      'Awa': 179,
      'Bsp': 6,
      'Sog': 4
    }
  },
  {
    coordinates: [ -175, 89.5 ],
    time: someTimePlusX(4),
    values: {
      'Awa': 179,
      'Bsp': 6,
      'Sog': 4
    }
  },
]