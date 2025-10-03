import { describe, test, expect } from 'vitest'
import { simulate } from './simulate'
import type { SparplanElement } from './sparplan-utils'

// Helper function to create a savings plan element
function createSparplanElement(start: string, einzahlung: number): SparplanElement {
  return {
    type: 'sparplan',
    start,
    einzahlung,
    simulation: {},
  }
}

describe('Negative Interest Bug - Issue Analysis', () => {
  test('should reproduce the issue with specific parameters', () => {
    // Create the exact scenario from the issue
    const elements = [createSparplanElement('2025-10-03', 24000)]

    // Set up random return configuration matching the issue
    const returnConfig = {
      mode: 'random' as const,
      randomConfig: {
        averageReturn: 0.07, // 7% average return
        standardDeviation: 0.15, // 15% standard deviation
        seed: 42, // Fixed seed for reproducible results
      },
    }

    const result = simulate({
      startYear: 2040,
      endYear: 2069,
      elements,
      returnConfig,
      steuerlast: 0.2638, // 26.38% capital gains tax
      simulationAnnual: 'monthly',
      teilfreistellungsquote: 0.30, // 30% partial exemption
      steuerReduzierenEndkapital: true, // Tax reduction active for savings phase
      freibetragPerYear: {
        2023: 4000, // 4,000€ allowance
      },
      // Inflation settings for savings phase
      inflationAktivSparphase: true,
      inflationsrateSparphase: 2.0, // 2% inflation
      inflationAnwendungSparphase: 'gesamtmenge', // Applied to total amount
    })

    // Check if there are any negative interest calculations
    for (const element of result) {
      for (const year in element.simulation) {
        const yearData = element.simulation[parseInt(year)]

        // Log the data for debugging
        console.log(`Year ${year}:`, {
          startkapital: yearData.startkapital,
          endkapital: yearData.endkapital,
          zinsen: yearData.zinsen,
          bezahlteSteuer: yearData.bezahlteSteuer,
        })

        // The main issue: zinsen (interest) should not be negative unless there's actual market loss
        if (yearData.zinsen < 0) {
          console.warn(`Negative interest detected in year ${year}:`, yearData.zinsen)
        }

        // Basic sanity checks
        expect(yearData.startkapital).toBeGreaterThanOrEqual(0)
        expect(yearData.endkapital).toBeGreaterThanOrEqual(0)
        expect(yearData.bezahlteSteuer).toBeGreaterThanOrEqual(0)
      }
    }
  })

  test('should not produce negative interest with gesamtmenge inflation mode over long periods', () => {
    // Simplified test to isolate the inflation issue
    const elements = [createSparplanElement('2025-01-01', 24000)]

    const result = simulate({
      startYear: 2025,
      endYear: 2035, // 10 year span
      elements,
      returnConfig: { mode: 'fixed', fixedRate: 0.07 }, // 7% fixed return
      steuerlast: 0.0, // No tax to isolate the inflation effect
      simulationAnnual: 'yearly',
      // Inflation settings for savings phase
      inflationAktivSparphase: true,
      inflationsrateSparphase: 2.0, // 2% inflation
      inflationAnwendungSparphase: 'gesamtmenge', // Applied to total amount
    })

    // With 7% growth and 2% inflation reduction, net should be ~5%
    // No calculation should result in negative interest
    for (const element of result) {
      for (const year in element.simulation) {
        const yearData = element.simulation[parseInt(year)]

        console.log(`Year ${year} (no tax):`, {
          startkapital: yearData.startkapital,
          endkapital: yearData.endkapital,
          zinsen: yearData.zinsen,
        })

        // Interest should never be negative with positive market returns
        expect(yearData.zinsen).toBeGreaterThanOrEqual(0)

        // With 7% return and 2% inflation reduction, we should still have positive growth
        if (parseInt(year) > 2025) {
          expect(yearData.endkapital).toBeGreaterThan(yearData.startkapital)
        }
      }
    }
  })

  test('should handle negative market returns correctly (this should produce negative interest)', () => {
    // This test ensures negative interest is correctly calculated when market actually loses
    const elements = [createSparplanElement('2025-01-01', 10000)]

    const result = simulate({
      startYear: 2025,
      endYear: 2025,
      elements,
      returnConfig: { mode: 'fixed', fixedRate: -0.20 }, // -20% market crash
      steuerlast: 0.0,
      simulationAnnual: 'yearly',
    })

    const yearData = result[0].simulation[2025]

    // In a real market crash, interest should be negative
    expect(yearData.zinsen).toBeLessThan(0)
    expect(yearData.endkapital).toBeLessThan(yearData.startkapital)
  })
})
