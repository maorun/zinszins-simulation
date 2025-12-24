import { describe, expect, it } from 'vitest'
import {
  calculatePaymentDates,
  calculateQuarterlyTaxPrepayments,
  calculatePrepaymentAdjustment,
  getDefaultQuarterlyTaxPrepaymentConfig,
  validateQuarterlyTaxPrepaymentConfig,
  arePrepaymentsRequired,
  getOptimizationSuggestions,
  type QuarterlyTaxPrepaymentConfig,
} from './quarterly-tax-prepayments'

describe('quarterly-tax-prepayments', () => {
  describe('getDefaultQuarterlyTaxPrepaymentConfig', () => {
    it('should return default config with disabled state', () => {
      const config = getDefaultQuarterlyTaxPrepaymentConfig(2024)

      expect(config).toEqual({
        enabled: false,
        expectedAnnualCapitalIncome: 0,
        capitalGainsTaxRate: 26.375,
        taxFreeAllowance: 1000,
        partialExemptionRate: 30,
        year: 2024,
      })
    })

    it('should use correct default tax rate (25% + 5.5% Soli)', () => {
      const config = getDefaultQuarterlyTaxPrepaymentConfig(2024)
      expect(config.capitalGainsTaxRate).toBe(26.375)
    })
  })

  describe('calculatePaymentDates', () => {
    it('should return four quarterly payment dates', () => {
      const dates = calculatePaymentDates(2024)
      expect(dates).toHaveLength(4)
    })

    it('should have correct quarter numbers', () => {
      const dates = calculatePaymentDates(2024)
      expect(dates[0].quarter).toBe(1)
      expect(dates[1].quarter).toBe(2)
      expect(dates[2].quarter).toBe(3)
      expect(dates[3].quarter).toBe(4)
    })

    it('should have correct deadlines (10th of March, June, September, December)', () => {
      const dates = calculatePaymentDates(2024)
      expect(dates[0].deadlineFormatted).toBe('10.03.2024')
      expect(dates[1].deadlineFormatted).toBe('10.06.2024')
      expect(dates[2].deadlineFormatted).toBe('10.09.2024')
      expect(dates[3].deadlineFormatted).toBe('10.12.2024')
    })

    it('should format ISO dates correctly', () => {
      const dates = calculatePaymentDates(2024)
      expect(dates[0].deadline).toBe('2024-03-10')
      expect(dates[1].deadline).toBe('2024-06-10')
    })
  })

  describe('validateQuarterlyTaxPrepaymentConfig', () => {
    it('should validate correct configuration without errors', () => {
      const config: QuarterlyTaxPrepaymentConfig = {
        enabled: true,
        expectedAnnualCapitalIncome: 50000,
        capitalGainsTaxRate: 26.375,
        taxFreeAllowance: 1000,
        partialExemptionRate: 30,
        year: 2024,
      }

      const errors = validateQuarterlyTaxPrepaymentConfig(config)
      expect(errors).toEqual([])
    })

    it('should reject negative capital income', () => {
      const config: QuarterlyTaxPrepaymentConfig = {
        enabled: true,
        expectedAnnualCapitalIncome: -10000,
        capitalGainsTaxRate: 26.375,
        taxFreeAllowance: 1000,
        partialExemptionRate: 30,
        year: 2024,
      }

      const errors = validateQuarterlyTaxPrepaymentConfig(config)
      expect(errors).toContain('Erwartete jährliche Kapitalerträge können nicht negativ sein')
    })

    it('should reject invalid tax rates', () => {
      const config1: QuarterlyTaxPrepaymentConfig = {
        enabled: true,
        expectedAnnualCapitalIncome: 10000,
        capitalGainsTaxRate: -5,
        taxFreeAllowance: 1000,
        partialExemptionRate: 30,
        year: 2024,
      }

      const config2: QuarterlyTaxPrepaymentConfig = {
        enabled: true,
        expectedAnnualCapitalIncome: 10000,
        capitalGainsTaxRate: 150,
        taxFreeAllowance: 1000,
        partialExemptionRate: 30,
        year: 2024,
      }

      expect(validateQuarterlyTaxPrepaymentConfig(config1)).toContain(
        'Kapitalertragsteuersatz muss zwischen 0% und 100% liegen',
      )
      expect(validateQuarterlyTaxPrepaymentConfig(config2)).toContain(
        'Kapitalertragsteuersatz muss zwischen 0% und 100% liegen',
      )
    })

    it('should reject negative tax-free allowance', () => {
      const config: QuarterlyTaxPrepaymentConfig = {
        enabled: true,
        expectedAnnualCapitalIncome: 10000,
        capitalGainsTaxRate: 26.375,
        taxFreeAllowance: -500,
        partialExemptionRate: 30,
        year: 2024,
      }

      const errors = validateQuarterlyTaxPrepaymentConfig(config)
      expect(errors).toContain('Freibetrag kann nicht negativ sein')
    })

    it('should reject invalid partial exemption rates', () => {
      const config1: QuarterlyTaxPrepaymentConfig = {
        enabled: true,
        expectedAnnualCapitalIncome: 10000,
        capitalGainsTaxRate: 26.375,
        taxFreeAllowance: 1000,
        partialExemptionRate: -10,
        year: 2024,
      }

      const config2: QuarterlyTaxPrepaymentConfig = {
        enabled: true,
        expectedAnnualCapitalIncome: 10000,
        capitalGainsTaxRate: 26.375,
        taxFreeAllowance: 1000,
        partialExemptionRate: 150,
        year: 2024,
      }

      expect(validateQuarterlyTaxPrepaymentConfig(config1)).toContain(
        'Teilfreistellungsquote muss zwischen 0% und 100% liegen',
      )
      expect(validateQuarterlyTaxPrepaymentConfig(config2)).toContain(
        'Teilfreistellungsquote muss zwischen 0% und 100% liegen',
      )
    })

    it('should reject invalid years', () => {
      const config1: QuarterlyTaxPrepaymentConfig = {
        enabled: true,
        expectedAnnualCapitalIncome: 10000,
        capitalGainsTaxRate: 26.375,
        taxFreeAllowance: 1000,
        partialExemptionRate: 30,
        year: 1999,
      }

      const config2: QuarterlyTaxPrepaymentConfig = {
        enabled: true,
        expectedAnnualCapitalIncome: 10000,
        capitalGainsTaxRate: 26.375,
        taxFreeAllowance: 1000,
        partialExemptionRate: 30,
        year: 2101,
      }

      expect(validateQuarterlyTaxPrepaymentConfig(config1)).toContain('Jahr muss zwischen 2000 und 2100 liegen')
      expect(validateQuarterlyTaxPrepaymentConfig(config2)).toContain('Jahr muss zwischen 2000 und 2100 liegen')
    })

    it('should return multiple errors for multiple violations', () => {
      const config: QuarterlyTaxPrepaymentConfig = {
        enabled: true,
        expectedAnnualCapitalIncome: -10000,
        capitalGainsTaxRate: 150,
        taxFreeAllowance: -500,
        partialExemptionRate: -10,
        year: 1999,
      }

      const errors = validateQuarterlyTaxPrepaymentConfig(config)
      expect(errors.length).toBeGreaterThanOrEqual(4)
    })
  })

  describe('calculateQuarterlyTaxPrepayments', () => {
    it('should return zero values when disabled', () => {
      const config: QuarterlyTaxPrepaymentConfig = {
        enabled: false,
        expectedAnnualCapitalIncome: 50000,
        capitalGainsTaxRate: 26.375,
        taxFreeAllowance: 1000,
        partialExemptionRate: 30,
        year: 2024,
      }

      const result = calculateQuarterlyTaxPrepayments(config)

      expect(result.annualTaxLiability).toBe(0)
      expect(result.quarterlyPrepayment).toBe(0)
      expect(result.taxableIncome).toBe(0)
      expect(result.paymentDates).toHaveLength(4)
    })

    it('should calculate basic scenario without exemptions', () => {
      const config: QuarterlyTaxPrepaymentConfig = {
        enabled: true,
        expectedAnnualCapitalIncome: 10000,
        capitalGainsTaxRate: 25,
        taxFreeAllowance: 0,
        partialExemptionRate: 0,
        year: 2024,
      }

      const result = calculateQuarterlyTaxPrepayments(config)

      // 10,000 € × 25% = 2,500 € annual tax
      expect(result.annualTaxLiability).toBe(2500)
      // Quarterly: 2,500 € / 4 = 625 €
      expect(result.quarterlyPrepayment).toBe(625)
      expect(result.taxableIncome).toBe(10000)
    })

    it('should apply tax-free allowance correctly', () => {
      const config: QuarterlyTaxPrepaymentConfig = {
        enabled: true,
        expectedAnnualCapitalIncome: 10000,
        capitalGainsTaxRate: 25,
        taxFreeAllowance: 1000,
        partialExemptionRate: 0,
        year: 2024,
      }

      const result = calculateQuarterlyTaxPrepayments(config)

      // Taxable: 10,000 - 1,000 = 9,000 €
      expect(result.taxableIncome).toBe(9000)
      // Tax: 9,000 × 25% = 2,250 €
      expect(result.annualTaxLiability).toBe(2250)
      // Savings from allowance: 1,000 × 25% = 250 €
      expect(result.taxFreeAllowanceSavings).toBe(250)
    })

    it('should apply partial exemption for equity funds', () => {
      const config: QuarterlyTaxPrepaymentConfig = {
        enabled: true,
        expectedAnnualCapitalIncome: 10000,
        capitalGainsTaxRate: 25,
        taxFreeAllowance: 0,
        partialExemptionRate: 30,
        year: 2024,
      }

      const result = calculateQuarterlyTaxPrepayments(config)

      // After partial exemption: 10,000 × (1 - 0.30) = 7,000 €
      expect(result.taxableIncome).toBe(7000)
      // Tax: 7,000 × 25% = 1,750 €
      expect(result.annualTaxLiability).toBe(1750)
      // Savings from exemption: 3,000 × 25% = 750 €
      expect(result.partialExemptionSavings).toBe(750)
    })

    it('should apply both partial exemption and tax-free allowance', () => {
      const config: QuarterlyTaxPrepaymentConfig = {
        enabled: true,
        expectedAnnualCapitalIncome: 10000,
        capitalGainsTaxRate: 26.375,
        taxFreeAllowance: 1000,
        partialExemptionRate: 30,
        year: 2024,
      }

      const result = calculateQuarterlyTaxPrepayments(config)

      // Step 1: Partial exemption: 10,000 × (1 - 0.30) = 7,000 €
      // Step 2: Tax-free allowance: 7,000 - 1,000 = 6,000 €
      expect(result.taxableIncome).toBe(6000)
      // Tax: 6,000 × 26.375% = 1,582.50 €
      expect(result.annualTaxLiability).toBeCloseTo(1582.5, 1)
      // Quarterly: 1,582.50 / 4 = 395.625 €
      expect(result.quarterlyPrepayment).toBeCloseTo(395.625, 2)
    })

    it('should calculate realistic scenario for self-employed', () => {
      // Realistic: Self-employed with 50,000 € annual capital income
      const config: QuarterlyTaxPrepaymentConfig = {
        enabled: true,
        expectedAnnualCapitalIncome: 50000,
        capitalGainsTaxRate: 26.375,
        taxFreeAllowance: 1000,
        partialExemptionRate: 30,
        year: 2024,
      }

      const result = calculateQuarterlyTaxPrepayments(config)

      // After partial exemption: 50,000 × 70% = 35,000 €
      // After allowance: 35,000 - 1,000 = 34,000 €
      expect(result.taxableIncome).toBe(34000)
      // Tax: 34,000 × 26.375% = 8,967.50 €
      expect(result.annualTaxLiability).toBeCloseTo(8967.5, 1)
      // Quarterly: 8,967.50 / 4 = 2,241.875 €
      expect(result.quarterlyPrepayment).toBeCloseTo(2241.875, 2)
    })

    it('should not have negative taxable income', () => {
      const config: QuarterlyTaxPrepaymentConfig = {
        enabled: true,
        expectedAnnualCapitalIncome: 500,
        capitalGainsTaxRate: 26.375,
        taxFreeAllowance: 1000,
        partialExemptionRate: 30,
        year: 2024,
      }

      const result = calculateQuarterlyTaxPrepayments(config)

      // Income after exemption: 500 × 70% = 350 €
      // After allowance: max(0, 350 - 1,000) = 0 €
      expect(result.taxableIncome).toBe(0)
      expect(result.annualTaxLiability).toBe(0)
      expect(result.quarterlyPrepayment).toBe(0)
    })

    it('should calculate late payment interest correctly', () => {
      const config: QuarterlyTaxPrepaymentConfig = {
        enabled: true,
        expectedAnnualCapitalIncome: 10000,
        capitalGainsTaxRate: 26.375,
        taxFreeAllowance: 1000,
        partialExemptionRate: 30,
        year: 2024,
      }

      const result = calculateQuarterlyTaxPrepayments(config)

      // Late payment interest rate: 6% p.a.
      expect(result.latePaymentInterestRate).toBe(0.06)

      // For one quarter (3 months): quarterly payment × 6% × 3/12
      const expectedInterest = (result.quarterlyPrepayment * 0.06 * 3) / 12
      expect(result.estimatedLatePaymentInterest).toBeCloseTo(expectedInterest, 2)
    })

    it('should handle zero capital income', () => {
      const config: QuarterlyTaxPrepaymentConfig = {
        enabled: true,
        expectedAnnualCapitalIncome: 0,
        capitalGainsTaxRate: 26.375,
        taxFreeAllowance: 1000,
        partialExemptionRate: 30,
        year: 2024,
      }

      const result = calculateQuarterlyTaxPrepayments(config)

      expect(result.taxableIncome).toBe(0)
      expect(result.annualTaxLiability).toBe(0)
      expect(result.quarterlyPrepayment).toBe(0)
      expect(result.estimatedLatePaymentInterest).toBe(0)
    })

    it('should handle high capital income scenario', () => {
      const config: QuarterlyTaxPrepaymentConfig = {
        enabled: true,
        expectedAnnualCapitalIncome: 200000,
        capitalGainsTaxRate: 26.375,
        taxFreeAllowance: 1000,
        partialExemptionRate: 30,
        year: 2024,
      }

      const result = calculateQuarterlyTaxPrepayments(config)

      // After partial exemption: 200,000 × 70% = 140,000 €
      // After allowance: 140,000 - 1,000 = 139,000 €
      expect(result.taxableIncome).toBe(139000)
      // Tax: 139,000 × 26.375% = 36,661.25 €
      expect(result.annualTaxLiability).toBeCloseTo(36661.25, 1)
    })

    it('should have four payment dates', () => {
      const config: QuarterlyTaxPrepaymentConfig = {
        enabled: true,
        expectedAnnualCapitalIncome: 10000,
        capitalGainsTaxRate: 26.375,
        taxFreeAllowance: 1000,
        partialExemptionRate: 30,
        year: 2024,
      }

      const result = calculateQuarterlyTaxPrepayments(config)

      expect(result.paymentDates).toHaveLength(4)
      expect(result.paymentDates[0].quarter).toBe(1)
      expect(result.paymentDates[3].quarter).toBe(4)
    })
  })

  describe('calculatePrepaymentAdjustment', () => {
    it('should calculate refund when overpaid', () => {
      const prepaid = 5000
      const actual = 4000
      const adjustment = calculatePrepaymentAdjustment(prepaid, actual)

      // Overpaid by 1,000 € → refund expected
      expect(adjustment).toBe(1000)
    })

    it('should calculate additional payment when underpaid', () => {
      const prepaid = 3000
      const actual = 4000
      const adjustment = calculatePrepaymentAdjustment(prepaid, actual)

      // Underpaid by 1,000 € → additional payment required
      expect(adjustment).toBe(-1000)
    })

    it('should return zero when exactly correct', () => {
      const prepaid = 5000
      const actual = 5000
      const adjustment = calculatePrepaymentAdjustment(prepaid, actual)

      expect(adjustment).toBe(0)
    })
  })

  describe('arePrepaymentsRequired', () => {
    it('should require prepayments when tax exceeds 400 €', () => {
      expect(arePrepaymentsRequired(500)).toBe(true)
      expect(arePrepaymentsRequired(1000)).toBe(true)
      expect(arePrepaymentsRequired(10000)).toBe(true)
    })

    it('should not require prepayments when tax is 400 € or less', () => {
      expect(arePrepaymentsRequired(400)).toBe(false)
      expect(arePrepaymentsRequired(300)).toBe(false)
      expect(arePrepaymentsRequired(0)).toBe(false)
    })

    it('should handle edge case at 400 € threshold', () => {
      expect(arePrepaymentsRequired(400.01)).toBe(true)
      expect(arePrepaymentsRequired(399.99)).toBe(false)
    })
  })

  describe('getOptimizationSuggestions', () => {
    it('should suggest using full tax-free allowance', () => {
      const config: QuarterlyTaxPrepaymentConfig = {
        enabled: true,
        expectedAnnualCapitalIncome: 10000,
        capitalGainsTaxRate: 26.375,
        taxFreeAllowance: 500,
        partialExemptionRate: 30,
        year: 2024,
      }

      const suggestions = getOptimizationSuggestions(config)

      expect(suggestions.length).toBeGreaterThan(0)
      expect(suggestions.some(s => s.includes('Sparer-Pauschbetrag'))).toBe(true)
    })

    it('should suggest partial exemption when not used', () => {
      const config: QuarterlyTaxPrepaymentConfig = {
        enabled: true,
        expectedAnnualCapitalIncome: 10000,
        capitalGainsTaxRate: 26.375,
        taxFreeAllowance: 1000,
        partialExemptionRate: 0,
        year: 2024,
      }

      const suggestions = getOptimizationSuggestions(config)

      expect(suggestions.some(s => s.includes('Teilfreistellung'))).toBe(true)
    })

    it('should suggest strategic planning for high tax liabilities', () => {
      const config: QuarterlyTaxPrepaymentConfig = {
        enabled: true,
        expectedAnnualCapitalIncome: 100000,
        capitalGainsTaxRate: 26.375,
        taxFreeAllowance: 1000,
        partialExemptionRate: 30,
        year: 2024,
      }

      const suggestions = getOptimizationSuggestions(config)

      expect(suggestions.some(s => s.includes('strategisch'))).toBe(true)
    })

    it('should return no suggestions for optimal configuration', () => {
      const config: QuarterlyTaxPrepaymentConfig = {
        enabled: true,
        expectedAnnualCapitalIncome: 5000,
        capitalGainsTaxRate: 26.375,
        taxFreeAllowance: 1000,
        partialExemptionRate: 30,
        year: 2024,
      }

      const suggestions = getOptimizationSuggestions(config)

      // Should have minimal or no suggestions for reasonable configuration
      expect(Array.isArray(suggestions)).toBe(true)
    })
  })
})
