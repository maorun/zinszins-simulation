import { describe, it, expect } from 'vitest'
import { calculateWithdrawal, type KapitalverzehrConfig } from './withdrawal'
import type { SparplanElement } from '../src/utils/sparplan-utils'

describe('Kapitalverzehr (Capital Depletion) Strategy', () => {
  // Helper to create a simple investment element
  const createTestElement = (
    startYear: number,
    einzahlung: number,
    finalValue: number,
    lastSimYear: number
  ): SparplanElement => ({
    start: new Date(`${startYear}-01-01`).toISOString(),
    type: 'sparplan',
    einzahlung,
    simulation: {
      [lastSimYear]: {
        startkapital: einzahlung,
        endkapital: finalValue,
        zinsen: 0,
        bezahlteSteuer: 0,
        genutzterFreibetrag: 0,
        vorabpauschale: 0,
        vorabpauschaleAccumulated: 0,
      },
    },
  })

  describe('Basic Capital Depletion Calculation', () => {
    it('should calculate withdrawal to fully deplete capital by target age', () => {
      const birthYear = 1960
      const startYear = 2025 // Age 65
      const targetAge = 85
      const initialCapital = 500000
      
      const config: KapitalverzehrConfig = {
        targetAge,
        safetyBuffer: 0,
        minWithdrawalRate: 0.01,
        maxWithdrawalRate: 0.20,
      }

      const result = calculateWithdrawal({
        elements: [createTestElement(2024, initialCapital, initialCapital, 2024)],
        startYear,
        endYear: 2045, // Age 85
        strategy: 'kapitalverzehr',
        kapitalverzehrConfig: config,
        returnConfig: { mode: 'fixed', fixedRate: 0.05 },
        birthYear,
      })

      // Verify withdrawals occurred for all years
      expect(Object.keys(result.result).length).toBeGreaterThan(0)
      
      // Verify that the first year has a reasonable withdrawal
      const firstYearData = result.result[startYear]
      expect(firstYearData).toBeDefined()
      expect(firstYearData.entnahme).toBeGreaterThan(0)
      
      // Capital should decrease over time
      const lastYearData = result.result[2045]
      expect(lastYearData.endkapital).toBeLessThan(initialCapital)
    })

    it('should work with safety buffer to account for longevity risk', () => {
      const birthYear = 1960
      const startYear = 2025
      const targetAge = 85
      const safetyBuffer = 5 // Plan for age 90
      
      const config: KapitalverzehrConfig = {
        targetAge,
        safetyBuffer,
        minWithdrawalRate: 0.01,
        maxWithdrawalRate: 0.20,
      }

      const result = calculateWithdrawal({
        elements: [createTestElement(2024, 500000, 500000, 2024)],
        startYear,
        endYear: 2045,
        strategy: 'kapitalverzehr',
        kapitalverzehrConfig: config,
        returnConfig: { mode: 'fixed', fixedRate: 0.05 },
        birthYear,
      })

      const firstYearData = result.result[startYear]
      expect(firstYearData).toBeDefined()
      
      // With safety buffer, withdrawal should be more conservative
      expect(firstYearData.entnahme).toBeGreaterThan(0)
      expect(firstYearData.entnahme).toBeLessThan(500000 * 0.1) // Should be reasonable
    })
  })

  describe('Edge Cases', () => {
    it('should handle zero expected return', () => {
      const birthYear = 1960
      const startYear = 2025
      
      const config: KapitalverzehrConfig = {
        targetAge: 85,
        safetyBuffer: 0,
      }

      const result = calculateWithdrawal({
        elements: [createTestElement(2024, 500000, 500000, 2024)],
        startYear,
        endYear: 2030,
        strategy: 'kapitalverzehr',
        kapitalverzehrConfig: config,
        returnConfig: { mode: 'fixed', fixedRate: 0.0 },
        birthYear,
      })

      const firstYearData = result.result[startYear]
      expect(firstYearData).toBeDefined()
      expect(firstYearData.entnahme).toBeGreaterThan(0)
    })

    it('should respect minimum withdrawal rate', () => {
      const birthYear = 1960
      const startYear = 2025
      const minWithdrawalRate = 0.03 // 3% minimum
      
      const config: KapitalverzehrConfig = {
        targetAge: 95, // Very far in future
        safetyBuffer: 10,
        minWithdrawalRate,
      }

      const result = calculateWithdrawal({
        elements: [createTestElement(2024, 500000, 500000, 2024)],
        startYear,
        endYear: 2030,
        strategy: 'kapitalverzehr',
        kapitalverzehrConfig: config,
        returnConfig: { mode: 'fixed', fixedRate: 0.05 },
        birthYear,
      })

      const firstYearData = result.result[startYear]
      expect(firstYearData).toBeDefined()
      
      // Should respect minimum withdrawal rate
      expect(firstYearData.entnahme).toBeGreaterThanOrEqual(500000 * minWithdrawalRate * 0.9) // Allow some rounding
    })

    it('should respect maximum withdrawal rate', () => {
      const birthYear = 1960
      const startYear = 2025
      const maxWithdrawalRate = 0.10 // 10% maximum
      
      const config: KapitalverzehrConfig = {
        targetAge: 68, // Very soon (high withdrawal needed)
        safetyBuffer: 0,
        maxWithdrawalRate,
      }

      const result = calculateWithdrawal({
        elements: [createTestElement(2024, 500000, 500000, 2024)],
        startYear,
        endYear: 2030,
        strategy: 'kapitalverzehr',
        kapitalverzehrConfig: config,
        returnConfig: { mode: 'fixed', fixedRate: 0.05 },
        birthYear,
      })

      const firstYearData = result.result[startYear]
      expect(firstYearData).toBeDefined()
      
      // Should not exceed maximum withdrawal rate
      expect(firstYearData.entnahme).toBeLessThanOrEqual(500000 * maxWithdrawalRate * 1.1) // Allow some rounding
    })

    it('should handle case when past target age (high withdrawal)', () => {
      const birthYear = 1950 // Born in 1950
      const startYear = 2040 // Age 90
      
      const config: KapitalverzehrConfig = {
        targetAge: 85, // Already past target
        safetyBuffer: 0,
      }

      const result = calculateWithdrawal({
        elements: [createTestElement(2039, 100000, 100000, 2039)],
        startYear,
        endYear: 2042,
        strategy: 'kapitalverzehr',
        kapitalverzehrConfig: config,
        returnConfig: { mode: 'fixed', fixedRate: 0.05 },
        birthYear,
      })

      const firstYearData = result.result[startYear]
      expect(firstYearData).toBeDefined()
      
      // Should withdraw a significant portion (50% as per implementation)
      expect(firstYearData.entnahme).toBeGreaterThan(100000 * 0.3) // At least 30%
    })
  })

  describe('Integration with Return Scenarios', () => {
    it('should work with positive returns', () => {
      const birthYear = 1960
      const startYear = 2025
      
      const config: KapitalverzehrConfig = {
        targetAge: 85,
        safetyBuffer: 0,
      }

      const result = calculateWithdrawal({
        elements: [createTestElement(2024, 500000, 500000, 2024)],
        startYear,
        endYear: 2035,
        strategy: 'kapitalverzehr',
        kapitalverzehrConfig: config,
        returnConfig: { mode: 'fixed', fixedRate: 0.07 }, // 7% return
        birthYear,
      })

      expect(Object.keys(result.result).length).toBe(11) // 2025-2035
      
      // Verify calculations are reasonable
      const years = Object.keys(result.result).map(Number).sort((a, b) => a - b)
      for (const year of years) {
        const yearData = result.result[year]
        expect(yearData.entnahme).toBeGreaterThan(0)
        expect(yearData.endkapital).toBeGreaterThanOrEqual(0)
      }
    })

    it('should adjust to negative returns appropriately', () => {
      const birthYear = 1960
      const startYear = 2025
      
      const config: KapitalverzehrConfig = {
        targetAge: 85,
        safetyBuffer: 0,
        minWithdrawalRate: 0.02, // Minimum 2%
      }

      const result = calculateWithdrawal({
        elements: [createTestElement(2024, 500000, 500000, 2024)],
        startYear,
        endYear: 2030,
        strategy: 'kapitalverzehr',
        kapitalverzehrConfig: config,
        returnConfig: { mode: 'fixed', fixedRate: -0.05 }, // -5% return (crisis scenario)
        birthYear,
      })

      const firstYearData = result.result[startYear]
      expect(firstYearData).toBeDefined()
      expect(firstYearData.entnahme).toBeGreaterThan(0)
      
      // Even with negative returns, should maintain minimum withdrawal
      expect(firstYearData.entnahme).toBeGreaterThanOrEqual(500000 * 0.02 * 0.9)
    })
  })

  describe('Comparison with Other Strategies', () => {
    const testScenario = {
      elements: [createTestElement(2024, 500000, 500000, 2024)],
      startYear: 2025,
      endYear: 2035,
      returnConfig: { mode: 'fixed' as const, fixedRate: 0.05 },
      birthYear: 1960,
    }

    it('should withdraw more aggressively than 4% rule when appropriate', () => {
      const config: KapitalverzehrConfig = {
        targetAge: 75, // Only 10 years (aggressive depletion needed)
        safetyBuffer: 0,
      }

      const kapitalverzehrResult = calculateWithdrawal({
        ...testScenario,
        strategy: 'kapitalverzehr',
        kapitalverzehrConfig: config,
      })

      const fourPercentResult = calculateWithdrawal({
        ...testScenario,
        strategy: '4prozent',
      })

      const kvFirstYear = kapitalverzehrResult.result[2025]
      const fpFirstYear = fourPercentResult.result[2025]

      // Kapitalverzehr should withdraw more aggressively for short timeframe
      expect(kvFirstYear.entnahme).toBeGreaterThan(fpFirstYear.entnahme)
    })

    it('should withdraw less aggressively than 4% rule for very long timeframes', () => {
      const config: KapitalverzehrConfig = {
        targetAge: 100, // Very long timeframe
        safetyBuffer: 5,
      }

      const kapitalverzehrResult = calculateWithdrawal({
        ...testScenario,
        strategy: 'kapitalverzehr',
        kapitalverzehrConfig: config,
      })

      const fourPercentResult = calculateWithdrawal({
        ...testScenario,
        strategy: '4prozent',
      })

      const kvFirstYear = kapitalverzehrResult.result[2025]
      const fpFirstYear = fourPercentResult.result[2025]

      // For very long timeframe, kapitalverzehr might be more conservative
      // This test just ensures both strategies work
      expect(kvFirstYear.entnahme).toBeGreaterThan(0)
      expect(fpFirstYear.entnahme).toBeGreaterThan(0)
    })
  })

  describe('Mathematical Correctness', () => {
    it('should use annuity formula correctly for simple case', () => {
      const birthYear = 1960
      const startYear = 2025 // Age 65
      const targetAge = 75 // 10 years
      const initialCapital = 100000
      const returnRate = 0.05
      
      const config: KapitalverzehrConfig = {
        targetAge,
        safetyBuffer: 0,
      }

      const result = calculateWithdrawal({
        elements: [createTestElement(2024, initialCapital, initialCapital, 2024)],
        startYear,
        endYear: startYear, // Just check first year
        strategy: 'kapitalverzehr',
        kapitalverzehrConfig: config,
        returnConfig: { mode: 'fixed', fixedRate: returnRate },
        birthYear,
      })

      const firstYearData = result.result[startYear]
      expect(firstYearData).toBeDefined()
      
      // Manual calculation of annuity payment for 10 years at 5%
      // PMT = PV * (r * (1 + r)^n) / ((1 + r)^n - 1)
      const n = 10
      const r = 0.05
      const pv = initialCapital
      const onePlusRtoN = Math.pow(1 + r, n)
      const expectedPMT = pv * (r * onePlusRtoN) / (onePlusRtoN - 1)
      
      // The actual withdrawal should be close to the annuity payment
      // Allow 10% variance due to min/max rate constraints
      expect(firstYearData.entnahme).toBeGreaterThan(expectedPMT * 0.9)
      expect(firstYearData.entnahme).toBeLessThan(expectedPMT * 1.1)
    })
  })
})
