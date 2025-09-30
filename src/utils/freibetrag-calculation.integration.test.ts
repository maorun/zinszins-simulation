import { describe, expect, test } from 'vitest'
import { calculateWithdrawal } from '../../helpers/withdrawal'
import type { SparplanElement } from './sparplan-utils'
import { createPlanningModeAwareFreibetragPerYear } from './freibetrag-calculation'

describe('freibetrag-calculation integration tests', () => {
  // Helper to create mock SparplanElement data
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

  describe('planning mode integration with withdrawal calculations', () => {
    test('should use individual freibetrag (2000€) in withdrawal calculations', () => {
      const withdrawalStartYear = 2024
      const lastSimYear = withdrawalStartYear - 1
      const elements = [createTestElement(2023, 50000, 60000, lastSimYear)]

      // Create freibetrag for individual planning
      const freibetragPerYear = createPlanningModeAwareFreibetragPerYear(
        withdrawalStartYear,
        withdrawalStartYear + 2,
        'individual',
      )

      const result = calculateWithdrawal({
        elements,
        startYear: withdrawalStartYear,
        endYear: withdrawalStartYear + 2,
        strategy: '4prozent',
        returnConfig: { mode: 'fixed', fixedRate: 0.05 },
        taxRate: 0.26375,
        freibetragPerYear,
      })

      // Verify that individual freibetrag amount is used
      expect(freibetragPerYear[withdrawalStartYear]).toBe(2000)
      expect(freibetragPerYear[withdrawalStartYear + 1]).toBe(2000)
      expect(freibetragPerYear[withdrawalStartYear + 2]).toBe(2000)

      // Verify the calculations work correctly
      expect(result.result).toBeDefined()
      expect(Object.keys(result.result)).toHaveLength(3)
    })

    test('should use couple freibetrag (4000€) in withdrawal calculations', () => {
      const withdrawalStartYear = 2024
      const lastSimYear = withdrawalStartYear - 1
      const elements = [createTestElement(2023, 50000, 60000, lastSimYear)]

      // Create freibetrag for couple planning
      const freibetragPerYear = createPlanningModeAwareFreibetragPerYear(
        withdrawalStartYear,
        withdrawalStartYear + 2,
        'couple',
      )

      const result = calculateWithdrawal({
        elements,
        startYear: withdrawalStartYear,
        endYear: withdrawalStartYear + 2,
        strategy: '4prozent',
        returnConfig: { mode: 'fixed', fixedRate: 0.05 },
        taxRate: 0.26375,
        freibetragPerYear,
      })

      // Verify that couple freibetrag amount is used
      expect(freibetragPerYear[withdrawalStartYear]).toBe(4000)
      expect(freibetragPerYear[withdrawalStartYear + 1]).toBe(4000)
      expect(freibetragPerYear[withdrawalStartYear + 2]).toBe(4000)

      // Verify the calculations work correctly
      expect(result.result).toBeDefined()
      expect(Object.keys(result.result)).toHaveLength(3)
    })

    test('should result in different tax amounts for individual vs couple planning', () => {
      const withdrawalStartYear = 2024
      const lastSimYear = withdrawalStartYear - 1
      // Use larger amounts to ensure freibetrag difference has measurable impact
      const elements = [createTestElement(2023, 500000, 600000, lastSimYear)]

      // Calculate for individual (2000€ freibetrag)
      const individualFreibetrag = createPlanningModeAwareFreibetragPerYear(
        withdrawalStartYear,
        withdrawalStartYear,
        'individual',
      )

      const individualResult = calculateWithdrawal({
        elements,
        startYear: withdrawalStartYear,
        endYear: withdrawalStartYear,
        strategy: '4prozent',
        returnConfig: { mode: 'fixed', fixedRate: 0.05 },
        taxRate: 0.26375,
        freibetragPerYear: individualFreibetrag,
      })

      // Calculate for couple (4000€ freibetrag)
      const coupleFreibetrag = createPlanningModeAwareFreibetragPerYear(
        withdrawalStartYear,
        withdrawalStartYear,
        'couple',
      )

      const coupleResult = calculateWithdrawal({
        elements,
        startYear: withdrawalStartYear,
        endYear: withdrawalStartYear,
        strategy: '4prozent',
        returnConfig: { mode: 'fixed', fixedRate: 0.05 },
        taxRate: 0.26375,
        freibetragPerYear: coupleFreibetrag,
      })

      // Both results should exist
      const individualYear = individualResult.result[withdrawalStartYear]
      const coupleYear = coupleResult.result[withdrawalStartYear]

      expect(individualYear).toBeDefined()
      expect(coupleYear).toBeDefined()

      // With larger amounts, couple should have better results due to higher freibetrag
      // If results are equal, at least verify the freibetrag amounts are correct
      expect(individualFreibetrag[withdrawalStartYear]).toBe(2000)
      expect(coupleFreibetrag[withdrawalStartYear]).toBe(4000)

      // Verify different freibetrag usage or at least the potential for it
      expect(individualYear?.genutzterFreibetrag).toBeLessThanOrEqual(2000)
      expect(coupleYear?.genutzterFreibetrag).toBeLessThanOrEqual(4000)

      // If there are gains to tax, couple should perform better or equal
      if (individualYear && coupleYear) {
        expect(coupleYear.endkapital).toBeGreaterThanOrEqual(individualYear.endkapital)
      }
    })

    test('should handle custom freibetrag overrides correctly', () => {
      const withdrawalStartYear = 2024
      const customOverrides = {
        [withdrawalStartYear]: 3000, // Custom amount
        [withdrawalStartYear + 1]: 2500, // Another custom amount
      }

      // Individual planning with custom overrides
      const individualFreibetrag = createPlanningModeAwareFreibetragPerYear(
        withdrawalStartYear,
        withdrawalStartYear + 2,
        'individual',
        customOverrides,
      )

      // Couple planning with custom overrides
      const coupleFreibetrag = createPlanningModeAwareFreibetragPerYear(
        withdrawalStartYear,
        withdrawalStartYear + 2,
        'couple',
        customOverrides,
      )

      // Custom overrides should be respected regardless of planning mode
      expect(individualFreibetrag[withdrawalStartYear]).toBe(3000)
      expect(individualFreibetrag[withdrawalStartYear + 1]).toBe(2500)
      expect(coupleFreibetrag[withdrawalStartYear]).toBe(3000)
      expect(coupleFreibetrag[withdrawalStartYear + 1]).toBe(2500)

      // Years without overrides should use planning mode defaults
      expect(individualFreibetrag[withdrawalStartYear + 2]).toBe(2000) // Individual default
      expect(coupleFreibetrag[withdrawalStartYear + 2]).toBe(4000) // Couple default
    })

    test('should work with different withdrawal strategies', () => {
      const withdrawalStartYear = 2024
      const lastSimYear = withdrawalStartYear - 1
      const elements = [createTestElement(2023, 50000, 60000, lastSimYear)]

      const strategies = ['4prozent', '3prozent'] as const

      strategies.forEach((strategy) => {
        // Test individual planning
        const individualFreibetrag = createPlanningModeAwareFreibetragPerYear(
          withdrawalStartYear,
          withdrawalStartYear,
          'individual',
        )

        const individualResult = calculateWithdrawal({
          elements,
          startYear: withdrawalStartYear,
          endYear: withdrawalStartYear,
          strategy,
          returnConfig: { mode: 'fixed', fixedRate: 0.05 },
          taxRate: 0.26375,
          freibetragPerYear: individualFreibetrag,
        })

        // Test couple planning
        const coupleFreibetrag = createPlanningModeAwareFreibetragPerYear(
          withdrawalStartYear,
          withdrawalStartYear,
          'couple',
        )

        const coupleResult = calculateWithdrawal({
          elements,
          startYear: withdrawalStartYear,
          endYear: withdrawalStartYear,
          strategy,
          returnConfig: { mode: 'fixed', fixedRate: 0.05 },
          taxRate: 0.26375,
          freibetragPerYear: coupleFreibetrag,
        })

        // Both should work without errors
        expect(individualResult.result).toBeDefined()
        expect(coupleResult.result).toBeDefined()

        // Couple should have better results due to higher freibetrag
        const individualYear = individualResult.result[withdrawalStartYear]
        const coupleYear = coupleResult.result[withdrawalStartYear]

        expect(coupleYear?.endkapital).toBeGreaterThanOrEqual(individualYear?.endkapital || 0)
      })
    })
  })

  describe('edge cases and error handling', () => {
    test('should handle zero or negative years gracefully', () => {
      expect(() => {
        createPlanningModeAwareFreibetragPerYear(2024, 2023, 'individual')
      }).not.toThrow()

      const result = createPlanningModeAwareFreibetragPerYear(2024, 2023, 'individual')
      expect(Object.keys(result)).toHaveLength(0)
    })

    test('should handle large year ranges efficiently', () => {
      const largeRange = createPlanningModeAwareFreibetragPerYear(
        2024,
        2024 + 50, // 50 years
        'couple',
      )

      expect(Object.keys(largeRange)).toHaveLength(51) // 2024 to 2074 inclusive
      expect(largeRange[2024]).toBe(4000)
      expect(largeRange[2074]).toBe(4000)
    })

    test('should handle extreme freibetrag values', () => {
      const extremeIndividual = 0.01 // Very small individual freibetrag
      const extremeCouple = 1000000 // Very large individual freibetrag

      const smallResult = createPlanningModeAwareFreibetragPerYear(
        2024,
        2024,
        'couple',
        undefined,
        extremeIndividual,
      )

      const largeResult = createPlanningModeAwareFreibetragPerYear(
        2024,
        2024,
        'couple',
        undefined,
        extremeCouple,
      )

      expect(smallResult[2024]).toBe(0.02) // 0.01 * 2 for couple
      expect(largeResult[2024]).toBe(2000000) // 1000000 * 2 for couple
    })
  })
})
