/**
 * Tests for Capital Growth Comparison types and constants
 */

import { describe, it, expect } from 'vitest'
import {
  DEFAULT_COMPARISON_CONFIG,
  CAPITAL_GROWTH_COMPARISONS_STORAGE_KEY,
  type ComparisonScenario,
  type ScenarioSimulationResult,
  type ComparisonStatistics,
  type CapitalGrowthComparison,
} from './capital-growth-comparison'

describe('Capital Growth Comparison Types', () => {
  describe('DEFAULT_COMPARISON_CONFIG', () => {
    it('should have correct default values', () => {
      expect(DEFAULT_COMPARISON_CONFIG.maxScenarios).toBe(5)
      expect(DEFAULT_COMPARISON_CONFIG.defaultColors).toHaveLength(5)
      expect(DEFAULT_COMPARISON_CONFIG.showRealValues).toBe(true)
      expect(DEFAULT_COMPARISON_CONFIG.highlightExtremes).toBe(true)
    })

    it('should have valid hex colors', () => {
      DEFAULT_COMPARISON_CONFIG.defaultColors.forEach((color) => {
        expect(color).toMatch(/^#[0-9a-f]{6}$/i)
      })
    })
  })

  describe('CAPITAL_GROWTH_COMPARISONS_STORAGE_KEY', () => {
    it('should have correct storage key', () => {
      expect(CAPITAL_GROWTH_COMPARISONS_STORAGE_KEY).toBe('zinszins-capital-growth-comparisons')
    })
  })

  describe('Type validation', () => {
    it('should allow valid ComparisonScenario', () => {
      const scenario: ComparisonScenario = {
        id: 'test-1',
        name: 'Konservativ',
        description: 'Conservative investment strategy',
        color: '#3b82f6',
        configuration: {
          rendite: 0.05,
          steuerlast: 0.26375,
          teilfreistellungsquote: 0.3,
          freibetragPerYear: { 2024: 2000 },
          returnMode: 'fixed' as const,
          averageReturn: 0.05,
          standardDeviation: 0.1,
          variableReturns: {},
          startEnd: [2024, 2050] as [number, number],
          sparplan: [],
          simulationAnnual: 'yearly' as const,
        },
      }

      expect(scenario.id).toBe('test-1')
      expect(scenario.name).toBe('Konservativ')
      expect(scenario.color).toBe('#3b82f6')
    })

    it('should allow valid ScenarioSimulationResult', () => {
      const result: ScenarioSimulationResult = {
        scenarioId: 'test-1',
        yearlyData: [],
        metrics: {
          endCapital: 500000,
          endCapitalReal: 450000,
          totalContributions: 300000,
          totalReturns: 200000,
          totalTaxes: 25000,
          annualizedReturn: 5.2,
          duration: 26,
        },
      }

      expect(result.scenarioId).toBe('test-1')
      expect(result.metrics.endCapital).toBe(500000)
      expect(result.metrics.annualizedReturn).toBe(5.2)
    })

    it('should allow valid ComparisonStatistics', () => {
      const stats: ComparisonStatistics = {
        bestScenario: {
          scenarioId: 'aggressive',
          endCapital: 600000,
        },
        worstScenario: {
          scenarioId: 'conservative',
          endCapital: 400000,
        },
        percentiles: {
          p25: 450000,
          p50: 500000,
          p75: 550000,
        },
        averageEndCapital: 500000,
        standardDeviation: 75000,
        range: 200000,
      }

      expect(stats.bestScenario.endCapital).toBe(600000)
      expect(stats.worstScenario.endCapital).toBe(400000)
      expect(stats.range).toBe(200000)
      expect(stats.percentiles.p50).toBe(500000)
    })

    it('should allow valid CapitalGrowthComparison', () => {
      const comparison: CapitalGrowthComparison = {
        id: 'comp-1',
        name: 'Retirement Planning Scenarios',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
        scenarios: [
          {
            id: 'scenario-1',
            name: 'Conservative',
            color: '#3b82f6',
            configuration: {
              rendite: 0.05,
              steuerlast: 0.26375,
              teilfreistellungsquote: 0.3,
              freibetragPerYear: {},
              returnMode: 'fixed' as const,
              averageReturn: 0.05,
              standardDeviation: 0.1,
              variableReturns: {},
              startEnd: [2024, 2050] as [number, number],
              sparplan: [],
              simulationAnnual: 'yearly' as const,
            },
          },
        ],
        results: [],
        statistics: undefined,
      }

      expect(comparison.id).toBe('comp-1')
      expect(comparison.name).toBe('Retirement Planning Scenarios')
      expect(comparison.scenarios).toHaveLength(1)
    })
  })
})
