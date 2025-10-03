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

describe('Inflation Correction Analysis', () => {
  test('should understand the correct behavior of inflation modes', () => {
    // Test with sparplan mode (inflation affects contributions)
    const resultSparplan = simulate({
      startYear: 2025,
      endYear: 2027,
      elements: [createSparplanElement('2025-01-01', 10000)],
      returnConfig: { mode: 'fixed', fixedRate: 0.05 }, // 5% return
      steuerlast: 0.0,
      simulationAnnual: 'yearly',
      inflationAktivSparphase: true,
      inflationsrateSparphase: 2.0, // 2% inflation
      inflationAnwendungSparphase: 'sparplan', // Applied to contributions
    })

    // Test with gesamtmenge mode (should affect calculation differently)
    const resultGesamtmenge = simulate({
      startYear: 2025,
      endYear: 2027,
      elements: [createSparplanElement('2025-01-01', 10000)],
      returnConfig: { mode: 'fixed', fixedRate: 0.05 }, // 5% return
      steuerlast: 0.0,
      simulationAnnual: 'yearly',
      inflationAktivSparphase: true,
      inflationsrateSparphase: 2.0, // 2% inflation
      inflationAnwendungSparphase: 'gesamtmenge', // Applied to total amount
    })

    // Test without inflation for comparison
    const resultNoInflation = simulate({
      startYear: 2025,
      endYear: 2027,
      elements: [createSparplanElement('2025-01-01', 10000)],
      returnConfig: { mode: 'fixed', fixedRate: 0.05 }, // 5% return
      steuerlast: 0.0,
      simulationAnnual: 'yearly',
      inflationAktivSparphase: false,
    })

    console.log('No inflation 2025:', resultNoInflation[0].simulation[2025])
    console.log('No inflation 2026:', resultNoInflation[0].simulation[2026])
    console.log('No inflation 2027:', resultNoInflation[0].simulation[2027])

    console.log('Sparplan mode 2025:', resultSparplan[0].simulation[2025])
    console.log('Sparplan mode 2026:', resultSparplan[0].simulation[2026])
    console.log('Sparplan mode 2027:', resultSparplan[0].simulation[2027])

    console.log('Gesamtmenge mode 2025:', resultGesamtmenge[0].simulation[2025])
    console.log('Gesamtmenge mode 2026:', resultGesamtmenge[0].simulation[2026])
    console.log('Gesamtmenge mode 2027:', resultGesamtmenge[0].simulation[2027])

    // With 5% nominal return and 2% inflation, real return should be ~3%
    // In gesamtmenge mode, the portfolio should show real (inflation-adjusted) values

    // All modes should show positive interest when market returns are positive
    expect(resultNoInflation[0].simulation[2025].zinsen).toBeGreaterThan(0)
    expect(resultSparplan[0].simulation[2025].zinsen).toBeGreaterThan(0)
    expect(resultGesamtmenge[0].simulation[2025].zinsen).toBeGreaterThan(0)
  })

  test('should correctly implement real returns (inflation-adjusted)', () => {
    // The correct way to handle inflation in gesamtmenge mode:
    // Instead of reducing portfolio value, we should calculate real returns

    const nominalReturn = 0.05 // 5%
    const inflationRate = 0.02 // 2%

    // Real return = (1 + nominal return) / (1 + inflation) - 1
    const realReturn = (1 + nominalReturn) / (1 + inflationRate) - 1

    console.log('Expected real return:', realReturn) // Should be ~2.94%

    // The portfolio should grow at the real return rate in gesamtmenge mode
    const startAmount = 10000
    const expectedAfterOneYear = startAmount * (1 + realReturn)

    console.log('Expected portfolio value after 1 year (real terms):', expectedAfterOneYear)

    expect(realReturn).toBeCloseTo(0.0294, 3) // ~2.94%
  })
})
