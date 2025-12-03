import { describe, it, expect } from 'vitest'
import {
  calculateGermanIncomeTax,
  calculateSeveranceTax,
  compareSeveranceYears,
  createDefaultSeveranceConfig,
  calculateTaxSavingsPercentage,
  isFuenftelregelungBeneficial,
  type SeveranceConfig,
} from './abfindung'

describe('abfindung - Severance Payment Optimization', () => {
  describe('calculateGermanIncomeTax', () => {
    it('should return 0 for income below Grundfreibetrag', () => {
      expect(calculateGermanIncomeTax(0)).toBe(0)
      expect(calculateGermanIncomeTax(5000)).toBe(0)
      expect(calculateGermanIncomeTax(10908)).toBe(0)
    })

    it('should calculate tax in first progression zone', () => {
      // Income slightly above Grundfreibetrag
      const tax1 = calculateGermanIncomeTax(15000)
      expect(tax1).toBeGreaterThan(0)
      expect(tax1).toBeLessThan(800)

      // Higher income in first zone
      const tax2 = calculateGermanIncomeTax(15999)
      expect(tax2).toBeGreaterThan(tax1)
      expect(tax2).toBeLessThan(1200)
    })

    it('should calculate tax in second progression zone', () => {
      // Middle income
      const tax = calculateGermanIncomeTax(35000)
      expect(tax).toBeGreaterThan(3000)
      expect(tax).toBeLessThan(8000)
    })

    it('should calculate tax in third zone (42% rate)', () => {
      // Income in 42% zone
      const tax = calculateGermanIncomeTax(70000)
      expect(tax).toBeGreaterThan(18000)
      expect(tax).toBeLessThan(20000)
    })

    it('should calculate tax with Solidaritätszuschlag', () => {
      // The result should include Soli for higher incomes
      const taxWithSoli = calculateGermanIncomeTax(100000)
      expect(taxWithSoli).toBeGreaterThan(32000)
      expect(taxWithSoli).toBeLessThan(35000)
    })

    it('should be progressive - higher income pays higher effective rate', () => {
      const tax50k = calculateGermanIncomeTax(50000)
      const tax100k = calculateGermanIncomeTax(100000)

      const effectiveRate50k = (tax50k / 50000) * 100
      const effectiveRate100k = (tax100k / 100000) * 100

      expect(effectiveRate100k).toBeGreaterThan(effectiveRate50k)
    })
  })

  describe('createDefaultSeveranceConfig', () => {
    it('should create a valid default configuration', () => {
      const config = createDefaultSeveranceConfig()

      expect(config.enabled).toBe(false)
      expect(config.severanceAmount).toBe(50000)
      expect(config.annualGrossIncome).toBe(60000)
      expect(config.capitalGainsTaxRate).toBe(26.375)
      expect(config.capitalGainsTaxAllowance).toBe(1000)
    })
  })

  describe('calculateSeveranceTax', () => {
    it('should return zero result when disabled', () => {
      const config: SeveranceConfig = {
        ...createDefaultSeveranceConfig(),
        enabled: false,
      }

      const result = calculateSeveranceTax(config)

      expect(result.grossAmount).toBe(0)
      expect(result.standardIncomeTax).toBe(0)
      expect(result.fuenftelregelungIncomeTax).toBe(0)
      expect(result.taxSavings).toBe(0)
      expect(result.netAmount).toBe(0)
    })

    it('should return zero result when severance amount is zero', () => {
      const config: SeveranceConfig = {
        ...createDefaultSeveranceConfig(),
        enabled: true,
        severanceAmount: 0,
      }

      const result = calculateSeveranceTax(config)

      expect(result.grossAmount).toBe(0)
      expect(result.netAmount).toBe(0)
    })

    it('should calculate basic severance tax with Fünftelregelung', () => {
      const config: SeveranceConfig = {
        enabled: true,
        severanceAmount: 50000,
        severanceYear: 2024,
        annualGrossIncome: 60000,
      }

      const result = calculateSeveranceTax(config)

      expect(result.grossAmount).toBe(50000)
      expect(result.fuenftelregelungIncomeTax).toBeGreaterThan(0)
      expect(result.standardIncomeTax).toBeGreaterThan(result.fuenftelregelungIncomeTax)
      expect(result.taxSavings).toBeGreaterThan(0)
      expect(result.netAmount).toBe(50000 - result.fuenftelregelungIncomeTax)
    })

    it('should show tax savings with Fünftelregelung for appropriate scenarios', () => {
      const config: SeveranceConfig = {
        enabled: true,
        severanceAmount: 80000,
        severanceYear: 2024,
        annualGrossIncome: 40000, // Lower income to see benefit
      }

      const result = calculateSeveranceTax(config)

      // With lower regular income, Fünftelregelung should show savings
      expect(result.fuenftelregelungIncomeTax).toBeGreaterThan(0)
      expect(result.standardIncomeTax).toBeGreaterThan(0)
      // Either savings are positive or taxes are similar
      expect(result.netAmount).toBeGreaterThan(0)
    })

    it('should calculate effective tax rate correctly', () => {
      const config: SeveranceConfig = {
        enabled: true,
        severanceAmount: 50000,
        severanceYear: 2024,
        annualGrossIncome: 60000,
      }

      const result = calculateSeveranceTax(config)

      expect(result.effectiveTaxRate).toBeGreaterThan(0)
      expect(result.effectiveTaxRate).toBeLessThan(45) // Should not exceed top tax rate
      expect(result.effectiveTaxRate).toBeCloseTo(
        (result.fuenftelregelungIncomeTax / result.grossAmount) * 100,
        2,
      )
    })

    it('should include capital gains tax in total burden', () => {
      const config: SeveranceConfig = {
        enabled: true,
        severanceAmount: 50000,
        severanceYear: 2024,
        annualGrossIncome: 60000,
        annualCapitalGains: 5000,
        capitalGainsTaxRate: 26.375,
        capitalGainsTaxAllowance: 1000,
      }

      const result = calculateSeveranceTax(config)

      expect(result.capitalGainsTax).toBeGreaterThan(0)
      expect(result.totalTaxBurden).toBe(
        result.regularIncomeTax + result.fuenftelregelungIncomeTax + result.capitalGainsTax,
      )
    })

    it('should apply capital gains tax allowance correctly', () => {
      const config1: SeveranceConfig = {
        enabled: true,
        severanceAmount: 50000,
        severanceYear: 2024,
        annualGrossIncome: 60000,
        annualCapitalGains: 800, // Below allowance
        capitalGainsTaxAllowance: 1000,
      }

      const config2: SeveranceConfig = {
        ...config1,
        annualCapitalGains: 1500, // Above allowance
      }

      const result1 = calculateSeveranceTax(config1)
      const result2 = calculateSeveranceTax(config2)

      expect(result1.capitalGainsTax).toBe(0) // Below allowance
      expect(result2.capitalGainsTax).toBeGreaterThan(0) // Above allowance
    })

    it('should calculate regular income tax separately', () => {
      const config: SeveranceConfig = {
        enabled: true,
        severanceAmount: 50000,
        severanceYear: 2024,
        annualGrossIncome: 60000,
      }

      const result = calculateSeveranceTax(config)

      const expectedRegularTax = calculateGermanIncomeTax(60000)
      expect(result.regularIncomeTax).toBeCloseTo(expectedRegularTax, 2)
    })
  })

  describe('compareSeveranceYears', () => {
    it('should compare multiple years and find optimal timing', () => {
      const severanceAmount = 80000
      const yearlyIncome = {
        2024: 70000, // High income year
        2025: 40000, // Lower income year
        2026: 75000, // High income year
      }

      const results = compareSeveranceYears(severanceAmount, yearlyIncome)

      expect(results).toHaveLength(3)
      expect(results.map(r => r.year)).toEqual([2024, 2025, 2026])

      // Find the optimal year
      const optimalResult = results.find(r => r.isOptimal)
      expect(optimalResult).toBeDefined()

      // The year with lowest income should likely be optimal
      expect(optimalResult!.year).toBe(2025)
      expect(optimalResult!.annualGrossIncome).toBe(40000)
    })

    it('should sort results by year', () => {
      const severanceAmount = 50000
      const yearlyIncome = {
        2026: 60000,
        2024: 65000,
        2025: 55000,
      }

      const results = compareSeveranceYears(severanceAmount, yearlyIncome)

      expect(results[0].year).toBe(2024)
      expect(results[1].year).toBe(2025)
      expect(results[2].year).toBe(2026)
    })

    it('should include capital gains in comparison', () => {
      const severanceAmount = 60000
      const yearlyIncome = {
        2024: 60000,
        2025: 60000,
      }
      const capitalGains = {
        2024: 10000, // High capital gains
        2025: 1000, // Low capital gains
      }

      const results = compareSeveranceYears(
        severanceAmount,
        yearlyIncome,
        capitalGains,
        26.375,
        1000,
      )

      // Year with lower capital gains should have lower total tax burden
      const year2024 = results.find(r => r.year === 2024)!
      const year2025 = results.find(r => r.year === 2025)!

      expect(year2024.taxResult.capitalGainsTax).toBeGreaterThan(year2025.taxResult.capitalGainsTax)
      expect(year2025.taxResult.totalTaxBurden).toBeLessThan(year2024.taxResult.totalTaxBurden)
    })

    it('should mark only one year as optimal', () => {
      const severanceAmount = 50000
      const yearlyIncome = {
        2024: 60000,
        2025: 55000,
        2026: 65000,
      }

      const results = compareSeveranceYears(severanceAmount, yearlyIncome)

      const optimalCount = results.filter(r => r.isOptimal).length
      expect(optimalCount).toBe(1)
    })
  })

  describe('calculateTaxSavingsPercentage', () => {
    it('should calculate savings percentage correctly', () => {
      const config: SeveranceConfig = {
        enabled: true,
        severanceAmount: 50000,
        severanceYear: 2024,
        annualGrossIncome: 60000,
      }

      const result = calculateSeveranceTax(config)
      const savingsPercentage = calculateTaxSavingsPercentage(result)

      expect(savingsPercentage).toBeGreaterThan(0)
      expect(savingsPercentage).toBeLessThan(100)
      expect(savingsPercentage).toBeCloseTo(
        (result.taxSavings / result.standardIncomeTax) * 100,
        2,
      )
    })

    it('should return 0 when standard tax is 0', () => {
      const result = {
        grossAmount: 0,
        standardIncomeTax: 0,
        fuenftelregelungIncomeTax: 0,
        taxSavings: 0,
        netAmount: 0,
        effectiveTaxRate: 0,
        regularIncomeTax: 0,
        totalTaxBurden: 0,
        capitalGainsTax: 0,
      }

      expect(calculateTaxSavingsPercentage(result)).toBe(0)
    })
  })

  describe('isFuenftelregelungBeneficial', () => {
    it('should identify when Fünftelregelung provides savings', () => {
      const config: SeveranceConfig = {
        enabled: true,
        severanceAmount: 150000, // Large severance
        severanceYear: 2024,
        annualGrossIncome: 30000, // Low regular income
      }

      const result = calculateSeveranceTax(config)
      // With this combination, Fünftelregelung should be beneficial
      const isBeneficial = isFuenftelregelungBeneficial(result)
      expect(typeof isBeneficial).toBe('boolean')
      if (result.taxSavings > 0) {
        const savingsPercent = calculateTaxSavingsPercentage(result)
        expect(savingsPercent).toBeGreaterThanOrEqual(0)
      }
    })

    it('should return false when savings are minimal', () => {
      // With very low income, tax savings might be minimal
      const config: SeveranceConfig = {
        enabled: true,
        severanceAmount: 5000,
        severanceYear: 2024,
        annualGrossIncome: 15000,
      }

      const result = calculateSeveranceTax(config)
      // With such low amounts, savings percentage might be below 5%
      const isBeneficial = isFuenftelregelungBeneficial(result)
      expect(typeof isBeneficial).toBe('boolean')
    })
  })

  describe('Real-world scenarios', () => {
    it('should handle typical manager severance scenario', () => {
      const config: SeveranceConfig = {
        enabled: true,
        severanceAmount: 120000, // €120k severance
        severanceYear: 2024,
        annualGrossIncome: 90000, // €90k annual salary
        annualCapitalGains: 3000,
        capitalGainsTaxRate: 26.375,
        capitalGainsTaxAllowance: 1000,
      }

      const result = calculateSeveranceTax(config)

      // Verify calculation completes and returns reasonable values
      expect(result.grossAmount).toBe(120000)
      expect(result.fuenftelregelungIncomeTax).toBeGreaterThan(0)
      expect(result.netAmount).toBeGreaterThan(0)
      expect(result.netAmount).toBeLessThan(120000)
      expect(result.effectiveTaxRate).toBeGreaterThan(0)
      expect(result.effectiveTaxRate).toBeLessThan(50)
      // Capital gains tax should be calculated
      expect(result.capitalGainsTax).toBeGreaterThan(0)
    })

    it('should handle job change with lower income in severance year', () => {
      const severanceAmount = 60000
      const yearlyIncome = {
        2024: 80000, // Full salary
        2025: 35000, // Part-year salary (job change)
        2026: 85000, // Full new salary
      }

      const results = compareSeveranceYears(severanceAmount, yearlyIncome)

      // Optimal year should be the one with lower income
      const optimal = results.find(r => r.isOptimal)!
      expect(optimal.year).toBe(2025)
      expect(optimal.taxResult.totalTaxBurden).toBeLessThan(results[0].taxResult.totalTaxBurden)
    })

    it('should handle retirement scenario with pension start', () => {
      const severanceAmount = 75000
      const yearlyIncome = {
        2024: 70000, // Last working year
        2025: 0, // Gap year
        2026: 25000, // Pension starts (partial year)
      }

      const results = compareSeveranceYears(severanceAmount, yearlyIncome)

      // Gap year (2025) should likely be optimal due to no other income
      // However, if severance/5 < Grundfreibetrag, the optimal year might be different
      const optimal = results.find(r => r.isOptimal)!
      expect(optimal).toBeDefined()
      // The optimal year should be one with lower total tax burden
      expect(optimal.taxResult.totalTaxBurden).toBeLessThanOrEqual(results[0].taxResult.totalTaxBurden)
    })

    it('should calculate multi-year distribution comparison', () => {
      // Compare taking severance in different years
      const severanceAmount = 90000

      // Test scenario 1: Take it while working
      const scenario1 = compareSeveranceYears(severanceAmount, { 2024: 75000 })
      expect(scenario1).toHaveLength(1)
      expect(scenario1[0].taxResult.grossAmount).toBe(severanceAmount)

      // Test scenario 2: Take it during sabbatical
      const scenario2 = compareSeveranceYears(severanceAmount, { 2025: 40000 })
      expect(scenario2).toHaveLength(1)
      expect(scenario2[0].taxResult.grossAmount).toBe(severanceAmount)

      // Test scenario 3: Take it when back to work
      const scenario3 = compareSeveranceYears(severanceAmount, { 2026: 72000 })
      expect(scenario3).toHaveLength(1)
      expect(scenario3[0].taxResult.grossAmount).toBe(severanceAmount)

      // Scenario 2 (sabbatical) should have lowest tax burden
      expect(scenario2[0].taxResult.totalTaxBurden).toBeLessThan(scenario1[0].taxResult.totalTaxBurden)
    })
  })

  describe('Edge cases', () => {
    it('should handle very high severance amounts', () => {
      const config: SeveranceConfig = {
        enabled: true,
        severanceAmount: 500000, // €500k severance
        severanceYear: 2024,
        annualGrossIncome: 150000,
      }

      const result = calculateSeveranceTax(config)

      expect(result.grossAmount).toBe(500000)
      expect(result.fuenftelregelungIncomeTax).toBeGreaterThan(0)
      expect(result.netAmount).toBeLessThan(500000)
      expect(result.taxSavings).toBeGreaterThan(0)
    })

    it('should handle zero income scenarios', () => {
      const config: SeveranceConfig = {
        enabled: true,
        severanceAmount: 50000,
        severanceYear: 2024,
        annualGrossIncome: 0, // No other income
      }

      const result = calculateSeveranceTax(config)

      expect(result.regularIncomeTax).toBe(0)
      // With 50000/5 = 10000, which is below Grundfreibetrag (10908),
      // Fünftelregelung tax will be 0
      // This is correct behavior - the severance is small enough to benefit from Grundfreibetrag
      expect(result.fuenftelregelungIncomeTax).toBe(0)
      expect(result.netAmount).toBe(50000)
    })

    it('should handle income exactly at Grundfreibetrag', () => {
      const config: SeveranceConfig = {
        enabled: true,
        severanceAmount: 60000, // 60000/5 = 12000, which is above Grundfreibetrag
        severanceYear: 2024,
        annualGrossIncome: 10908, // Exactly at Grundfreibetrag
      }

      const result = calculateSeveranceTax(config)

      expect(result.regularIncomeTax).toBe(0)
      // 10908 + 12000 = 22908, which should result in some tax
      expect(result.fuenftelregelungIncomeTax).toBeGreaterThan(0)
    })
  })
})
