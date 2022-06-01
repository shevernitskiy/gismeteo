import { Gismeteo } from '../src/gismeteo'
import { GismeteoTomorrow, GismeteoTwoWeeks, GismeteoMonth, GismeteoNow, GismeteoToday } from '../src/common/types'

jest.setTimeout(15000)

describe('Gismeteo', () => {
  const gismeteo = new Gismeteo()

  describe('getNow', () => {
    let result: GismeteoNow

    beforeAll(async () => {
      result = await gismeteo.getNow('Лондон')
    })

    test('should not be null', () => {
      expect(result).not.toBeNull()
    })

    test('should not contain any undefined values', () => {
      expect(undefInObj(result)).toBeFalsy()
    })
  })

  describe('getToday', () => {
    let result: GismeteoToday[]

    beforeAll(async () => {
      result = await gismeteo.getToday('Berlin')
    })

    test('should contain 8 items', () => {
      expect(result.length).toBe(8)
    })

    test('should not contain any undefined values', () => {
      expect(undefInArray(result)).toBeFalsy()
    })
  })

  describe('getTomorrow', () => {
    let result: GismeteoTomorrow[]

    beforeAll(async () => {
      result = await gismeteo.getTomorrow('Berlin')
    })

    test('should contain 8 items', () => {
      expect(result.length).toBe(8)
    })

    test('should not contain any undefined values', () => {
      expect(undefInArray(result)).toBeFalsy()
    })
  })

  describe('getTwoWeeks', () => {
    let result: GismeteoTwoWeeks[]

    beforeAll(async () => {
      result = await gismeteo.getTwoWeeks('Moscow')
    })

    test('should contain 14 items', () => {
      expect(result.length).toBe(14)
    })

    test('should not contain any undefined values', () => {
      expect(undefInArray(result)).toBeFalsy()
    })
  })

  describe('getMonth', () => {
    let result: GismeteoMonth[]

    beforeAll(async () => {
      result = await gismeteo.getMonth('Moscow')
    })

    test('should contain 42 items', () => {
      expect(result.length).toBe(42)
    })

    test('should not contain any undefined values', () => {
      expect(undefInArray(result)).toBeFalsy()
    })
  })
})

const undefInArray = <T>(input: T[]): boolean => {
  const out = input.map((item) => {
    for (const key in item) {
      if (item[key] === undefined) {
        return false
      }
    }
    return item
  })

  return out.includes(false)
}

const undefInObj = <T>(input: T): boolean => {
  for (const key in input) {
    if (input[key] === undefined) {
      return true
    }
  }
  return false
}
