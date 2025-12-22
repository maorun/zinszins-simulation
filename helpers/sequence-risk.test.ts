import { describe, expect, it } from 'vitest'
import {
  simulateSequence,
  generateSequenceScenarios,
  calculateSafeWithdrawalRate,
  analyzeSequenceRisk,
  getDefaultSequenceRiskConfig,
  type SequenceRiskScenario,
} from './sequence-risk'

describe('sequence-risk', () => {
  describe('simulateSequence', () => {
    it('should simulate a basic sequence with positive returns', () => {
      const scenario: SequenceRiskScenario = {
        id: 'test',
        name: 'Test',
        description: 'Test scenario',
        startingPortfolio: 100000,
        annualWithdrawal: 4000,
        withdrawalRate: 0.04,
        returns: [0.07, 0.07, 0.07, 0.07, 0.07],
        years: 5,
      }

      const result = simulateSequence(scenario)

      expect(result.yearlyResults).toHaveLength(5)
      expect(result.yearsSurvived).toBe(5)
      expect(result.portfolioDepleted).toBe(false)
      expect(result.finalPortfolioValue).toBeGreaterThan(100000)
      expect(result.averageReturn).toBe(0.07)
    })

    it('should handle portfolio depletion', () => {
      const scenario: SequenceRiskScenario = {
        id: 'test',
        name: 'Test',
        description: 'Test scenario',
        startingPortfolio: 100000,
        annualWithdrawal: 30000,
        withdrawalRate: 0.3,
        returns: [-0.2, -0.2, -0.2, -0.2, -0.2],
        years: 5,
      }

      const result = simulateSequence(scenario)

      expect(result.portfolioDepleted).toBe(true)
      expect(result.depletionYear).toBeDefined()
      expect(result.depletionYear).toBeLessThan(5)
      expect(result.finalPortfolioValue).toBe(0)
    })

    it('should track year-by-year results correctly', () => {
      const scenario: SequenceRiskScenario = {
        id: 'test',
        name: 'Test',
        description: 'Test scenario',
        startingPortfolio: 100000,
        annualWithdrawal: 4000,
        withdrawalRate: 0.04,
        returns: [0.1, -0.05, 0.08],
        years: 3,
      }

      const result = simulateSequence(scenario)

      // Year 1: Start 100k, +10% = 110k, -4k = 106k
      expect(result.yearlyResults[0].startingValue).toBe(100000)
      expect(result.yearlyResults[0].returnRate).toBe(0.1)
      expect(result.yearlyResults[0].investmentGain).toBe(10000)
      expect(result.yearlyResults[0].withdrawal).toBe(4000)
      expect(result.yearlyResults[0].endingValue).toBe(106000)

      // Year 2: Start 106k, -5% = 100.7k, -4k = 96.7k
      expect(result.yearlyResults[1].startingValue).toBe(106000)
      expect(result.yearlyResults[1].returnRate).toBe(-0.05)
      expect(result.yearlyResults[1].investmentGain).toBe(-5300)
      expect(result.yearlyResults[1].withdrawal).toBe(4000)
      expect(result.yearlyResults[1].endingValue).toBeCloseTo(96700, 0)
    })

    it('should handle zero returns', () => {
      const scenario: SequenceRiskScenario = {
        id: 'test',
        name: 'Test',
        description: 'Test scenario',
        startingPortfolio: 100000,
        annualWithdrawal: 4000,
        withdrawalRate: 0.04,
        returns: [0, 0, 0],
        years: 3,
      }

      const result = simulateSequence(scenario)

      expect(result.yearsSurvived).toBe(3)
      expect(result.finalPortfolioValue).toBe(88000) // 100k - 3*4k
    })

    it('should calculate total withdrawals correctly', () => {
      const scenario: SequenceRiskScenario = {
        id: 'test',
        name: 'Test',
        description: 'Test scenario',
        startingPortfolio: 100000,
        annualWithdrawal: 5000,
        withdrawalRate: 0.05,
        returns: [0.07, 0.07, 0.07],
        years: 3,
      }

      const result = simulateSequence(scenario)

      expect(result.totalWithdrawals).toBeCloseTo(15000, 0)
    })

    it('should limit withdrawal to available funds', () => {
      const scenario: SequenceRiskScenario = {
        id: 'test',
        name: 'Test',
        description: 'Test scenario',
        startingPortfolio: 10000,
        annualWithdrawal: 20000,
        withdrawalRate: 2.0,
        returns: [0],
        years: 1,
      }

      const result = simulateSequence(scenario)

      expect(result.yearlyResults[0].withdrawal).toBe(10000) // Limited to available
      expect(result.finalPortfolioValue).toBe(0)
      expect(result.portfolioDepleted).toBe(true)
    })
  })

  describe('generateSequenceScenarios', () => {
    it('should generate three scenarios with same average return', () => {
      const scenarios = generateSequenceScenarios(500000, 20000, 30, 0.07, 0.15)

      expect(scenarios.bestCase).toBeDefined()
      expect(scenarios.worstCase).toBeDefined()
      expect(scenarios.averageCase).toBeDefined()

      // All should have same average return (approximately)
      expect(Math.abs(scenarios.bestCase.averageReturn - 0.07)).toBeLessThan(0.01)
      expect(Math.abs(scenarios.worstCase.averageReturn - 0.07)).toBeLessThan(0.01)
      expect(Math.abs(scenarios.averageCase.averageReturn - 0.07)).toBeLessThan(0.01)
    })

    it('should show best case outperforming worst case', () => {
      const scenarios = generateSequenceScenarios(500000, 20000, 30, 0.07, 0.15)

      expect(scenarios.bestCase.finalPortfolioValue).toBeGreaterThan(scenarios.worstCase.finalPortfolioValue)
      expect(scenarios.bestCase.yearsSurvived).toBeGreaterThanOrEqual(scenarios.worstCase.yearsSurvived)
    })

    it('should calculate outcome differences correctly', () => {
      const scenarios = generateSequenceScenarios(500000, 20000, 30, 0.07, 0.15)

      expect(scenarios.outcomeDifference.portfolioValueDiff).toBeGreaterThan(0)
      expect(scenarios.outcomeDifference.yearsSurvivedDiff).toBeGreaterThanOrEqual(0)
    })

    it('should handle different starting portfolios', () => {
      const scenarios1 = generateSequenceScenarios(300000, 12000, 25, 0.07, 0.15)
      const scenarios2 = generateSequenceScenarios(700000, 28000, 25, 0.07, 0.15)

      expect(scenarios1.bestCase.scenario.startingPortfolio).toBe(300000)
      expect(scenarios2.bestCase.scenario.startingPortfolio).toBe(700000)
    })

    it('should handle different time horizons', () => {
      const scenarios20 = generateSequenceScenarios(500000, 20000, 20, 0.07, 0.15)
      const scenarios40 = generateSequenceScenarios(500000, 20000, 40, 0.07, 0.15)

      expect(scenarios20.bestCase.yearlyResults).toHaveLength(20)
      expect(scenarios40.bestCase.yearlyResults).toHaveLength(40)
    })

    it('should use correct withdrawal rates', () => {
      const scenarios = generateSequenceScenarios(500000, 20000, 30, 0.07, 0.15)

      expect(scenarios.bestCase.scenario.withdrawalRate).toBeCloseTo(0.04, 3)
      expect(scenarios.worstCase.scenario.withdrawalRate).toBeCloseTo(0.04, 3)
      expect(scenarios.averageCase.scenario.withdrawalRate).toBeCloseTo(0.04, 3)
    })
  })

  describe('calculateSafeWithdrawalRate', () => {
    it('should return a conservative withdrawal rate', () => {
      const result = calculateSafeWithdrawalRate(500000, 30, 0.95, 0.07, 0.15)

      expect(result.safeWithdrawalRate).toBeGreaterThan(0)
      expect(result.safeWithdrawalRate).toBeLessThanOrEqual(0.06)
      expect(result.safeWithdrawalAmount).toBe(result.safeWithdrawalRate * 500000)
    })

    it('should return lower rate for longer time horizons', () => {
      const result20 = calculateSafeWithdrawalRate(500000, 20, 0.95, 0.07, 0.15)
      const result40 = calculateSafeWithdrawalRate(500000, 40, 0.95, 0.15)

      expect(result40.safeWithdrawalRate).toBeLessThanOrEqual(result20.safeWithdrawalRate)
    })

    it('should return the target survival probability', () => {
      const result = calculateSafeWithdrawalRate(500000, 30, 0.95, 0.07, 0.15)

      expect(result.survivalProbability).toBe(0.95)
    })

    it('should handle different portfolio sizes', () => {
      const result300k = calculateSafeWithdrawalRate(300000, 30, 0.95, 0.07, 0.15)
      const result700k = calculateSafeWithdrawalRate(700000, 30, 0.95, 0.07, 0.15)

      // Rates should be similar regardless of portfolio size
      expect(Math.abs(result300k.safeWithdrawalRate - result700k.safeWithdrawalRate)).toBeLessThan(0.01)

      // But amounts should scale with portfolio
      expect(result700k.safeWithdrawalAmount).toBeGreaterThan(result300k.safeWithdrawalAmount)
    })

    it('should return safe withdrawal amount correctly', () => {
      const result = calculateSafeWithdrawalRate(500000, 30, 0.95, 0.07, 0.15)

      expect(result.safeWithdrawalAmount).toBeCloseTo(result.safeWithdrawalRate * 500000, 0)
    })
  })

  describe('analyzeSequenceRisk', () => {
    it('should provide risk analysis with recommendations', () => {
      const analysis = analyzeSequenceRisk(500000, 20000, 30, 0.07, 0.15)

      expect(analysis.riskLevel).toBeDefined()
      expect(analysis.recommendations).toBeInstanceOf(Array)
      expect(analysis.recommendations.length).toBeGreaterThan(0)
      expect(analysis.bestCase).toBeDefined()
      expect(analysis.worstCase).toBeDefined()
      expect(analysis.averageCase).toBeDefined()
    })

    it('should identify critical risk for high withdrawal rates', () => {
      const analysis = analyzeSequenceRisk(500000, 50000, 30, 0.07, 0.15)

      expect(analysis.riskLevel).toBe('critical')
      expect(analysis.worstCase.portfolioDepleted).toBe(true)
    })

    it('should identify low risk for conservative withdrawal rates', () => {
      const analysis = analyzeSequenceRisk(500000, 15000, 30, 0.07, 0.15)

      expect(analysis.riskLevel).toMatch(/low|medium/)
      expect(analysis.worstCase.portfolioDepleted).toBe(false)
    })

    it('should provide different recommendations based on risk level', () => {
      const criticalAnalysis = analyzeSequenceRisk(500000, 50000, 30, 0.07, 0.15)
      const lowAnalysis = analyzeSequenceRisk(500000, 15000, 30, 0.07, 0.15)

      expect(criticalAnalysis.recommendations).not.toEqual(lowAnalysis.recommendations)
    })

    it('should handle edge case of very low returns', () => {
      const analysis = analyzeSequenceRisk(500000, 20000, 30, 0.02, 0.15)

      expect(analysis.riskLevel).toMatch(/high|critical/)
    })

    it('should handle edge case of high returns', () => {
      const analysis = analyzeSequenceRisk(500000, 20000, 30, 0.12, 0.15)

      expect(analysis.riskLevel).toMatch(/low|medium/)
    })
  })

  describe('getDefaultSequenceRiskConfig', () => {
    it('should return default configuration', () => {
      const config = getDefaultSequenceRiskConfig()

      expect(config.startingPortfolio).toBe(500000)
      expect(config.annualWithdrawal).toBe(20000)
      expect(config.years).toBe(30)
      expect(config.averageReturn).toBe(0.07)
      expect(config.volatility).toBe(0.15)
    })

    it('should return configuration with reasonable 4% withdrawal rate', () => {
      const config = getDefaultSequenceRiskConfig()
      const withdrawalRate = config.annualWithdrawal / config.startingPortfolio

      expect(withdrawalRate).toBe(0.04)
    })
  })

  describe('integration tests', () => {
    it('should demonstrate sequence risk impact', () => {
      // Compare two scenarios with same average return but different sequences
      const goodSequence: SequenceRiskScenario = {
        id: 'good',
        name: 'Good',
        description: 'Good sequence',
        startingPortfolio: 500000,
        annualWithdrawal: 20000,
        withdrawalRate: 0.04,
        returns: [0.15, 0.12, 0.08, 0.05, 0.03, -0.02],
        years: 6,
      }

      const badSequence: SequenceRiskScenario = {
        id: 'bad',
        name: 'Bad',
        description: 'Bad sequence',
        startingPortfolio: 500000,
        annualWithdrawal: 20000,
        withdrawalRate: 0.04,
        returns: [-0.02, 0.03, 0.05, 0.08, 0.12, 0.15],
        years: 6,
      }

      const goodResult = simulateSequence(goodSequence)
      const badResult = simulateSequence(badSequence)

      // Same average return
      expect(goodResult.averageReturn).toBeCloseTo(badResult.averageReturn, 3)

      // But different outcomes due to sequence
      expect(goodResult.finalPortfolioValue).toBeGreaterThan(badResult.finalPortfolioValue)
    })

    it('should complete full analysis workflow', () => {
      // 1. Get default config
      const config = getDefaultSequenceRiskConfig()

      // 2. Generate scenarios
      const scenarios = generateSequenceScenarios(
        config.startingPortfolio,
        config.annualWithdrawal,
        config.years,
        config.averageReturn,
        config.volatility,
      )

      // 3. Analyze risk
      const analysis = analyzeSequenceRisk(
        config.startingPortfolio,
        config.annualWithdrawal,
        config.years,
        config.averageReturn,
        config.volatility,
      )

      // 4. Calculate safe withdrawal rate
      const safeRate = calculateSafeWithdrawalRate(
        config.startingPortfolio,
        config.years,
        0.95,
        config.averageReturn,
        config.volatility,
      )

      expect(scenarios).toBeDefined()
      expect(analysis).toBeDefined()
      expect(safeRate).toBeDefined()
      expect(analysis.recommendations.length).toBeGreaterThan(0)
    })
  })
})
