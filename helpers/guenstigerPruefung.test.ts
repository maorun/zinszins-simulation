import { describe, it, expect } from 'vitest'
import { performGuenstigerPruefung } from './steuer'

describe('performGuenstigerPruefung', () => {
  const defaultAbgeltungssteuer = 0.26375 // 26.375%
  const defaultTeilfreistellungsquote = 0.3 // 30% for equity funds
  const defaultGrundfreibetrag = 11604 // 2024 Grundfreibetrag

  describe('Basic functionality', () => {
    it('should handle zero Vorabpauschale', () => {
      const result = performGuenstigerPruefung(
        0,
        defaultAbgeltungssteuer,
        0.25, // 25% personal tax rate
        defaultTeilfreistellungsquote,
        defaultGrundfreibetrag,
      )

      expect(result.abgeltungssteuerAmount).toBe(0)
      expect(result.personalTaxAmount).toBe(0)
      expect(result.isFavorable).toBe('equal')
      expect(result.explanation).toContain('Keine Vorabpauschale')
    })

    it('should calculate Abgeltungssteuer correctly', () => {
      const vorabpauschale = 1000
      const result = performGuenstigerPruefung(
        vorabpauschale,
        defaultAbgeltungssteuer,
        0.25,
        defaultTeilfreistellungsquote,
      )

      // Expected: 1000 * 0.26375 * (1 - 0.3) = 1000 * 0.26375 * 0.7 = 184.625
      expect(result.abgeltungssteuerAmount).toBeCloseTo(184.625, 2)
    })

    it('should calculate personal tax correctly without Grundfreibetrag', () => {
      const vorabpauschale = 1000
      const personalTaxRate = 0.25
      const result = performGuenstigerPruefung(
        vorabpauschale,
        defaultAbgeltungssteuer,
        personalTaxRate,
        defaultTeilfreistellungsquote,
        0, // No Grundfreibetrag
      )

      // Taxable income: 1000 * (1 - 0.3) = 700
      // Personal tax: 700 * 0.25 = 175
      expect(result.personalTaxAmount).toBeCloseTo(175, 2)
    })

    it('should calculate personal tax correctly with Grundfreibetrag', () => {
      const vorabpauschale = 20000
      const personalTaxRate = 0.25
      const result = performGuenstigerPruefung(
        vorabpauschale,
        defaultAbgeltungssteuer,
        personalTaxRate,
        defaultTeilfreistellungsquote,
        defaultGrundfreibetrag,
      )

      // Taxable before Grundfreibetrag: 20000 * (1 - 0.3) = 14000
      // After Grundfreibetrag: 14000 - 11604 = 2396
      // Personal tax: 2396 * 0.25 = 599
      expect(result.personalTaxAmount).toBeCloseTo(599, 2)
      expect(result.usedGrundfreibetrag).toBe(defaultGrundfreibetrag)
    })
  })

  describe('Tax optimization logic', () => {
    it('should prefer personal tax when it is lower', () => {
      const vorabpauschale = 20000
      const lowPersonalTaxRate = 0.15 // 15% - lower than effective Abgeltungssteuer rate
      const result = performGuenstigerPruefung(
        vorabpauschale,
        defaultAbgeltungssteuer,
        lowPersonalTaxRate,
        defaultTeilfreistellungsquote,
        defaultGrundfreibetrag,
      )

      expect(result.isFavorable).toBe('personal')
      expect(result.personalTaxAmount).toBeLessThan(result.abgeltungssteuerAmount)
      expect(result.explanation).toContain('Persönlicher Steuersatz')
      expect(result.explanation).toContain('15.00%')
    })

    it('should prefer Abgeltungssteuer when it is lower', () => {
      const vorabpauschale = 1000
      const highPersonalTaxRate = 0.42 // 42% - higher than effective Abgeltungssteuer rate
      const result = performGuenstigerPruefung(
        vorabpauschale,
        defaultAbgeltungssteuer,
        highPersonalTaxRate,
        defaultTeilfreistellungsquote,
        0, // No Grundfreibetrag to simplify
      )

      expect(result.isFavorable).toBe('abgeltungssteuer')
      expect(result.abgeltungssteuerAmount).toBeLessThan(result.personalTaxAmount)
      expect(result.explanation).toContain('Abgeltungssteuer')
      expect(result.explanation).toContain('26.38%')
    })

    it('should handle equal tax amounts', () => {
      const vorabpauschale = 1000
      // Find a personal tax rate that equals the effective Abgeltungssteuer rate
      // Abgeltungssteuer: 1000 * 0.26375 * 0.7 = 184.625
      // Personal tax rate needed: 184.625 / (1000 * 0.7) = 0.26375
      const equalPersonalTaxRate = 0.26375
      const result = performGuenstigerPruefung(
        vorabpauschale,
        defaultAbgeltungssteuer,
        equalPersonalTaxRate,
        defaultTeilfreistellungsquote,
        0, // No Grundfreibetrag
      )

      expect(result.isFavorable).toBe('equal')
      expect(result.abgeltungssteuerAmount).toBeCloseTo(result.personalTaxAmount, 2)
      expect(result.explanation).toContain('gleichen Ergebnis')
    })
  })

  describe('Grundfreibetrag handling', () => {
    it('should handle partial Grundfreibetrag usage', () => {
      const vorabpauschale = 10000
      const alreadyUsed = 5000
      const result = performGuenstigerPruefung(
        vorabpauschale,
        defaultAbgeltungssteuer,
        0.25,
        defaultTeilfreistellungsquote,
        defaultGrundfreibetrag,
        alreadyUsed,
      )

      const expectedAvailable = defaultGrundfreibetrag - alreadyUsed
      expect(result.availableGrundfreibetrag).toBe(expectedAvailable)

      // Taxable: 10000 * 0.7 = 7000
      // After remaining Grundfreibetrag: 7000 - 6604 = 396
      // Used Grundfreibetrag: min(6604, 7000) = 6604
      expect(result.usedGrundfreibetrag).toBe(expectedAvailable)
    })

    it('should handle fully used Grundfreibetrag', () => {
      const vorabpauschale = 1000
      const alreadyUsed = defaultGrundfreibetrag
      const result = performGuenstigerPruefung(
        vorabpauschale,
        defaultAbgeltungssteuer,
        0.15,
        defaultTeilfreistellungsquote,
        defaultGrundfreibetrag,
        alreadyUsed,
      )

      expect(result.availableGrundfreibetrag).toBe(0)
      expect(result.usedGrundfreibetrag).toBe(0)
      // Full personal tax: 1000 * 0.7 * 0.15 = 105
      expect(result.personalTaxAmount).toBeCloseTo(105, 2)
    })

    it('should handle case where Vorabpauschale is smaller than available Grundfreibetrag', () => {
      const vorabpauschale = 5000 // Small amount
      const result = performGuenstigerPruefung(
        vorabpauschale,
        defaultAbgeltungssteuer,
        0.25,
        defaultTeilfreistellungsquote,
        defaultGrundfreibetrag,
      )

      // Taxable: 5000 * 0.7 = 3500, which is less than Grundfreibetrag
      expect(result.personalTaxAmount).toBe(0)
      expect(result.usedGrundfreibetrag).toBe(3500)
      expect(result.isFavorable).toBe('personal')
    })
  })

  describe('Used tax rate calculation', () => {
    it('should calculate correct used tax rate for personal tax', () => {
      const vorabpauschale = 20000
      const personalTaxRate = 0.15
      const result = performGuenstigerPruefung(
        vorabpauschale,
        defaultAbgeltungssteuer,
        personalTaxRate,
        defaultTeilfreistellungsquote,
        defaultGrundfreibetrag,
      )

      if (result.isFavorable === 'personal') {
        // Calculate expected effective rate
        const taxableBeforeGrundfreibetrag = vorabpauschale * (1 - defaultTeilfreistellungsquote)
        const taxableAfterGrundfreibetrag = Math.max(0, taxableBeforeGrundfreibetrag - defaultGrundfreibetrag)
        const actualTax = taxableAfterGrundfreibetrag * personalTaxRate
        const expectedRate = actualTax / taxableBeforeGrundfreibetrag

        expect(result.usedTaxRate).toBeCloseTo(expectedRate, 4)
      }
    })

    it('should use Abgeltungssteuer rate when Abgeltungssteuer is favorable', () => {
      const vorabpauschale = 1000
      const highPersonalTaxRate = 0.42
      const result = performGuenstigerPruefung(
        vorabpauschale,
        defaultAbgeltungssteuer,
        highPersonalTaxRate,
        defaultTeilfreistellungsquote,
        0,
      )

      expect(result.isFavorable).toBe('abgeltungssteuer')
      expect(result.usedTaxRate).toBe(defaultAbgeltungssteuer)
    })
  })

  describe('Edge cases', () => {
    it('should handle very small amounts', () => {
      const result = performGuenstigerPruefung(
        0.01,
        defaultAbgeltungssteuer,
        0.25,
        defaultTeilfreistellungsquote,
        defaultGrundfreibetrag,
      )

      expect(result.abgeltungssteuerAmount).toBeGreaterThan(0)
      expect(result.personalTaxAmount).toBe(0) // Should be covered by Grundfreibetrag
      expect(result.isFavorable).toBe('personal')
    })

    it('should handle very large amounts', () => {
      const vorabpauschale = 1000000 // 1 million
      const result = performGuenstigerPruefung(
        vorabpauschale,
        defaultAbgeltungssteuer,
        0.45, // High personal tax rate
        defaultTeilfreistellungsquote,
        defaultGrundfreibetrag,
      )

      expect(result.abgeltungssteuerAmount).toBeGreaterThan(0)
      expect(result.personalTaxAmount).toBeGreaterThan(0)
      expect(result.isFavorable).toBe('abgeltungssteuer') // High personal rate should make Abgeltungssteuer favorable
    })

    it('should handle zero personal tax rate', () => {
      const result = performGuenstigerPruefung(
        1000,
        defaultAbgeltungssteuer,
        0, // 0% personal tax
        defaultTeilfreistellungsquote,
        0,
      )

      expect(result.personalTaxAmount).toBe(0)
      expect(result.isFavorable).toBe('personal')
      expect(result.explanation).toContain('0.00%')
    })
  })
})
