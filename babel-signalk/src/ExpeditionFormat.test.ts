import { ExpeditionFormatConversion } from './ExpeditionFormat'

it('can convert expedition times', () => {
  expect(ExpeditionFormatConversion.timeConverter({'Utc': 38249.70139}))
    .toEqual(new Date('2004-09-21T16:50:00.096Z'))
})
