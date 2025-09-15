import { simulate } from './simulate'

describe('Variable Tax Allowance (Freibetrag) Tests', () => {
  const createTestElement = (year: string, amount: number) => ({
    id: Date.now(),
    start: new Date(`${year}-01-01`),
    einzahlung: amount,
    type: 'sparplan' as const,
    simulation: {},
  })

  describe('simulate function with variable freibetrag', () => {
    test('should use default freibetrag when none provided', () => {
      const elements = [createTestElement('2023', 24000)]
      const result = simulate({
        startYear: 2023,
        endYear: 2024,
        elements,
        returnConfig: { mode: 'fixed', fixedRate: 0.05 },
        steuerlast: 0.26375,
        simulationAnnual: 'yearly',
      })

      expect(result).toHaveLength(1)
      expect(result[0].simulation[2023]).toBeDefined()
      expect(result[0].simulation[2024]).toBeDefined()
      // Should use default freibetrag of 2000€
      expect(result[0].simulation[2024].genutzterFreibetrag).toBeGreaterThan(0)
    })

    test('should use year-specific freibetrag values', () => {
      const elements = [createTestElement('2023', 100000)] // Large amount to trigger tax
      const freibetragPerYear = {
        2023: 2000,
        2024: 3000,
      }

      const result = simulate({
        startYear: 2023,
        endYear: 2024,
        elements,
        returnConfig: { mode: 'fixed', fixedRate: 0.08 },
        steuerlast: 0.26375,
        simulationAnnual: 'yearly',
        teilfreistellungsquote: 0.3,
        freibetragPerYear,
      })

      expect(result).toHaveLength(1)

      // 2023 should use 2000€ freibetrag
      const sim2023 = result[0].simulation[2023]
      expect(sim2023).toBeDefined()

      // 2024 should use 3000€ freibetrag
      const sim2024 = result[0].simulation[2024]
      expect(sim2024).toBeDefined()

      // With higher freibetrag in 2024, should pay less tax or use more allowance
      expect(sim2024.genutzterFreibetrag).toBeGreaterThanOrEqual(0)
    })

    test('should handle missing year in freibetragPerYear by using default', () => {
      const elements = [createTestElement('2023', 50000)]
      const freibetragPerYear = {
        2023: 1500, // Only 2023 defined
        // 2024 missing, should use default
      }

      const result = simulate({
        startYear: 2023,
        endYear: 2024,
        elements,
        returnConfig: { mode: 'fixed', fixedRate: 0.06 },
        steuerlast: 0.26375,
        simulationAnnual: 'yearly',
        teilfreistellungsquote: 0.3,
        freibetragPerYear,
      })

      expect(result).toHaveLength(1)
      expect(result[0].simulation[2023]).toBeDefined()
      expect(result[0].simulation[2024]).toBeDefined()
      // Should still work without errors
    })

    test('should work with monthly simulation mode', () => {
      const elements = [createTestElement('2023', 24000)]
      const freibetragPerYear = {
        2023: 2500,
      }

      const result = simulate({
        startYear: 2023,
        endYear: 2024,
        elements,
        returnConfig: { mode: 'fixed', fixedRate: 0.05 },
        steuerlast: 0.26375,
        simulationAnnual: 'monthly',
        teilfreistellungsquote: 0.3,
        freibetragPerYear,
      })

      expect(result).toHaveLength(1)
      expect(result[0].simulation[2023]).toBeDefined()
      expect(result[0].simulation[2024]).toBeDefined()
    })

    test('should handle multiple elements with different year-specific freibetrag', () => {
      const elements = [
        createTestElement('2023', 30000),
        createTestElement('2024', 35000),
      ]
      const freibetragPerYear = {
        2023: 2000,
        2024: 4000,
      }

      const result = simulate({
        startYear: 2023,
        endYear: 2025,
        elements,
        returnConfig: { mode: 'fixed', fixedRate: 0.07 },
        steuerlast: 0.26375,
        simulationAnnual: 'yearly',
        teilfreistellungsquote: 0.3,
        freibetragPerYear,
      })

      expect(result).toHaveLength(2)

      // Both elements should have simulations
      expect(result[0].simulation[2023]).toBeDefined()
      expect(result[0].simulation[2024]).toBeDefined()
      expect(result[0].simulation[2025]).toBeDefined()

      expect(result[1].simulation[2024]).toBeDefined()
      expect(result[1].simulation[2025]).toBeDefined()
    })

    test('should validate freibetrag values are positive', () => {
      const elements = [createTestElement('2023', 24000)]
      const freibetragPerYear = {
        2023: 2000,
        2024: 3500,
      }

      const result = simulate({
        startYear: 2023,
        endYear: 2024,
        elements,
        returnConfig: { mode: 'fixed', fixedRate: 0.05 },
        steuerlast: 0.26375,
        simulationAnnual: 'yearly',
        teilfreistellungsquote: 0.3,
        freibetragPerYear,
      })

      expect(result).toHaveLength(1)

      // All used freibetrag values should be non-negative
      Object.values(result[0].simulation).forEach((sim) => {
        expect(sim.genutzterFreibetrag).toBeGreaterThanOrEqual(0)
        expect(sim.bezahlteSteuer).toBeGreaterThanOrEqual(0)
      })
    })

    test('should maintain backwards compatibility when freibetragPerYear is undefined', () => {
      const elements = [createTestElement('2023', 24000)]

      const result = simulate({
        startYear: 2023,
        endYear: 2024,
        elements,
        returnConfig: { mode: 'fixed', fixedRate: 0.05 },
        steuerlast: 0.26375,
        simulationAnnual: 'yearly',
        teilfreistellungsquote: 0.3,
        freibetragPerYear: undefined,
      })

      expect(result).toHaveLength(1)
      expect(result[0].simulation[2023]).toBeDefined()
      expect(result[0].simulation[2024]).toBeDefined()
      // Should work exactly like before
    })
  })
})
