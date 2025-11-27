import { describe, it, expect } from 'vitest'
import {
  type AlimonyConfig,
  type AlimonyPaymentConfig,
  getDefaultAlimonyPayment,
  getDefaultAlimonyConfig,
  calculateAnnualPayment,
  isPaymentActiveInYear,
  calculateTaxDeductibleAmount,
  calculateAlimonyForYear,
  validateAlimonyPayment,
  validateAlimonyConfig,
  calculateCapitalAfterAlimony,
  getSuggestedDescription,
} from './alimony'

describe('alimony', () => {
  describe('getDefaultAlimonyPayment', () => {
    it('should return default child support payment configuration', () => {
      const defaultPayment = getDefaultAlimonyPayment()

      expect(defaultPayment.type).toBe('child_support')
      expect(defaultPayment.monthlyAmount).toBe(500)
      expect(defaultPayment.numberOfRecipients).toBe(1)
      expect(defaultPayment.frequency).toBe('monthly')
      expect(defaultPayment.taxTreatment).toBe('aussergewoehnliche_belastungen')
      expect(defaultPayment.realsplittingAgreement).toBe(false)
      expect(defaultPayment.endYear).toBeNull()
    })

    it('should set current year as start year', () => {
      const defaultPayment = getDefaultAlimonyPayment()
      const currentYear = new Date().getFullYear()

      expect(defaultPayment.startYear).toBe(currentYear)
    })
  })

  describe('getDefaultAlimonyConfig', () => {
    it('should return disabled configuration with empty payments', () => {
      const defaultConfig = getDefaultAlimonyConfig()

      expect(defaultConfig.enabled).toBe(false)
      expect(defaultConfig.payments).toEqual([])
    })
  })

  describe('calculateAnnualPayment', () => {
    it('should calculate annual payment for monthly frequency', () => {
      const annual = calculateAnnualPayment(500, 'monthly')
      expect(annual).toBe(6000) // 500 * 12
    })

    it('should calculate annual payment for quarterly frequency', () => {
      const annual = calculateAnnualPayment(1500, 'quarterly')
      expect(annual).toBe(6000) // 1500 * 4
    })

    it('should calculate annual payment for yearly frequency', () => {
      const annual = calculateAnnualPayment(6000, 'yearly')
      expect(annual).toBe(6000) // 6000 * 1
    })

    it('should handle zero amount', () => {
      const annual = calculateAnnualPayment(0, 'monthly')
      expect(annual).toBe(0)
    })
  })

  describe('isPaymentActiveInYear', () => {
    const basePayment: AlimonyPaymentConfig = {
      ...getDefaultAlimonyPayment(),
      startYear: 2020,
      endYear: 2025,
    }

    it('should return true for year within range', () => {
      expect(isPaymentActiveInYear(basePayment, 2022)).toBe(true)
      expect(isPaymentActiveInYear(basePayment, 2020)).toBe(true) // start year
      expect(isPaymentActiveInYear(basePayment, 2025)).toBe(true) // end year
    })

    it('should return false for year before start', () => {
      expect(isPaymentActiveInYear(basePayment, 2019)).toBe(false)
    })

    it('should return false for year after end', () => {
      expect(isPaymentActiveInYear(basePayment, 2026)).toBe(false)
    })

    it('should return true for all future years if endYear is null', () => {
      const indefinitePayment = { ...basePayment, endYear: null }

      expect(isPaymentActiveInYear(indefinitePayment, 2020)).toBe(true)
      expect(isPaymentActiveInYear(indefinitePayment, 2050)).toBe(true)
      expect(isPaymentActiveInYear(indefinitePayment, 2100)).toBe(true)
    })
  })

  describe('calculateTaxDeductibleAmount', () => {
    it('should return 0 for child support (not tax-deductible)', () => {
      const payment: AlimonyPaymentConfig = {
        ...getDefaultAlimonyPayment(),
        type: 'child_support',
        monthlyAmount: 500,
      }

      const deductible = calculateTaxDeductibleAmount(payment, 6000)
      expect(deductible).toBe(0)
    })

    it('should apply Realsplitting limit for spousal support with agreement', () => {
      const payment: AlimonyPaymentConfig = {
        ...getDefaultAlimonyPayment(),
        type: 'spousal_support',
        monthlyAmount: 1200, // 14,400 per year
        realsplittingAgreement: true,
        taxTreatment: 'sonderausgaben',
      }

      const deductible = calculateTaxDeductibleAmount(payment, 14400)
      expect(deductible).toBe(13805) // Limited to Realsplitting maximum
    })

    it('should allow full deduction if below Realsplitting limit', () => {
      const payment: AlimonyPaymentConfig = {
        ...getDefaultAlimonyPayment(),
        type: 'spousal_support',
        monthlyAmount: 1000, // 12,000 per year
        realsplittingAgreement: true,
        taxTreatment: 'sonderausgaben',
      }

      const deductible = calculateTaxDeductibleAmount(payment, 12000)
      expect(deductible).toBe(12000) // Below limit, fully deductible
    })

    it('should apply außergewöhnliche Belastungen limit without Realsplitting', () => {
      const payment: AlimonyPaymentConfig = {
        ...getDefaultAlimonyPayment(),
        type: 'spousal_support',
        monthlyAmount: 1000, // 12,000 per year
        realsplittingAgreement: false,
        taxTreatment: 'aussergewoehnliche_belastungen',
        numberOfRecipients: 1,
      }

      const deductible = calculateTaxDeductibleAmount(payment, 12000)
      expect(deductible).toBe(10908) // Limited to außergewöhnliche Belastungen max
    })

    it('should multiply außergewöhnliche Belastungen by number of recipients', () => {
      const payment: AlimonyPaymentConfig = {
        ...getDefaultAlimonyPayment(),
        type: 'spousal_support',
        monthlyAmount: 1500,
        realsplittingAgreement: false,
        taxTreatment: 'aussergewoehnliche_belastungen',
        numberOfRecipients: 2,
      }

      const deductible = calculateTaxDeductibleAmount(payment, 18000)
      expect(deductible).toBe(10908 * 2) // Multiplied by recipients
    })

    it('should return 0 for separation support without tax treatment', () => {
      const payment: AlimonyPaymentConfig = {
        ...getDefaultAlimonyPayment(),
        type: 'separation_support',
        monthlyAmount: 800,
        taxTreatment: 'none',
      }

      const deductible = calculateTaxDeductibleAmount(payment, 9600)
      expect(deductible).toBe(0)
    })
  })

  describe('calculateAlimonyForYear', () => {
    it('should return zero result when disabled', () => {
      const config: AlimonyConfig = {
        enabled: false,
        payments: [getDefaultAlimonyPayment()],
      }

      const result = calculateAlimonyForYear(config, 2024)

      expect(result.totalAnnualPayment).toBe(0)
      expect(result.taxDeductibleAmount).toBe(0)
      expect(result.estimatedTaxSavings).toBe(0)
      expect(result.activePayments).toBe(0)
    })

    it('should return zero result when no payments configured', () => {
      const config: AlimonyConfig = {
        enabled: true,
        payments: [],
      }

      const result = calculateAlimonyForYear(config, 2024)

      expect(result.totalAnnualPayment).toBe(0)
      expect(result.activePayments).toBe(0)
    })

    it('should calculate single child support payment correctly', () => {
      const config: AlimonyConfig = {
        enabled: true,
        payments: [
          {
            ...getDefaultAlimonyPayment(),
            type: 'child_support',
            monthlyAmount: 500,
            startYear: 2020,
            endYear: 2030,
          },
        ],
      }

      const result = calculateAlimonyForYear(config, 2024)

      expect(result.totalAnnualPayment).toBe(6000) // 500 * 12
      expect(result.breakdown.childSupport).toBe(6000)
      expect(result.breakdown.spousalSupport).toBe(0)
      expect(result.breakdown.separationSupport).toBe(0)
      expect(result.taxDeductibleAmount).toBe(0) // Child support not deductible
      expect(result.activePayments).toBe(1)
    })

    it('should calculate multiple payments with different types', () => {
      const config: AlimonyConfig = {
        enabled: true,
        payments: [
          {
            ...getDefaultAlimonyPayment(),
            type: 'child_support',
            monthlyAmount: 500,
            startYear: 2020,
            endYear: 2030,
          },
          {
            ...getDefaultAlimonyPayment(),
            type: 'spousal_support',
            monthlyAmount: 800,
            startYear: 2020,
            endYear: 2025,
            realsplittingAgreement: true,
          },
        ],
      }

      const result = calculateAlimonyForYear(config, 2024)

      expect(result.totalAnnualPayment).toBe(15600) // (500 + 800) * 12
      expect(result.breakdown.childSupport).toBe(6000)
      expect(result.breakdown.spousalSupport).toBe(9600)
      expect(result.taxDeductibleAmount).toBe(9600) // Spousal support deductible
      expect(result.activePayments).toBe(2)
    })

    it('should exclude inactive payments from calculation', () => {
      const config: AlimonyConfig = {
        enabled: true,
        payments: [
          {
            ...getDefaultAlimonyPayment(),
            monthlyAmount: 500,
            startYear: 2020,
            endYear: 2023, // Ended before 2024
          },
          {
            ...getDefaultAlimonyPayment(),
            monthlyAmount: 600,
            startYear: 2024,
            endYear: 2030, // Active in 2024
          },
        ],
      }

      const result = calculateAlimonyForYear(config, 2024)

      expect(result.totalAnnualPayment).toBe(7200) // Only second payment (600 * 12)
      expect(result.activePayments).toBe(1)
    })

    it('should calculate tax savings based on marginal tax rate', () => {
      const config: AlimonyConfig = {
        enabled: true,
        payments: [
          {
            ...getDefaultAlimonyPayment(),
            type: 'spousal_support',
            monthlyAmount: 1000,
            startYear: 2020,
            endYear: 2030,
            realsplittingAgreement: true,
          },
        ],
      }

      const result = calculateAlimonyForYear(config, 2024, 0.42) // 42% tax rate

      expect(result.taxDeductibleAmount).toBe(12000)
      expect(result.estimatedTaxSavings).toBe(12000 * 0.42) // 5,040€
    })

    it('should handle quarterly payment frequency', () => {
      const config: AlimonyConfig = {
        enabled: true,
        payments: [
          {
            ...getDefaultAlimonyPayment(),
            monthlyAmount: 1500,
            frequency: 'quarterly',
            startYear: 2024,
            endYear: null,
          },
        ],
      }

      const result = calculateAlimonyForYear(config, 2024)

      expect(result.totalAnnualPayment).toBe(6000) // 1500 * 4
    })
  })

  describe('validateAlimonyPayment', () => {
    it('should pass validation for valid payment', () => {
      const payment = getDefaultAlimonyPayment()
      const errors = validateAlimonyPayment(payment)

      expect(errors).toEqual([])
    })

    it('should reject negative monthly amount', () => {
      const payment = { ...getDefaultAlimonyPayment(), monthlyAmount: -100 }
      const errors = validateAlimonyPayment(payment)

      expect(errors).toContain('Monatlicher Betrag kann nicht negativ sein')
    })

    it('should reject unrealistically high monthly amount', () => {
      const payment = { ...getDefaultAlimonyPayment(), monthlyAmount: 150000 }
      const errors = validateAlimonyPayment(payment)

      expect(errors).toContain('Monatlicher Betrag ist unrealistisch hoch (max. 100.000€)')
    })

    it('should reject invalid start year', () => {
      const payment = { ...getDefaultAlimonyPayment(), startYear: 1800 }
      const errors = validateAlimonyPayment(payment)

      expect(errors).toContain('Startjahr muss zwischen 1900 und 2100 liegen')
    })

    it('should reject end year before start year', () => {
      const payment = { ...getDefaultAlimonyPayment(), startYear: 2025, endYear: 2020 }
      const errors = validateAlimonyPayment(payment)

      expect(errors).toContain('Endjahr kann nicht vor Startjahr liegen')
    })

    it('should reject unrealistic end year', () => {
      const payment = { ...getDefaultAlimonyPayment(), startYear: 2020, endYear: 2200 }
      const errors = validateAlimonyPayment(payment)

      expect(errors).toContain('Endjahr ist unrealistisch (max. 2100)')
    })

    it('should reject less than 1 recipient', () => {
      const payment = { ...getDefaultAlimonyPayment(), numberOfRecipients: 0 }
      const errors = validateAlimonyPayment(payment)

      expect(errors).toContain('Anzahl Empfänger muss mindestens 1 sein')
    })

    it('should reject too many recipients', () => {
      const payment = { ...getDefaultAlimonyPayment(), numberOfRecipients: 15 }
      const errors = validateAlimonyPayment(payment)

      expect(errors).toContain('Anzahl Empfänger ist unrealistisch hoch (max. 10)')
    })

    it('should reject Realsplitting for non-spousal support', () => {
      const payment = {
        ...getDefaultAlimonyPayment(),
        type: 'child_support' as const,
        realsplittingAgreement: true,
      }
      const errors = validateAlimonyPayment(payment)

      expect(errors).toContain('Realsplitting ist nur für Ehegattenunterhalt zulässig')
    })

    it('should allow Realsplitting for spousal support', () => {
      const payment = {
        ...getDefaultAlimonyPayment(),
        type: 'spousal_support' as const,
        realsplittingAgreement: true,
      }
      const errors = validateAlimonyPayment(payment)

      expect(errors).toEqual([])
    })
  })

  describe('validateAlimonyConfig', () => {
    it('should pass validation for valid config', () => {
      const config: AlimonyConfig = {
        enabled: true,
        payments: [getDefaultAlimonyPayment()],
      }
      const errors = validateAlimonyConfig(config)

      expect(errors).toEqual([])
    })

    it('should reject too many payments', () => {
      const config: AlimonyConfig = {
        enabled: true,
        payments: Array(25).fill(getDefaultAlimonyPayment()),
      }
      const errors = validateAlimonyConfig(config)

      expect(errors).toContain('Zu viele Unterhaltszahlungen konfiguriert (max. 20)')
    })

    it('should validate all payments and report errors with indices', () => {
      const config: AlimonyConfig = {
        enabled: true,
        payments: [
          getDefaultAlimonyPayment(), // Valid
          { ...getDefaultAlimonyPayment(), monthlyAmount: -500 }, // Invalid
          { ...getDefaultAlimonyPayment(), numberOfRecipients: 0 }, // Invalid
        ],
      }
      const errors = validateAlimonyConfig(config)

      expect(errors).toContain('Zahlung 2: Monatlicher Betrag kann nicht negativ sein')
      expect(errors).toContain('Zahlung 3: Anzahl Empfänger muss mindestens 1 sein')
    })
  })

  describe('calculateCapitalAfterAlimony', () => {
    it('should subtract alimony from available capital', () => {
      const remaining = calculateCapitalAfterAlimony(50000, 10000)
      expect(remaining).toBe(40000)
    })

    it('should not go below zero', () => {
      const remaining = calculateCapitalAfterAlimony(5000, 10000)
      expect(remaining).toBe(0)
    })

    it('should handle zero alimony', () => {
      const remaining = calculateCapitalAfterAlimony(50000, 0)
      expect(remaining).toBe(50000)
    })

    it('should handle exact match', () => {
      const remaining = calculateCapitalAfterAlimony(10000, 10000)
      expect(remaining).toBe(0)
    })
  })

  describe('getSuggestedDescription', () => {
    it('should return correct description for child support', () => {
      expect(getSuggestedDescription('child_support')).toBe('Kindesunterhalt')
    })

    it('should return correct description for spousal support', () => {
      expect(getSuggestedDescription('spousal_support')).toBe('Nachehelicher Unterhalt')
    })

    it('should return correct description for separation support', () => {
      expect(getSuggestedDescription('separation_support')).toBe('Trennungsunterhalt')
    })
  })
})
