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

describe('Start Year Gap Analysis', () => {
  test('should handle gap between element start and simulation start correctly', () => {
    // Test case 1: Element starts in 2025, simulation starts in 2025 (no gap)
    const resultNoGap = simulate({
      startYear: 2025,
      endYear: 2026,
      elements: [createSparplanElement('2025-01-01', 24000)],
      returnConfig: { mode: 'fixed', fixedRate: 0.05 },
      steuerlast: 0.0,
      simulationAnnual: 'yearly',
    })

    // Test case 2: Element starts in 2025, simulation starts in 2040 (15-year gap)
    const resultWithGap = simulate({
      startYear: 2040,
      endYear: 2041,
      elements: [createSparplanElement('2025-01-01', 24000)],
      returnConfig: { mode: 'fixed', fixedRate: 0.05 },
      steuerlast: 0.0,
      simulationAnnual: 'yearly',
    })

    console.log('No gap - 2025:', resultNoGap[0].simulation[2025])
    console.log('No gap - 2026:', resultNoGap[0].simulation[2026])

    console.log('With gap - 2040:', resultWithGap[0].simulation[2040])
    console.log('With gap - 2041:', resultWithGap[0].simulation[2041])

    // Both should have positive returns
    expect(resultNoGap[0].simulation[2025].zinsen).toBeGreaterThan(0)
    expect(resultWithGap[0].simulation[2040].zinsen).toBeGreaterThan(0)
  })

  test('should reproduce the original issue with correct parameters', () => {
    // Use the exact parameters from the issue but with proper year alignment
    const elements = [createSparplanElement('2040-01-01', 24000)] // Start in simulation year

    const result = simulate({
      startYear: 2040,
      endYear: 2042,
      elements,
      returnConfig: {
        mode: 'random',
        randomConfig: {
          averageReturn: 0.07,
          standardDeviation: 0.15,
          seed: 42,
        },
      },
      steuerlast: 0.2638,
      simulationAnnual: 'monthly',
      teilfreistellungsquote: 0.30,
      steuerReduzierenEndkapital: true,
      freibetragPerYear: { 2023: 4000 },
      inflationAktivSparphase: true,
      inflationsrateSparphase: 2.0,
      inflationAnwendungSparphase: 'gesamtmenge',
    })

    console.log('Fixed alignment - 2040:', result[0].simulation[2040])
    console.log('Fixed alignment - 2041:', result[0].simulation[2041])
    console.log('Fixed alignment - 2042:', result[0].simulation[2042])

    // Even with random returns, the first year shouldn't show massive losses
    // unless the random return itself is very negative
    expect(result[0].simulation[2040].startkapital).toBe(24000)
  })
})
