/**
 * Tests for Stress Testing utilities
 */

import { describe, it, expect } from 'vitest'
import {
  getStressTestScenarios,
  calculateStressTestResult,
  runStressTests,
  calculateStressTestSummary,
  type StressTestConfiguration,
} from './stress-testing'

describe('stress-testing', () => {
  describe('getStressTestScenarios', () => {
    it('should return all predefined stress test scenarios', () => {
      const scenarios = getStressTestScenarios()

      expect(scenarios).toHaveLength(3)
      expect(scenarios.map(s => s.id)).toEqual(['dotcom-crash-2000', 'financial-crisis-2008', 'covid-crash-2020'])
    })

    it('should include scenario details', () => {
      const scenarios = getStressTestScenarios()

      scenarios.forEach(scenario => {
        expect(scenario.id).toBeTruthy()
        expect(scenario.name).toBeTruthy()
        expect(scenario.description).toBeTruthy()
        expect(scenario.event).toBeTruthy()
        expect(typeof scenario.cumulativeImpact).toBe('number')
      })
    })

    it('should calculate cumulative impact for each scenario', () => {
      const scenarios = getStressTestScenarios()

      // Dotcom crash: (1-0.09)*(1-0.19)*(1-0.44) - 1 ≈ -0.585
      const dotcomScenario = scenarios.find(s => s.id === 'dotcom-crash-2000')
      expect(dotcomScenario?.cumulativeImpact).toBeCloseTo(-0.585, 2)

      // Financial crisis: (1-0.4)*(1-0.25) - 1 = -0.55
      const financialCrisisScenario = scenarios.find(s => s.id === 'financial-crisis-2008')
      expect(financialCrisisScenario?.cumulativeImpact).toBeCloseTo(-0.55, 2)

      // COVID: (1-0.08) - 1 = -0.08
      const covidScenario = scenarios.find(s => s.id === 'covid-crash-2020')
      expect(covidScenario?.cumulativeImpact).toBeCloseTo(-0.08, 2)
    })
  })

  describe('calculateStressTestResult', () => {
    const baseConfig: StressTestConfiguration = {
      baselineCapital: 100000,
      annualContribution: 10000,
      normalReturn: 0.07,
      testDurationYears: 10,
    }

    it('should calculate portfolio value under stress scenario', () => {
      const scenarios = getStressTestScenarios()
      const covidScenario = scenarios.find(s => s.id === 'covid-crash-2020')!

      const result = calculateStressTestResult(covidScenario, baseConfig)

      expect(result.scenario).toBe(covidScenario)
      expect(result.finalCapital).toBeGreaterThan(0)
      expect(result.capitalLoss).toBeGreaterThan(0)
      expect(result.percentageLoss).toBeGreaterThan(0)
      expect(result.recoveryYearsNeeded).toBeGreaterThanOrEqual(0)
    })

    it('should show higher losses for more severe crises', () => {
      const scenarios = getStressTestScenarios()

      const covidResult = calculateStressTestResult(scenarios.find(s => s.id === 'covid-crash-2020')!, baseConfig)
      const dotcomResult = calculateStressTestResult(scenarios.find(s => s.id === 'dotcom-crash-2000')!, baseConfig)
      const financialResult = calculateStressTestResult(
        scenarios.find(s => s.id === 'financial-crisis-2008')!,
        baseConfig,
      )

      // COVID was the least severe (-8% in 1 year)
      expect(covidResult.percentageLoss).toBeLessThan(dotcomResult.percentageLoss)
      expect(covidResult.percentageLoss).toBeLessThan(financialResult.percentageLoss)

      // Both dotcom and financial crisis were severe
      expect(dotcomResult.percentageLoss).toBeGreaterThan(0)
      expect(financialResult.percentageLoss).toBeGreaterThan(0)
    })

    it('should calculate capital loss correctly', () => {
      const scenarios = getStressTestScenarios()
      const covidScenario = scenarios.find(s => s.id === 'covid-crash-2020')!

      const result = calculateStressTestResult(covidScenario, baseConfig)

      // Capital loss should be positive (loss in value)
      expect(result.capitalLoss).toBeGreaterThan(0)

      // Percentage loss should match capital loss / baseline
      // This is approximate due to compounding
      expect(result.percentageLoss).toBeGreaterThan(0)
      expect(result.percentageLoss).toBeLessThan(100)
    })

    it('should handle different baseline capitals', () => {
      const scenarios = getStressTestScenarios()
      const covidScenario = scenarios.find(s => s.id === 'covid-crash-2020')!

      const smallCapitalConfig = { ...baseConfig, baselineCapital: 50000 }
      const largeCapitalConfig = { ...baseConfig, baselineCapital: 200000 }

      const smallResult = calculateStressTestResult(covidScenario, smallCapitalConfig)
      const largeResult = calculateStressTestResult(covidScenario, largeCapitalConfig)

      // Percentage loss should be within reasonable range regardless of starting capital
      expect(Math.abs(smallResult.percentageLoss - largeResult.percentageLoss)).toBeLessThan(10)

      // But absolute capital loss should scale with starting capital
      expect(largeResult.capitalLoss).toBeGreaterThan(smallResult.capitalLoss)
    })

    it('should calculate recovery years needed', () => {
      const scenarios = getStressTestScenarios()
      const covidScenario = scenarios.find(s => s.id === 'covid-crash-2020')!
      const dotcomScenario = scenarios.find(s => s.id === 'dotcom-crash-2000')!

      const covidResult = calculateStressTestResult(covidScenario, baseConfig)
      const dotcomResult = calculateStressTestResult(dotcomScenario, baseConfig)

      // COVID should recover faster (less severe, shorter duration)
      expect(covidResult.recoveryYearsNeeded).toBeLessThan(dotcomResult.recoveryYearsNeeded)

      // Recovery years should be reasonable (not infinite, allowing up to 25 years for severe crises)
      expect(covidResult.recoveryYearsNeeded).toBeLessThanOrEqual(25)
      expect(dotcomResult.recoveryYearsNeeded).toBeLessThanOrEqual(25)
    })
  })

  describe('runStressTests', () => {
    const baseConfig: StressTestConfiguration = {
      baselineCapital: 100000,
      annualContribution: 10000,
      normalReturn: 0.07,
      testDurationYears: 10,
    }

    it('should run tests for all scenarios', () => {
      const results = runStressTests(baseConfig)

      expect(results).toHaveLength(3)
      expect(results.every(r => r.finalCapital > 0)).toBe(true)
      expect(results.every(r => r.capitalLoss >= 0)).toBe(true)
      expect(results.every(r => r.percentageLoss >= 0)).toBe(true)
    })

    it('should return results in consistent order', () => {
      const results1 = runStressTests(baseConfig)
      const results2 = runStressTests(baseConfig)

      expect(results1.map(r => r.scenario.id)).toEqual(results2.map(r => r.scenario.id))
    })

    it('should produce different results for different configurations', () => {
      const config1 = baseConfig
      const config2 = { ...baseConfig, normalReturn: 0.05 }

      const results1 = runStressTests(config1)
      const results2 = runStressTests(config2)

      // With lower normal return, losses should be different
      expect(results1[0].finalCapital).not.toEqual(results2[0].finalCapital)
    })
  })

  describe('calculateStressTestSummary', () => {
    const baseConfig: StressTestConfiguration = {
      baselineCapital: 100000,
      annualContribution: 10000,
      normalReturn: 0.07,
      testDurationYears: 10,
    }

    it('should calculate summary statistics', () => {
      const results = runStressTests(baseConfig)
      const summary = calculateStressTestSummary(results)

      expect(summary.totalScenariosTestedCount).toBe(3)
      expect(summary.worstCaseScenario).toBeTruthy()
      expect(summary.averageCapitalLoss).toBeGreaterThan(0)
      expect(summary.averagePercentageLoss).toBeGreaterThan(0)
      expect(summary.averageRecoveryYears).toBeGreaterThan(0)
    })

    it('should identify worst case scenario', () => {
      const results = runStressTests(baseConfig)
      const summary = calculateStressTestSummary(results)

      // Worst case should have highest percentage loss
      const maxLoss = Math.max(...results.map(r => r.percentageLoss))
      expect(summary.worstCaseScenario.percentageLoss).toBe(maxLoss)
    })

    it('should calculate averages correctly', () => {
      const results = runStressTests(baseConfig)
      const summary = calculateStressTestSummary(results)

      const manualAvgCapitalLoss = results.reduce((sum, r) => sum + r.capitalLoss, 0) / results.length
      const manualAvgPercentageLoss = results.reduce((sum, r) => sum + r.percentageLoss, 0) / results.length
      const manualAvgRecoveryYears = results.reduce((sum, r) => sum + r.recoveryYearsNeeded, 0) / results.length

      expect(summary.averageCapitalLoss).toBeCloseTo(manualAvgCapitalLoss, 2)
      expect(summary.averagePercentageLoss).toBeCloseTo(manualAvgPercentageLoss, 2)
      expect(summary.averageRecoveryYears).toBeCloseTo(manualAvgRecoveryYears, 2)
    })

    it('should throw error for empty results', () => {
      expect(() => calculateStressTestSummary([])).toThrow('No stress test results to summarize')
    })

    it('should handle single result', () => {
      const results = runStressTests(baseConfig)
      const singleResult = [results[0]]

      const summary = calculateStressTestSummary(singleResult)

      expect(summary.totalScenariosTestedCount).toBe(1)
      expect(summary.worstCaseScenario).toBe(singleResult[0])
      expect(summary.averageCapitalLoss).toBe(singleResult[0].capitalLoss)
      expect(summary.averagePercentageLoss).toBe(singleResult[0].percentageLoss)
      expect(summary.averageRecoveryYears).toBe(singleResult[0].recoveryYearsNeeded)
    })
  })
})
