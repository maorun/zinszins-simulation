import { describe, it, expect } from 'vitest'
import {
  calculateBusinessSaleExemption,
  calculateIncomeTax,
  calculateTaxWithFifthRule,
  calculateBusinessSaleTax,
  compareBusinessSaleTaxMethods,
  calculateOptimalSaleTiming,
  calculateReinvestmentStrategy,
  BUSINESS_SALE_EXEMPTION,
} from './business-sale'

describe('business-sale', () => {
  describe('calculateBusinessSaleExemption', () => {
    it('should return 0 exemption for seller under 55', () => {
      const exemption = calculateBusinessSaleExemption(200000, 50, false)
      expect(exemption).toBe(0)
    })

    it('should return full exemption for seller aged 55+ with gain below threshold', () => {
      const exemption = calculateBusinessSaleExemption(100000, 55, false)
      expect(exemption).toBe(BUSINESS_SALE_EXEMPTION.FULL_EXEMPTION)
    })

    it('should cap exemption at capital gain if gain is less than full exemption', () => {
      const exemption = calculateBusinessSaleExemption(30000, 60, false)
      expect(exemption).toBe(30000)
    })

    it('should apply full exemption for permanently disabled regardless of age', () => {
      const exemption = calculateBusinessSaleExemption(100000, 30, true)
      expect(exemption).toBe(BUSINESS_SALE_EXEMPTION.FULL_EXEMPTION)
    })

    it('should reduce exemption for gains above reduction threshold', () => {
      // Gain of 150,000€: 14,000€ above threshold
      // Exemption = 45,000€ - 14,000€ = 31,000€
      const exemption = calculateBusinessSaleExemption(150000, 55, false)
      expect(exemption).toBe(31000)
    })

    it('should return 0 exemption for gains above full phaseout threshold', () => {
      const exemption = calculateBusinessSaleExemption(200000, 55, false)
      expect(exemption).toBe(0)
    })

    it('should handle edge case at exact reduction threshold', () => {
      const exemption = calculateBusinessSaleExemption(
        BUSINESS_SALE_EXEMPTION.REDUCTION_THRESHOLD,
        55,
        false,
      )
      expect(exemption).toBe(BUSINESS_SALE_EXEMPTION.FULL_EXEMPTION)
    })

    it('should handle edge case at exact phaseout threshold', () => {
      const exemption = calculateBusinessSaleExemption(
        BUSINESS_SALE_EXEMPTION.FULL_PHASEOUT,
        55,
        false,
      )
      expect(exemption).toBe(0)
    })
  })

  describe('calculateIncomeTax', () => {
    it('should return 0 for income below Grundfreibetrag', () => {
      const tax = calculateIncomeTax(10000)
      expect(tax).toBe(0)
    })

    it('should calculate tax for income in entry zone', () => {
      const tax = calculateIncomeTax(15000)
      expect(tax).toBeGreaterThan(0)
      expect(tax).toBeLessThan(15000 * 0.14) // Should be less than max rate
    })

    it('should calculate tax for middle income', () => {
      const tax = calculateIncomeTax(50000)
      expect(tax).toBeGreaterThan(0)
      expect(tax).toBeLessThan(50000 * 0.24)
    })

    it('should calculate tax for high income', () => {
      const tax = calculateIncomeTax(100000)
      expect(tax).toBeGreaterThan(0)
      expect(tax).toBeLessThan(100000 * 0.42)
    })

    it('should apply Reichensteuer for very high income', () => {
      const tax = calculateIncomeTax(300000)
      expect(tax).toBeGreaterThan(0)
      expect(tax).toBeLessThan(300000 * 0.45)
    })

    it('should return 0 for zero income', () => {
      const tax = calculateIncomeTax(0)
      expect(tax).toBe(0)
    })

    it('should return 0 for negative income', () => {
      const tax = calculateIncomeTax(-10000)
      expect(tax).toBe(0)
    })
  })

  describe('calculateTaxWithFifthRule', () => {
    it('should reduce tax burden compared to normal taxation', () => {
      const taxableGain = 200000
      const otherIncome = 50000

      const taxWithFifthRule = calculateTaxWithFifthRule(taxableGain, otherIncome)
      const normalTax =
        calculateIncomeTax(otherIncome + taxableGain) - calculateIncomeTax(otherIncome)

      expect(taxWithFifthRule).toBeLessThan(normalTax)
      expect(taxWithFifthRule).toBeGreaterThan(0)
    })

    it('should handle zero other income', () => {
      const taxWithFifthRule = calculateTaxWithFifthRule(100000, 0)
      expect(taxWithFifthRule).toBeGreaterThan(0)
    })

    it('should correctly split gain into fifths', () => {
      const taxableGain = 100000
      const otherIncome = 30000

      const oneFifth = taxableGain / 5
      const taxDiff = calculateIncomeTax(otherIncome + oneFifth) - calculateIncomeTax(otherIncome)
      const expectedTax = taxDiff * 5

      const actualTax = calculateTaxWithFifthRule(taxableGain, otherIncome)
      expect(actualTax).toBeCloseTo(expectedTax, 0)
    })
  })

  describe('calculateBusinessSaleTax', () => {
    it('should calculate complete tax for simple sale', () => {
      const config = {
        salePrice: 500000,
        bookValue: 200000,
        sellerAge: 60,
        otherIncome: 50000,
        applyFifthRule: true,
      }

      const result = calculateBusinessSaleTax(config)

      expect(result.capitalGain).toBe(300000)
      expect(result.exemptionAmount).toBe(0) // No exemption - gain exceeds 181,000€ phaseout
      expect(result.taxableGain).toBe(300000)
      expect(result.incomeTax).toBeGreaterThan(0)
      expect(result.solidaritySurcharge).toBeCloseTo(result.incomeTax * 0.055, 2)
      expect(result.totalTax).toBe(result.incomeTax + result.solidaritySurcharge)
      expect(result.netProceeds).toBe(config.salePrice - result.totalTax)
      expect(result.fifthRuleApplied).toBe(true)
      expect(result.fifthRuleSavings).toBeGreaterThan(0)
    })

    it('should apply full exemption for moderate gains', () => {
      const config = {
        salePrice: 200000,
        bookValue: 100000,
        sellerAge: 60,
        otherIncome: 40000,
        applyFifthRule: true,
      }

      const result = calculateBusinessSaleTax(config)

      expect(result.capitalGain).toBe(100000)
      expect(result.exemptionAmount).toBe(45000) // Full exemption - gain below 136,000€
      expect(result.taxableGain).toBe(55000)
    })

    it('should handle sale by seller under 55 (no exemption)', () => {
      const config = {
        salePrice: 300000,
        bookValue: 100000,
        sellerAge: 50,
        otherIncome: 40000,
        applyFifthRule: true,
      }

      const result = calculateBusinessSaleTax(config)

      expect(result.capitalGain).toBe(200000)
      expect(result.exemptionAmount).toBe(0)
      expect(result.taxableGain).toBe(200000)
      expect(result.totalTax).toBeGreaterThan(0)
    })

    it('should handle permanently disabled seller under 55', () => {
      const config = {
        salePrice: 180000,
        bookValue: 100000,
        sellerAge: 45,
        permanentlyDisabled: true,
        otherIncome: 30000,
        applyFifthRule: true,
      }

      const result = calculateBusinessSaleTax(config)

      expect(result.capitalGain).toBe(80000)
      expect(result.exemptionAmount).toBe(45000) // Full exemption due to disability, gain below threshold
      expect(result.taxableGain).toBe(35000)
    })

    it('should calculate tax without fifth rule when disabled', () => {
      const config = {
        salePrice: 500000,
        bookValue: 200000,
        sellerAge: 60,
        otherIncome: 50000,
        applyFifthRule: false,
      }

      const result = calculateBusinessSaleTax(config)

      expect(result.fifthRuleApplied).toBe(false)
      expect(result.fifthRuleSavings).toBeUndefined()
    })

    it('should handle sale with no capital gain', () => {
      const config = {
        salePrice: 100000,
        bookValue: 100000,
        sellerAge: 60,
      }

      const result = calculateBusinessSaleTax(config)

      expect(result.capitalGain).toBe(0)
      expect(result.exemptionAmount).toBe(0)
      expect(result.taxableGain).toBe(0)
      expect(result.incomeTax).toBe(0)
      expect(result.totalTax).toBe(0)
      expect(result.effectiveTaxRate).toBe(0)
    })

    it('should handle sale with loss (book value > sale price)', () => {
      const config = {
        salePrice: 100000,
        bookValue: 150000,
        sellerAge: 60,
      }

      const result = calculateBusinessSaleTax(config)

      expect(result.capitalGain).toBe(0)
      expect(result.totalTax).toBe(0)
    })

    it('should default to applying fifth rule when not specified', () => {
      const config = {
        salePrice: 500000,
        bookValue: 200000,
        sellerAge: 60,
        otherIncome: 50000,
      }

      const result = calculateBusinessSaleTax(config)

      expect(result.fifthRuleApplied).toBe(true)
    })

    it('should handle high capital gains with reduced exemption', () => {
      const config = {
        salePrice: 1000000,
        bookValue: 800000,
        sellerAge: 60,
        otherIncome: 60000,
        applyFifthRule: true,
      }

      const result = calculateBusinessSaleTax(config)

      expect(result.capitalGain).toBe(200000)
      // Exemption should be 0 (gain exceeds phaseout threshold of 181,000€)
      expect(result.exemptionAmount).toBe(0)
      expect(result.taxableGain).toBe(200000)
    })
  })

  describe('compareBusinessSaleTaxMethods', () => {
    it('should show fifth rule provides tax savings', () => {
      const config = {
        salePrice: 500000,
        bookValue: 200000,
        sellerAge: 60,
        otherIncome: 50000,
      }

      const comparison = compareBusinessSaleTaxMethods(config)

      expect(comparison.withFifthRule.fifthRuleApplied).toBe(true)
      expect(comparison.withoutFifthRule.fifthRuleApplied).toBe(false)
      expect(comparison.savings).toBeGreaterThan(0)
      expect(comparison.savingsPercentage).toBeGreaterThan(0)
      expect(comparison.withFifthRule.totalTax).toBeLessThan(comparison.withoutFifthRule.totalTax)
    })

    it('should handle case with no capital gain', () => {
      const config = {
        salePrice: 100000,
        bookValue: 100000,
        sellerAge: 60,
      }

      const comparison = compareBusinessSaleTaxMethods(config)

      expect(comparison.savings).toBe(0)
      expect(comparison.savingsPercentage).toBe(0)
    })

    it('should calculate percentage savings correctly', () => {
      const config = {
        salePrice: 300000,
        bookValue: 100000,
        sellerAge: 60,
        otherIncome: 40000,
      }

      const comparison = compareBusinessSaleTaxMethods(config)

      const expectedPercentage =
        (comparison.savings / comparison.withoutFifthRule.totalTax) * 100
      expect(comparison.savingsPercentage).toBeCloseTo(expectedPercentage, 2)
    })
  })

  describe('calculateOptimalSaleTiming', () => {
    it('should identify optimal year based on age and income', () => {
      const baseConfig = {
        salePrice: 500000,
        bookValue: 200000,
        sellerAge: 53, // Currently under 55
        applyFifthRule: true,
      }

      const yearlyIncome = new Map([
        [2024, 60000],
        [2025, 55000],
        [2026, 50000], // Seller turns 55 in 2026
        [2027, 52000],
      ])

      const result = calculateOptimalSaleTiming(baseConfig, 2024, 2027, yearlyIncome)

      expect(result.yearAnalysis).toHaveLength(4)
      // Should prefer year 2026 or later (age 55+) for exemption
      expect(result.optimalYear).toBeGreaterThanOrEqual(2026)
      expect(result.optimalYearSavings).toBeGreaterThan(0)
    })

    it('should consider both age and other income in optimization', () => {
      const baseConfig = {
        salePrice: 400000,
        bookValue: 150000,
        sellerAge: 54,
        applyFifthRule: true,
      }

      const yearlyIncome = new Map([
        [2024, 80000], // High income, no exemption (age 54)
        [2025, 20000], // Low income, WITH exemption (age 55)
        [2026, 75000], // High income, with exemption (age 56)
      ])

      const result = calculateOptimalSaleTiming(baseConfig, 2024, 2026, yearlyIncome)

      // Year 2025 should be optimal: age 55 (exemption) + low other income
      expect(result.optimalYear).toBe(2025)
    })

    it('should handle empty income map with defaults', () => {
      const baseConfig = {
        salePrice: 300000,
        bookValue: 100000,
        sellerAge: 60,
      }

      const yearlyIncome = new Map()
      const result = calculateOptimalSaleTiming(baseConfig, 2024, 2026, yearlyIncome)

      expect(result.yearAnalysis).toHaveLength(3)
      // All years should have 0 other income
      result.yearAnalysis.forEach(year => {
        expect(year.otherIncome).toBe(0)
      })
    })

    it('should track seller age progression correctly', () => {
      const currentYear = new Date().getFullYear()
      const baseConfig = {
        salePrice: 300000,
        bookValue: 100000,
        sellerAge: 52,
      }

      const yearlyIncome = new Map([
        [currentYear, 50000],
        [currentYear + 1, 50000],
        [currentYear + 2, 50000],
      ])

      const result = calculateOptimalSaleTiming(
        baseConfig,
        currentYear,
        currentYear + 2,
        yearlyIncome,
      )

      expect(result.yearAnalysis[0].sellerAge).toBe(52)
      expect(result.yearAnalysis[1].sellerAge).toBe(53)
      expect(result.yearAnalysis[2].sellerAge).toBe(54)
    })
  })

  describe('calculateReinvestmentStrategy', () => {
    it('should calculate compound growth correctly', () => {
      const netProceeds = 100000
      const rate = 0.07 // 7% annual return
      const years = 5

      const result = calculateReinvestmentStrategy(netProceeds, rate, years)

      expect(result.yearlyGrowth).toHaveLength(5)
      expect(result.finalBalance).toBeCloseTo(100000 * Math.pow(1.07, 5), 0)
      expect(result.totalReturn).toBeCloseTo(result.finalBalance - netProceeds, 0)
    })

    it('should handle first year return correctly', () => {
      const netProceeds = 100000
      const rate = 0.05
      const years = 1

      const result = calculateReinvestmentStrategy(netProceeds, rate, years)

      expect(result.yearlyGrowth[0].yearlyReturn).toBeCloseTo(5000, 0)
      expect(result.yearlyGrowth[0].balance).toBeCloseTo(105000, 0)
      expect(result.yearlyGrowth[0].cumulativeReturn).toBeCloseTo(5000, 0)
    })

    it('should track cumulative returns correctly', () => {
      const netProceeds = 100000
      const rate = 0.1
      const years = 3

      const result = calculateReinvestmentStrategy(netProceeds, rate, years)

      // Year 1: 100k * 0.1 = 10k
      expect(result.yearlyGrowth[0].cumulativeReturn).toBeCloseTo(10000, 0)
      // Year 2: 110k * 0.1 = 11k, cumulative = 21k
      expect(result.yearlyGrowth[1].cumulativeReturn).toBeCloseTo(21000, 0)
      // Year 3: 121k * 0.1 = 12.1k, cumulative = 33.1k
      expect(result.yearlyGrowth[2].cumulativeReturn).toBeCloseTo(33100, 0)
    })

    it('should handle zero return rate', () => {
      const netProceeds = 100000
      const rate = 0
      const years = 5

      const result = calculateReinvestmentStrategy(netProceeds, rate, years)

      expect(result.finalBalance).toBe(netProceeds)
      expect(result.totalReturn).toBe(0)
      result.yearlyGrowth.forEach(year => {
        expect(year.yearlyReturn).toBe(0)
        expect(year.balance).toBe(netProceeds)
      })
    })

    it('should handle long-term projections', () => {
      const netProceeds = 500000
      const rate = 0.06
      const years = 30

      const result = calculateReinvestmentStrategy(netProceeds, rate, years)

      expect(result.yearlyGrowth).toHaveLength(30)
      expect(result.finalBalance).toBeGreaterThan(netProceeds * 5) // Should more than quintuple
      expect(result.totalReturn).toBeGreaterThan(netProceeds * 4)
    })

    it('should number years sequentially starting from 1', () => {
      const result = calculateReinvestmentStrategy(100000, 0.05, 5)

      expect(result.yearlyGrowth[0].year).toBe(1)
      expect(result.yearlyGrowth[1].year).toBe(2)
      expect(result.yearlyGrowth[4].year).toBe(5)
    })
  })
})
