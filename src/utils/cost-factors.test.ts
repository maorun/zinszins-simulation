import { describe, it, expect } from 'vitest'
import { simulate } from './simulate'
import type { SparplanElement } from './sparplan-utils'

describe('Cost Factors', () => {
  it('should apply TER costs annually', () => {
    const elements: SparplanElement[] = [
      {
        start: new Date('2025-01-01'),
        type: 'sparplan',
        einzahlung: 12000, // 12,000€ annually
        simulation: {},
        ter: 0.75, // 0.75% TER
      },
    ]

    const result = simulate({
      startYear: 2025,
      endYear: 2026,
      elements,
      returnConfig: { mode: 'fixed', fixedRate: 0.05 }, // 5% return
      steuerlast: 0,
      simulationAnnual: 'yearly',
    })

    // Check that TER costs are applied
    const firstYear = result[0].simulation[2025]
    const expectedTerCosts = ((12000 + 12000 * 1.05) / 2) * 0.0075 // 92.25
    expect(firstYear.terCosts).toBeCloseTo(expectedTerCosts)
    expect(firstYear.totalCosts).toBeCloseTo(expectedTerCosts)

    // Check that capital is reduced by costs
    const withoutCosts = 12000 * 1.05 // 12,600€
    const expectedWithCosts = withoutCosts - expectedTerCosts // 12,507.75€
    expect(firstYear.endkapital).toBeCloseTo(expectedWithCosts, 2)
  })

  it('should apply transaction costs only in first year', () => {
    const elements: SparplanElement[] = [
      {
        start: new Date('2025-01-01'),
        type: 'sparplan',
        einzahlung: 12000,
        simulation: {},
        transactionCostPercent: 0.25, // 0.25%
        transactionCostAbsolute: 5, // 5€ absolute
      },
    ]

    const result = simulate({
      startYear: 2025,
      endYear: 2026,
      elements,
      returnConfig: { mode: 'fixed', fixedRate: 0.05 },
      steuerlast: 0,
      simulationAnnual: 'yearly',
    })

    // First year should have transaction costs
    const firstYear = result[0].simulation[2025]
    const expectedTransactionCosts = (12000 * 0.0025) + 5 // 30 + 5 = 35€
    expect(firstYear.transactionCosts).toBeCloseTo(expectedTransactionCosts)
    expect(firstYear.totalCosts).toBeCloseTo(expectedTransactionCosts)

    // Second year should not have transaction costs (but would have TER if specified)
    const secondYear = result[0].simulation[2026]
    expect(secondYear.transactionCosts).toBe(0)
    expect(secondYear.totalCosts).toBe(0)
  })

  it('should combine TER and transaction costs', () => {
    const elements: SparplanElement[] = [
      {
        start: new Date('2025-01-01'),
        type: 'sparplan',
        einzahlung: 10000,
        simulation: {},
        ter: 1.0, // 1% TER
        transactionCostPercent: 0.5, // 0.5%
        transactionCostAbsolute: 10, // 10€
      },
    ]

    const result = simulate({
      startYear: 2025,
      endYear: 2025,
      elements,
      returnConfig: { mode: 'fixed', fixedRate: 0.05 },
      steuerlast: 0,
      simulationAnnual: 'yearly',
    })

    const firstYear = result[0].simulation[2025]

    const expectedTerCosts = ((10000 + 10000 * 1.05) / 2) * 0.01 // 102.5€
    expect(firstYear.terCosts).toBeCloseTo(expectedTerCosts)

    const expectedTransactionCosts = (10000 * 0.005) + 10 // 60€
    expect(firstYear.transactionCosts).toBeCloseTo(expectedTransactionCosts)

    const expectedTotalCosts = expectedTerCosts + expectedTransactionCosts // 162.5€
    expect(firstYear.totalCosts).toBeCloseTo(expectedTotalCosts)
  })

  it('should apply costs to one-time payments', () => {
    const elements: SparplanElement[] = [
      {
        start: new Date('2025-01-01'),
        type: 'einmalzahlung',
        einzahlung: 50000,
        gewinn: 0,
        simulation: {},
        ter: 0.75,
        transactionCostPercent: 1.0,
        transactionCostAbsolute: 25,
      },
    ]

    const result = simulate({
      startYear: 2025,
      endYear: 2026,
      elements,
      returnConfig: { mode: 'fixed', fixedRate: 0.06 },
      steuerlast: 0,
      simulationAnnual: 'yearly',
    })

    const firstYear = result[0].simulation[2025]

    const expectedTerCosts = ((50000 + 50000 * 1.06) / 2) * 0.0075 // 386.25€
    expect(firstYear.terCosts).toBeCloseTo(expectedTerCosts)

    const expectedTransactionCosts = (50000 * 0.01) + 25 // 525€
    expect(firstYear.transactionCosts).toBeCloseTo(expectedTransactionCosts)

    const expectedTotalCosts = expectedTerCosts + expectedTransactionCosts // 911.25€
    expect(firstYear.totalCosts).toBeCloseTo(expectedTotalCosts)

    // Second year should only have TER costs
    const secondYear = result[0].simulation[2026]
    expect(secondYear.transactionCosts).toBe(0)
    expect(secondYear.terCosts).toBeGreaterThan(0) // TER continues
  })

  it('should handle elements without cost factors', () => {
    const elements: SparplanElement[] = [
      {
        start: new Date('2025-01-01'),
        type: 'sparplan',
        einzahlung: 12000,
        simulation: {},
        // No cost factors specified
      },
    ]

    const result = simulate({
      startYear: 2025,
      endYear: 2025,
      elements,
      returnConfig: { mode: 'fixed', fixedRate: 0.05 },
      steuerlast: 0,
      simulationAnnual: 'yearly',
    })

    const firstYear = result[0].simulation[2025]
    expect(firstYear.terCosts).toBe(0)
    expect(firstYear.transactionCosts).toBe(0)
    expect(firstYear.totalCosts).toBe(0)

    // Capital should grow without cost reduction
    expect(firstYear.endkapital).toBeCloseTo(12600) // 12,000 * 1.05
  })
})
