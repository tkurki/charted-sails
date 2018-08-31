import { SKPosition } from "../model";
import { IntelligibleSignalK } from "./IntelligibleSignalK";

describe('sorting sk field names', () => {
  it('sorts fields who have a preferred order', () => {
    const fields = ['navigation.courseOverGround', 'navigation.speedOverGround']
    fields.sort(new IntelligibleSignalK().getSignalKPathComparator())
    expect(fields).toEqual(['navigation.speedOverGround', 'navigation.courseOverGround'])
  })

  it('reverts to alphabetical sorting if no order has been defined', () => {
    const fields = ['navigation.zFieldNameStartingWithZulu', 'navigation.aFieldNameStartingWithAlpha']
    fields.sort(new IntelligibleSignalK().getSignalKPathComparator())
    expect(fields).toEqual(['navigation.aFieldNameStartingWithAlpha', 'navigation.zFieldNameStartingWithZulu'])
  })

  it('preferred fields always go first', () => {
    const fields = ['navigation.zFieldNameStartingWithZulu', 'navigation.courseOverGround']
    fields.sort(new IntelligibleSignalK().getSignalKPathComparator())
    expect(fields).toEqual(['navigation.courseOverGround', 'navigation.zFieldNameStartingWithZulu'])
  })
})

describe('making data intelligible', () => {
  it('converts speeds to knots', () => {
    const formatter = new IntelligibleSignalK().getFormatterForPath('navigation.speedOverGround')
    const s = formatter.format(3*1852/3600)
    expect(formatter.unit).toBe('knots')
    expect(s).toBe("3.0")
  })

  it('converts directions to degrees', () => {
    const formatter = new IntelligibleSignalK().getFormatterForPath('navigation.courseOverGround')
    const s = formatter.format(30/360*2*Math.PI)
    expect(formatter.unit).toBe('deg')
    expect(s).toBe("30")
  })

  it('converts angles to degrees', () => {
    const formatter = new IntelligibleSignalK().getFormatterForPath('environment.wind.angleApparent')
    const s = formatter.format(30/360*2*Math.PI)
    expect(formatter.unit).toBe('deg')
    expect(s).toBe("30")
  })

  it('converts angles gt 180 to negative degrees', () => {
    const formatter = new IntelligibleSignalK().getFormatterForPath('environment.wind.angleApparent')
    const s = formatter.format(330/360*2*Math.PI)
    expect(formatter.unit).toBe('deg')
    expect(s).toBe("-30")
  })

  it('converts temperature to celsius', () => {
    const formatter = new IntelligibleSignalK().getFormatterForPath('environment.water.temperature')
    const s = formatter.format(22 + 273.15)
    expect(formatter.unit).toBe('ºC')
    expect(s).toBe("22.0")
  })

  it('converts GPS Position to something readable', () => {
    const formatter = new IntelligibleSignalK().getFormatterForPath('navigation.position')
    const s = formatter.format(new SKPosition(17.00505555108625, -61.76250950023393))
    expect(formatter.unit).toBe('')
    expect(s).toBe('N 17º0\'18.200" W 61º45\'45.034"')
  })

  it('converts distance to nm', () => {
    const formatter = new IntelligibleSignalK().getFormatterForPath('navigation.log')
    const s = formatter.format(3.5 * 1852)
    expect(formatter.unit).toBe('nm')
    expect(s).toBe('3.50')
  })
})