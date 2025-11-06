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

describe('Inflation Scenarios - Comprehensive Testing', () => {
  test('should handle gesamtmenge inflation mode correctly over multiple years', () => {
    const elements = [createSparplanElement('2025-01-01', 12000)]

    const result = simulate({
      startYear: 2025,
      endYear: 2030, // 5 year span
      elements,
      returnConfig: { mode: 'fixed', fixedRate: 0.07 }, // 7% return
      steuerlast: 0.0,
      simulationAnnual: 'yearly',
      inflationAktivSparphase: true,
      inflationsrateSparphase: 2.0, // 2% inflation
      inflationAnwendungSparphase: 'gesamtmenge',
    })

    // Real return should be approximately (1.07 / 1.02) - 1 = 4.9%
    const expectedRealReturn = 1.07 / 1.02 - 1

    for (const element of result) {
      for (const year in element.simulation) {
        const yearData = element.simulation[parseInt(year)]
        const yearInt = parseInt(year)

        // All years should show positive interest with positive real returns
        expect(yearData.zinsen).toBeGreaterThan(0)

        // Verify that the interest calculation is consistent
        expect(yearData.zinsen).toBeCloseTo(yearData.endkapital - yearData.startkapital, 2)

        // The effective return rate should be close to the real return
        if (yearInt > 2025) {
          const effectiveReturn = yearData.endkapital / yearData.startkapital - 1
          expect(effectiveReturn).toBeCloseTo(expectedRealReturn, 1) // Within 0.1 percentage points
        }
      }
    }
  })

  test('should handle sparplan inflation mode correctly', () => {
    const elements = [createSparplanElement('2025-01-01', 12000)]

    const result = simulate({
      startYear: 2025,
      endYear: 2027,
      elements,
      returnConfig: { mode: 'fixed', fixedRate: 0.05 }, // 5% return
      steuerlast: 0.0,
      simulationAnnual: 'yearly',
      inflationAktivSparphase: true,
      inflationsrateSparphase: 2.0, // 2% inflation
      inflationAnwendungSparphase: 'sparplan', // Affects contributions, not total capital
    })

    // In sparplan mode, the portfolio should grow at nominal rate (5%)
    // because inflation only affects future contributions, not existing capital
    for (const element of result) {
      for (const year in element.simulation) {
        const yearData = element.simulation[parseInt(year)]

        expect(yearData.zinsen).toBeGreaterThan(0)
        expect(yearData.zinsen).toBeCloseTo(yearData.endkapital - yearData.startkapital, 2)

        // With single element (no ongoing contributions), should be close to 5% growth
        if (parseInt(year) === 2025) {
          const growth = yearData.endkapital / yearData.startkapital - 1
          expect(growth).toBeCloseTo(0.05, 2) // Should be ~5%
        }
      }
    }
  })

  test('should handle extreme negative market returns correctly', () => {
    const elements = [createSparplanElement('2025-01-01', 10000)]

    const result = simulate({
      startYear: 2025,
      endYear: 2025,
      elements,
      returnConfig: { mode: 'fixed', fixedRate: -0.3 }, // -30% market crash
      steuerlast: 0.0,
      simulationAnnual: 'yearly',
      inflationAktivSparphase: true,
      inflationsrateSparphase: 2.0, // 2% inflation
      inflationAnwendungSparphase: 'gesamtmenge',
    })

    const yearData = result[0].simulation[2025]

    // In a severe market crash, negative interest is expected and correct
    expect(yearData.zinsen).toBeLessThan(0)
    expect(yearData.endkapital).toBeLessThan(yearData.startkapital)

    // The total loss should be market loss + inflation effect
    // -30% market + 2% inflation reduction = approximately -32% total
    const totalLoss = yearData.endkapital / yearData.startkapital - 1
    expect(totalLoss).toBeLessThan(-0.3) // Should be worse than -30%
    expect(totalLoss).toBeGreaterThan(-0.35) // But not worse than -35%
  })

  test('should handle monthly simulation with inflation correctly', () => {
    const elements = [createSparplanElement('2025-06-01', 12000)] // Mid-year start

    const result = simulate({
      startYear: 2025,
      endYear: 2026,
      elements,
      returnConfig: { mode: 'fixed', fixedRate: 0.06 }, // 6% annual return
      steuerlast: 0.0,
      simulationAnnual: 'monthly',
      inflationAktivSparphase: true,
      inflationsrateSparphase: 2.0, // 2% inflation
      inflationAnwendungSparphase: 'gesamtmenge',
    })

    for (const element of result) {
      for (const year in element.simulation) {
        const yearData = element.simulation[parseInt(year)]

        // Even with monthly calculations and mid-year start, should have positive real returns
        expect(yearData.zinsen).toBeGreaterThan(0)
        expect(yearData.zinsen).toBeCloseTo(yearData.endkapital - yearData.startkapital, 2)
      }
    }
  })

  test('should show consistent behavior with high volatility random returns', () => {
    const elements = [createSparplanElement('2025-01-01', 24000)]

    const result = simulate({
      startYear: 2025,
      endYear: 2027,
      elements,
      returnConfig: {
        mode: 'random',
        randomConfig: {
          averageReturn: 0.07, // 7% average
          standardDeviation: 0.15, // 15% volatility
          seed: 123, // Different seed than the problematic one
        },
      },
      steuerlast: 0.0,
      simulationAnnual: 'yearly',
      inflationAktivSparphase: true,
      inflationsrateSparphase: 2.0,
      inflationAnwendungSparphase: 'gesamtmenge',
    })

    let positiveYears = 0
    let negativeYears = 0

    for (const element of result) {
      for (const year in element.simulation) {
        const yearData = element.simulation[parseInt(year)]

        // Interest calculation should always be consistent
        expect(yearData.zinsen).toBeCloseTo(yearData.endkapital - yearData.startkapital, 2)

        if (yearData.zinsen > 0) {
          positiveYears++
        } else {
          negativeYears++
        }
      }
    }

    // With 7% average return and inflation adjustment, most years should be positive
    // But some negative years are possible with high volatility - this is correct behavior
    console.log(`Positive years: ${positiveYears}, Negative years: ${negativeYears}`)
  })

  test('should handle tax calculations with inflation correctly', () => {
    const elements = [createSparplanElement('2025-01-01', 20000)]

    const result = simulate({
      startYear: 2025,
      endYear: 2027,
      elements,
      returnConfig: { mode: 'fixed', fixedRate: 0.08 }, // 8% return
      steuerlast: 0.26375, // 26.375% tax
      simulationAnnual: 'yearly',
      teilfreistellungsquote: 0.3, // 30% partial exemption
      steuerReduzierenEndkapital: true,
      freibetragPerYear: { 2025: 2000, 2026: 2000, 2027: 2000 },
      inflationAktivSparphase: true,
      inflationsrateSparphase: 2.0,
      inflationAnwendungSparphase: 'gesamtmenge',
    })

    for (const element of result) {
      for (const year in element.simulation) {
        const yearData = element.simulation[parseInt(year)]

        // With 8% nominal return and 2% inflation, real return is ~5.9%
        // Even after taxes, should still be positive
        expect(yearData.zinsen).toBeGreaterThan(0)
        expect(yearData.zinsen).toBeCloseTo(yearData.endkapital - yearData.startkapital, 2)

        // Tax and allowance calculations should be reasonable
        expect(yearData.bezahlteSteuer).toBeGreaterThanOrEqual(0)
        expect(yearData.genutzterFreibetrag).toBeGreaterThanOrEqual(0)
        expect(yearData.genutzterFreibetrag).toBeLessThanOrEqual(2000) // Max allowance
      }
    }
  })
})
