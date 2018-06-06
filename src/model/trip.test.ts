import {convertExpeditionLineToTimedData} from './trip'

it('Converts time format', () => {
  const expedition = {'Utc': 38249.70139}

  let timedData = convertExpeditionLineToTimedData(expedition)

  let d = new Date('2004-09-21T16:50:00.096Z')
  expect(timedData.time.getTime()).toEqual(d.getTime())
})

it('Converts coordinates', () => {
  const expedition = {'Utc': 38249.70139, 'Lat': 42.0, 'Lon': 117.1}
  let timedData = convertExpeditionLineToTimedData(expedition)

  expect('coordinates' in timedData).toBeTruthy()
  expect(timedData.coordinates.length).toEqual(2)
  expect(timedData.coordinates).toEqual([117.1, 42.0])
})

it('Converts values to their SignalK representation', () => {
  // TODO: Many more tests to add here

  const expedition = {'Utc': 38249.70139, 'Lat': 42.0, 'Lon': 117.1, 'Sog': 42, 'Bsp': 4.0}
  let timedData = convertExpeditionLineToTimedData(expedition)

  expect(timedData.values).toHaveProperty('Sog', 42)
  expect(timedData.values).toHaveProperty('Bsp', 4.0)
  expect(timedData.values).not.toHaveProperty('Utc')
  expect(timedData.values).not.toHaveProperty('Lat')
  expect(timedData.values).not.toHaveProperty('Lon')
})
