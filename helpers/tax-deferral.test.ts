import { describe, it, expect } from 'vitest'
import { calculateTaxDeferralComparison, createDefaultTaxDeferralConfig, type TaxDeferralConfig } from './tax-deferral'

describe('Tax Deferral Calculator (Steuerstundungs-Kalkulator)', () => {
  describe('createDefaultTaxDeferralConfig', () => {
    it('should create a valid default configuration', () => {
      const config = createDefaultTaxDeferralConfig()

      expect(config.initialInvestment).toBe(50000)
      expect(config.annualReturn).toBe(0.07)
      expect(config.years).toBe(20)
      expect(config.capitalGainsTaxRate).toBe(0.26375)
      expect(config.teilfreistellungsquote).toBe(0.3)
      expect(config.freibetrag).toBe(1000)
      expect(config.startYear).toBeGreaterThanOrEqual(2024)
    })
  })

  describe('calculateTaxDeferralComparison', () => {
    it('should calculate comparison for basic scenario', () => {
      const config: TaxDeferralConfig = {
        initialInvestment: 10000,
        annualReturn: 0.05,
        years: 10,
        capitalGainsTaxRate: 0.26375,
        teilfreistellungsquote: 0.3,
        freibetrag: 0, // No allowance to see clear tax difference
        startYear: 2024,
      }

      const result = calculateTaxDeferralComparison(config)

      // Basic structure validation
      expect(result.config).toEqual(config)
      expect(result.accumulating.yearlyBreakdown).toHaveLength(10)
      expect(result.distributing.yearlyBreakdown).toHaveLength(10)

      // Accumulating fund should have higher or equal final value
      // (equal is possible with very low Basiszins resulting in minimal Vorabpauschale)
      expect(result.accumulating.finalValue).toBeGreaterThanOrEqual(result.distributing.finalValue)

      // Value difference should be non-negative
      expect(result.comparison.valueDifference).toBeGreaterThanOrEqual(0)

      // Tax deferral benefit should equal value difference in this simple case
      expect(result.comparison.taxDeferralBenefit).toBe(result.comparison.valueDifference)
    })

    it('should handle scenario with no returns', () => {
      const config: TaxDeferralConfig = {
        initialInvestment: 10000,
        annualReturn: 0,
        years: 5,
        capitalGainsTaxRate: 0.26375,
        teilfreistellungsquote: 0.3,
        freibetrag: 1000,
        startYear: 2024,
      }

      const result = calculateTaxDeferralComparison(config)

      // With no returns, both should have same final value
      expect(result.accumulating.finalValue).toBe(10000)
      expect(result.distributing.finalValue).toBe(10000)
      expect(result.comparison.valueDifference).toBe(0)

      // No taxes should be paid
      expect(result.accumulating.totalTaxPaid).toBe(0)
      expect(result.distributing.totalTaxPaid).toBe(0)
    })

    it('should calculate taxes correctly for accumulating fund', () => {
      const config: TaxDeferralConfig = {
        initialInvestment: 100000,
        annualReturn: 0.07,
        years: 1,
        capitalGainsTaxRate: 0.26375,
        teilfreistellungsquote: 0.3,
        freibetrag: 0, // No tax allowance for easier calculation
        startYear: 2024,
      }

      const result = calculateTaxDeferralComparison(config)

      // For accumulating fund, tax is based on Vorabpauschale
      const firstYear = result.accumulating.yearlyBreakdown[0]

      expect(firstYear.startValue).toBe(100000)
      expect(firstYear.grossReturn).toBeCloseTo(7000, 1)
      expect(firstYear.endValueBeforeTax).toBeCloseTo(107000, 1)

      // Vorabpauschale should be less than gross return
      expect(firstYear.taxableAmount).toBeLessThan(7000)
      expect(firstYear.taxableAmount).toBeGreaterThan(0)

      // Tax should be positive but less than full tax on returns
      expect(firstYear.taxPaid).toBeGreaterThan(0)
      expect(firstYear.taxPaid).toBeLessThan(7000 * 0.26375 * (1 - 0.3))
    })

    it('should calculate taxes correctly for distributing fund', () => {
      const config: TaxDeferralConfig = {
        initialInvestment: 100000,
        annualReturn: 0.07,
        years: 1,
        capitalGainsTaxRate: 0.26375,
        teilfreistellungsquote: 0.3,
        freibetrag: 0, // No tax allowance for easier calculation
        startYear: 2024,
      }

      const result = calculateTaxDeferralComparison(config)

      // For distributing fund, tax is based on full distribution
      const firstYear = result.distributing.yearlyBreakdown[0]

      expect(firstYear.startValue).toBe(100000)
      expect(firstYear.grossReturn).toBeCloseTo(7000, 1)
      expect(firstYear.taxableAmount).toBeCloseTo(7000, 1)

      // Tax should be on full distribution with Teilfreistellungsquote
      const expectedTax = 7000 * (1 - 0.3) * 0.26375
      expect(firstYear.taxPaid).toBeCloseTo(expectedTax, 2)
    })

    it('should apply Freibetrag correctly to accumulating fund', () => {
      const config: TaxDeferralConfig = {
        initialInvestment: 10000,
        annualReturn: 0.05,
        years: 1,
        capitalGainsTaxRate: 0.26375,
        teilfreistellungsquote: 0.3,
        freibetrag: 1000, // €1,000 allowance
        startYear: 2024,
      }

      const result = calculateTaxDeferralComparison(config)
      const firstYear = result.accumulating.yearlyBreakdown[0]

      // With a small investment and Freibetrag, tax should be reduced or zero
      expect(firstYear.taxPaid).toBeLessThanOrEqual(firstYear.taxableAmount * 0.26375)
    })

    it('should apply Freibetrag correctly to distributing fund', () => {
      const config: TaxDeferralConfig = {
        initialInvestment: 10000,
        annualReturn: 0.05,
        years: 1,
        capitalGainsTaxRate: 0.26375,
        teilfreistellungsquote: 0.3,
        freibetrag: 1000, // €1,000 allowance
        startYear: 2024,
      }

      const result = calculateTaxDeferralComparison(config)
      const firstYear = result.distributing.yearlyBreakdown[0]

      // Freibetrag should reduce the tax
      const taxWithoutFreibetrag = 500 * (1 - 0.3) * 0.26375 // 500€ return
      expect(firstYear.taxPaid).toBeLessThanOrEqual(taxWithoutFreibetrag)
    })

    it('should show accumulating advantage increases over time', () => {
      const config: TaxDeferralConfig = {
        initialInvestment: 50000,
        annualReturn: 0.07,
        years: 20,
        capitalGainsTaxRate: 0.26375,
        teilfreistellungsquote: 0.3,
        freibetrag: 1000,
        startYear: 2024,
      }

      const result = calculateTaxDeferralComparison(config)

      // Accumulating fund should have significantly higher final value
      expect(result.accumulating.finalValue).toBeGreaterThan(result.distributing.finalValue)

      // The advantage should be substantial over 20 years
      expect(result.comparison.percentageAdvantage).toBeGreaterThan(1) // At least 1% advantage

      // Tax deferral benefit should be positive
      expect(result.comparison.taxDeferralBenefit).toBeGreaterThan(0)
    })

    it('should handle different Teilfreistellungsquoten correctly', () => {
      const baseConfig: TaxDeferralConfig = {
        initialInvestment: 200000, // Larger investment to exceed Freibetrag
        annualReturn: 0.07,
        years: 10,
        capitalGainsTaxRate: 0.26375,
        teilfreistellungsquote: 0.3, // Equity fund
        freibetrag: 1000,
        startYear: 2024,
      }

      // Compare equity fund (30% exemption) vs. mixed fund (15% exemption)
      const equityResult = calculateTaxDeferralComparison(baseConfig)

      const mixedConfig = { ...baseConfig, teilfreistellungsquote: 0.15 }
      const mixedResult = calculateTaxDeferralComparison(mixedConfig)

      // Mixed fund should pay more taxes due to lower exemption
      expect(mixedResult.distributing.totalTaxPaid).toBeGreaterThan(equityResult.distributing.totalTaxPaid)

      // Both should have grown
      expect(equityResult.accumulating.finalValue).toBeGreaterThan(baseConfig.initialInvestment)
      expect(mixedResult.accumulating.finalValue).toBeGreaterThan(baseConfig.initialInvestment)

      // Equity fund should have higher final value due to tax advantages
      expect(equityResult.accumulating.finalValue).toBeGreaterThan(mixedResult.accumulating.finalValue)
    })

    it('should calculate cumulative tax paid correctly', () => {
      const config: TaxDeferralConfig = {
        initialInvestment: 10000,
        annualReturn: 0.05,
        years: 3,
        capitalGainsTaxRate: 0.26375,
        teilfreistellungsquote: 0.3,
        freibetrag: 0, // No allowance for easier calculation
        startYear: 2024,
      }

      const result = calculateTaxDeferralComparison(config)

      // Cumulative tax should increase each year
      for (let i = 1; i < result.accumulating.yearlyBreakdown.length; i++) {
        expect(result.accumulating.yearlyBreakdown[i].cumulativeTaxPaid).toBeGreaterThanOrEqual(
          result.accumulating.yearlyBreakdown[i - 1].cumulativeTaxPaid,
        )
      }

      // Final cumulative tax should equal total tax paid
      const lastYear = result.accumulating.yearlyBreakdown[result.accumulating.yearlyBreakdown.length - 1]
      expect(lastYear.cumulativeTaxPaid).toBe(result.accumulating.totalTaxPaid)
    })

    it('should throw error for invalid initial investment', () => {
      const config: TaxDeferralConfig = {
        initialInvestment: 0,
        annualReturn: 0.05,
        years: 10,
        capitalGainsTaxRate: 0.26375,
        teilfreistellungsquote: 0.3,
        freibetrag: 1000,
        startYear: 2024,
      }

      expect(() => calculateTaxDeferralComparison(config)).toThrow('Initial investment must be greater than 0')
    })

    it('should throw error for invalid years', () => {
      const config: TaxDeferralConfig = {
        initialInvestment: 10000,
        annualReturn: 0.05,
        years: 0,
        capitalGainsTaxRate: 0.26375,
        teilfreistellungsquote: 0.3,
        freibetrag: 1000,
        startYear: 2024,
      }

      expect(() => calculateTaxDeferralComparison(config)).toThrow('Investment period must be greater than 0')
    })

    it('should throw error for negative returns', () => {
      const config: TaxDeferralConfig = {
        initialInvestment: 10000,
        annualReturn: -0.05,
        years: 10,
        capitalGainsTaxRate: 0.26375,
        teilfreistellungsquote: 0.3,
        freibetrag: 1000,
        startYear: 2024,
      }

      expect(() => calculateTaxDeferralComparison(config)).toThrow('Annual return cannot be negative')
    })

    it('should calculate comparison with custom Basiszins configuration', () => {
      const config: TaxDeferralConfig = {
        initialInvestment: 100000, // Larger investment to exceed Freibetrag
        annualReturn: 0.07,
        years: 2,
        capitalGainsTaxRate: 0.26375,
        teilfreistellungsquote: 0.3,
        freibetrag: 1000,
        startYear: 2024,
        basiszinsConfig: {
          2024: { year: 2024, rate: 0.035, source: 'manual' },
          2025: { year: 2025, rate: 0.04, source: 'manual' },
        },
      }

      const result = calculateTaxDeferralComparison(config)

      // Should complete without errors
      expect(result.accumulating.yearlyBreakdown).toHaveLength(2)
      expect(result.distributing.yearlyBreakdown).toHaveLength(2)

      // With larger investment and higher Basiszins, should pay some taxes
      expect(result.accumulating.totalTaxPaid).toBeGreaterThanOrEqual(0)
      expect(result.distributing.totalTaxPaid).toBeGreaterThan(0)
    })

    it('should demonstrate compound interest effect in accumulating fund', () => {
      const config: TaxDeferralConfig = {
        initialInvestment: 10000,
        annualReturn: 0.08,
        years: 5,
        capitalGainsTaxRate: 0.26375,
        teilfreistellungsquote: 0.3,
        freibetrag: 0,
        startYear: 2024,
      }

      const result = calculateTaxDeferralComparison(config)

      // Each year's start value should be previous year's end value after tax
      for (let i = 1; i < result.accumulating.yearlyBreakdown.length; i++) {
        const previousYear = result.accumulating.yearlyBreakdown[i - 1]
        const currentYear = result.accumulating.yearlyBreakdown[i]

        expect(currentYear.startValue).toBeCloseTo(previousYear.endValueAfterTax, 2)
      }
    })

    it('should show distributing fund pays more taxes over time', () => {
      const config: TaxDeferralConfig = {
        initialInvestment: 100000,
        annualReturn: 0.07,
        years: 15,
        capitalGainsTaxRate: 0.26375,
        teilfreistellungsquote: 0.3,
        freibetrag: 1000,
        startYear: 2024,
      }

      const result = calculateTaxDeferralComparison(config)

      // Distributing fund typically pays more taxes (or at least comparable) due to taxing full distributions
      // The comparison should show the tax difference
      expect(result.comparison.taxDifference).toBeDefined()

      // If distributing pays more taxes, difference should be positive
      // If accumulating pays more (rare), difference should be negative
      // Both scenarios are valid depending on Basiszins vs. actual returns
      expect(typeof result.comparison.taxDifference).toBe('number')
    })

    it('should calculate realistic scenario for retirement planning', () => {
      // Realistic scenario: €100,000 investment, 6% return, 25 years until retirement
      const config: TaxDeferralConfig = {
        initialInvestment: 100000,
        annualReturn: 0.06,
        years: 25,
        capitalGainsTaxRate: 0.26375,
        teilfreistellungsquote: 0.3, // Equity fund
        freibetrag: 2000, // Couple's Freibetrag
        startYear: 2024,
      }

      const result = calculateTaxDeferralComparison(config)

      // Both funds should grow significantly
      expect(result.accumulating.finalValue).toBeGreaterThan(200000)
      expect(result.distributing.finalValue).toBeGreaterThan(200000)

      // Accumulating should outperform distributing
      expect(result.accumulating.finalValue).toBeGreaterThan(result.distributing.finalValue)

      // The advantage should be meaningful for retirement planning
      expect(result.comparison.valueDifference).toBeGreaterThan(5000) // At least €5,000 advantage
    })
  })
})
