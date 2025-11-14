import { calculateWithdrawal } from '../../helpers/withdrawal'
import type { SparplanElement } from './sparplan-utils'

describe('Grundfreibetrag Calculation Fix', () => {
  // Helper to create mock SparplanElement data with existing capital
  const createTestElement = (
    startYear: number,
    einzahlung: number,
    finalValue: number,
    lastSimYear: number,
  ): SparplanElement => ({
    start: new Date(`${startYear}-01-01`),
    type: 'sparplan' as const,
    einzahlung: einzahlung,
    simulation: {
      [lastSimYear]: {
        startkapital: einzahlung,
        endkapital: finalValue,
        zinsen: finalValue - einzahlung,
        bezahlteSteuer: 0,
        genutzterFreibetrag: 0,
        vorabpauschale: 0,
        vorabpauschaleAccumulated: 0,
      },
    },
  })

  describe('when enableGrundfreibetrag is false', () => {
    test('should not apply any Grundfreibetrag (use 0 instead of 10908)', () => {
      const withdrawalStartYear = 2024
      const lastSimYear = withdrawalStartYear - 1
      const elements = [createTestElement(2023, 50000, 60000, lastSimYear)]

      const result = calculateWithdrawal({
        elements,
        startYear: withdrawalStartYear,
        endYear: withdrawalStartYear,
        strategy: '4prozent',
        returnConfig: { mode: 'fixed', fixedRate: 0.05 },
        taxRate: 0.26375,
        enableGrundfreibetrag: false, // Explicitly disabled
      })

      // When disabled, no income tax should be calculated
      const yearResults = Object.values(result.result)
      yearResults.forEach(yearResult => {
        expect(yearResult.einkommensteuer).toBeUndefined()
        expect(yearResult.genutzterGrundfreibetrag).toBeUndefined()
      })
    })
  })

  describe('when enableGrundfreibetrag is true', () => {
    test('should apply the specified Grundfreibetrag amount', () => {
      const withdrawalStartYear = 2024
      const lastSimYear = withdrawalStartYear - 1
      const customGrundfreibetrag = 15000 // Custom amount
      const elements = [createTestElement(2023, 50000, 60000, lastSimYear)]

      const result = calculateWithdrawal({
        elements,
        startYear: withdrawalStartYear,
        endYear: withdrawalStartYear,
        strategy: '4prozent',
        returnConfig: { mode: 'fixed', fixedRate: 0.05 },
        taxRate: 0.26375,
        enableGrundfreibetrag: true,
        grundfreibetragPerYear: { [withdrawalStartYear]: customGrundfreibetrag },
      })

      // When enabled, income tax should be calculated with the custom Grundfreibetrag
      const yearResults = Object.values(result.result)
      yearResults.forEach(yearResult => {
        expect(yearResult.einkommensteuer).toBeDefined()
        expect(yearResult.genutzterGrundfreibetrag).toBeDefined()

        // The used Grundfreibetrag should not exceed the available amount
        expect(yearResult.genutzterGrundfreibetrag!).toBeLessThanOrEqual(customGrundfreibetrag)

        // If withdrawal is less than Grundfreibetrag, no income tax should be paid
        if (yearResult.entnahme <= customGrundfreibetrag) {
          expect(yearResult.einkommensteuer).toBe(0)
          expect(yearResult.genutzterGrundfreibetrag).toBe(yearResult.entnahme)
        }
      })
    })

    test('should use default 10908 when no specific amount is provided', () => {
      const withdrawalStartYear = 2024
      const lastSimYear = withdrawalStartYear - 1
      const elements = [createTestElement(2023, 50000, 60000, lastSimYear)]

      const result = calculateWithdrawal({
        elements,
        startYear: withdrawalStartYear,
        endYear: withdrawalStartYear,
        strategy: '4prozent',
        returnConfig: { mode: 'fixed', fixedRate: 0.05 },
        taxRate: 0.26375,
        enableGrundfreibetrag: true,
        // No grundfreibetragPerYear provided - should use default
      })

      // Should use the default value of 11604 (2024 German basic tax allowance)
      const yearResults = Object.values(result.result)
      yearResults.forEach(yearResult => {
        expect(yearResult.einkommensteuer).toBeDefined()
        expect(yearResult.genutzterGrundfreibetrag).toBeDefined()
        expect(yearResult.genutzterGrundfreibetrag!).toBeLessThanOrEqual(11604) // Updated to 2024 value
      })
    })
  })

  describe('calculation correctness', () => {
    test('taxable income should be (withdrawal - grundfreibetrag) when enabled', () => {
      const withdrawalStartYear = 2024
      const lastSimYear = withdrawalStartYear - 1
      const grundfreibetrag = 11604 // Updated to 2024 German basic tax allowance
      const elements = [createTestElement(2023, 50000, 60000, lastSimYear)]

      const resultEnabled = calculateWithdrawal({
        elements,
        startYear: withdrawalStartYear,
        endYear: withdrawalStartYear,
        strategy: '4prozent',
        returnConfig: { mode: 'fixed', fixedRate: 0.05 },
        taxRate: 0.26375,
        enableGrundfreibetrag: true,
        grundfreibetragPerYear: { [withdrawalStartYear]: grundfreibetrag },
      })

      const resultDisabled = calculateWithdrawal({
        elements,
        startYear: withdrawalStartYear,
        endYear: withdrawalStartYear,
        strategy: '4prozent',
        returnConfig: { mode: 'fixed', fixedRate: 0.05 },
        taxRate: 0.26375,
        enableGrundfreibetrag: false,
      })

      const enabledYear = resultEnabled.result[withdrawalStartYear]
      const disabledYear = resultDisabled.result[withdrawalStartYear]

      // Both should have data for the year
      expect(enabledYear).toBeDefined()
      expect(disabledYear).toBeDefined()

      // When enabled, should have income tax and used Grundfreibetrag
      expect(enabledYear.einkommensteuer).toBeDefined()
      expect(enabledYear.genutzterGrundfreibetrag).toBeDefined()

      // When disabled, should not have income tax or used Grundfreibetrag
      expect(disabledYear.einkommensteuer).toBeUndefined()
      expect(disabledYear.genutzterGrundfreibetrag).toBeUndefined()

      // Other values should be the same (same withdrawal amount, etc.)
      expect(enabledYear.entnahme).toBeCloseTo(disabledYear.entnahme, 0)
    })
  })
})
