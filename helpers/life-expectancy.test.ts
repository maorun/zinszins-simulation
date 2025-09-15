import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  calculateEndOfLifeYear,
  calculateCurrentAge,
  calculateAgeAtYear,
  getDefaultLifeExpectancy,
} from './life-expectancy'

describe('life-expectancy helpers', () => {
  beforeEach(() => {
    // Mock Date to return consistent current year for testing
    vi.setSystemTime(new Date('2024-01-01'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('calculateEndOfLifeYear', () => {
    it('should calculate correct end of life year', () => {
      expect(calculateEndOfLifeYear(1974, 85)).toBe(2059)
      expect(calculateEndOfLifeYear(1980, 90)).toBe(2070)
      expect(calculateEndOfLifeYear(1950, 75)).toBe(2025)
    })

    it('should handle edge cases', () => {
      expect(calculateEndOfLifeYear(2000, 100)).toBe(2100)
      expect(calculateEndOfLifeYear(1900, 50)).toBe(1950)
    })
  })

  describe('calculateCurrentAge', () => {
    it('should calculate current age based on birth year', () => {
      // Current year is mocked as 2024
      expect(calculateCurrentAge(1974)).toBe(50)
      expect(calculateCurrentAge(1980)).toBe(44)
      expect(calculateCurrentAge(2000)).toBe(24)
    })

    it('should calculate age based on specific year', () => {
      expect(calculateCurrentAge(1974, 2030)).toBe(56)
      expect(calculateCurrentAge(1980, 2050)).toBe(70)
    })

    it('should handle future birth years', () => {
      expect(calculateCurrentAge(2030)).toBe(-6)
    })
  })

  describe('calculateAgeAtYear', () => {
    it('should calculate age at specific target year', () => {
      expect(calculateAgeAtYear(1974, 2080)).toBe(106)
      expect(calculateAgeAtYear(1980, 2065)).toBe(85)
      expect(calculateAgeAtYear(2000, 2085)).toBe(85)
    })

    it('should handle past years', () => {
      expect(calculateAgeAtYear(1974, 1990)).toBe(16)
    })
  })

  describe('getDefaultLifeExpectancy', () => {
    it('should return gender-specific life expectancy', () => {
      expect(getDefaultLifeExpectancy(30, 'male')).toBe(78)
      expect(getDefaultLifeExpectancy(30, 'female')).toBe(83)
      expect(getDefaultLifeExpectancy(30)).toBe(81) // 80.5 rounded
    })

    it('should adjust for older ages', () => {
      expect(getDefaultLifeExpectancy(65, 'male')).toBe(80) // +2 for 65+
      expect(getDefaultLifeExpectancy(65, 'female')).toBe(85) // +2 for 65+
      expect(getDefaultLifeExpectancy(70)).toBe(83) // 80.5 + 2 = 82.5, rounded to 83
    })

    it('should adjust for middle-aged people', () => {
      expect(getDefaultLifeExpectancy(50, 'male')).toBe(79) // +1 for 50+
      expect(getDefaultLifeExpectancy(55, 'female')).toBe(84) // +1 for 50+
      expect(getDefaultLifeExpectancy(60)).toBe(82) // 80.5 + 1 = 81.5, rounded to 82
    })

    it('should not adjust for younger ages', () => {
      expect(getDefaultLifeExpectancy(25, 'male')).toBe(78)
      expect(getDefaultLifeExpectancy(35, 'female')).toBe(83)
      expect(getDefaultLifeExpectancy(40)).toBe(81) // 80.5 rounded to 81
    })

    it('should handle edge cases', () => {
      expect(getDefaultLifeExpectancy(0, 'male')).toBe(78)
      expect(getDefaultLifeExpectancy(100, 'female')).toBe(85)
      expect(getDefaultLifeExpectancy(75)).toBe(83) // 80.5 + 2 = 82.5, rounded to 83
    })
  })

  describe('integration scenarios', () => {
    it('should work with realistic scenarios', () => {
      // Scenario 1: Person born in 1974, currently 50, expects to live to 85
      const birthYear1974 = 1974
      const currentAge = calculateCurrentAge(birthYear1974) // 50 in 2024
      const lifeExpectancy = getDefaultLifeExpectancy(currentAge) // 80.5 + 1 = 81.5, rounded to 82
      const endOfLifeYear = calculateEndOfLifeYear(birthYear1974, lifeExpectancy)

      expect(currentAge).toBe(50)
      expect(lifeExpectancy).toBe(82) // 80.5 + 1 (50+) = 81.5, rounded to 82
      expect(endOfLifeYear).toBe(2056) // 1974 + 82

      // Scenario 2: Person born in 1960, currently 64, expects to live to 85
      const birthYear1960 = 1960
      const currentAge2 = calculateCurrentAge(birthYear1960) // 64 in 2024
      const lifeExpectancy2 = getDefaultLifeExpectancy(currentAge2, 'female') // Should be 84 (50+ adjustment)
      const endOfLifeYear2 = calculateEndOfLifeYear(birthYear1960, lifeExpectancy2)

      expect(currentAge2).toBe(64)
      expect(lifeExpectancy2).toBe(84) // 83 + 1 (50+)
      expect(endOfLifeYear2).toBe(2044) // 1960 + 84
    })

    it('should calculate age at end of life correctly', () => {
      const birthYear = 1974
      const expectedLifespan = 85
      const endOfLifeYear = calculateEndOfLifeYear(birthYear, expectedLifespan)
      const ageAtEndOfLife = calculateAgeAtYear(birthYear, endOfLifeYear)

      expect(ageAtEndOfLife).toBe(expectedLifespan)
    })
  })
})
