import { describe, it, expect } from 'vitest'
import {
  StatutoryPensionConfig,
  calculateStatutoryPensionForYear,
  calculateStatutoryPension,
  createDefaultStatutoryPensionConfig,
  calculatePensionStartYear,
  estimateMonthlyPensionFromTaxReturn,
  estimateTaxablePercentageFromTaxReturn,
} from './statutory-pension'

describe('statutory-pension', () => {
  describe('createDefaultStatutoryPensionConfig', () => {
    it('should create a default configuration', () => {
      const config = createDefaultStatutoryPensionConfig()

      expect(config.enabled).toBe(true)
      expect(config.startYear).toBe(2041)
      expect(config.monthlyAmount).toBe(1500)
      expect(config.annualIncreaseRate).toBe(1.0)
      expect(config.taxablePercentage).toBe(80)
      expect(config.retirementAge).toBe(67)
    })
  })

  describe('calculatePensionStartYear', () => {
    it('should calculate start year from birth year and retirement age', () => {
      expect(calculatePensionStartYear(1974)).toBe(2041) // 1974 + 67 = 2041
      expect(calculatePensionStartYear(1980, 65)).toBe(2045) // 1980 + 65 = 2045
    })
  })

  describe('estimateMonthlyPensionFromTaxReturn', () => {
    it('should calculate monthly pension from annual amount', () => {
      const taxReturnData = {
        taxYear: 2023,
        annualPensionReceived: 18000,
        taxablePortion: 14400,
      }

      expect(estimateMonthlyPensionFromTaxReturn(taxReturnData)).toBe(1500)
    })
  })

  describe('estimateTaxablePercentageFromTaxReturn', () => {
    it('should calculate taxable percentage from tax return data', () => {
      const taxReturnData = {
        taxYear: 2023,
        annualPensionReceived: 18000,
        taxablePortion: 14400,
      }

      expect(estimateTaxablePercentageFromTaxReturn(taxReturnData)).toBe(80)
    })

    it('should return default percentage when annual pension is zero', () => {
      const taxReturnData = {
        taxYear: 2023,
        annualPensionReceived: 0,
        taxablePortion: 0,
      }

      expect(estimateTaxablePercentageFromTaxReturn(taxReturnData)).toBe(80)
    })
  })

  describe('calculateStatutoryPensionForYear', () => {
    const baseConfig: StatutoryPensionConfig = {
      enabled: true,
      startYear: 2041,
      monthlyAmount: 1500,
      annualIncreaseRate: 1.0,
      taxablePercentage: 80,
    }

    it('should return zero values when pension is disabled', () => {
      const config = { ...baseConfig, enabled: false }
      const result = calculateStatutoryPensionForYear(config, 2041)

      expect(result.grossAnnualAmount).toBe(0)
      expect(result.grossMonthlyAmount).toBe(0)
      expect(result.taxableAmount).toBe(0)
      expect(result.incomeTax).toBe(0)
      expect(result.netAnnualAmount).toBe(0)
    })

    it('should return zero values before start year', () => {
      const result = calculateStatutoryPensionForYear(baseConfig, 2040)

      expect(result.grossAnnualAmount).toBe(0)
      expect(result.grossMonthlyAmount).toBe(0)
      expect(result.taxableAmount).toBe(0)
      expect(result.incomeTax).toBe(0)
      expect(result.netAnnualAmount).toBe(0)
    })

    it('should calculate pension for the start year without increases', () => {
      const result = calculateStatutoryPensionForYear(baseConfig, 2041)

      expect(result.grossAnnualAmount).toBe(18000) // 1500 * 12
      expect(result.grossMonthlyAmount).toBe(1500)
      expect(result.taxableAmount).toBe(14400) // 18000 * 0.8
      expect(result.incomeTax).toBe(0) // No income tax rate provided
      expect(result.netAnnualAmount).toBe(18000)
      expect(result.adjustmentFactor).toBe(1)
    })

    it('should apply annual increases correctly', () => {
      const result = calculateStatutoryPensionForYear(baseConfig, 2043) // 2 years after start

      const expectedAdjustment = Math.pow(1.01, 2) // 1.01^2 = 1.0201
      const expectedMonthly = 1500 * expectedAdjustment // ~1530.15
      const expectedAnnual = expectedMonthly * 12 // ~18361.8

      expect(result.grossAnnualAmount).toBeCloseTo(expectedAnnual, 2)
      expect(result.grossMonthlyAmount).toBeCloseTo(expectedMonthly, 2)
      expect(result.taxableAmount).toBeCloseTo(expectedAnnual * 0.8, 2)
      expect(result.adjustmentFactor).toBeCloseTo(expectedAdjustment, 4)
    })

    it('should calculate income tax correctly', () => {
      const incomeTaxRate = 25 // 25%
      const grundfreibetrag = 10000 // €10,000 basic allowance

      const result = calculateStatutoryPensionForYear(baseConfig, 2041, incomeTaxRate, grundfreibetrag)

      const taxableAmount = 14400 // 18000 * 0.8
      const taxableAboveAllowance = taxableAmount - grundfreibetrag // 14400 - 10000 = 4400
      const expectedTax = taxableAboveAllowance * 0.25 // 4400 * 0.25 = 1100

      expect(result.incomeTax).toBe(expectedTax)
      expect(result.netAnnualAmount).toBe(18000 - expectedTax) // 18000 - 1100 = 16900
    })

    it('should not apply tax when taxable amount is below grundfreibetrag', () => {
      const incomeTaxRate = 25
      const grundfreibetrag = 20000 // Higher than taxable amount

      const result = calculateStatutoryPensionForYear(baseConfig, 2041, incomeTaxRate, grundfreibetrag)

      expect(result.incomeTax).toBe(0)
      expect(result.netAnnualAmount).toBe(18000)
    })
  })

  describe('calculateStatutoryPension', () => {
    const baseConfig: StatutoryPensionConfig = {
      enabled: true,
      startYear: 2041,
      monthlyAmount: 1500,
      annualIncreaseRate: 1.0,
      taxablePercentage: 80,
    }

    it('should calculate pension for multiple years', () => {
      const result = calculateStatutoryPension(baseConfig, 2040, 2043)

      expect(Object.keys(result)).toHaveLength(4)
      expect(result[2040].grossAnnualAmount).toBe(0) // Before start year
      expect(result[2041].grossAnnualAmount).toBe(18000) // Start year
      expect(result[2042].grossAnnualAmount).toBeCloseTo(18180, 2) // 1% increase
      expect(result[2043].grossAnnualAmount).toBeCloseTo(18361.8, 2) // 2% total increase
    })

    it('should apply different grundfreibetrag per year', () => {
      const grundfreibetragPerYear = {
        2041: 10000,
        2042: 10500,
        2043: 11000,
      }
      const incomeTaxRate = 25

      const result = calculateStatutoryPension(
        baseConfig,
        2041,
        2043,
        incomeTaxRate,
        grundfreibetragPerYear,
      )

      // 2041: taxable 14400, above allowance 4400, tax 1100
      expect(result[2041].incomeTax).toBe(1100)

      // 2042: taxable ~14544, above allowance ~4044, tax ~1011
      expect(result[2042].incomeTax).toBeCloseTo(1011, 0)

      // 2043: taxable ~14690, above allowance ~3690, tax ~922.5
      expect(result[2043].incomeTax).toBeCloseTo(922.5, 0)
    })

    it('should handle disabled pension correctly', () => {
      const config = { ...baseConfig, enabled: false }
      const result = calculateStatutoryPension(config, 2041, 2043)

      Object.values(result).forEach((yearResult) => {
        expect(yearResult.grossAnnualAmount).toBe(0)
        expect(yearResult.netAnnualAmount).toBe(0)
      })
    })
  })

  describe('integration with tax return data', () => {
    it('should work with complete tax return configuration', () => {
      const config: StatutoryPensionConfig = {
        enabled: true,
        startYear: 2041,
        monthlyAmount: 1600, // Will be overridden by tax return data
        annualIncreaseRate: 1.2,
        taxablePercentage: 75, // Will be overridden by tax return data
        birthYear: 1974,
        retirementAge: 67,
        taxReturnData: {
          taxYear: 2023,
          annualPensionReceived: 19200,
          taxablePortion: 15360,
        },
      }

      // Estimate values from tax return
      const estimatedMonthly = estimateMonthlyPensionFromTaxReturn(config.taxReturnData!)
      const estimatedTaxablePercentage = estimateTaxablePercentageFromTaxReturn(config.taxReturnData!)

      expect(estimatedMonthly).toBe(1600)
      expect(estimatedTaxablePercentage).toBe(80)

      // Use estimated values in calculation
      const adjustedConfig = {
        ...config,
        monthlyAmount: estimatedMonthly,
        taxablePercentage: estimatedTaxablePercentage,
      }

      const result = calculateStatutoryPensionForYear(adjustedConfig, 2041)
      expect(result.grossAnnualAmount).toBe(19200)
      expect(result.taxableAmount).toBe(15360)
    })
  })
})
