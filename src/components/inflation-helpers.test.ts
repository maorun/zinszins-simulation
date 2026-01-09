import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { calculateRealValue, formatValueWithInflation } from './inflation-helpers'
import * as currencyModule from '../utils/currency'
import * as inflationAdjustmentModule from '../utils/inflation-adjustment'

describe('inflation-helpers', () => {
  describe('calculateRealValue', () => {
    describe('Base year scenarios', () => {
      it('should return nominal value for base year (yearsFromBase = 0)', () => {
        const result = calculateRealValue({
          nominalValue: 100000,
          currentYear: 2023,
          allYears: [2023, 2024, 2025],
          inflationRate: 0.02,
        })
        
        expect(result).toBe(100000)
      })

      it('should return nominal value when current year equals base year', () => {
        const result = calculateRealValue({
          nominalValue: 50000,
          currentYear: 2020,
          allYears: [2020],
          inflationRate: 0.03,
        })
        
        expect(result).toBe(50000)
      })
    })

    describe('Future years with inflation', () => {
      it('should calculate real value for 1 year after base year', () => {
        const result = calculateRealValue({
          nominalValue: 100000,
          currentYear: 2024,
          allYears: [2023, 2024, 2025],
          inflationRate: 0.02,
        })
        
        // 100000 / (1.02^1) = 98039.22
        expect(result).toBeCloseTo(98039.22, 2)
      })

      it('should calculate real value for 5 years after base year', () => {
        const result = calculateRealValue({
          nominalValue: 100000,
          currentYear: 2028,
          allYears: [2023, 2024, 2025],
          inflationRate: 0.02,
        })
        
        // 100000 / (1.02^5) = 90573.08
        expect(result).toBeCloseTo(90573.08, 2)
      })

      it('should calculate real value for 10 years after base year', () => {
        const result = calculateRealValue({
          nominalValue: 100000,
          currentYear: 2033,
          allYears: [2023],
          inflationRate: 0.03,
        })
        
        // 100000 / (1.03^10) = 74409.39
        expect(result).toBeCloseTo(74409.39, 2)
      })

      it('should handle high inflation rate (10%)', () => {
        const result = calculateRealValue({
          nominalValue: 100000,
          currentYear: 2028,
          allYears: [2023],
          inflationRate: 0.10,
        })
        
        // 100000 / (1.10^5) = 62092.13
        expect(result).toBeCloseTo(62092.13, 2)
      })

      it('should handle low inflation rate (0.5%)', () => {
        const result = calculateRealValue({
          nominalValue: 100000,
          currentYear: 2028,
          allYears: [2023],
          inflationRate: 0.005,
        })
        
        // 100000 / (1.005^5) = 97537.07
        expect(result).toBeCloseTo(97537.07, 1)
      })
    })

    describe('Edge cases', () => {
      it('should handle zero inflation rate', () => {
        const result = calculateRealValue({
          nominalValue: 100000,
          currentYear: 2028,
          allYears: [2023],
          inflationRate: 0,
        })
        
        // With 0% inflation, real value equals nominal value
        expect(result).toBe(100000)
      })

      it('should handle zero nominal value', () => {
        const result = calculateRealValue({
          nominalValue: 0,
          currentYear: 2028,
          allYears: [2023],
          inflationRate: 0.02,
        })
        
        expect(result).toBe(0)
      })

      it('should handle negative nominal value', () => {
        const result = calculateRealValue({
          nominalValue: -50000,
          currentYear: 2028,
          allYears: [2023],
          inflationRate: 0.02,
        })
        
        // Negative values should also be adjusted
        expect(result).toBeCloseTo(-45286.54, 2)
      })

      it('should handle empty years array', () => {
        const result = calculateRealValue({
          nominalValue: 100000,
          currentYear: 2023,
          allYears: [],
          inflationRate: 0.02,
        })
        
        // Should use currentYear as base year
        expect(result).toBe(100000)
      })

      it('should filter out null values in years array', () => {
        const result = calculateRealValue({
          nominalValue: 100000,
          currentYear: 2024,
          allYears: [2023, null, 2024, null, 2025],
          inflationRate: 0.02,
        })
        
        // Should use 2023 as base year (earliest valid year)
        expect(result).toBeCloseTo(98039.22, 2)
      })

      it('should filter out undefined values in years array', () => {
        const result = calculateRealValue({
          nominalValue: 100000,
          currentYear: 2024,
          allYears: [2023, undefined, 2024, undefined, 2025],
          inflationRate: 0.02,
        })
        
        // Should use 2023 as base year (earliest valid year)
        expect(result).toBeCloseTo(98039.22, 2)
      })

      it('should find minimum year when years are not sorted', () => {
        const result = calculateRealValue({
          nominalValue: 100000,
          currentYear: 2025,
          allYears: [2025, 2023, 2024, 2022],
          inflationRate: 0.02,
        })
        
        // Should use 2022 as base year (minimum year)
        // Years from base: 2025 - 2022 = 3
        expect(result).toBeCloseTo(94232.23, 1)
      })
    })

    describe('Real-world scenarios', () => {
      it('should calculate purchasing power loss over 20 years at 2% inflation', () => {
        const result = calculateRealValue({
          nominalValue: 100000,
          currentYear: 2043,
          allYears: [2023],
          inflationRate: 0.02,
        })
        
        // After 20 years at 2% inflation
        expect(result).toBeCloseTo(67297.13, 2)
      })

      it('should calculate purchasing power with typical retirement span (30 years)', () => {
        const result = calculateRealValue({
          nominalValue: 500000,
          currentYear: 2053,
          allYears: [2023],
          inflationRate: 0.025,
        })
        
        // After 30 years at 2.5% inflation
        expect(result).toBeCloseTo(238371.34, 1)
      })

      it('should handle scenario with multiple valid years', () => {
        const years = Array.from({ length: 10 }, (_, i) => 2020 + i)
        const result = calculateRealValue({
          nominalValue: 200000,
          currentYear: 2025,
          allYears: years,
          inflationRate: 0.02,
        })
        
        // Base year is 2020, current is 2025 (5 years)
        expect(result).toBeCloseTo(181146.16, 2)
      })
    })
  })

  describe('formatValueWithInflation', () => {
    beforeEach(() => {
      vi.spyOn(currencyModule, 'formatCurrency').mockReturnValue('100.000,00 €')
      vi.spyOn(inflationAdjustmentModule, 'formatInflationAdjustedValue').mockReturnValue(
        '98.039,22 € (100.000,00 €)'
      )
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    describe('Inflation inactive scenarios', () => {
      it('should return formatted nominal value when inflation is not active', () => {
        const result = formatValueWithInflation({
          nominalValue: 100000,
          currentYear: 2024,
          allYears: [2023, 2024, 2025],
          inflationActive: false,
          inflationRatePercent: 2,
        })
        
        expect(result).toBe('100.000,00 €')
        expect(vi.mocked(currencyModule.formatCurrency)).toHaveBeenCalledWith(100000)
        expect(vi.mocked(inflationAdjustmentModule.formatInflationAdjustedValue)).not.toHaveBeenCalled()
      })

      it('should return formatted nominal value when inflation rate is undefined', () => {
        const result = formatValueWithInflation({
          nominalValue: 100000,
          currentYear: 2024,
          allYears: [2023, 2024, 2025],
          inflationActive: true,
          inflationRatePercent: undefined,
        })
        
        expect(result).toBe('100.000,00 €')
        expect(vi.mocked(currencyModule.formatCurrency)).toHaveBeenCalledWith(100000)
        expect(vi.mocked(inflationAdjustmentModule.formatInflationAdjustedValue)).not.toHaveBeenCalled()
      })

      it('should return formatted nominal value when inflation rate is 0', () => {
        const result = formatValueWithInflation({
          nominalValue: 100000,
          currentYear: 2024,
          allYears: [2023, 2024, 2025],
          inflationActive: true,
          inflationRatePercent: 0,
        })
        
        expect(result).toBe('100.000,00 €')
        expect(currencyModule.formatCurrency).toHaveBeenCalledWith(100000)
      })
    })

    describe('Inflation active scenarios', () => {
      it('should calculate and format inflation-adjusted value when active', () => {
        const result = formatValueWithInflation({
          nominalValue: 100000,
          currentYear: 2024,
          allYears: [2023, 2024, 2025],
          inflationActive: true,
          inflationRatePercent: 2,
        })
        
        expect(result).toBe('98.039,22 € (100.000,00 €)')
        expect(currencyModule.formatCurrency).not.toHaveBeenCalled()
        expect(inflationAdjustmentModule.formatInflationAdjustedValue).toHaveBeenCalled()
      })

      it('should pass showIcon parameter when provided', () => {
        formatValueWithInflation({
          nominalValue: 100000,
          currentYear: 2024,
          allYears: [2023, 2024, 2025],
          inflationActive: true,
          inflationRatePercent: 2,
          showIcon: true,
        })
        
        // Verify formatInflationAdjustedValue was called with correct real value
        const calls = vi.mocked(inflationAdjustmentModule.formatInflationAdjustedValue).mock.calls
        expect(calls.length).toBeGreaterThan(0)
        const lastCall = calls[calls.length - 1]
        expect(lastCall[0]).toBe(100000) // nominal value
        expect(lastCall[1]).toBeCloseTo(98039.22, 2) // real value
        expect(lastCall[2]).toBe(true) // showIcon
      })

      it('should default showIcon to false when not provided', () => {
        formatValueWithInflation({
          nominalValue: 100000,
          currentYear: 2024,
          allYears: [2023, 2024, 2025],
          inflationActive: true,
          inflationRatePercent: 2,
        })
        
        const calls = vi.mocked(inflationAdjustmentModule.formatInflationAdjustedValue).mock.calls
        expect(calls.length).toBeGreaterThan(0)
        const lastCall = calls[calls.length - 1]
        expect(lastCall[2]).toBe(false) // showIcon defaults to false
      })

      it('should handle high inflation rate percentage', () => {
        formatValueWithInflation({
          nominalValue: 100000,
          currentYear: 2028,
          allYears: [2023],
          inflationActive: true,
          inflationRatePercent: 10,
        })
        
        const calls = vi.mocked(inflationAdjustmentModule.formatInflationAdjustedValue).mock.calls
        const lastCall = calls[calls.length - 1]
        // Real value should be significantly lower with 10% inflation over 5 years
        expect(lastCall[1]).toBeCloseTo(62092.13, 2)
      })

      it('should handle low inflation rate percentage', () => {
        formatValueWithInflation({
          nominalValue: 100000,
          currentYear: 2028,
          allYears: [2023],
          inflationActive: true,
          inflationRatePercent: 0.5,
        })
        
        const calls = vi.mocked(inflationAdjustmentModule.formatInflationAdjustedValue).mock.calls
        const lastCall = calls[calls.length - 1]
        // Real value should be close to nominal with low inflation
        expect(lastCall[1]).toBeCloseTo(97537.07, 1)
      })
    })

    describe('Edge cases', () => {
      it('should handle zero nominal value with inflation active', () => {
        formatValueWithInflation({
          nominalValue: 0,
          currentYear: 2024,
          allYears: [2023, 2024, 2025],
          inflationActive: true,
          inflationRatePercent: 2,
        })
        
        const calls = vi.mocked(inflationAdjustmentModule.formatInflationAdjustedValue).mock.calls
        const lastCall = calls[calls.length - 1]
        expect(lastCall[0]).toBe(0)
        expect(lastCall[1]).toBe(0)
      })

      it('should handle negative nominal value with inflation active', () => {
        formatValueWithInflation({
          nominalValue: -50000,
          currentYear: 2028,
          allYears: [2023],
          inflationActive: true,
          inflationRatePercent: 2,
        })
        
        const calls = vi.mocked(inflationAdjustmentModule.formatInflationAdjustedValue).mock.calls
        const lastCall = calls[calls.length - 1]
        expect(lastCall[0]).toBe(-50000)
        expect(lastCall[1]).toBeCloseTo(-45286.54, 2)
      })

      it('should handle empty years array with inflation active', () => {
        formatValueWithInflation({
          nominalValue: 100000,
          currentYear: 2023,
          allYears: [],
          inflationActive: true,
          inflationRatePercent: 2,
        })
        
        const calls = vi.mocked(inflationAdjustmentModule.formatInflationAdjustedValue).mock.calls
        const lastCall = calls[calls.length - 1]
        // Should use currentYear as base year, so real = nominal
        expect(lastCall[1]).toBe(100000)
      })

      it('should handle years array with null and undefined values', () => {
        formatValueWithInflation({
          nominalValue: 100000,
          currentYear: 2024,
          allYears: [null, 2023, undefined, 2024, null, 2025],
          inflationActive: true,
          inflationRatePercent: 2,
        })
        
        const calls = vi.mocked(inflationAdjustmentModule.formatInflationAdjustedValue).mock.calls
        const lastCall = calls[calls.length - 1]
        expect(lastCall[1]).toBeCloseTo(98039.22, 2)
      })
    })

    describe('Integration scenarios', () => {
      it('should work correctly for base year (no adjustment needed)', () => {
        formatValueWithInflation({
          nominalValue: 100000,
          currentYear: 2023,
          allYears: [2023, 2024, 2025],
          inflationActive: true,
          inflationRatePercent: 2,
        })
        
        const calls = vi.mocked(inflationAdjustmentModule.formatInflationAdjustedValue).mock.calls
        const lastCall = calls[calls.length - 1]
        // Base year: real value equals nominal value
        expect(lastCall[1]).toBe(100000)
      })

      it('should handle typical retirement scenario', () => {
        formatValueWithInflation({
          nominalValue: 500000,
          currentYear: 2053,
          allYears: Array.from({ length: 30 }, (_, i) => 2023 + i),
          inflationActive: true,
          inflationRatePercent: 2.5,
        })
        
        const calls = vi.mocked(inflationAdjustmentModule.formatInflationAdjustedValue).mock.calls
        const lastCall = calls[calls.length - 1]
        // After 30 years at 2.5% inflation
        expect(lastCall[1]).toBeCloseTo(238371.34, 1)
      })
    })
  })
})
