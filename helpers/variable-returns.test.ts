import { describe, test, expect } from 'vitest'
import { simulate } from '../src/utils/simulate'
import type { ReturnConfiguration } from './random-returns'

function createSparplanElement(start: string, einzahlung: number) {
  return {
    id: 'test-element',
    start,
    end: '',
    einzahlung,
    gewinn: 0,
    type: 'sparplan' as const,
    simulation: {},
  }
}

describe('Variable Returns per Year', () => {
  test('should handle variable returns configuration', () => {
    const elements = [createSparplanElement('2023-01-01', 12000)]
    const returnConfig: ReturnConfiguration = {
      mode: 'variable',
      variableConfig: {
        yearlyReturns: {
          2023: 0.05, // 5%
          2024: 0.10, // 10%
          2025: 0.03, // 3%
        },
      },
    }

    const result = simulate({
      startYear: 2023,
      endYear: 2025,
      elements,
      returnConfig,
      steuerlast: 0.26375,
      simulationAnnual: 'yearly',
    })

    expect(result).toHaveLength(1)
    expect(result[0].simulation[2023]).toBeDefined()
    expect(result[0].simulation[2024]).toBeDefined()
    expect(result[0].simulation[2025]).toBeDefined()

    // Check that each year uses the correct return rate
    const sim2023 = result[0].simulation[2023]
    const sim2024 = result[0].simulation[2024]
    const sim2025 = result[0].simulation[2025]

    expect(sim2023.endkapital).toBeCloseTo(12600, 0) // 12000 * 1.05
    expect(sim2024.endkapital).toBeGreaterThan(sim2023.endkapital)
    expect(sim2025.endkapital).toBeGreaterThan(sim2024.endkapital)
  })

  test('should use default rate for missing years', () => {
    const elements = [createSparplanElement('2023-01-01', 10000)]
    const returnConfig: ReturnConfiguration = {
      mode: 'variable',
      variableConfig: {
        yearlyReturns: {
          2023: 0.08, // Only define 2023, 2024 should use default 5%
        },
      },
    }

    const result = simulate({
      startYear: 2023,
      endYear: 2024,
      elements,
      returnConfig,
      steuerlast: 0.26375,
      simulationAnnual: 'yearly',
    })

    expect(result[0].simulation[2023]).toBeDefined()
    expect(result[0].simulation[2024]).toBeDefined()

    // 2023 should use 8%, 2024 should use default 5%
    const sim2023 = result[0].simulation[2023]
    expect(sim2023.endkapital).toBeCloseTo(10800, 0) // 10000 * 1.08
  })

  test('should handle negative returns', () => {
    const elements = [createSparplanElement('2023-01-01', 10000)]
    const returnConfig: ReturnConfiguration = {
      mode: 'variable',
      variableConfig: {
        yearlyReturns: {
          2023: -0.20, // -20% (market crash scenario)
        },
      },
    }

    const result = simulate({
      startYear: 2023,
      endYear: 2023,
      elements,
      returnConfig,
      steuerlast: 0.26375,
      simulationAnnual: 'yearly',
    })

    const sim2023 = result[0].simulation[2023]
    expect(sim2023.endkapital).toBeLessThan(10000) // Should be less than initial investment
  })

  test('should work with monthly calculations', () => {
    const elements = [createSparplanElement('2023-01-01', 12000)]
    const returnConfig: ReturnConfiguration = {
      mode: 'variable',
      variableConfig: {
        yearlyReturns: {
          2023: 0.06, // 6% annually
          2024: 0.12, // 12% annually
        },
      },
    }

    const result = simulate({
      startYear: 2023,
      endYear: 2024,
      elements,
      returnConfig,
      steuerlast: 0.26375,
      simulationAnnual: 'monthly',
    })

    expect(result[0].simulation[2023]).toBeDefined()
    expect(result[0].simulation[2024]).toBeDefined()

    // Should handle monthly compounding correctly
    const sim2024 = result[0].simulation[2024]
    expect(sim2024.endkapital).toBeGreaterThan(12000) // Should be more than just one year's contribution
  })

  test('should handle empty variable returns gracefully', () => {
    const elements = [createSparplanElement('2023-01-01', 10000)]
    const returnConfig: ReturnConfiguration = {
      mode: 'variable',
      variableConfig: {
        yearlyReturns: {}, // Empty - should use defaults
      },
    }

    const result = simulate({
      startYear: 2023,
      endYear: 2024,
      elements,
      returnConfig,
      steuerlast: 0.26375,
      simulationAnnual: 'yearly',
    })

    expect(result[0].simulation[2023]).toBeDefined()
    expect(result[0].simulation[2024]).toBeDefined()

    // Should use default 5% rate for all years
    const sim2023 = result[0].simulation[2023]
    expect(sim2023.endkapital).toBeCloseTo(10500, 0) // 10000 * 1.05
  })
})
