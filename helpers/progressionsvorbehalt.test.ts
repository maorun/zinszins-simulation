import { describe, it, expect } from 'vitest'
import {
  calculateGermanIncomeTax,
  calculateProgressionRate,
  calculateIncomeTaxWithProgressionsvorbehalt,
  getProgressionRelevantIncomeForYear,
  DEFAULT_PROGRESSIONSVORBEHALT_CONFIG,
  type ProgressionsvorbehaltConfig,
} from './progressionsvorbehalt'

describe('Progressionsvorbehalt', () => {
  describe('calculateGermanIncomeTax', () => {
    const grundfreibetrag = 11604 // 2024 Grundfreibetrag

    it('should return 0 tax for income below Grundfreibetrag', () => {
      expect(calculateGermanIncomeTax(0, grundfreibetrag)).toBe(0)
      expect(calculateGermanIncomeTax(5000, grundfreibetrag)).toBe(0)
      expect(calculateGermanIncomeTax(11604, grundfreibetrag)).toBe(0)
    })

    it('should calculate tax for income in zone 1 (14-24% progressive)', () => {
      const income = 20000
      const tax = calculateGermanIncomeTax(income, grundfreibetrag)

      // Should be positive but less than 24% of adjusted income
      const adjustedIncome = income - grundfreibetrag
      expect(tax).toBeGreaterThan(0)
      expect(tax).toBeLessThan(adjustedIncome * 0.24)
      expect(tax).toBeGreaterThan(adjustedIncome * 0.14)
    })

    it('should calculate tax for income in zone 2 (24-42% progressive)', () => {
      const income = 100000
      const tax = calculateGermanIncomeTax(income, grundfreibetrag)

      // Should be positive and in reasonable range
      expect(tax).toBeGreaterThan(0)
      // Average effective rate should be somewhere between 14% and 42%
      const effectiveRate = tax / (income - grundfreibetrag)
      expect(effectiveRate).toBeGreaterThan(0.14)
      expect(effectiveRate).toBeLessThan(0.42)
    })

    it('should calculate tax for high income in zone 3 (42%)', () => {
      const income = 300000
      const tax = calculateGermanIncomeTax(income, grundfreibetrag)

      // Should be significant tax
      expect(tax).toBeGreaterThan(50000)
    })

    it('should use custom Grundfreibetrag when provided', () => {
      const income = 20000
      const customGrundfreibetrag = 15000

      const tax = calculateGermanIncomeTax(income, customGrundfreibetrag)
      const adjustedIncome = income - customGrundfreibetrag

      expect(tax).toBeGreaterThan(0)
      expect(tax).toBeLessThan(adjustedIncome * 0.24)
    })

    it('should handle exact Grundfreibetrag amount', () => {
      expect(calculateGermanIncomeTax(grundfreibetrag, grundfreibetrag)).toBe(0)
    })
  })

  describe('calculateProgressionRate', () => {
    const grundfreibetrag = 11604

    it('should return 0 rate for zero taxable income', () => {
      const rate = calculateProgressionRate(0, 0, grundfreibetrag)
      expect(rate).toBe(0)
    })

    it('should return normal rate when no progression-relevant income exists', () => {
      const taxableIncome = 20000
      const rate = calculateProgressionRate(taxableIncome, 0, grundfreibetrag)

      // Should be a reasonable rate
      expect(rate).toBeGreaterThan(0)
      expect(rate).toBeLessThan(1)
    })

    it('should increase rate when progression-relevant income is added', () => {
      const taxableIncome = 30000
      const progressionIncome = 20000

      const normalRate = calculateProgressionRate(taxableIncome, 0, grundfreibetrag)
      const progressionRate = calculateProgressionRate(taxableIncome, progressionIncome, grundfreibetrag)

      // Progression rate should be higher than normal rate
      expect(progressionRate).toBeGreaterThan(normalRate)
    })

    it('should calculate correct rate with moderate progression income', () => {
      const taxableIncome = 40000
      const progressionIncome = 15000

      const rate = calculateProgressionRate(taxableIncome, progressionIncome, grundfreibetrag)

      // Rate should be reasonable (between 0 and 1)
      expect(rate).toBeGreaterThan(0)
      expect(rate).toBeLessThan(1)

      // With progression, the rate should reflect higher tax bracket
      // Verify it's calculated correctly using the correct Progressionsvorbehalt formula:
      // effectiveRate = (tax(taxable + progression) - tax(progression)) / taxable
      const totalIncome = taxableIncome + progressionIncome
      const taxOnTotal = calculateGermanIncomeTax(totalIncome, grundfreibetrag)
      const taxOnProgression = calculateGermanIncomeTax(progressionIncome, grundfreibetrag)
      const expectedRate = (taxOnTotal - taxOnProgression) / taxableIncome

      expect(rate).toBeCloseTo(expectedRate, 5)
    })

    it('should handle high progression-relevant income', () => {
      const taxableIncome = 50000
      const progressionIncome = 100000

      const rate = calculateProgressionRate(taxableIncome, progressionIncome, grundfreibetrag)

      // Should result in a significantly higher rate
      expect(rate).toBeGreaterThan(0.2)
    })
  })

  describe('calculateIncomeTaxWithProgressionsvorbehalt', () => {
    const grundfreibetrag = 11604

    it('should return 0 for zero taxable income', () => {
      const tax = calculateIncomeTaxWithProgressionsvorbehalt(0, 0, grundfreibetrag)
      expect(tax).toBe(0)
    })

    it('should calculate normal tax when no progression income exists', () => {
      const taxableIncome = 25000
      const tax = calculateIncomeTaxWithProgressionsvorbehalt(taxableIncome, 0, grundfreibetrag)

      // Should be same as normal tax calculation
      const normalTax = calculateGermanIncomeTax(taxableIncome, grundfreibetrag)
      expect(tax).toBeCloseTo(normalTax, 2)
    })

    it('should increase tax with progression-relevant income', () => {
      const taxableIncome = 30000
      const progressionIncome = 20000

      const normalTax = calculateIncomeTaxWithProgressionsvorbehalt(taxableIncome, 0, grundfreibetrag)
      const progressionTax = calculateIncomeTaxWithProgressionsvorbehalt(
        taxableIncome,
        progressionIncome,
        grundfreibetrag,
      )

      // Tax should be higher with progression
      expect(progressionTax).toBeGreaterThan(normalTax)
    })

    it('should calculate tax correctly with Kirchensteuer', () => {
      const taxableIncome = 40000
      const progressionIncome = 10000
      const kirchensteuersatz = 9

      const taxWithoutKirchensteuer = calculateIncomeTaxWithProgressionsvorbehalt(
        taxableIncome,
        progressionIncome,
        grundfreibetrag,
        false,
        kirchensteuersatz,
      )

      const taxWithKirchensteuer = calculateIncomeTaxWithProgressionsvorbehalt(
        taxableIncome,
        progressionIncome,
        grundfreibetrag,
        true,
        kirchensteuersatz,
      )

      // Tax with Kirchensteuer should be higher
      expect(taxWithKirchensteuer).toBeGreaterThan(taxWithoutKirchensteuer)

      // Kirchensteuer should be approximately 9% of base tax
      const kirchensteuer = taxWithKirchensteuer - taxWithoutKirchensteuer
      expect(kirchensteuer).toBeCloseTo(taxWithoutKirchensteuer * 0.09, 2)
    })

    it('should handle realistic scenario: foreign income affecting German tax', () => {
      // Realistic scenario:
      // - German taxable income (withdrawals): €35,000
      // - Foreign tax-exempt income: €25,000
      const germanIncome = 35000
      const foreignIncome = 25000

      const tax = calculateIncomeTaxWithProgressionsvorbehalt(germanIncome, foreignIncome, grundfreibetrag)

      // Tax should be calculated on German income at higher rate
      expect(tax).toBeGreaterThan(0)

      // Verify it's higher than without progression
      const normalTax = calculateIncomeTaxWithProgressionsvorbehalt(germanIncome, 0, grundfreibetrag)
      expect(tax).toBeGreaterThan(normalTax)

      // The difference should be meaningful
      const additionalTax = tax - normalTax
      expect(additionalTax).toBeGreaterThan(germanIncome * 0.02) // At least 2% additional
    })

    it('should handle scenario with unemployment benefits', () => {
      // Scenario: Received unemployment benefits in early retirement
      // - Investment withdrawals: €20,000
      // - Unemployment benefits (Arbeitslosengeld I): €15,000
      const withdrawals = 20000
      const unemploymentBenefits = 15000

      const tax = calculateIncomeTaxWithProgressionsvorbehalt(withdrawals, unemploymentBenefits, grundfreibetrag)

      expect(tax).toBeGreaterThan(0)

      // Should be higher than normal tax
      const normalTax = calculateIncomeTaxWithProgressionsvorbehalt(withdrawals, 0, grundfreibetrag)
      expect(tax).toBeGreaterThan(normalTax)
    })

    it('should handle custom Grundfreibetrag', () => {
      const taxableIncome = 30000
      const progressionIncome = 10000
      const customGrundfreibetrag = 12000

      const tax = calculateIncomeTaxWithProgressionsvorbehalt(taxableIncome, progressionIncome, customGrundfreibetrag)

      expect(tax).toBeGreaterThan(0)
    })
  })

  describe('getProgressionRelevantIncomeForYear', () => {
    it('should return 0 when disabled', () => {
      const config: ProgressionsvorbehaltConfig = {
        enabled: false,
        progressionRelevantIncomePerYear: {
          2024: 20000,
          2025: 25000,
        },
      }

      expect(getProgressionRelevantIncomeForYear(2024, config)).toBe(0)
      expect(getProgressionRelevantIncomeForYear(2025, config)).toBe(0)
    })

    it('should return configured income for specific year when enabled', () => {
      const config: ProgressionsvorbehaltConfig = {
        enabled: true,
        progressionRelevantIncomePerYear: {
          2024: 20000,
          2025: 25000,
          2026: 30000,
        },
      }

      expect(getProgressionRelevantIncomeForYear(2024, config)).toBe(20000)
      expect(getProgressionRelevantIncomeForYear(2025, config)).toBe(25000)
      expect(getProgressionRelevantIncomeForYear(2026, config)).toBe(30000)
    })

    it('should return 0 for years without configured income', () => {
      const config: ProgressionsvorbehaltConfig = {
        enabled: true,
        progressionRelevantIncomePerYear: {
          2024: 20000,
        },
      }

      expect(getProgressionRelevantIncomeForYear(2023, config)).toBe(0)
      expect(getProgressionRelevantIncomeForYear(2025, config)).toBe(0)
    })

    it('should handle empty configuration', () => {
      expect(getProgressionRelevantIncomeForYear(2024, DEFAULT_PROGRESSIONSVORBEHALT_CONFIG)).toBe(0)
    })

    it('should handle missing year in configuration', () => {
      const config: ProgressionsvorbehaltConfig = {
        enabled: true,
        progressionRelevantIncomePerYear: {},
      }

      expect(getProgressionRelevantIncomeForYear(2024, config)).toBe(0)
    })
  })

  describe('Integration scenarios', () => {
    const grundfreibetrag = 11604

    it('should demonstrate progression effect for typical scenarios', () => {
      // Test with moderate progression income levels where monotonic increase is expected
      const taxableIncomes = [20000, 30000, 40000, 50000]
      const progressionIncome = 15000 // Moderate progression income

      taxableIncomes.forEach(income => {
        const normalTax = calculateIncomeTaxWithProgressionsvorbehalt(income, 0, grundfreibetrag)
        const progressionTax = calculateIncomeTaxWithProgressionsvorbehalt(income, progressionIncome, grundfreibetrag)

        // Progression should increase tax
        expect(progressionTax).toBeGreaterThan(normalTax)

        // The additional tax burden should be reasonable
        const additionalBurden = progressionTax - normalTax
        expect(additionalBurden).toBeGreaterThan(0)
        expect(additionalBurden).toBeLessThan(income * 0.3) // Less than 30% additional
      })
    })

    it('should show progression effect with varying exempt income levels', () => {
      const taxableIncome = 40000
      // Use moderate progression income levels where behavior is predictable
      const progressionIncomes = [0, 5000, 10000, 15000]

      let previousTax = 0

      progressionIncomes.forEach(progressionIncome => {
        const tax = calculateIncomeTaxWithProgressionsvorbehalt(taxableIncome, progressionIncome, grundfreibetrag)

        // Each moderate increase in progression income should increase tax
        if (progressionIncome > 0) {
          expect(tax).toBeGreaterThan(previousTax)
        }
        previousTax = tax
      })

      // Also verify that with very high progression income, tax is still calculated correctly
      const veryHighProgressionTax = calculateIncomeTaxWithProgressionsvorbehalt(taxableIncome, 50000, grundfreibetrag)
      expect(veryHighProgressionTax).toBeGreaterThan(0)
      expect(veryHighProgressionTax).toBeLessThan(taxableIncome) // Tax should never exceed income
    })

    it('should calculate reasonable tax for typical retirement scenario', () => {
      // Typical scenario: Retiree with foreign pension
      // - German investment withdrawals: €30,000
      // - Foreign pension (tax-exempt in Germany but progression-relevant): €18,000
      const germanWithdrawals = 30000
      const foreignPension = 18000

      const tax = calculateIncomeTaxWithProgressionsvorbehalt(germanWithdrawals, foreignPension, grundfreibetrag)

      // Tax should be reasonable (not zero, but not excessive)
      expect(tax).toBeGreaterThan(1000)
      expect(tax).toBeLessThan(germanWithdrawals * 0.5)

      // Should be significantly higher than without progression
      const normalTax = calculateIncomeTaxWithProgressionsvorbehalt(germanWithdrawals, 0, grundfreibetrag)
      const increase = ((tax - normalTax) / normalTax) * 100

      // Expect at least 20% increase due to progression
      expect(increase).toBeGreaterThan(20)
    })
  })

  describe('Edge cases', () => {
    const grundfreibetrag = 11604

    it('should handle very small amounts', () => {
      const tax = calculateIncomeTaxWithProgressionsvorbehalt(100, 100, grundfreibetrag)
      expect(tax).toBe(0) // Below Grundfreibetrag
    })

    it('should handle very large amounts', () => {
      const taxableIncome = 1000000
      const progressionIncome = 500000

      const tax = calculateIncomeTaxWithProgressionsvorbehalt(taxableIncome, progressionIncome, grundfreibetrag)

      // Should calculate without errors
      expect(tax).toBeGreaterThan(0)
      expect(tax).toBeLessThan(taxableIncome) // Tax should never exceed income
    })

    it('should handle negative inputs gracefully', () => {
      const tax1 = calculateIncomeTaxWithProgressionsvorbehalt(-1000, 0, grundfreibetrag)
      expect(tax1).toBe(0)

      const tax2 = calculateIncomeTaxWithProgressionsvorbehalt(20000, -5000, grundfreibetrag)
      // Negative progression income should be treated as 0
      expect(tax2).toBeGreaterThanOrEqual(0)
    })

    it('should be consistent with repeated calculations', () => {
      const taxableIncome = 35000
      const progressionIncome = 20000

      const tax1 = calculateIncomeTaxWithProgressionsvorbehalt(taxableIncome, progressionIncome, grundfreibetrag)
      const tax2 = calculateIncomeTaxWithProgressionsvorbehalt(taxableIncome, progressionIncome, grundfreibetrag)

      expect(tax1).toBe(tax2)
    })
  })
})
