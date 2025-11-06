import { describe, it, expect } from 'vitest'
import { calculateIncomeTax } from './withdrawal'
import { performGuenstigerPruefung } from './steuer'

describe('Kirchensteuer Integration', () => {
  describe('calculateIncomeTax with Kirchensteuer', () => {
    it('should calculate income tax without Kirchensteuer when disabled', () => {
      const withdrawalAmount = 20000
      const grundfreibetrag = 11604 // 2024 value
      const incomeTaxRate = 0.25 // 25%
      const expectedTaxableIncome = withdrawalAmount - grundfreibetrag
      const expectedTax = expectedTaxableIncome * incomeTaxRate

      const result = calculateIncomeTax(
        withdrawalAmount,
        grundfreibetrag,
        incomeTaxRate,
        false, // Kirchensteuer disabled
        9,
      )

      expect(result).toBe(expectedTax)
      expect(result).toBe(2099) // (20000 - 11604) * 0.25
    })

    it('should calculate income tax with 9% Kirchensteuer when enabled', () => {
      const withdrawalAmount = 20000
      const grundfreibetrag = 11604
      const incomeTaxRate = 0.25 // 25%
      const kirchensteuersatz = 9 // 9%

      const taxableIncome = withdrawalAmount - grundfreibetrag
      const baseIncomeTax = taxableIncome * incomeTaxRate
      const kirchensteuer = baseIncomeTax * (kirchensteuersatz / 100)
      const expectedTotal = baseIncomeTax + kirchensteuer

      const result = calculateIncomeTax(
        withdrawalAmount,
        grundfreibetrag,
        incomeTaxRate,
        true, // Kirchensteuer enabled
        kirchensteuersatz,
      )

      expect(result).toBe(expectedTotal)
      expect(result).toBe(2287.91) // 2099 + (2099 * 0.09)
    })

    it('should calculate income tax with 8% Kirchensteuer (Bayern/Baden-Württemberg)', () => {
      const withdrawalAmount = 30000
      const grundfreibetrag = 11604
      const incomeTaxRate = 0.3 // 30%
      const kirchensteuersatz = 8 // 8%

      const taxableIncome = withdrawalAmount - grundfreibetrag
      const baseIncomeTax = taxableIncome * incomeTaxRate
      const kirchensteuer = baseIncomeTax * (kirchensteuersatz / 100)
      const expectedTotal = baseIncomeTax + kirchensteuer

      const result = calculateIncomeTax(withdrawalAmount, grundfreibetrag, incomeTaxRate, true, kirchensteuersatz)

      expect(result).toBe(expectedTotal)
      expect(result).toBe(5960.304) // (30000-11604)*0.30 + (5518.8*0.08)
    })

    it('should return 0 when withdrawal amount is below Grundfreibetrag', () => {
      const withdrawalAmount = 10000
      const grundfreibetrag = 11604
      const incomeTaxRate = 0.25
      const kirchensteuersatz = 9

      const result = calculateIncomeTax(withdrawalAmount, grundfreibetrag, incomeTaxRate, true, kirchensteuersatz)

      expect(result).toBe(0)
    })

    it('should handle edge case with exact Grundfreibetrag amount', () => {
      const withdrawalAmount = 11604
      const grundfreibetrag = 11604
      const incomeTaxRate = 0.25
      const kirchensteuersatz = 9

      const result = calculateIncomeTax(withdrawalAmount, grundfreibetrag, incomeTaxRate, true, kirchensteuersatz)

      expect(result).toBe(0)
    })
  })

  describe('performGuenstigerPruefung with Kirchensteuer', () => {
    const vorabpauschale = 1000
    const abgeltungssteuer = 0.26375 // 26.375%
    const teilfreistellungsquote = 0.3 // 30%
    const grundfreibetrag = 2000
    const alreadyUsedGrundfreibetrag = 0

    it('should favor Abgeltungssteuer when personal tax rate + Kirchensteuer is higher', () => {
      const personalTaxRate = 0.3 // 30%
      const kirchensteuersatz = 9 // 9%
      const testVorabpauschale = 5000 // Higher amount to avoid Grundfreibetrag
      const noGrundfreibetrag = 0 // No Grundfreibetrag to ensure tax is paid

      const result = performGuenstigerPruefung(
        testVorabpauschale,
        abgeltungssteuer,
        personalTaxRate,
        teilfreistellungsquote,
        noGrundfreibetrag,
        alreadyUsedGrundfreibetrag,
        true, // Kirchensteuer enabled
        kirchensteuersatz,
      )

      expect(result.isFavorable).toBe('abgeltungssteuer')
      expect(result.abgeltungssteuerAmount).toBeLessThan(result.personalTaxAmount)
      expect(result.explanation).toContain('26.38%')
      expect(result.explanation).toContain('(inkl. 9% Kirchensteuer)')
    })

    it('should favor personal tax rate when it is lower even with Kirchensteuer', () => {
      const personalTaxRate = 0.15 // 15%
      const kirchensteuersatz = 9 // 9%
      // Effective personal tax rate: 15% + (15% * 9%) = 16.35%

      const result = performGuenstigerPruefung(
        vorabpauschale,
        abgeltungssteuer,
        personalTaxRate,
        teilfreistellungsquote,
        grundfreibetrag,
        alreadyUsedGrundfreibetrag,
        true,
        kirchensteuersatz,
      )

      expect(result.isFavorable).toBe('personal')
      expect(result.personalTaxAmount).toBeLessThan(result.abgeltungssteuerAmount)
      expect(result.explanation).toContain('15.00%')
      expect(result.explanation).toContain('(inkl. 9% Kirchensteuer)')
    })

    it('should calculate correct Kirchensteuer amounts with 8% rate', () => {
      const personalTaxRate = 0.2 // 20%
      const kirchensteuersatz = 8 // 8%

      const result = performGuenstigerPruefung(
        vorabpauschale,
        abgeltungssteuer,
        personalTaxRate,
        teilfreistellungsquote,
        grundfreibetrag,
        alreadyUsedGrundfreibetrag,
        true,
        kirchensteuersatz,
      )

      // Calculate expected values
      const taxableIncome = Math.max(0, vorabpauschale * (1 - teilfreistellungsquote) - grundfreibetrag)
      const basePersonalTax = taxableIncome * personalTaxRate
      const kirchensteuer = basePersonalTax * (kirchensteuersatz / 100)
      const expectedPersonalTaxAmount = basePersonalTax + kirchensteuer

      expect(result.personalTaxAmount).toBe(expectedPersonalTaxAmount)
      expect(result.explanation).toContain('(inkl. 8% Kirchensteuer)')
    })

    it('should not include Kirchensteuer text when disabled', () => {
      const personalTaxRate = 0.2 // 20%
      const kirchensteuersatz = 9

      const result = performGuenstigerPruefung(
        vorabpauschale,
        abgeltungssteuer,
        personalTaxRate,
        teilfreistellungsquote,
        grundfreibetrag,
        alreadyUsedGrundfreibetrag,
        false, // Kirchensteuer disabled
        kirchensteuersatz,
      )

      expect(result.explanation).not.toContain('Kirchensteuer')
      expect(result.explanation).not.toContain('inkl.')
    })

    it('should handle zero vorabpauschale correctly', () => {
      const personalTaxRate = 0.25
      const kirchensteuersatz = 9

      const result = performGuenstigerPruefung(
        0, // Zero vorabpauschale
        abgeltungssteuer,
        personalTaxRate,
        teilfreistellungsquote,
        grundfreibetrag,
        alreadyUsedGrundfreibetrag,
        true,
        kirchensteuersatz,
      )

      expect(result.abgeltungssteuerAmount).toBe(0)
      expect(result.personalTaxAmount).toBe(0)
      expect(result.isFavorable).toBe('equal')
      expect(result.explanation).toContain('Keine Vorabpauschale')
    })
  })

  describe('Edge cases and validation', () => {
    it('should handle very high Kirchensteuer rates correctly', () => {
      const withdrawalAmount = 50000
      const grundfreibetrag = 11604
      const incomeTaxRate = 0.42 // High tax bracket
      const kirchensteuersatz = 9

      const result = calculateIncomeTax(withdrawalAmount, grundfreibetrag, incomeTaxRate, true, kirchensteuersatz)

      const taxableIncome = withdrawalAmount - grundfreibetrag
      const baseIncomeTax = taxableIncome * incomeTaxRate
      const kirchensteuer = baseIncomeTax * 0.09
      const expectedTotal = baseIncomeTax + kirchensteuer

      expect(result).toBe(expectedTotal)
      expect(result).toBeGreaterThan(baseIncomeTax) // Should include Kirchensteuer
    })

    it('should handle minimum tax amounts correctly', () => {
      const withdrawalAmount = 11605 // Just above Grundfreibetrag
      const grundfreibetrag = 11604
      const incomeTaxRate = 0.14 // Minimum tax rate
      const kirchensteuersatz = 8

      const result = calculateIncomeTax(withdrawalAmount, grundfreibetrag, incomeTaxRate, true, kirchensteuersatz)

      // Should be very small but non-zero
      expect(result).toBeGreaterThan(0)
      expect(result).toBe(0.1512) // 1 * 0.14 * 1.08
    })
  })
})
