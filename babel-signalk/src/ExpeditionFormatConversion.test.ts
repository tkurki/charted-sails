import { ExpeditionFormatConversion } from './ExpeditionFormatConversion'
import * as utils from '@signalk/nmea0183-utilities'
import { SKValue } from '@aldis/strongly-signalk';
import { columnConvertersForLine } from './CSVConversion';
import {toBeDeepCloseTo,toMatchCloseTo} from 'jest-matcher-deep-close-to';

// This little dance is needed to avoid Typescript errors when adding new matchers.
// Thanks to: https://github.com/kentcdodds/react-testing-library/issues/36
interface ExtendedMatchers extends jest.Matchers<void> {
  toBeDeepCloseTo: (o: object) => object
}
expect.extend({toBeDeepCloseTo, toMatchCloseTo});
let myExpect = (x:any) => (expect(x) as ExtendedMatchers)


let expeditionConverter : ExpeditionFormatConversion

beforeAll(() => {
  expeditionConverter = new ExpeditionFormatConversion()
})


it('can convert expedition times', () => {
  expect(expeditionConverter.timeConverter({'Utc': 38249.70139}))
    .toEqual(new Date('2004-09-21T16:50:00.096Z'))
})

let convertHelper = (csvLine: any):SKValue|null => {
  let availableConversions = columnConvertersForLine(csvLine, expeditionConverter)
  expect(availableConversions).toHaveLength(1)

  if (availableConversions.length == 1) {
    return availableConversions[0].convert(csvLine)
  }
  return null
}


it('converts BSP column', () => {
  myExpect(convertHelper({'Bsp': 6.2}))
    .toBeDeepCloseTo({'path': 'navigation.speedThroughWater', value: utils.transform(6.2, 'knots', 'ms')})
})

