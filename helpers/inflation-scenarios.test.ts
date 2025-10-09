import { describe, it, expect } from 'vitest'
import {
  type InflationScenario,
  INFLATION_SCENARIOS,
  applyInflationScenario,
  applyReturnModifiers,
  calculateCumulativeInflation,
  calculateAverageInflation,
  mergeInflationScenario,
  getAvailableInflationScenarios,
  getInflationScenario,
  calculatePurchasingPowerImpact,
} from './inflation-scenarios'

describe('Inflation Scenarios', () => {
  describe('INFLATION_SCENARIOS', () => {
    it('should define hyperinflation scenario with correct structure', () => {
      const scenario = INFLATION_SCENARIOS.hyperinflation

      expect(scenario.id).toBe('hyperinflation')
      expect(scenario.name).toBe('Hyperinflation (Hohes Inflationsszenario)')
      expect(scenario.duration).toBe(5)
      expect(scenario.yearlyInflationRates[0]).toBe(0.08)
      expect(scenario.yearlyInflationRates[1]).toBe(0.10)
      expect(scenario.yearlyInflationRates[2]).toBe(0.12)
      expect(scenario.yearlyInflationRates[3]).toBe(0.10)
      expect(scenario.yearlyInflationRates[4]).toBe(0.08)
      expect(scenario.recoveryYears).toBe(3)
    })

    it('should define deflation scenario with negative inflation rates', () => {
      const scenario = INFLATION_SCENARIOS.deflation

      expect(scenario.id).toBe('deflation')
      expect(scenario.name).toBe('Deflation (Negatives Inflationsszenario)')
      expect(scenario.duration).toBe(4)
      expect(scenario.yearlyInflationRates[0]).toBe(-0.01)
      expect(scenario.yearlyInflationRates[1]).toBe(-0.02)
      expect(scenario.yearlyInflationRates[2]).toBe(-0.01)
      expect(scenario.yearlyInflationRates[3]).toBe(0.00)
    })

    it('should define stagflation scenario with inflation and return modifiers', () => {
      const scenario = INFLATION_SCENARIOS.stagflation

      expect(scenario.id).toBe('stagflation')
      expect(scenario.name).toBe('Stagflation (Inflation + niedrige Renditen)')
      expect(scenario.duration).toBe(4)
      expect(scenario.yearlyInflationRates[0]).toBe(0.06)
      expect(scenario.yearlyReturnModifiers).toBeDefined()
      expect(scenario.yearlyReturnModifiers![0]).toBe(-0.03)
      expect(scenario.yearlyReturnModifiers![1]).toBe(-0.04)
    })

    it('should define custom scenario', () => {
      const scenario = INFLATION_SCENARIOS.custom

      expect(scenario.id).toBe('custom')
      expect(scenario.duration).toBe(3)
      expect(scenario.yearlyInflationRates[0]).toBe(0.05)
    })
  })

  describe('applyInflationScenario', () => {
    it('should apply hyperinflation scenario to specific year', () => {
      const scenario = INFLATION_SCENARIOS.hyperinflation
      const baseYear = 2025

      const result = applyInflationScenario(baseYear, scenario)

      expect(result[2025]).toBe(0.08)
      expect(result[2026]).toBe(0.10)
      expect(result[2027]).toBe(0.12)
      expect(result[2028]).toBe(0.10)
      expect(result[2029]).toBe(0.08)
      expect(Object.keys(result)).toHaveLength(5)
    })

    it('should apply deflation scenario to specific year', () => {
      const scenario = INFLATION_SCENARIOS.deflation
      const baseYear = 2030

      const result = applyInflationScenario(baseYear, scenario)

      expect(result[2030]).toBe(-0.01)
      expect(result[2031]).toBe(-0.02)
      expect(result[2032]).toBe(-0.01)
      expect(result[2033]).toBe(0.00)
      expect(Object.keys(result)).toHaveLength(4)
    })

    it('should use fallback rate for missing year data', () => {
      const customScenario: InflationScenario = {
        id: 'custom',
        name: 'Test',
        description: 'Test scenario',
        startYear: 2024,
        duration: 3,
        yearlyInflationRates: {
          0: 0.05,
          // Missing 1 and 2
        },
      }

      const result = applyInflationScenario(2025, customScenario)

      expect(result[2025]).toBe(0.05)
      expect(result[2026]).toBe(0.02) // Fallback
      expect(result[2027]).toBe(0.02) // Fallback
    })
  })

  describe('applyReturnModifiers', () => {
    it('should apply return modifiers for stagflation scenario', () => {
      const scenario = INFLATION_SCENARIOS.stagflation
      const baseYear = 2025

      const result = applyReturnModifiers(baseYear, scenario)

      expect(result[2025]).toBe(-0.03)
      expect(result[2026]).toBe(-0.04)
      expect(result[2027]).toBe(-0.03)
      expect(result[2028]).toBe(-0.02)
      expect(Object.keys(result)).toHaveLength(4)
    })

    it('should return empty object for scenarios without return modifiers', () => {
      const scenario = INFLATION_SCENARIOS.hyperinflation
      const baseYear = 2025

      const result = applyReturnModifiers(baseYear, scenario)

      expect(result).toEqual({})
    })

    it('should skip years without defined modifiers', () => {
      const customScenario: InflationScenario = {
        id: 'custom',
        name: 'Test',
        description: 'Test scenario',
        startYear: 2024,
        duration: 3,
        yearlyInflationRates: {
          0: 0.05,
          1: 0.05,
          2: 0.05,
        },
        yearlyReturnModifiers: {
          0: -0.02,
          // Skip 1
          2: -0.01,
        },
      }

      const result = applyReturnModifiers(2025, customScenario)

      expect(result[2025]).toBe(-0.02)
      expect(result[2026]).toBeUndefined()
      expect(result[2027]).toBe(-0.01)
    })
  })

  describe('calculateCumulativeInflation', () => {
    it('should calculate cumulative inflation for hyperinflation scenario', () => {
      const scenario = INFLATION_SCENARIOS.hyperinflation

      const result = calculateCumulativeInflation(scenario)

      // (1.08 * 1.10 * 1.12 * 1.10 * 1.08) - 1 ≈ 0.5807
      expect(result).toBeCloseTo(0.5807, 3)
    })

    it('should calculate cumulative deflation (negative)', () => {
      const scenario = INFLATION_SCENARIOS.deflation

      const result = calculateCumulativeInflation(scenario)

      // (0.99 * 0.98 * 0.99 * 1.00) - 1 ≈ -0.0396
      expect(result).toBeCloseTo(-0.0396, 3)
    })

    it('should calculate cumulative inflation for stagflation scenario', () => {
      const scenario = INFLATION_SCENARIOS.stagflation

      const result = calculateCumulativeInflation(scenario)

      // (1.06 * 1.08 * 1.07 * 1.06) - 1 ≈ 0.2984
      expect(result).toBeCloseTo(0.2984, 3)
    })

    it('should handle scenario with no inflation', () => {
      const zeroInflationScenario: InflationScenario = {
        id: 'custom',
        name: 'Zero',
        description: 'Zero inflation',
        startYear: 2024,
        duration: 3,
        yearlyInflationRates: {
          0: 0,
          1: 0,
          2: 0,
        },
      }

      const result = calculateCumulativeInflation(zeroInflationScenario)

      expect(result).toBe(0)
    })
  })

  describe('calculateAverageInflation', () => {
    it('should calculate average annual inflation for hyperinflation', () => {
      const scenario = INFLATION_SCENARIOS.hyperinflation

      const result = calculateAverageInflation(scenario)

      // Geometric mean: (1.5807)^(1/5) - 1 ≈ 0.0959
      expect(result).toBeCloseTo(0.0959, 3)
    })

    it('should calculate average annual deflation', () => {
      const scenario = INFLATION_SCENARIOS.deflation

      const result = calculateAverageInflation(scenario)

      // Geometric mean: (0.9604)^(1/4) - 1 ≈ -0.0100
      expect(result).toBeCloseTo(-0.0100, 3)
    })

    it('should calculate average inflation for stagflation', () => {
      const scenario = INFLATION_SCENARIOS.stagflation

      const result = calculateAverageInflation(scenario)

      // Geometric mean: (1.2984)^(1/4) - 1 ≈ 0.0675
      expect(result).toBeCloseTo(0.0675, 3)
    })
  })

  describe('mergeInflationScenario', () => {
    it('should merge scenario rates with existing rates', () => {
      const existing = {
        2024: 0.02,
        2025: 0.02,
        2026: 0.02,
        2027: 0.02,
      }
      const scenario = {
        2025: 0.08,
        2026: 0.10,
      }

      const result = mergeInflationScenario(existing, scenario)

      expect(result[2024]).toBe(0.02)
      expect(result[2025]).toBe(0.08) // Overridden
      expect(result[2026]).toBe(0.10) // Overridden
      expect(result[2027]).toBe(0.02)
    })

    it('should handle empty existing rates', () => {
      const existing = {}
      const scenario = {
        2025: 0.08,
        2026: 0.10,
      }

      const result = mergeInflationScenario(existing, scenario)

      expect(result).toEqual(scenario)
    })

    it('should handle empty scenario rates', () => {
      const existing = {
        2024: 0.02,
        2025: 0.02,
      }
      const scenario = {}

      const result = mergeInflationScenario(existing, scenario)

      expect(result).toEqual(existing)
    })
  })

  describe('getAvailableInflationScenarios', () => {
    it('should return all scenarios except custom', () => {
      const scenarios = getAvailableInflationScenarios()

      expect(scenarios).toHaveLength(3)
      expect(scenarios.map(s => s.id)).toContain('hyperinflation')
      expect(scenarios.map(s => s.id)).toContain('deflation')
      expect(scenarios.map(s => s.id)).toContain('stagflation')
      expect(scenarios.map(s => s.id)).not.toContain('custom')
    })

    it('should return scenarios with all required properties', () => {
      const scenarios = getAvailableInflationScenarios()

      scenarios.forEach((scenario) => {
        expect(scenario.id).toBeDefined()
        expect(scenario.name).toBeDefined()
        expect(scenario.description).toBeDefined()
        expect(scenario.startYear).toBeGreaterThan(0)
        expect(scenario.duration).toBeGreaterThan(0)
        expect(scenario.yearlyInflationRates).toBeDefined()
      })
    })
  })

  describe('getInflationScenario', () => {
    it('should return hyperinflation scenario by id', () => {
      const scenario = getInflationScenario('hyperinflation')

      expect(scenario).toBeDefined()
      expect(scenario?.id).toBe('hyperinflation')
    })

    it('should return deflation scenario by id', () => {
      const scenario = getInflationScenario('deflation')

      expect(scenario).toBeDefined()
      expect(scenario?.id).toBe('deflation')
    })

    it('should return stagflation scenario by id', () => {
      const scenario = getInflationScenario('stagflation')

      expect(scenario).toBeDefined()
      expect(scenario?.id).toBe('stagflation')
    })

    it('should return custom scenario by id', () => {
      const scenario = getInflationScenario('custom')

      expect(scenario).toBeDefined()
      expect(scenario?.id).toBe('custom')
    })

    it('should return undefined for invalid id', () => {
      const scenario = getInflationScenario('invalid' as any)

      expect(scenario).toBeUndefined()
    })
  })

  describe('calculatePurchasingPowerImpact', () => {
    it('should calculate purchasing power loss for hyperinflation', () => {
      const scenario = INFLATION_SCENARIOS.hyperinflation
      const initialAmount = 100000

      const result = calculatePurchasingPowerImpact(scenario, initialAmount)

      // After 58% cumulative inflation, purchasing power: 100000 / 1.5807 ≈ 63263
      expect(result).toBeCloseTo(63263, 0)
    })

    it('should calculate purchasing power gain for deflation', () => {
      const scenario = INFLATION_SCENARIOS.deflation
      const initialAmount = 100000

      const result = calculatePurchasingPowerImpact(scenario, initialAmount)

      // After -3.96% cumulative deflation, purchasing power increases: 100000 / 0.9604 ≈ 104113
      expect(result).toBeCloseTo(104113, 0)
    })

    it('should calculate purchasing power loss for stagflation', () => {
      const scenario = INFLATION_SCENARIOS.stagflation
      const initialAmount = 100000

      const result = calculatePurchasingPowerImpact(scenario, initialAmount)

      // After 29.84% cumulative inflation, purchasing power: 100000 / 1.2984 ≈ 77016
      expect(result).toBeCloseTo(77016, 0)
    })

    it('should handle zero initial amount', () => {
      const scenario = INFLATION_SCENARIOS.hyperinflation

      const result = calculatePurchasingPowerImpact(scenario, 0)

      expect(result).toBe(0)
    })

    it('should preserve purchasing power with zero inflation', () => {
      const zeroInflationScenario: InflationScenario = {
        id: 'custom',
        name: 'Zero',
        description: 'Zero inflation',
        startYear: 2024,
        duration: 3,
        yearlyInflationRates: {
          0: 0,
          1: 0,
          2: 0,
        },
      }
      const initialAmount = 100000

      const result = calculatePurchasingPowerImpact(zeroInflationScenario, initialAmount)

      expect(result).toBe(initialAmount)
    })
  })
})
