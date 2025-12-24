import { describe, it, expect } from 'vitest'
import {
  calculateQuellensteuerconfigCredit,
  calculateTotalQuellensteuerconfigCredit,
  getWithholdingTaxRateForCountry,
  validateQuellensteuerconfigConfiguration,
  createDefaultQuellensteuerconfigConfiguration,
  COMMON_WITHHOLDING_TAX_RATES,
  type QuellensteuerconfigConfiguration,
} from './quellensteuer'

describe('Quellensteuer (Foreign Withholding Tax) Calculations', () => {
  const GERMAN_CAPITAL_GAINS_TAX = 0.26375 // 26.375% (25% + 5.5% Soli)

  describe('calculateQuellensteuerconfigCredit', () => {
    it('should calculate credit when foreign tax is lower than German tax', () => {
      // US dividend: 1000 EUR, 15% withholding tax
      const result = calculateQuellensteuerconfigCredit(1000, 0.15, GERMAN_CAPITAL_GAINS_TAX, 0)

      expect(result.foreignIncome).toBe(1000)
      expect(result.foreignWithholdingTaxPaid).toBe(150) // 15%
      expect(result.germanTaxDue).toBeCloseTo(263.75, 2) // 26.375%
      expect(result.creditableAmount).toBe(150) // Full foreign tax is creditable
      expect(result.remainingGermanTax).toBeCloseTo(113.75, 2) // 263.75 - 150
      expect(result.limitApplied).toBe(false)
      expect(result.explanation).toContain('1000.00 €')
      expect(result.explanation).toContain('15.0%')
    })

    it('should limit credit when foreign tax is higher than German tax', () => {
      // Swiss dividend: 1000 EUR, 35% withholding tax (before DBA reduction)
      const result = calculateQuellensteuerconfigCredit(1000, 0.35, GERMAN_CAPITAL_GAINS_TAX, 0)

      expect(result.foreignIncome).toBe(1000)
      expect(result.foreignWithholdingTaxPaid).toBe(350) // 35%
      expect(result.germanTaxDue).toBeCloseTo(263.75, 2) // 26.375%
      expect(result.creditableAmount).toBeCloseTo(263.75, 2) // Limited to German tax
      expect(result.remainingGermanTax).toBe(0) // No German tax due
      expect(result.limitApplied).toBe(true)
      expect(result.explanation).toContain('begrenzt')
      expect(result.explanation).toContain('nicht anrechenbare')
    })

    it('should apply Teilfreistellung for equity funds', () => {
      // Equity fund dividend: 1000 EUR, 15% withholding tax, 30% Teilfreistellung
      const result = calculateQuellensteuerconfigCredit(1000, 0.15, GERMAN_CAPITAL_GAINS_TAX, 0.3)

      expect(result.foreignIncome).toBe(1000)
      expect(result.foreignWithholdingTaxPaid).toBe(150) // 15% of 1000
      const expectedTaxableIncome = 1000 * 0.7 // 30% exemption
      const expectedGermanTax = expectedTaxableIncome * GERMAN_CAPITAL_GAINS_TAX
      expect(result.germanTaxDue).toBeCloseTo(expectedGermanTax, 2)
      expect(result.creditableAmount).toBe(150) // Foreign tax is lower
      expect(result.explanation).toContain('Teilfreistellung')
      expect(result.explanation).toContain('30%')
    })

    it('should handle zero foreign income', () => {
      const result = calculateQuellensteuerconfigCredit(0, 0.15, GERMAN_CAPITAL_GAINS_TAX, 0)

      expect(result.foreignIncome).toBe(0)
      expect(result.foreignWithholdingTaxPaid).toBe(0)
      expect(result.germanTaxDue).toBe(0)
      expect(result.creditableAmount).toBe(0)
      expect(result.remainingGermanTax).toBe(0)
    })

    it('should handle zero withholding tax (e.g., UK dividends)', () => {
      // UK dividend: 1000 EUR, 0% withholding tax
      const result = calculateQuellensteuerconfigCredit(1000, 0, GERMAN_CAPITAL_GAINS_TAX, 0)

      expect(result.foreignIncome).toBe(1000)
      expect(result.foreignWithholdingTaxPaid).toBe(0)
      expect(result.germanTaxDue).toBeCloseTo(263.75, 2)
      expect(result.creditableAmount).toBe(0)
      expect(result.remainingGermanTax).toBeCloseTo(263.75, 2)
      expect(result.limitApplied).toBe(false)
    })

    it('should handle large foreign income amounts', () => {
      // Large US dividend: 100,000 EUR, 15% withholding tax
      const result = calculateQuellensteuerconfigCredit(100000, 0.15, GERMAN_CAPITAL_GAINS_TAX, 0)

      expect(result.foreignIncome).toBe(100000)
      expect(result.foreignWithholdingTaxPaid).toBe(15000)
      expect(result.germanTaxDue).toBeCloseTo(26375, 2)
      expect(result.creditableAmount).toBe(15000) // Full foreign tax is creditable (lower than German tax)
      expect(result.remainingGermanTax).toBeCloseTo(11375, 2) // 26375 - 15000
      expect(result.limitApplied).toBe(false) // Not limited since foreign tax < German tax
    })

    it('should calculate correctly with different German tax rates', () => {
      // Test with Günstigerprüfung scenario (lower personal tax rate)
      const lowerGermanTaxRate = 0.2 // 20% personal tax rate
      const result = calculateQuellensteuerconfigCredit(1000, 0.15, lowerGermanTaxRate, 0)

      expect(result.foreignIncome).toBe(1000)
      expect(result.foreignWithholdingTaxPaid).toBe(150)
      expect(result.germanTaxDue).toBe(200) // 20%
      expect(result.creditableAmount).toBe(150) // Full foreign tax
      expect(result.remainingGermanTax).toBe(50) // 200 - 150
      expect(result.limitApplied).toBe(false)
    })

    it('should handle edge case where foreign tax equals German tax', () => {
      // Contrived scenario where rates match
      const matchingRate = 0.26375
      const result = calculateQuellensteuerconfigCredit(1000, matchingRate, GERMAN_CAPITAL_GAINS_TAX, 0)

      expect(result.foreignWithholdingTaxPaid).toBeCloseTo(263.75, 2)
      expect(result.germanTaxDue).toBeCloseTo(263.75, 2)
      expect(result.creditableAmount).toBeCloseTo(263.75, 2)
      expect(result.remainingGermanTax).toBeCloseTo(0, 2)
      expect(result.limitApplied).toBe(false)
    })
  })

  describe('getWithholdingTaxRateForCountry', () => {
    it('should return USA withholding tax rates', () => {
      const rate = getWithholdingTaxRateForCountry('US')

      expect(rate).toBeDefined()
      expect(rate?.country).toBe('USA')
      expect(rate?.standardRate).toBe(0.3)
      expect(rate?.dbaRate).toBe(0.15)
    })

    it('should return Switzerland withholding tax rates', () => {
      const rate = getWithholdingTaxRateForCountry('CH')

      expect(rate).toBeDefined()
      expect(rate?.country).toBe('Schweiz')
      expect(rate?.standardRate).toBe(0.35)
      expect(rate?.dbaRate).toBe(0.15)
    })

    it('should return UK withholding tax rates (0%)', () => {
      const rate = getWithholdingTaxRateForCountry('GB')

      expect(rate).toBeDefined()
      expect(rate?.country).toBe('Großbritannien')
      expect(rate?.standardRate).toBe(0)
      expect(rate?.dbaRate).toBe(0)
    })

    it('should return undefined for unknown country', () => {
      const rate = getWithholdingTaxRateForCountry('ZZ')

      expect(rate).toBeUndefined()
    })

    it('should handle all common countries', () => {
      const countryCodes = ['US', 'CH', 'AT', 'FR', 'GB', 'JP', 'CA', 'AU']

      countryCodes.forEach(code => {
        const rate = getWithholdingTaxRateForCountry(code)
        expect(rate).toBeDefined()
        expect(rate?.countryCode).toBe(code)
        expect(rate?.standardRate).toBeGreaterThanOrEqual(0)
        expect(rate?.dbaRate).toBeGreaterThanOrEqual(0)
        expect(rate?.dbaRate).toBeLessThanOrEqual(rate!.standardRate) // DBA rate should be <= standard
      })
    })
  })

  describe('COMMON_WITHHOLDING_TAX_RATES', () => {
    it('should have consistent data structure', () => {
      COMMON_WITHHOLDING_TAX_RATES.forEach(rate => {
        expect(rate.country).toBeTruthy()
        expect(rate.countryCode).toBeTruthy()
        expect(rate.countryCode.length).toBe(2) // ISO codes are 2 letters
        expect(rate.standardRate).toBeGreaterThanOrEqual(0)
        expect(rate.dbaRate).toBeGreaterThanOrEqual(0)
        expect(rate.dbaRate).toBeLessThanOrEqual(rate.standardRate) // DBA should reduce or maintain rate
        expect(rate.description).toBeTruthy()
      })
    })

    it('should have at least 8 countries', () => {
      expect(COMMON_WITHHOLDING_TAX_RATES.length).toBeGreaterThanOrEqual(8)
    })

    it('should have unique country codes', () => {
      const codes = COMMON_WITHHOLDING_TAX_RATES.map(r => r.countryCode)
      const uniqueCodes = new Set(codes)
      expect(codes.length).toBe(uniqueCodes.size)
    })
  })

  describe('calculateTotalQuellensteuerconfigCredit', () => {
    it('should calculate total for multiple foreign income sources', () => {
      const configs: QuellensteuerconfigConfiguration[] = [
        { enabled: true, foreignIncome: 1000, withholdingTaxRate: 0.15, countryCode: 'US' },
        { enabled: true, foreignIncome: 500, withholdingTaxRate: 0.15, countryCode: 'CH' },
      ]

      const result = calculateTotalQuellensteuerconfigCredit(configs, GERMAN_CAPITAL_GAINS_TAX, 0)

      expect(result.totalForeignIncome).toBe(1500)
      expect(result.totalForeignTaxPaid).toBe(225) // 150 + 75
      expect(result.totalCreditableAmount).toBe(225)
      expect(result.details).toHaveLength(2)
    })

    it('should ignore disabled configurations', () => {
      const configs: QuellensteuerconfigConfiguration[] = [
        { enabled: true, foreignIncome: 1000, withholdingTaxRate: 0.15, countryCode: 'US' },
        { enabled: false, foreignIncome: 5000, withholdingTaxRate: 0.35, countryCode: 'CH' },
      ]

      const result = calculateTotalQuellensteuerconfigCredit(configs, GERMAN_CAPITAL_GAINS_TAX, 0)

      expect(result.totalForeignIncome).toBe(1000)
      expect(result.totalForeignTaxPaid).toBe(150)
      expect(result.details).toHaveLength(1)
    })

    it('should handle empty configuration array', () => {
      const configs: QuellensteuerconfigConfiguration[] = []

      const result = calculateTotalQuellensteuerconfigCredit(configs, GERMAN_CAPITAL_GAINS_TAX, 0)

      expect(result.totalForeignIncome).toBe(0)
      expect(result.totalForeignTaxPaid).toBe(0)
      expect(result.totalCreditableAmount).toBe(0)
      expect(result.totalGermanTaxDue).toBe(0)
      expect(result.totalRemainingGermanTax).toBe(0)
      expect(result.details).toHaveLength(0)
    })

    it('should apply Teilfreistellung to all sources', () => {
      const configs: QuellensteuerconfigConfiguration[] = [
        { enabled: true, foreignIncome: 1000, withholdingTaxRate: 0.15, countryCode: 'US' },
        { enabled: true, foreignIncome: 2000, withholdingTaxRate: 0.15, countryCode: 'FR' },
      ]

      const result = calculateTotalQuellensteuerconfigCredit(configs, GERMAN_CAPITAL_GAINS_TAX, 0.3)

      expect(result.totalForeignIncome).toBe(3000)
      // With 30% Teilfreistellung, taxable income is 2100
      const expectedGermanTax = 3000 * 0.7 * GERMAN_CAPITAL_GAINS_TAX
      expect(result.totalGermanTaxDue).toBeCloseTo(expectedGermanTax, 2)
    })

    it('should handle mix of limited and unlimited credits', () => {
      const configs: QuellensteuerconfigConfiguration[] = [
        { enabled: true, foreignIncome: 1000, withholdingTaxRate: 0.15, countryCode: 'US' }, // Not limited
        { enabled: true, foreignIncome: 1000, withholdingTaxRate: 0.35, countryCode: 'CH' }, // Limited
      ]

      const result = calculateTotalQuellensteuerconfigCredit(configs, GERMAN_CAPITAL_GAINS_TAX, 0)

      expect(result.totalForeignIncome).toBe(2000)
      expect(result.totalForeignTaxPaid).toBe(500) // 150 + 350
      expect(result.totalGermanTaxDue).toBeCloseTo(527.5, 2) // 2000 * 0.26375
      expect(result.totalCreditableAmount).toBeCloseTo(413.75, 2) // 150 + 263.75 (limited)
      expect(result.totalRemainingGermanTax).toBeCloseTo(113.75, 2)
    })
  })

  describe('validateQuellensteuerconfigConfiguration', () => {
    it('should pass validation for valid configuration', () => {
      const config: QuellensteuerconfigConfiguration = {
        enabled: true,
        foreignIncome: 1000,
        withholdingTaxRate: 0.15,
        countryCode: 'US',
      }

      const errors = validateQuellensteuerconfigConfiguration(config)
      expect(errors).toHaveLength(0)
    })

    it('should reject negative foreign income', () => {
      const config: QuellensteuerconfigConfiguration = {
        enabled: true,
        foreignIncome: -1000,
        withholdingTaxRate: 0.15,
        countryCode: 'US',
      }

      const errors = validateQuellensteuerconfigConfiguration(config)
      expect(errors.length).toBeGreaterThan(0)
      expect(errors[0]).toContain('negativ')
    })

    it('should reject withholding tax rate > 100%', () => {
      const config: QuellensteuerconfigConfiguration = {
        enabled: true,
        foreignIncome: 1000,
        withholdingTaxRate: 1.5,
        countryCode: 'US',
      }

      const errors = validateQuellensteuerconfigConfiguration(config)
      expect(errors.length).toBeGreaterThan(0)
      expect(errors.some(e => e.includes('100%'))).toBe(true)
    })

    it('should reject negative withholding tax rate', () => {
      const config: QuellensteuerconfigConfiguration = {
        enabled: true,
        foreignIncome: 1000,
        withholdingTaxRate: -0.15,
        countryCode: 'US',
      }

      const errors = validateQuellensteuerconfigConfiguration(config)
      expect(errors.length).toBeGreaterThan(0)
    })

    it('should warn for unusually high withholding tax rate', () => {
      const config: QuellensteuerconfigConfiguration = {
        enabled: true,
        foreignIncome: 1000,
        withholdingTaxRate: 0.6, // 60%
        countryCode: 'US',
      }

      const errors = validateQuellensteuerconfigConfiguration(config)
      expect(errors.length).toBeGreaterThan(0)
      expect(errors.some(e => e.includes('Warnung'))).toBe(true)
      expect(errors.some(e => e.includes('50%'))).toBe(true)
    })

    it('should skip validation when disabled', () => {
      const config: QuellensteuerconfigConfiguration = {
        enabled: false,
        foreignIncome: -1000, // Invalid, but should be ignored
        withholdingTaxRate: 2.0, // Invalid, but should be ignored
      }

      const errors = validateQuellensteuerconfigConfiguration(config)
      expect(errors).toHaveLength(0)
    })

    it('should accept zero values', () => {
      const config: QuellensteuerconfigConfiguration = {
        enabled: true,
        foreignIncome: 0,
        withholdingTaxRate: 0,
        countryCode: 'GB', // UK has 0% withholding tax
      }

      const errors = validateQuellensteuerconfigConfiguration(config)
      expect(errors).toHaveLength(0)
    })
  })

  describe('createDefaultQuellensteuerconfigConfiguration', () => {
    it('should create valid default configuration', () => {
      const config = createDefaultQuellensteuerconfigConfiguration()

      expect(config.enabled).toBe(false)
      expect(config.foreignIncome).toBe(0)
      expect(config.withholdingTaxRate).toBe(0.15) // Common DBA rate
      expect(config.countryCode).toBe('US')

      // Should pass validation
      const errors = validateQuellensteuerconfigConfiguration(config)
      expect(errors).toHaveLength(0)
    })

    it('should create independent configurations', () => {
      const config1 = createDefaultQuellensteuerconfigConfiguration()
      const config2 = createDefaultQuellensteuerconfigConfiguration()

      config1.foreignIncome = 1000
      expect(config2.foreignIncome).toBe(0) // Should not be affected
    })
  })

  describe('Integration scenarios', () => {
    it('should handle realistic US dividend scenario', () => {
      // German investor receives $5000 dividend from US stocks
      // Converted to EUR: 4500 EUR (example exchange rate)
      // US withholding tax: 15% (DBA rate)
      const foreignIncome = 4500
      const withholdingTaxRate = 0.15
      const teilfreistellung = 0.3 // Equity fund

      const result = calculateQuellensteuerconfigCredit(
        foreignIncome,
        withholdingTaxRate,
        GERMAN_CAPITAL_GAINS_TAX,
        teilfreistellung,
      )

      expect(result.foreignIncome).toBe(4500)
      expect(result.foreignWithholdingTaxPaid).toBe(675) // 15% of 4500
      const taxableIncome = 4500 * 0.7 // 30% exemption
      const germanTax = taxableIncome * GERMAN_CAPITAL_GAINS_TAX
      expect(result.germanTaxDue).toBeCloseTo(germanTax, 2)
      expect(result.creditableAmount).toBe(675) // Full credit
      expect(result.remainingGermanTax).toBeCloseTo(germanTax - 675, 2)
    })

    it('should handle Swiss dividend with high withholding tax', () => {
      // Swiss dividends have 35% withholding tax
      // Only 15% under DBA, but need to reclaim 20% from Swiss authorities
      // For this test, assume investor only got 15% DBA rate back
      const foreignIncome = 2000
      const withholdingTaxRate = 0.15 // After DBA reduction

      const result = calculateQuellensteuerconfigCredit(
        foreignIncome,
        withholdingTaxRate,
        GERMAN_CAPITAL_GAINS_TAX,
        0.3,
      )

      expect(result.foreignWithholdingTaxPaid).toBe(300)
      expect(result.creditableAmount).toBe(300)
    })

    it('should handle portfolio with mixed countries', () => {
      const configs: QuellensteuerconfigConfiguration[] = [
        { enabled: true, foreignIncome: 3000, withholdingTaxRate: 0.15, countryCode: 'US' }, // US stocks
        { enabled: true, foreignIncome: 2000, withholdingTaxRate: 0, countryCode: 'GB' }, // UK stocks (no WHT)
        { enabled: true, foreignIncome: 1000, withholdingTaxRate: 0.15, countryCode: 'FR' }, // French stocks
      ]

      const result = calculateTotalQuellensteuerconfigCredit(configs, GERMAN_CAPITAL_GAINS_TAX, 0.3)

      expect(result.totalForeignIncome).toBe(6000)
      expect(result.totalForeignTaxPaid).toBe(600) // 450 + 0 + 150
      expect(result.details).toHaveLength(3)

      // Verify each detail
      expect(result.details[0].foreignWithholdingTaxPaid).toBe(450) // US
      expect(result.details[1].foreignWithholdingTaxPaid).toBe(0) // UK
      expect(result.details[2].foreignWithholdingTaxPaid).toBe(150) // FR
    })
  })
})
