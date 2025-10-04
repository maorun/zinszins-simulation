import { describe, test, expect } from 'vitest'
import {
  calculateRealValue,
  calculateYearlyInflationAdjustedValues,
  getCumulativeInflationFactor,
  formatInflationAdjustedValue,
} from './inflation-adjustment'

describe('inflation-adjustment utilities', () => {
  describe('calculateRealValue', () => {
    test('should return nominal value when inflation rate is zero', () => {
      expect(calculateRealValue(1000, 0, 5)).toBe(1000)
    })

    test('should return nominal value when years is zero', () => {
      expect(calculateRealValue(1000, 0.02, 0)).toBe(1000)
    })

    test('should return nominal value when inflation rate is negative', () => {
      expect(calculateRealValue(1000, -0.02, 5)).toBe(1000)
    })

    test('should calculate real value correctly with 2% inflation over 1 year', () => {
      const result = calculateRealValue(1000, 0.02, 1)
      expect(result).toBeCloseTo(980.39, 2) // 1000 / 1.02
    })

    test('should calculate real value correctly with 2% inflation over 5 years', () => {
      const result = calculateRealValue(1000, 0.02, 5)
      expect(result).toBeCloseTo(905.73, 2) // 1000 / (1.02^5)
    })

    test('should calculate real value correctly with higher inflation', () => {
      const result = calculateRealValue(10000, 0.05, 10)
      expect(result).toBeCloseTo(6139.13, 2) // 10000 / (1.05^10)
    })
  })

  describe('calculateYearlyInflationAdjustedValues', () => {
    test('should calculate inflation-adjusted values for multiple years', () => {
      const yearlyData = {
        2023: 1000,
        2024: 2000,
        2025: 3000,
      }

      const result = calculateYearlyInflationAdjustedValues(yearlyData, 2023, 0.02)

      expect(result[2023]).toEqual({
        nominal: 1000,
        real: 1000, // Base year, no adjustment
      })

      expect(result[2024].nominal).toBe(2000)
      expect(result[2024].real).toBeCloseTo(1960.78, 2) // 2000 / 1.02

      expect(result[2025].nominal).toBe(3000)
      expect(result[2025].real).toBeCloseTo(2883.51, 2) // 3000 / (1.02^2)
    })

    test('should handle zero inflation rate', () => {
      const yearlyData = {
        2023: 1000,
        2024: 2000,
      }

      const result = calculateYearlyInflationAdjustedValues(yearlyData, 2023, 0)

      expect(result[2023]).toEqual({ nominal: 1000, real: 1000 })
      expect(result[2024]).toEqual({ nominal: 2000, real: 2000 })
    })

    test('should handle negative years (past years from base)', () => {
      const yearlyData = {
        2022: 1000,
        2023: 2000,
      }

      const result = calculateYearlyInflationAdjustedValues(yearlyData, 2023, 0.02)

      expect(result[2022].nominal).toBe(1000)
      expect(result[2022].real).toBe(1000) // Negative years return nominal
      expect(result[2023]).toEqual({ nominal: 2000, real: 2000 })
    })
  })

  describe('getCumulativeInflationFactor', () => {
    test('should return 1.0 for zero inflation', () => {
      expect(getCumulativeInflationFactor(0, 5)).toBe(1.0)
    })

    test('should return 1.0 for zero years', () => {
      expect(getCumulativeInflationFactor(0.02, 0)).toBe(1.0)
    })

    test('should return 1.0 for negative inflation', () => {
      expect(getCumulativeInflationFactor(-0.02, 5)).toBe(1.0)
    })

    test('should calculate cumulative inflation factor correctly', () => {
      expect(getCumulativeInflationFactor(0.02, 1)).toBeCloseTo(1.02, 4)
      expect(getCumulativeInflationFactor(0.02, 5)).toBeCloseTo(1.1041, 4)
      expect(getCumulativeInflationFactor(0.05, 10)).toBeCloseTo(1.6289, 4)
    })
  })

  describe('formatInflationAdjustedValue', () => {
    test('should format nominal value only when inflation not shown', () => {
      const result = formatInflationAdjustedValue(1000, 800, false)
      expect(result).toContain('1.000,00')
      expect(result).not.toContain('real')
    })

    test('should format both nominal and real values when inflation shown', () => {
      const result = formatInflationAdjustedValue(1000, 800, true)
      expect(result).toContain('1.000,00')
      expect(result).toContain('800,00')
      expect(result).toContain('real')
    })

    test('should handle decimal values correctly', () => {
      const result = formatInflationAdjustedValue(1234.56, 987.65, true)
      expect(result).toContain('1.234,56')
      expect(result).toContain('987,65')
      expect(result).toContain('real')
    })

    test('should handle large values correctly', () => {
      const result = formatInflationAdjustedValue(123456.78, 98765.43, true)
      expect(result).toContain('123.456,78')
      expect(result).toContain('98.765,43')
      expect(result).toContain('real')
    })
  })

  describe('integration tests', () => {
    test('should work correctly in a realistic savings scenario', () => {
      // Simulate 15 years of savings with 2% inflation
      const yearlyCapital = {
        2025: 24000, // First year savings
        2030: 150000, // 5 years accumulated
        2035: 300000, // 10 years accumulated
        2040: 500000, // 15 years accumulated
      }

      const result = calculateYearlyInflationAdjustedValues(yearlyCapital, 2025, 0.02)

      // 2025 base year - no adjustment
      expect(result[2025].real).toBe(24000)

      // 2030 - 5 years later with 2% inflation
      expect(result[2030].real).toBeCloseTo(135859.62, 2)

      // 2035 - 10 years later
      expect(result[2035].real).toBeCloseTo(246104.49, 2)

      // 2040 - 15 years later
      expect(result[2040].real).toBeCloseTo(371507.36, 2)
    })

    test('should work correctly in a withdrawal scenario', () => {
      // Simulate 10 years of withdrawals with 3% inflation
      const yearlyWithdrawals = {
        2041: 30000, // Year 1 withdrawal
        2045: 35000, // Year 5 withdrawal
        2050: 40000, // Year 10 withdrawal
      }

      const result = calculateYearlyInflationAdjustedValues(yearlyWithdrawals, 2041, 0.03)

      // Base year - no adjustment
      expect(result[2041].real).toBe(30000)

      // Year 5 - real value reduced by inflation
      expect(result[2045].real).toBeCloseTo(31097.05, 2)

      // Year 10 - further reduction
      expect(result[2050].real).toBeCloseTo(30656.67, 2)
    })
  })
})
