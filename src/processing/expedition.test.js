const prepareExpeditionData = require('./expedition').prepareExpeditionData;

test('returns an array', () => {
  expect(Array.isArray(prepareExpeditionData([])));
});

test('Converts time to Date objects', () => {
  const data = [ {'Utc': 38249.70139, 'Lat':0, 'Lon': 0} ];
  let r = prepareExpeditionData(data);
  expect(r[0]['time']).toEqual(new Date('2004-09-21T16:50:00.096Z'));
})

test('Converts position from Expedition format to an array of coordinates', () => {
  const data = [ {'Utc': 38249.70139, 'Lat':42, 'Lon': 117} ];
  let r = prepareExpeditionData(data);
  expect(r[0]['coordinates']).toEqual([ 117, 42]);
})

test('Includes coordinates of previous points for line drawing', () => {
  const data = [ {'Utc': 38249.70139, 'Lat':42, 'Lon': 117}, {'Utc': 38249.70140, 'Lat': 43, 'Lon': 118} ];
  let r = prepareExpeditionData(data);
  expect(r[0]['coordinates']).toEqual([ 117, 42]);
  expect(r[1]['coordinates']).toEqual([ 118, 43]);
  expect(r[1]['previousCoordinates']).toEqual([ 117, 42]);
})

test('skip line that do not have coordinates', () => {
  const data = [ 
    {'Utc': 38249.70139, 'Lat':42, 'Lon': 117}, 
    {'Utc': 38249.70139, 'Lat':null, 'Lon': null}, 
    {'Utc': 38249.70140, 'Lat': 43, 'Lon': 118} 
  ];
  let r = prepareExpeditionData(data);
  expect(r.length).toBe(2);
  expect(r[0]['coordinates']).toEqual([ 117, 42]);
  expect(r[1]['coordinates']).toEqual([ 118, 43]);
  expect(r[1]['previousCoordinates']).toEqual([ 117, 42]);
})

test('skip lines that do not have coordinates but propagate their values to the next update', () => {
  const data = [ 
    {'Utc': 38249.70139, 'Lat':42, 'Lon': 117}, 
    {'Utc': 38249.70139, 'Lat':null, 'Lon': null, 'Sog': 3}, 
    {'Utc': 38249.70140, 'Lat': 43, 'Lon': 118} 
  ];

  let r = prepareExpeditionData(data);
  expect(r.length).toBe(2);
  expect(r[1]['Sog']).toBe(3);
});

test('average propagated values', () => {
  const data = [ 
    {'Utc': 38249.70139, 'Lat':42, 'Lon': 117}, 
    {'Utc': 38249.70139, 'Lat':null, 'Lon': null, 'Sog': 3}, 
    {'Utc': 38249.70140, 'Lat': 43, 'Lon': 118, 'Sog': 5} 
  ];

  let r = prepareExpeditionData(data);
  expect(r.length).toBe(2);
  expect(r[1]['Sog']).toBe(4);
})

test('do not include null values', () => {
  const data = [
    {'Utc': 38249.70139, 'Lat':42, 'Lon': 117, 'Sog': null} 
  ];

  let r = prepareExpeditionData(data);
  console.log(r);
  expect(r.length).toBe(1);
  expect('Sog' in r[0]).toBe(false);  
})

test('do not include "special" properties', () => {
  const data = [
    {'Utc': 38249.70139, 'Lat':42, 'Lon': 117, 'Sog': null} 
  ];

  let r = prepareExpeditionData(data);
  expect('Utc' in r[0]).toBe(false);  
  expect('Lat' in r[0]).toBe(false);  
  expect('Lon' in r[0]).toBe(false);  
})