import { describe, test, expect } from 'vitest'
import { calculateVorabpauschale, calculateSteuerOnVorabpauschale, calculateVorabpauschaleDetailed } from './steuer'

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
})
