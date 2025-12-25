import { describe, it, expect } from 'vitest'
import {
  getRuerupDeductibilityLimits,
  calculateRuerupTaxDeduction,
  getRuerupPensionTaxablePercentage,
  calculateRuerupPensionTaxation,
  createDefaultRuerupConfig,
} from './ruerup-rente'

describe('Rürup-Rente Helper Functions', () => {
  describe('getRuerupDeductibilityLimits', () => {
    it('should return correct limits for 2024', () => {
      const limits = getRuerupDeductibilityLimits(2024)
      
      expect(limits.maxAmountSingle).toBe(27566)
      expect(limits.maxAmountMarried).toBe(55132)
      expect(limits.deductiblePercentage).toBe(0.98) // 98% in 2024, 100% from 2025
    })

    it('should return 100% deductibility for 2025 and later', () => {
      const limits2025 = getRuerupDeductibilityLimits(2025)
      expect(limits2025.deductiblePercentage).toBe(1.0)

      const limits2030 = getRuerupDeductibilityLimits(2030)
      expect(limits2030.deductiblePercentage).toBe(1.0)
    })

    it('should return progressive deductibility for years 2012-2024', () => {
      const limits2012 = getRuerupDeductibilityLimits(2012)
      expect(limits2012.deductiblePercentage).toBe(0.74)

      const limits2015 = getRuerupDeductibilityLimits(2015)
      expect(limits2015.deductiblePercentage).toBe(0.80) // 74% + 6%

      const limits2020 = getRuerupDeductibilityLimits(2020)
      expect(limits2020.deductiblePercentage).toBe(0.90) // 74% + 16%
    })

    it('should handle years before 2012', () => {
      const limits2010 = getRuerupDeductibilityLimits(2010)
      expect(limits2010.deductiblePercentage).toBe(0.74)
    })

    it('should increase limits for future years with inflation adjustment', () => {
      const limits2024 = getRuerupDeductibilityLimits(2024)
      const limits2026 = getRuerupDeductibilityLimits(2026)

      expect(limits2026.maxAmountSingle).toBeGreaterThan(limits2024.maxAmountSingle)
      expect(limits2026.maxAmountMarried).toBeGreaterThan(limits2024.maxAmountMarried)
    })

    it('should maintain married limits as double of single limits', () => {
      const years = [2020, 2024, 2025, 2030]
      
      years.forEach(year => {
        const limits = getRuerupDeductibilityLimits(year)
        expect(limits.maxAmountMarried).toBe(limits.maxAmountSingle * 2)
      })
    })
  })

  describe('calculateRuerupTaxDeduction', () => {
    it('should calculate full deduction for contribution below limit in 2025', () => {
      const result = calculateRuerupTaxDeduction(20000, 2025, 'single', 0.42)

      expect(result.contribution).toBe(20000)
      expect(result.deductiblePercentage).toBe(1.0)
      expect(result.deductibleAmount).toBe(20000)
      expect(result.estimatedTaxSavings).toBe(8400) // 20000 * 0.42
    })

    it('should limit deduction to maximum for high contributions in 2024', () => {
      const result = calculateRuerupTaxDeduction(30000, 2024, 'single', 0.42)
      const limits = getRuerupDeductibilityLimits(2024)

      expect(result.deductibleAmount).toBe(limits.maxAmountSingle)
      expect(result.deductibleAmount).toBeLessThan(30000)
    })

    it('should apply deductible percentage for partial deductibility years', () => {
      const result = calculateRuerupTaxDeduction(20000, 2020, 'single', 0.35)

      expect(result.deductiblePercentage).toBe(0.90) // 90% in 2020
      expect(result.deductibleAmount).toBe(18000) // 20000 * 0.90
      expect(result.estimatedTaxSavings).toBe(6300) // 18000 * 0.35
    })

    it('should use higher limits for married couples', () => {
      const singleResult = calculateRuerupTaxDeduction(30000, 2025, 'single', 0.42)
      const marriedResult = calculateRuerupTaxDeduction(30000, 2025, 'married', 0.42)

      expect(marriedResult.maxDeductible).toBeGreaterThan(singleResult.maxDeductible)
      expect(marriedResult.deductibleAmount).toBe(30000) // Fully deductible for married
    })

    it('should handle zero contribution', () => {
      const result = calculateRuerupTaxDeduction(0, 2024, 'single', 0.42)

      expect(result.contribution).toBe(0)
      expect(result.deductibleAmount).toBe(0)
      expect(result.estimatedTaxSavings).toBe(0)
    })

    it('should correctly estimate tax savings for different tax rates', () => {
      const lowTaxResult = calculateRuerupTaxDeduction(20000, 2025, 'single', 0.20)
      const highTaxResult = calculateRuerupTaxDeduction(20000, 2025, 'single', 0.45)

      expect(lowTaxResult.estimatedTaxSavings).toBe(4000) // 20000 * 0.20
      expect(highTaxResult.estimatedTaxSavings).toBe(9000) // 20000 * 0.45
    })

    it('should handle maximum contribution for married couple in 2024', () => {
      const result = calculateRuerupTaxDeduction(55132, 2024, 'married', 0.42)

      // 2024 has 98% deductibility
      expect(result.deductibleAmount).toBeCloseTo(54029.36, 2) // 55132 * 0.98
      expect(result.estimatedTaxSavings).toBeCloseTo(22692.33, 2) // 54029.36 * 0.42
    })
  })

  describe('getRuerupPensionTaxablePercentage', () => {
    it('should return 50% for retirement in 2005 or earlier', () => {
      expect(getRuerupPensionTaxablePercentage(2000)).toBe(0.50)
      expect(getRuerupPensionTaxablePercentage(2005)).toBe(0.50)
    })

    it('should return 100% for retirement in 2040 or later', () => {
      expect(getRuerupPensionTaxablePercentage(2040)).toBe(1.0)
      expect(getRuerupPensionTaxablePercentage(2050)).toBe(1.0)
    })

    it('should increase by 2% per year from 2006 to 2020', () => {
      expect(getRuerupPensionTaxablePercentage(2006)).toBe(0.52) // 50% + 2%
      expect(getRuerupPensionTaxablePercentage(2010)).toBe(0.60) // 50% + 10%
      expect(getRuerupPensionTaxablePercentage(2020)).toBe(0.80) // 50% + 30%
    })

    it('should increase by 1% per year from 2021 to 2039', () => {
      expect(getRuerupPensionTaxablePercentage(2021)).toBe(0.81) // Base 81%
      expect(getRuerupPensionTaxablePercentage(2025)).toBeCloseTo(0.85, 10) // 81% + 4%
      expect(getRuerupPensionTaxablePercentage(2030)).toBeCloseTo(0.90, 10) // 81% + 9%
      expect(getRuerupPensionTaxablePercentage(2039)).toBeCloseTo(0.99, 10) // 81% + 18%
    })

    it('should handle transition year 2020 correctly', () => {
      const percentage2020 = getRuerupPensionTaxablePercentage(2020)
      const percentage2021 = getRuerupPensionTaxablePercentage(2021)

      expect(percentage2020).toBe(0.80)
      expect(percentage2021).toBe(0.81)
    })
  })

  describe('calculateRuerupPensionTaxation', () => {
    it('should calculate taxation for first year of retirement', () => {
      const result = calculateRuerupPensionTaxation(2000, 2030, 2030, 0.01, 0.25)

      expect(result.grossMonthlyPension).toBe(2000)
      expect(result.grossAnnualPension).toBe(24000)
      expect(result.taxablePercentage).toBe(0.90) // 2030 retirement
      expect(result.taxableAmount).toBe(21600) // 24000 * 0.90
      expect(result.incomeTax).toBe(5400) // 21600 * 0.25
      expect(result.netAnnualPension).toBe(18600) // 24000 - 5400
    })

    it('should apply pension increase for years after retirement', () => {
      const result = calculateRuerupPensionTaxation(2000, 2030, 2035, 0.02, 0.25)

      // 5 years after retirement with 2% annual increase
      const expectedFactor = Math.pow(1.02, 5)
      const expectedMonthly = 2000 * expectedFactor
      
      expect(result.grossMonthlyPension).toBeCloseTo(expectedMonthly, 2)
      expect(result.grossAnnualPension).toBeCloseTo(expectedMonthly * 12, 2)
    })

    it('should calculate zero tax for zero pension', () => {
      const result = calculateRuerupPensionTaxation(0, 2030, 2030, 0.01, 0.25)

      expect(result.grossAnnualPension).toBe(0)
      expect(result.taxableAmount).toBe(0)
      expect(result.incomeTax).toBe(0)
      expect(result.netAnnualPension).toBe(0)
    })

    it('should correctly apply different taxable percentages', () => {
      // Early retirement (2020): 80% taxable
      const result2020 = calculateRuerupPensionTaxation(2000, 2020, 2020, 0.01, 0.30)
      expect(result2020.taxablePercentage).toBe(0.80)
      expect(result2020.taxableAmount).toBe(19200) // 24000 * 0.80

      // Late retirement (2040): 100% taxable
      const result2040 = calculateRuerupPensionTaxation(2000, 2040, 2040, 0.01, 0.30)
      expect(result2040.taxablePercentage).toBe(1.0)
      expect(result2040.taxableAmount).toBe(24000) // 24000 * 1.0
    })

    it('should handle different tax rates correctly', () => {
      const lowTaxResult = calculateRuerupPensionTaxation(2000, 2030, 2030, 0.01, 0.15)
      const highTaxResult = calculateRuerupPensionTaxation(2000, 2030, 2030, 0.01, 0.42)

      expect(lowTaxResult.incomeTax).toBe(3240) // 21600 * 0.15
      expect(highTaxResult.incomeTax).toBe(9072) // 21600 * 0.42
    })

    it('should compound pension increases correctly over multiple years', () => {
      const result = calculateRuerupPensionTaxation(1000, 2025, 2035, 0.03, 0.25)

      // 10 years with 3% annual increase
      const expectedFactor = Math.pow(1.03, 10)
      const expectedMonthly = 1000 * expectedFactor

      expect(result.grossMonthlyPension).toBeCloseTo(expectedMonthly, 2)
      expect(result.grossMonthlyPension).toBeCloseTo(1343.92, 2)
    })

    it('should not apply increase for retirement year (0 years since retirement)', () => {
      const result = calculateRuerupPensionTaxation(2000, 2030, 2030, 0.05, 0.25)

      expect(result.grossMonthlyPension).toBe(2000)
      expect(result.grossAnnualPension).toBe(24000)
    })
  })

  describe('createDefaultRuerupConfig', () => {
    it('should create a valid default configuration', () => {
      const config = createDefaultRuerupConfig()

      expect(config.enabled).toBe(false)
      expect(config.annualContribution).toBeGreaterThan(0)
      expect(config.pensionStartYear).toBeGreaterThan(2024)
      expect(config.expectedMonthlyPension).toBeGreaterThan(0)
      expect(config.civilStatus).toBe('single')
      expect(config.pensionIncreaseRate).toBeGreaterThanOrEqual(0)
    })

    it('should have reasonable default values', () => {
      const config = createDefaultRuerupConfig()

      expect(config.annualContribution).toBe(10000)
      expect(config.pensionStartYear).toBe(2040)
      expect(config.expectedMonthlyPension).toBe(1500)
      expect(config.pensionIncreaseRate).toBe(0.01)
    })

    it('should be a complete RuerupRenteConfig object', () => {
      const config = createDefaultRuerupConfig()

      expect(config).toHaveProperty('enabled')
      expect(config).toHaveProperty('annualContribution')
      expect(config).toHaveProperty('pensionStartYear')
      expect(config).toHaveProperty('expectedMonthlyPension')
      expect(config).toHaveProperty('civilStatus')
      expect(config).toHaveProperty('pensionIncreaseRate')
    })
  })

  describe('Integration Tests', () => {
    it('should handle a complete contribution and payout lifecycle', () => {
      // Contribution phase
      const contributionResult = calculateRuerupTaxDeduction(15000, 2025, 'single', 0.35)
      
      expect(contributionResult.deductibleAmount).toBe(15000)
      expect(contributionResult.estimatedTaxSavings).toBe(5250) // 15000 * 0.35

      // Payout phase - retirement in 2045
      const payoutResult = calculateRuerupPensionTaxation(1200, 2045, 2045, 0.015, 0.20)
      
      expect(payoutResult.grossAnnualPension).toBe(14400)
      expect(payoutResult.taxablePercentage).toBe(1.0) // 100% taxable in 2045
      expect(payoutResult.netAnnualPension).toBe(11520) // After 20% tax
    })

    it('should demonstrate tax advantage for high earners', () => {
      // High earner contributes maximum in 2025
      const limits = getRuerupDeductibilityLimits(2025)
      const contribution = limits.maxAmountSingle
      
      const highTaxResult = calculateRuerupTaxDeduction(contribution, 2025, 'single', 0.42)
      
      // Tax savings during contribution phase
      expect(highTaxResult.estimatedTaxSavings).toBeGreaterThan(10000)
      
      // Even with 100% taxation in retirement, effective tax rate is usually lower
      const retirementTaxRate = 0.25 // Lower in retirement
      const monthlyPension = 2500
      const payoutResult = calculateRuerupPensionTaxation(monthlyPension, 2045, 2045, 0.01, retirementTaxRate)
      
      // Net benefit exists due to tax rate differential
      const contributionTaxRate = 0.42
      const retirementEffectiveRate = payoutResult.incomeTax / payoutResult.grossAnnualPension
      
      expect(retirementEffectiveRate).toBeLessThan(contributionTaxRate)
    })

    it('should calculate correctly for married couple with high contributions', () => {
      const contribution = 50000
      const result = calculateRuerupTaxDeduction(contribution, 2025, 'married', 0.38)

      expect(result.deductibleAmount).toBe(50000)
      expect(result.estimatedTaxSavings).toBe(19000) // 50000 * 0.38

      // Verify they can contribute more than single
      const singleResult = calculateRuerupTaxDeduction(50000, 2025, 'single', 0.38)
      expect(result.maxDeductible).toBeGreaterThan(singleResult.maxDeductible)
    })

    it('should show increasing taxation burden for later retirement', () => {
      const monthlyPension = 2000
      const taxRate = 0.25

      const early2020 = calculateRuerupPensionTaxation(monthlyPension, 2020, 2020, 0.01, taxRate)
      const mid2030 = calculateRuerupPensionTaxation(monthlyPension, 2030, 2030, 0.01, taxRate)
      const late2040 = calculateRuerupPensionTaxation(monthlyPension, 2040, 2040, 0.01, taxRate)

      // Later retirement = higher taxable percentage = more tax
      expect(early2020.taxablePercentage).toBe(0.80)
      expect(mid2030.taxablePercentage).toBe(0.90)
      expect(late2040.taxablePercentage).toBe(1.0)

      expect(early2020.incomeTax).toBeLessThan(mid2030.incomeTax)
      expect(mid2030.incomeTax).toBeLessThan(late2040.incomeTax)
    })
  })
})
