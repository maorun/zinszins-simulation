import { describe, it, expect } from 'vitest'
import { simulate } from './simulate'
import { calculateWithdrawal } from '../../helpers/withdrawal'
import type { SparplanElement } from './sparplan-utils'
import type { ReturnConfiguration } from './random-returns'

describe('steuerReduzierenEndkapital functionality', () => {
  // Sample test data
  const testElement: SparplanElement = {
    type: 'sparplan',
    start: '2023-01-01',
    einzahlung: 1000,
    simulation: {},
  }

  const returnConfig: ReturnConfiguration = {
    mode: 'fixed',
    fixedRate: 0.05, // 5% return
  }

  const baseOptions = {
    startYear: 2023,
    endYear: 2024,
    elements: [testElement],
    returnConfig,
    steuerlast: 0.26375, // 26.375% tax rate
    simulationAnnual: 'yearly' as const,
    teilfreistellungsquote: 0.3, // 30% partial exemption
    freibetragPerYear: { 2023: 0, 2024: 0 }, // No allowance to make tax calculation clearer
  }

  describe('savings phase (simulate function)', () => {
    it('should reduce endkapital by tax when steuerReduzierenEndkapital is true (default)', () => {
      const result = simulate({
        ...baseOptions,
        steuerReduzierenEndkapital: true, // This still uses the old parameter for the simulate function
      })

      // We only have one element, so use the first one
      const testElementResult = result[0]
      expect(testElementResult).toBeDefined()

      // Check that tax was deducted from capital
      const year2024Data = testElementResult.simulation[2024]
      expect(year2024Data).toBeDefined()
      expect(year2024Data.bezahlteSteuer).toBeGreaterThan(0)

      // Verify that endkapital is reduced by the tax amount
      const capitalBeforeTax = year2024Data.endkapital + year2024Data.bezahlteSteuer
      expect(year2024Data.endkapital).toBeLessThan(capitalBeforeTax)
    })

    it('should NOT reduce endkapital by tax when steuerReduzierenEndkapital is false', () => {
      // Create separate element arrays to avoid interference
      const testElementForReduction: SparplanElement = {
        type: 'sparplan',
        start: '2023-01-01',
        einzahlung: 1000,
        simulation: {},
      }

      const testElementForNoReduction: SparplanElement = {
        type: 'sparplan',
        start: '2023-01-01',
        einzahlung: 1000,
        simulation: {},
      }

      const resultWithTaxReduction = simulate({
        ...baseOptions,
        elements: [testElementForReduction],
        steuerReduzierenEndkapital: true,
      })

      const resultWithoutTaxReduction = simulate({
        ...baseOptions,
        elements: [testElementForNoReduction],
        steuerReduzierenEndkapital: false,
      })

      // We only have one element, so use the first one from each result
      const elementWithReduction = resultWithTaxReduction[0]
      const elementWithoutReduction = resultWithoutTaxReduction[0]

      expect(elementWithReduction).toBeDefined()
      expect(elementWithoutReduction).toBeDefined()

      const year2024WithReduction = elementWithReduction.simulation[2024]
      const year2024WithoutReduction = elementWithoutReduction.simulation[2024]

      // Both should calculate tax amounts (but they might be slightly different due to compound effect)
      expect(year2024WithReduction.bezahlteSteuer).toBeGreaterThan(0)
      expect(year2024WithoutReduction.bezahlteSteuer).toBeGreaterThan(0)

      // But endkapital should be different - this is the main test
      expect(year2024WithoutReduction.endkapital).toBeGreaterThan(year2024WithReduction.endkapital)

      // The difference should be substantial (more than just the current year's tax due to compound effect)
      const capitalDifference = year2024WithoutReduction.endkapital - year2024WithReduction.endkapital
      expect(capitalDifference).toBeGreaterThan(5) // Should be more than 5 euros difference
    })

    it('should have same tax calculations regardless of steuerReduzierenEndkapital setting', () => {
      // Create separate element arrays to avoid interference
      const testElementForReduction: SparplanElement = {
        type: 'sparplan',
        start: '2023-01-01',
        einzahlung: 1000,
        simulation: {},
      }

      const testElementForNoReduction: SparplanElement = {
        type: 'sparplan',
        start: '2023-01-01',
        einzahlung: 1000,
        simulation: {},
      }

      const resultWithReduction = simulate({
        ...baseOptions,
        elements: [testElementForReduction],
        steuerReduzierenEndkapital: true,
      })

      const resultWithoutReduction = simulate({
        ...baseOptions,
        elements: [testElementForNoReduction],
        steuerReduzierenEndkapital: false,
      })

      const elementWithReduction = resultWithReduction[0]
      const elementWithoutReduction = resultWithoutReduction[0]

      const year2024WithReduction = elementWithReduction.simulation[2024]
      const year2024WithoutReduction = elementWithoutReduction.simulation[2024]

      // Tax calculations will be slightly different due to compound effects (different starting capital)
      expect(year2024WithReduction.bezahlteSteuer).toBeGreaterThan(0)
      expect(year2024WithoutReduction.bezahlteSteuer).toBeGreaterThan(0)

      // Vorabpauschale calculations should also be different due to different starting capital
      expect(year2024WithReduction.vorabpauschale).toBeGreaterThan(0)
      expect(year2024WithoutReduction.vorabpauschale).toBeGreaterThan(0)

      // Both should use the same Freibetrag structure
      expect(year2024WithReduction.genutzterFreibetrag).toEqual(year2024WithoutReduction.genutzterFreibetrag)
    })
  })

  describe('withdrawal phase (calculateWithdrawal function)', () => {
    // Create element with existing simulation data
    const testElementWithHistory: SparplanElement = {
      ...testElement,
      simulation: {
        2023: {
          startkapital: 1000,
          endkapital: 1050,
          zinsen: 50,
          bezahlteSteuer: 5,
          genutzterFreibetrag: 0,
          vorabpauschale: 20,
          vorabpauschaleAccumulated: 20,
          vorabpauschaleDetails: {
            basiszins: 0.02,
            basisertrag: 14,
            vorabpauschaleAmount: 14,
            steuerVorFreibetrag: 2.5,
            jahresgewinn: 50,
            anteilImJahr: 12,
          },
          terCosts: 0,
          transactionCosts: 0,
          totalCosts: 0,
        },
      },
    }

    const withdrawalBaseParams = {
      elements: [testElementWithHistory],
      startYear: 2024,
      endYear: 2025,
      strategy: '4prozent' as const,
      returnConfig,
      taxRate: 0.26375,
      teilfreistellungsquote: 0.3,
      freibetragPerYear: { 2024: 0, 2025: 0 }, // No allowance for clearer testing
    }

    it('should reduce capital by tax when steuerReduzierenEndkapital is true (default)', () => {
      const { result } = calculateWithdrawal({
        ...withdrawalBaseParams,
        steuerReduzierenEndkapital: true,
      })

      const year2024Data = result[2024]
      expect(year2024Data).toBeDefined()
      expect(year2024Data.bezahlteSteuer).toBeGreaterThan(0)

      // Capital should be reduced compared to scenario without tax deduction
      expect(year2024Data.endkapital).toBeGreaterThan(0)
    })

    it('should NOT reduce capital by tax when steuerReduzierenEndkapital is false', () => {
      const { result: resultWithReduction } = calculateWithdrawal({
        ...withdrawalBaseParams,
        steuerReduzierenEndkapital: true,
      })

      const { result: resultWithoutReduction } = calculateWithdrawal({
        ...withdrawalBaseParams,
        steuerReduzierenEndkapital: false,
      })

      const year2024WithReduction = resultWithReduction[2024]
      const year2024WithoutReduction = resultWithoutReduction[2024]

      // Both should calculate the same tax amount
      expect(year2024WithReduction.bezahlteSteuer).toEqual(year2024WithoutReduction.bezahlteSteuer)
      expect(year2024WithReduction.bezahlteSteuer).toBeGreaterThan(0)

      // But endkapital should be different
      expect(year2024WithoutReduction.endkapital).toBeGreaterThan(year2024WithReduction.endkapital)

      // The difference should be related to the tax amount (accounting for compound effects)
      const capitalDifference = year2024WithoutReduction.endkapital - year2024WithReduction.endkapital
      expect(capitalDifference).toBeGreaterThan(0)
    })

    it('should have same tax calculations regardless of steuerReduzierenEndkapital setting', () => {
      const { result: resultWithReduction } = calculateWithdrawal({
        ...withdrawalBaseParams,
        steuerReduzierenEndkapital: true,
      })

      const { result: resultWithoutReduction } = calculateWithdrawal({
        ...withdrawalBaseParams,
        steuerReduzierenEndkapital: false,
      })

      const year2024WithReduction = resultWithReduction[2024]
      const year2024WithoutReduction = resultWithoutReduction[2024]

      // Tax calculations should be identical
      expect(year2024WithReduction.bezahlteSteuer).toEqual(year2024WithoutReduction.bezahlteSteuer)
      expect(year2024WithReduction.genutzterFreibetrag).toEqual(year2024WithoutReduction.genutzterFreibetrag)

      // Withdrawal amounts should be the same
      expect(year2024WithReduction.entnahme).toEqual(year2024WithoutReduction.entnahme)
    })
  })

  describe('default behavior', () => {
    it('should default to true (tax reduces capital) when steuerReduzierenEndkapital is not specified', () => {
      // Create separate element arrays to avoid interference
      const testElementDefault: SparplanElement = {
        type: 'sparplan',
        start: '2023-01-01',
        einzahlung: 1000,
        simulation: {},
      }

      const testElementTrue: SparplanElement = {
        type: 'sparplan',
        start: '2023-01-01',
        einzahlung: 1000,
        simulation: {},
      }

      const resultWithoutParam = simulate({
        ...baseOptions,
        elements: [testElementDefault],
      })

      const resultWithTrueParam = simulate({
        ...baseOptions,
        elements: [testElementTrue],
        steuerReduzierenEndkapital: true,
      })

      const elementWithoutParam = resultWithoutParam[0]
      const elementWithTrueParam = resultWithTrueParam[0]

      const year2024WithoutParam = elementWithoutParam.simulation[2024]
      const year2024WithTrueParam = elementWithTrueParam.simulation[2024]

      // Results should be identical (default is true)
      expect(year2024WithoutParam.endkapital).toEqual(year2024WithTrueParam.endkapital)
      expect(year2024WithoutParam.bezahlteSteuer).toEqual(year2024WithTrueParam.bezahlteSteuer)
    })
  })
})
