/**
 * Tests for Capital Growth Comparison helper functions
 */

import { describe, it, expect } from 'vitest'
import {
  simulateScenario,
  simulateComparison,
  calculateStatistics,
  createScenario,
  createComparison,
} from './capital-growth-comparison'
import type { ComparisonScenario, ScenarioSimulationResult } from '../types/capital-growth-comparison'

describe('Capital Growth Comparison Helpers', () => {
  // Helper function to create a test scenario
  function createTestScenario(
    id: string,
    name: string,
    rendite: number,
    annualSavings = 24000
  ): ComparisonScenario {
    return {
      id,
      name,
      color: '#3b82f6',
      configuration: {
        rendite,
        steuerlast: 0.26375,
        teilfreistellungsquote: 0.3,
        freibetragPerYear: { 2024: 2000 },
        returnMode: 'fixed' as const,
        averageReturn: rendite,
        standardDeviation: 0.1,
        variableReturns: {},
        startEnd: [2024, 2030] as [number, number],
        sparplan: [
          {
            id: 1,
            start: new Date('2024-01-01'),
            einzahlung: annualSavings,
          },
        ],
        simulationAnnual: 'yearly' as const,
      },
    }
  }

  describe('simulateScenario', () => {
    it('should simulate a scenario and return results with metrics', () => {
      const scenario = createTestScenario('test-1', 'Conservative', 0.05, 24000)

      const result = simulateScenario(scenario)

      expect(result.scenarioId).toBe('test-1')
      expect(result.yearlyData).toBeDefined()
      expect(result.yearlyData.length).toBeGreaterThan(0)
      expect(result.metrics).toBeDefined()
      expect(result.metrics.endCapital).toBeGreaterThan(0)
      expect(result.metrics.totalContributions).toBeGreaterThan(0)
      expect(result.metrics.duration).toBe(6) // 2024-2030 = 6 years
    })

    it('should include yearly data with proper structure', () => {
      const scenario = createTestScenario('test-2', 'Moderate', 0.07)

      const result = simulateScenario(scenario)

      result.yearlyData.forEach((year) => {
        expect(year.jahr).toBeDefined()
        expect(year.startkapital).toBeDefined()
        expect(year.zinsen).toBeDefined()
        expect(year.endkapital).toBeDefined()
        expect(year.bezahlteSteuer).toBeDefined()
      })
    })

    it('should calculate correct metrics for different return rates', () => {
      const lowReturn = createTestScenario('low', 'Low Return', 0.03)
      const highReturn = createTestScenario('high', 'High Return', 0.08)

      const lowResult = simulateScenario(lowReturn)
      const highResult = simulateScenario(highReturn)

      // Higher return should result in higher end capital
      expect(highResult.metrics.endCapital).toBeGreaterThan(lowResult.metrics.endCapital)

      // Both should have positive returns
      expect(lowResult.metrics.totalReturns).toBeGreaterThan(0)
      expect(highResult.metrics.totalReturns).toBeGreaterThan(0)

      // Higher return should have higher total returns
      expect(highResult.metrics.totalReturns).toBeGreaterThan(lowResult.metrics.totalReturns)
    })

    it('should handle scenarios with different savings amounts', () => {
      const lowSavings = createTestScenario('low-save', 'Low Savings', 0.05, 12000)
      const highSavings = createTestScenario('high-save', 'High Savings', 0.05, 48000)

      const lowResult = simulateScenario(lowSavings)
      const highResult = simulateScenario(highSavings)

      // Higher savings should result in higher end capital
      expect(highResult.metrics.endCapital).toBeGreaterThan(lowResult.metrics.endCapital)

      // Contributions should reflect the savings amount
      expect(highResult.metrics.totalContributions).toBeGreaterThan(lowResult.metrics.totalContributions)
    })
  })

  describe('calculateStatistics', () => {
    it('should calculate correct statistics for multiple results', () => {
      const results: ScenarioSimulationResult[] = [
        {
          scenarioId: 'scenario-1',
          yearlyData: [],
          metrics: {
            endCapital: 400000,
            endCapitalReal: 380000,
            totalContributions: 300000,
            totalReturns: 100000,
            totalTaxes: 10000,
            annualizedReturn: 5.0,
            duration: 10,
          },
        },
        {
          scenarioId: 'scenario-2',
          yearlyData: [],
          metrics: {
            endCapital: 500000,
            endCapitalReal: 470000,
            totalContributions: 300000,
            totalReturns: 200000,
            totalTaxes: 20000,
            annualizedReturn: 7.0,
            duration: 10,
          },
        },
        {
          scenarioId: 'scenario-3',
          yearlyData: [],
          metrics: {
            endCapital: 600000,
            endCapitalReal: 560000,
            totalContributions: 300000,
            totalReturns: 300000,
            totalTaxes: 30000,
            annualizedReturn: 9.0,
            duration: 10,
          },
        },
      ]

      const stats = calculateStatistics(results)

      expect(stats.bestScenario.scenarioId).toBe('scenario-3')
      expect(stats.bestScenario.endCapital).toBe(600000)
      expect(stats.worstScenario.scenarioId).toBe('scenario-1')
      expect(stats.worstScenario.endCapital).toBe(400000)
      expect(stats.averageEndCapital).toBe(500000)
      expect(stats.range).toBe(200000)
      expect(stats.percentiles.p50).toBe(500000) // Median
    })

    it('should handle single result', () => {
      const results: ScenarioSimulationResult[] = [
        {
          scenarioId: 'only-one',
          yearlyData: [],
          metrics: {
            endCapital: 500000,
            endCapitalReal: 470000,
            totalContributions: 300000,
            totalReturns: 200000,
            totalTaxes: 20000,
            annualizedReturn: 7.0,
            duration: 10,
          },
        },
      ]

      const stats = calculateStatistics(results)

      expect(stats.bestScenario.scenarioId).toBe('only-one')
      expect(stats.worstScenario.scenarioId).toBe('only-one')
      expect(stats.averageEndCapital).toBe(500000)
      expect(stats.range).toBe(0)
      expect(stats.standardDeviation).toBe(0)
      expect(stats.percentiles.p25).toBe(500000)
      expect(stats.percentiles.p50).toBe(500000)
      expect(stats.percentiles.p75).toBe(500000)
    })

    it('should calculate correct percentiles', () => {
      // Create 5 results with known values
      const results: ScenarioSimulationResult[] = [
        { scenarioId: 's1', yearlyData: [], metrics: { endCapital: 100000, endCapitalReal: 100000, totalContributions: 0, totalReturns: 0, totalTaxes: 0, annualizedReturn: 0, duration: 0 } },
        { scenarioId: 's2', yearlyData: [], metrics: { endCapital: 200000, endCapitalReal: 200000, totalContributions: 0, totalReturns: 0, totalTaxes: 0, annualizedReturn: 0, duration: 0 } },
        { scenarioId: 's3', yearlyData: [], metrics: { endCapital: 300000, endCapitalReal: 300000, totalContributions: 0, totalReturns: 0, totalTaxes: 0, annualizedReturn: 0, duration: 0 } },
        { scenarioId: 's4', yearlyData: [], metrics: { endCapital: 400000, endCapitalReal: 400000, totalContributions: 0, totalReturns: 0, totalTaxes: 0, annualizedReturn: 0, duration: 0 } },
        { scenarioId: 's5', yearlyData: [], metrics: { endCapital: 500000, endCapitalReal: 500000, totalContributions: 0, totalReturns: 0, totalTaxes: 0, annualizedReturn: 0, duration: 0 } },
      ]

      const stats = calculateStatistics(results)

      expect(stats.percentiles.p25).toBe(200000)
      expect(stats.percentiles.p50).toBe(300000)
      expect(stats.percentiles.p75).toBe(400000)
    })

    it('should throw error for empty results', () => {
      expect(() => calculateStatistics([])).toThrow('Cannot calculate statistics for empty results')
    })
  })

  describe('simulateComparison', () => {
    it('should simulate all scenarios in a comparison', () => {
      const comparison = createComparison('Test Comparison')
      comparison.scenarios = [
        createTestScenario('s1', 'Conservative', 0.05, 24000),
        createTestScenario('s2', 'Moderate', 0.07, 24000),
        createTestScenario('s3', 'Aggressive', 0.09, 24000),
      ]

      const result = simulateComparison(comparison)

      expect(result.results).toBeDefined()
      expect(result.results).toHaveLength(3)
      expect(result.statistics).toBeDefined()
      expect(result.statistics?.bestScenario).toBeDefined()
      expect(result.statistics?.worstScenario).toBeDefined()

      // Verify that aggressive strategy has highest end capital
      const aggressiveResult = result.results?.find((r) => r.scenarioId === 's3')
      expect(aggressiveResult).toBeDefined()
      expect(result.statistics?.bestScenario.scenarioId).toBe('s3')
    })

    it('should update the updatedAt timestamp', async () => {
      const comparison = createComparison('Test')
      comparison.scenarios = [createTestScenario('s1', 'Test', 0.05)]

      const oldTimestamp = comparison.updatedAt

      // Wait a tiny bit to ensure timestamp changes
      await new Promise((resolve) => setTimeout(resolve, 10))

      const result = simulateComparison(comparison)

      expect(result.updatedAt).not.toBe(oldTimestamp)
      expect(new Date(result.updatedAt).getTime()).toBeGreaterThan(new Date(oldTimestamp).getTime())
    })
  })

  describe('createScenario', () => {
    it('should create a new scenario with unique ID', () => {
      const baseConfig = createTestScenario('base', 'Base', 0.05).configuration

      const scenario1 = createScenario('Scenario 1', '#ff0000', baseConfig)
      const scenario2 = createScenario('Scenario 2', '#00ff00', baseConfig)

      expect(scenario1.id).not.toBe(scenario2.id)
      expect(scenario1.name).toBe('Scenario 1')
      expect(scenario2.name).toBe('Scenario 2')
      expect(scenario1.color).toBe('#ff0000')
      expect(scenario2.color).toBe('#00ff00')
    })

    it('should clone the configuration', () => {
      const baseConfig = createTestScenario('base', 'Base', 0.05).configuration

      const scenario = createScenario('Test', '#000000', baseConfig)

      // Modify the original
      baseConfig.rendite = 0.10

      // Scenario should still have original value
      expect(scenario.configuration.rendite).toBe(0.05)
    })
  })

  describe('createComparison', () => {
    it('should create a new comparison with unique ID', () => {
      const comparison1 = createComparison('Comparison 1')
      const comparison2 = createComparison('Comparison 2')

      expect(comparison1.id).not.toBe(comparison2.id)
      expect(comparison1.name).toBe('Comparison 1')
      expect(comparison2.name).toBe('Comparison 2')
      expect(comparison1.scenarios).toEqual([])
    })

    it('should set timestamps', () => {
      const comparison = createComparison('Test')

      expect(comparison.createdAt).toBeDefined()
      expect(comparison.updatedAt).toBeDefined()

      // Verify ISO date format
      expect(new Date(comparison.createdAt).toISOString()).toBe(comparison.createdAt)
      expect(new Date(comparison.updatedAt).toISOString()).toBe(comparison.updatedAt)
    })
  })
})
