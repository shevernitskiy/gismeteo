import { Gismeteo } from '../src/gismeteo'

jest.setTimeout(15000)

describe('Gismeteo', () => {
  const gismeteo = new Gismeteo()

  describe('getNow', () => {
    test('should not be null', async () => {
      const result = await gismeteo.getNow('Лондон')

      expect(result).not.toBeNull()
    })
  })

  describe('getTomorrow', () => {
    test('should not be null and contain 8 items', async () => {
      const result = await gismeteo.getTommorow('Berlin')

      expect(result).not.toBeNull()
      expect(result.length).toBe(8)
      expect(undefInArray(result)).toBeFalsy()
    })
  })

  describe('getTwoWeeks', () => {
    test('should not be null and contain 14 items', async () => {
      const result = await gismeteo.getTwoWeeks('Moscow')

      expect(result).not.toBeNull()
      expect(result.length).toBe(14)
      expect(undefInArray(result)).toBeFalsy()
    })
  })

  describe('getMonth', () => {
    test('should not be null and contain 42 items', async () => {
      const result = await gismeteo.getMonth('Moscow')

      expect(result).not.toBeNull()
      expect(result.length).toBe(42)
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
