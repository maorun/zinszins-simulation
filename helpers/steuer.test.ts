import { describe, test, expect } from 'vitest'
import {
  calculateVorabpauschale,
  calculateSteuerOnVorabpauschale,
  calculateVorabpauschaleDetailed,
  calculateProgressiveTax,
  calculateProgressiveTaxOnVorabpauschale,
} from './steuer'

describe('Steuer (Tax) Calculations - New', () => {
  describe('calculateVorabpauschale', () => {
    test('should calculate vorabpauschale correctly when gain is higher than basisertrag', () => {
      // Basisertrag = 10000 * 0.0255 * 0.7 = 178.5
      // Gain = 11000 - 10000 = 1000
      // Vorabpauschale should be the lesser amount, i.e., 178.5
      const vorabpauschale = calculateVorabpauschale(10000, 11000, 0.0255)
      expect(vorabpauschale).toBeCloseTo(178.5)
    })

    test('should be capped at the actual gain if it is lower than basisertrag', () => {
      // Basisertrag = 10000 * 0.0255 * 0.7 = 178.5
      // Gain = 10100 - 10000 = 100
      // Vorabpauschale should be capped at the gain, i.e., 100
      const vorabpauschale = calculateVorabpauschale(10000, 10100, 0.0255)
      expect(vorabpauschale).toBe(100)
    })

    test('should be zero if there is a loss', () => {
      // Gain is negative
      const vorabpauschale = calculateVorabpauschale(10000, 9000, 0.0255)
      expect(vorabpauschale).toBe(0)
    })

    test('should handle partial year calculations correctly', () => {
      // Basisertrag for full year = 178.5
      // For 6 months, it should be half
      const vorabpauschale = calculateVorabpauschale(10000, 11000, 0.0255, 6)
      expect(vorabpauschale).toBeCloseTo(178.5 / 2)
    })
  })

  describe('calculateSteuerOnVorabpauschale', () => {
    const VORABPAUSCHALE_AMOUNT = 100
    const TAX_RATE = 0.26375
    const TEILFREISTELLUNG_30 = 0.3

    test('should calculate basic tax correctly', () => {
      // Tax = 100 * 0.26375 * (1 - 0.3) = 18.4625
      const tax = calculateSteuerOnVorabpauschale(VORABPAUSCHALE_AMOUNT, TAX_RATE, TEILFREISTELLUNG_30)
      expect(tax).toBeCloseTo(18.4625)
    })

    test('should calculate correctly with no Teilfreistellung', () => {
      // Tax = 100 * 0.26375 * 1 = 26.375
      const tax = calculateSteuerOnVorabpauschale(VORABPAUSCHALE_AMOUNT, TAX_RATE, 0)
      expect(tax).toBe(26.375)
    })

    test('should be zero if vorabpauschale is zero or negative', () => {
      const tax1 = calculateSteuerOnVorabpauschale(0, TAX_RATE, TEILFREISTELLUNG_30)
      const tax2 = calculateSteuerOnVorabpauschale(-100, TAX_RATE, TEILFREISTELLUNG_30)
      expect(tax1).toBe(0)
      expect(tax2).toBe(0)
    })
  })

  describe('calculateVorabpauschaleDetailed', () => {
    test('should return detailed breakdown of Vorabpauschale calculation', () => {
      const startkapital = 10000
      const endkapital = 11000
      const basiszins = 0.0255
      const steuerlast = 0.26375
      const teilfreistellung = 0.3

      const details = calculateVorabpauschaleDetailed(
        startkapital,
        endkapital,
        basiszins,
        12,
        steuerlast,
        teilfreistellung,
      )

      expect(details.basiszins).toBe(0.0255)
      expect(details.jahresgewinn).toBe(1000)
      expect(details.anteilImJahr).toBe(12)
      expect(details.basisertrag).toBeCloseTo(178.5) // 10000 * 0.0255 * 0.7
      expect(details.vorabpauschaleAmount).toBeCloseTo(178.5) // min(basisertrag, jahresgewinn)
      expect(details.steuerVorFreibetrag).toBeCloseTo(32.9556, 3) // 178.5 * 0.26375 * (1 - 0.3)
    })

    test('should handle partial year ownership', () => {
      const details = calculateVorabpauschaleDetailed(10000, 11000, 0.0255, 6, 0.26375, 0.3)

      expect(details.anteilImJahr).toBe(6)
      expect(details.basisertrag).toBeCloseTo(89.25) // 10000 * 0.0255 * 0.7 * (6/12)
      expect(details.vorabpauschaleAmount).toBeCloseTo(89.25)
    })

    test('should limit vorabpauschale to actual gain when basisertrag is higher', () => {
      const details = calculateVorabpauschaleDetailed(10000, 10100, 0.0255, 12, 0.26375, 0.3)

      expect(details.jahresgewinn).toBe(100)
      expect(details.basisertrag).toBeCloseTo(178.5)
      expect(details.vorabpauschaleAmount).toBe(100) // Limited to actual gain
    })

    test('should be zero when there is no gain', () => {
      const details = calculateVorabpauschaleDetailed(10000, 9900, 0.0255, 12, 0.26375, 0.3)

      expect(details.jahresgewinn).toBe(-100)
      expect(details.vorabpauschaleAmount).toBe(0) // Never negative
      expect(details.steuerVorFreibetrag).toBe(0)
    })
  })

  describe('calculateProgressiveTax', () => {
    test('should return zero tax for income below Grundfreibetrag', () => {
      const result = calculateProgressiveTax(10000)
      expect(result.totalTax).toBe(0)
      expect(result.effectiveRate).toBe(0)
      expect(result.marginalRate).toBe(0)
      expect(result.usedGrundfreibetrag).toBe(0)
    })

    test('should return zero tax for income equal to Grundfreibetrag', () => {
      const result = calculateProgressiveTax(11604)
      expect(result.totalTax).toBe(0)
      expect(result.effectiveRate).toBe(0)
      expect(result.marginalRate).toBe(0)
      expect(result.usedGrundfreibetrag).toBe(0)
    })

    test('should calculate tax for income in Zone 2 (11,605€ - 17,005€)', () => {
      // Test with 15,000€ income
      const result = calculateProgressiveTax(15000)
      // Tax = (922.98 * z + 1400) * z where z = (15000 - 11604) / 10000 = 0.3396
      // Tax = (922.98 * 0.3396 + 1400) * 0.3396 = 581.89€
      expect(result.totalTax).toBeGreaterThan(570)
      expect(result.totalTax).toBeLessThan(600)
      expect(result.marginalRate).toBe(0.14)
      expect(result.usedGrundfreibetrag).toBe(0)
      expect(result.effectiveRate).toBeGreaterThan(0.038) // More than 3.8%
      expect(result.effectiveRate).toBeLessThan(0.04) // Less than 4%
    })

    test('should calculate tax for income in Zone 3 (17,006€ - 66,760€)', () => {
      // Test with 30,000€ income
      const result = calculateProgressiveTax(30000)
      // Expected tax is approximately 4,446€
      expect(result.totalTax).toBeGreaterThan(4300)
      expect(result.totalTax).toBeLessThan(4600)
      expect(result.marginalRate).toBe(0.2397)
      expect(result.usedGrundfreibetrag).toBe(0)
      expect(result.effectiveRate).toBeGreaterThan(0.14) // More than 14%
      expect(result.effectiveRate).toBeLessThan(0.15) // Less than 15%
    })

    test('should calculate tax for income in Zone 4 (66,761€ - 277,825€)', () => {
      // Test with 100,000€ income
      const result = calculateProgressiveTax(100000)
      // Zone 4 has a flat 42% marginal rate
      // Expected tax is approximately 31,398€
      expect(result.totalTax).toBeGreaterThan(31000)
      expect(result.totalTax).toBeLessThan(32000)
      expect(result.marginalRate).toBe(0.42)
      expect(result.usedGrundfreibetrag).toBe(0)
      expect(result.effectiveRate).toBeGreaterThan(0.31) // More than 31%
      expect(result.effectiveRate).toBeLessThan(0.32) // Less than 32%
    })

    test('should calculate tax for income in Zone 5 (277,826€+)', () => {
      // Test with 300,000€ income (Reichensteuer applies)
      const result = calculateProgressiveTax(300000)
      // Zone 5 has a 45% marginal rate
      // Expected tax is approximately 116,063€
      expect(result.totalTax).toBeGreaterThan(115000)
      expect(result.totalTax).toBeLessThan(117000)
      expect(result.marginalRate).toBe(0.45)
      expect(result.usedGrundfreibetrag).toBe(0)
      expect(result.effectiveRate).toBeGreaterThan(0.38) // More than 38%
      expect(result.effectiveRate).toBeLessThan(0.39) // Less than 39%
    })

    test('should handle Grundfreibetrag offset for capital gains', () => {
      // 20,000€ capital gains with 11,604€ Grundfreibetrag to offset
      const result = calculateProgressiveTax(20000, 11604, 0)
      // After offset: 20,000 - 11,604 = 8,396€ taxable
      // This falls in Zone 1, so no tax
      expect(result.usedGrundfreibetrag).toBe(11604)
      expect(result.totalTax).toBe(0)
    })

    test('should handle partially used Grundfreibetrag', () => {
      // 20,000€ income with 5,000€ Grundfreibetrag already used
      const result = calculateProgressiveTax(20000, 11604, 5000)
      const remainingGrundfreibetrag = 11604 - 5000 // 6,604€
      expect(result.usedGrundfreibetrag).toBe(remainingGrundfreibetrag)
      // Taxable income: 20,000 - 6,604 = 13,396€
      // This falls in Zone 2
      expect(result.totalTax).toBeGreaterThan(280)
      expect(result.totalTax).toBeLessThan(400)
    })

    test('should handle fully used Grundfreibetrag', () => {
      const result = calculateProgressiveTax(20000, 11604, 11604)
      expect(result.usedGrundfreibetrag).toBe(0)
      // Full 20,000€ is taxable, falls in Zone 3
      expect(result.totalTax).toBeGreaterThan(1700)
      expect(result.totalTax).toBeLessThan(1900)
    })

    test('should provide detailed bracket breakdown', () => {
      const result = calculateProgressiveTax(30000)
      expect(result.bracketBreakdown.length).toBeGreaterThan(0)
      // Should show which bracket the income falls into
      const lastBracket = result.bracketBreakdown[result.bracketBreakdown.length - 1]
      expect(lastBracket.bracket.marginalRate).toBe(0.2397) // Zone 3
    })
  })

  describe('calculateProgressiveTaxOnVorabpauschale', () => {
    test('should apply Teilfreistellung before progressive tax calculation', () => {
      // 20,000€ Vorabpauschale with 30% Teilfreistellung
      // Taxable: 20,000 * (1 - 0.3) = 14,000€
      const result = calculateProgressiveTaxOnVorabpauschale(20000, 0.3)

      // 14,000€ falls in Zone 2
      expect(result.totalTax).toBeGreaterThan(380)
      expect(result.totalTax).toBeLessThan(480)
      expect(result.kirchensteuer).toBe(0)
    })

    test('should calculate Kirchensteuer when active', () => {
      const resultWithoutKirchensteuer = calculateProgressiveTaxOnVorabpauschale(20000, 0.3, 0, 0, false, 9)
      const resultWithKirchensteuer = calculateProgressiveTaxOnVorabpauschale(20000, 0.3, 0, 0, true, 9)

      // Kirchensteuer should be 9% of the base tax
      expect(resultWithKirchensteuer.kirchensteuer).toBeCloseTo(resultWithoutKirchensteuer.totalTax * 0.09, 2)
      expect(resultWithKirchensteuer.totalTax).toBeCloseTo(resultWithoutKirchensteuer.totalTax * 1.09, 2)
    })

    test('should handle different Kirchensteuersatz (8% vs 9%)', () => {
      const resultWith9Percent = calculateProgressiveTaxOnVorabpauschale(20000, 0.3, 0, 0, true, 9)
      const resultWith8Percent = calculateProgressiveTaxOnVorabpauschale(20000, 0.3, 0, 0, true, 8)

      // 8% should result in slightly less Kirchensteuer than 9%
      expect(resultWith8Percent.kirchensteuer).toBeLessThan(resultWith9Percent.kirchensteuer)
      expect(resultWith8Percent.totalTax).toBeLessThan(resultWith9Percent.totalTax)
    })

    test('should handle high Vorabpauschale with progressive rates', () => {
      // 100,000€ Vorabpauschale with 30% Teilfreistellung
      // Taxable: 100,000 * 0.7 = 70,000€
      const result = calculateProgressiveTaxOnVorabpauschale(100000, 0.3, 0, 0, false, 9)

      // Should reach Zone 4 (42% marginal rate)
      expect(result.marginalRate).toBe(0.42)
      expect(result.totalTax).toBeGreaterThan(15000)
      expect(result.totalTax).toBeLessThan(19000)
    })

    test('should handle zero Teilfreistellung', () => {
      // 20,000€ Vorabpauschale with no Teilfreistellung
      const result = calculateProgressiveTaxOnVorabpauschale(20000, 0, 0, 0, false, 9)

      // Full 20,000€ is taxable, falls in Zone 3
      expect(result.totalTax).toBeGreaterThan(1700)
      expect(result.totalTax).toBeLessThan(1900)
    })

    test('should return zero tax for Vorabpauschale below Grundfreibetrag with offset', () => {
      // 10,000€ Vorabpauschale with 30% Teilfreistellung
      // Taxable: 10,000 * 0.7 = 7,000€
      // With 11,604€ Grundfreibetrag offset, this results in 0 tax
      const result = calculateProgressiveTaxOnVorabpauschale(10000, 0.3, 11604, 0, false, 9)

      expect(result.totalTax).toBe(0)
      expect(result.effectiveRate).toBe(0)
      expect(result.kirchensteuer).toBe(0)
      expect(result.usedGrundfreibetrag).toBe(7000)
    })
  })
})
