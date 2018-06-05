/**
 * Takes expedition data as loaded by Papa Parse (maybe via CSVLoader webpack extension) and
 * returns a data set with the following guarantee:
 * 
 * - Each point will have a 'time' as a JS object
 * - Each point will have 'coordinates' as [ lon, lat ]
 * - Each point will have a set of extra attributes from the data file.
 */
 export function prepareExpeditionData(data) {
   // These properties will not be included.
   const specialProperties = ['Utc', 'Lat', 'Lon'];
   let previousCoordinates = null;
   let segmentProperties = {};

   data = data.reduce((trip, line) => {
     // Add all properties values to 'segmentProperties' so we can average them when we are ready to write a new line.
     for (var key in line) {
      if (!specialProperties.includes(key) && line[key] !== null) {
        if (!(key in segmentProperties)) {
          segmentProperties[key] = [];
        }
        segmentProperties[key].push(line[key]);
      }
    }

    var segment = {};
    segment['time'] = new Date(new Date("1900-01-01T00:00:00Z").getTime() + line['Utc'] * 24 * 3600 * 1000);

    // Process coordinates if they are included
    if (line['Lon'] !== null && line['Lat'] !== null) {
      segment['coordinates'] = [ Number(line['Lon']), Number(line['Lat']) ];

      // Record previous coordinates so we can draw a line from last point to this one.
      if (previousCoordinates !== null) {
        segment['previousCoordinates'] = previousCoordinates;
      }
      previousCoordinates = segment['coordinates'];
    }

    // Decide whether to produce a line or not
    if ('coordinates' in segment) {
      // Calculate segment properties and add them to segment.
      for (key in segmentProperties) {
        var valueAgg = segmentProperties[key].reduce((result, v) => { return result+v });
        segment[key] = valueAgg / segmentProperties[key].length;
      }
      trip.push(segment);
      segmentProperties = {};
    }

    return trip;
  }, []);
  return data;
}