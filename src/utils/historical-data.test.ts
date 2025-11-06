import { describe, it, expect } from 'vitest'
import {
  HISTORICAL_INDICES,
  getHistoricalIndex,
  getHistoricalReturns,
  getAvailableYears,
  isYearRangeAvailable,
} from './historical-data'

describe('historical-data', () => {
  describe('HISTORICAL_INDICES', () => {
    it('should contain expected indices', () => {
      expect(HISTORICAL_INDICES).toHaveLength(3)

      const indexIds = HISTORICAL_INDICES.map(index => index.id)
      expect(indexIds).toContain('dax')
      expect(indexIds).toContain('sp500')
      expect(indexIds).toContain('msci-world')
    })

    it('should have properly calculated statistics', () => {
      HISTORICAL_INDICES.forEach(index => {
        expect(index.averageReturn).toBeTypeOf('number')
        expect(index.volatility).toBeTypeOf('number')
        expect(index.volatility).toBeGreaterThan(0)
        expect(index.startYear).toBeLessThanOrEqual(index.endYear)
        expect(index.data.length).toBeGreaterThan(0)
      })
    })

    it('should have reasonable statistical ranges', () => {
      HISTORICAL_INDICES.forEach(index => {
        // Average returns should be between -50% and +50% annually
        expect(index.averageReturn).toBeGreaterThan(-0.5)
        expect(index.averageReturn).toBeLessThan(0.5)

        // Volatility should be reasonable (0-100%)
        expect(index.volatility).toBeGreaterThan(0)
        expect(index.volatility).toBeLessThan(1.0)
      })
    })
  })

  describe('getHistoricalIndex', () => {
    it('should return correct index for valid ID', () => {
      const dax = getHistoricalIndex('dax')
      expect(dax).toBeDefined()
      expect(dax?.name).toBe('DAX')
      expect(dax?.currency).toBe('EUR')
    })

    it('should return undefined for invalid ID', () => {
      const result = getHistoricalIndex('invalid-index')
      expect(result).toBeUndefined()
    })

    it('should return all expected indices', () => {
      expect(getHistoricalIndex('dax')).toBeDefined()
      expect(getHistoricalIndex('sp500')).toBeDefined()
      expect(getHistoricalIndex('msci-world')).toBeDefined()
    })
  })

  describe('getHistoricalReturns', () => {
    it('should return returns for valid index and years', () => {
      const returns = getHistoricalReturns('dax', 2020, 2023)
      expect(returns).toBeDefined()
      expect(Object.keys(returns!)).toHaveLength(4)
      expect(returns![2020]).toBeTypeOf('number')
      expect(returns![2023]).toBeTypeOf('number')
    })

    it('should return null for invalid index', () => {
      const returns = getHistoricalReturns('invalid', 2020, 2023)
      expect(returns).toBeNull()
    })

    it('should use average return for missing years', () => {
      const returns = getHistoricalReturns('dax', 1990, 1995) // Years before data
      expect(returns).toBeDefined()

      const dax = getHistoricalIndex('dax')!
      Object.values(returns!).forEach(returnValue => {
        expect(returnValue).toBe(dax.averageReturn)
      })
    })

    it('should handle mixed available and unavailable years', () => {
      const returns = getHistoricalReturns('dax', 2022, 2025) // 2022-2023 available, 2024-2025 not
      expect(returns).toBeDefined()
      expect(Object.keys(returns!)).toHaveLength(4)

      const dax = getHistoricalIndex('dax')!
      // 2022 and 2023 should have actual data
      expect(returns![2022]).not.toBe(dax.averageReturn)
      expect(returns![2023]).not.toBe(dax.averageReturn)
      // 2024 and 2025 should use average
      expect(returns![2024]).toBe(dax.averageReturn)
      expect(returns![2025]).toBe(dax.averageReturn)
    })
  })

  describe('getAvailableYears', () => {
    it('should return sorted years for valid index', () => {
      const years = getAvailableYears('dax')
      expect(years.length).toBeGreaterThan(0)
      expect(years[0]).toBe(2000)
      expect(years[years.length - 1]).toBe(2023)

      // Check if sorted
      for (let i = 1; i < years.length; i++) {
        expect(years[i]).toBeGreaterThan(years[i - 1])
      }
    })

    it('should return empty array for invalid index', () => {
      const years = getAvailableYears('invalid')
      expect(years).toEqual([])
    })

    it('should include expected years for all indices', () => {
      ;['dax', 'sp500', 'msci-world'].forEach(indexId => {
        const years = getAvailableYears(indexId)
        expect(years).toContain(2000)
        expect(years).toContain(2023)
        expect(years.length).toBeGreaterThan(20)
      })
    })
  })

  describe('isYearRangeAvailable', () => {
    it('should return true for available year ranges', () => {
      expect(isYearRangeAvailable('dax', 2000, 2023)).toBe(true)
      expect(isYearRangeAvailable('dax', 2010, 2020)).toBe(true)
      expect(isYearRangeAvailable('sp500', 2005, 2015)).toBe(true)
    })

    it('should return false for unavailable year ranges', () => {
      expect(isYearRangeAvailable('dax', 1990, 2000)).toBe(false) // Starts too early
      expect(isYearRangeAvailable('dax', 2020, 2030)).toBe(false) // Ends too late
      expect(isYearRangeAvailable('dax', 1990, 2030)).toBe(false) // Both out of range
    })

    it('should return false for invalid index', () => {
      expect(isYearRangeAvailable('invalid', 2000, 2023)).toBe(false)
    })

    it('should handle edge cases', () => {
      expect(isYearRangeAvailable('dax', 2000, 2000)).toBe(true) // Single year
      expect(isYearRangeAvailable('dax', 2023, 2023)).toBe(true) // Last available year
      expect(isYearRangeAvailable('dax', 2024, 2024)).toBe(false) // First unavailable year
    })
  })

  describe('data integrity', () => {
    it('should have consistent data structure across indices', () => {
      HISTORICAL_INDICES.forEach(index => {
        expect(index.id).toBeTypeOf('string')
        expect(index.name).toBeTypeOf('string')
        expect(index.description).toBeTypeOf('string')
        expect(index.currency).toBeTypeOf('string')
        expect(Array.isArray(index.data)).toBe(true)

        index.data.forEach(dataPoint => {
          expect(dataPoint.year).toBeTypeOf('number')
          expect(dataPoint.return).toBeTypeOf('number')
          expect(dataPoint.year).toBeGreaterThan(1990)
          expect(dataPoint.year).toBeLessThan(2030)
          expect(dataPoint.return).toBeGreaterThan(-1) // Max -100% return
          expect(dataPoint.return).toBeLessThan(5) // Max 500% return (unrealistic but safe)
        })
      })
    })

    it('should have realistic return ranges', () => {
      HISTORICAL_INDICES.forEach(index => {
        const returns = index.data.map(d => d.return)
        const minReturn = Math.min(...returns)
        const maxReturn = Math.max(...returns)

        // Market crashes shouldn't exceed -50%
        expect(minReturn).toBeGreaterThan(-0.6)
        // Bull markets shouldn't exceed +50% typically
        expect(maxReturn).toBeLessThan(0.6)
      })
    })

    it('should have data for expected time period', () => {
      HISTORICAL_INDICES.forEach(index => {
        const years = index.data.map(d => d.year)
        const minYear = Math.min(...years)
        const maxYear = Math.max(...years)

        expect(minYear).toBe(index.startYear)
        expect(maxYear).toBe(index.endYear)
        expect(maxYear - minYear).toBeGreaterThanOrEqual(20) // At least 20 years of data
      })
    })
  })

  describe('specific index data validation', () => {
    it('should have DAX data with German market characteristics', () => {
      const dax = getHistoricalIndex('dax')!
      expect(dax.currency).toBe('EUR')
      expect(dax.name).toBe('DAX')

      // Check for known market events
      const returns = getHistoricalReturns('dax', 2000, 2023)!

      // 2008 financial crisis - should be negative
      expect(returns[2008]).toBeLessThan(0)
      expect(returns[2008]).toBeLessThan(-0.3) // At least -30%

      // 2002 dot-com crash - should be very negative
      expect(returns[2002]).toBeLessThan(-0.3)
    })

    it('should have S&P 500 data with US market characteristics', () => {
      const sp500 = getHistoricalIndex('sp500')!
      expect(sp500.currency).toBe('USD')
      expect(sp500.name).toBe('S&P 500')

      const returns = getHistoricalReturns('sp500', 2000, 2023)!

      // 2008 financial crisis
      expect(returns[2008]).toBeLessThan(-0.3)

      // Strong bull market years
      expect(returns[2013]).toBeGreaterThan(0.25) // Should be > 25%
      expect(returns[2019]).toBeGreaterThan(0.25)
    })

    it('should have MSCI World data with global characteristics', () => {
      const msciWorld = getHistoricalIndex('msci-world')!
      expect(msciWorld.currency).toBe('USD')
      expect(msciWorld.name).toBe('MSCI World')

      const returns = getHistoricalReturns('msci-world', 2000, 2023)!

      // 2008 financial crisis - global impact
      expect(returns[2008]).toBeLessThan(-0.3)
    })
  })
})
