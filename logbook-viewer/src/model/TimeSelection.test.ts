import TimeSelection from "./TimeSelection";

describe('Instant TimeSelection', () => {
  const sometime = new Date('2042-03-03T17:33:01')
  const ts = new TimeSelection(sometime)

  it('returns its date', () => {
    expect(ts.getCenter()).toEqual(sometime)
  })

  it('can behave like a range', () => {
    expect(ts.getRange()).toEqual([sometime, sometime])
    expect(ts.getDuration()).toEqual(0)
  })
})

describe('Ranged TimeSelection', () => {
  const begin = new Date('1979-08-11T10:00:00Z')
  const end = new Date('1979-08-15T07:44:19Z')
  const ts = new TimeSelection(begin, end)

  it('returns its range', () => {
    expect(ts.getRange()).toEqual([begin, end])
  })

  it('can calculate its center', () => {
    expect(ts.getCenter()).toEqual(new Date("1979-08-13T08:52:09.500Z"))
  })

  it('can calculate its duration', () => {
    expect(ts.getDuration()).toEqual(((((93*60)+44)*60)+19)*1000)
  })
})