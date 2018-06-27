import { CSVLoader } from '@aldis/babel-signalk';
import { TripOverview } from '../model/TripOverview';

import SAMPLE_DATA_AUCKLAND from './expedition-auckland.csv'
import SAMPLE_DATA_SF from './expedition-sanfrancisco.csv'
import SAMPLE_DATA_SOLENT from './expedition-solent.csv'
import SAMPLE_DATA_VALENCIA from './expedition-valencia.csv'

export const sampleDataTripOverviews : TripOverview[] = [
  {
    label: 'Expedition - San Francisco',
    description: '16083 updates and 92276 values',
    startTime: new Date("2004-09-21T16:50:00.096Z"),
    endTime: new Date("2004-09-21T21:19:32.448Z"),
    path: [
      [-122.445967,37.806633],[-122.39025,37.828883],[-122.399233,37.833283],[-122.4143,37.82225],
      [-122.387017,37.824467],[-122.445467,37.825433],[-122.4585,37.810217],[-122.4068,37.818683],
      [-122.445867,37.80655]
    ],
    getSKDelta: () => CSVLoader.fromURL(window.location.origin + SAMPLE_DATA_SF)
  },
  {
    label: 'Expedition - Valencia',
    description: '11978 updates and 131758 values',
    startTime: new Date("2005-06-15T09:19:32.448Z"),
    endTime: new Date("2005-06-15T12:43:55.200Z"),
    path: [
      [-0.299097,39.400246],[-0.272375,39.390888],[-0.291825,39.388309],[-0.260553,39.367348],
      [-0.292261,39.387905],[-0.260461,39.369606],[-0.287819,39.379692],[-0.285,39.370037],
      [-0.255403,39.366417],[-0.297992,39.400982]
    ],
    getSKDelta: () => CSVLoader.fromURL(window.location.origin + SAMPLE_DATA_VALENCIA)
  },
  {
    label: 'Expedition - Auckland',
    description: '11370 updates and 64216 values',
    startTime: new Date("2004-03-09T00:00:01.727Z"),
    endTime: new Date("2004-03-09T03:44:56.544Z"),
    path: [
      [174.904436,-36.731609],[174.932352,-36.736418],[174.939266,-36.76474],
      [174.093748,-36.773959],[174.937514,-36.773995],[174.919583,-36.795767],
      [174.008325,-36.797971],[174.915073,-36.797988],[174.089884,-36.802525],
      [174.899115,-36.802517],[174.833882,-36.827884],[174.000793,-36.828598],
      [174.832611,-36.828663],[174.806005,-36.842229],[174.750268,-36.837881]
    ],
    getSKDelta: () => CSVLoader.fromURL(window.location.origin + SAMPLE_DATA_AUCKLAND)
  },
  {
    label: 'Expedition - Solent',
    description: '466 updates and 3728 values',
    startTime: new Date("2005-03-10T18:45:37.152Z"),
    endTime: new Date("2005-03-10T19:24:28.224Z"),
    path: [
      [-1.36405,50.76229],[-1.348708,50.758006],[-1.351024,50.767958],[-1.3602,50.75735]
    ],
    getSKDelta: () => CSVLoader.fromURL(window.location.origin + SAMPLE_DATA_SOLENT)
  }
]