import { describe, it, expect } from 'vitest'
import type { SimulationResult } from '../src/utils/simulate'
import {
  calculateAnnualReturns,
  calculateReturns,
  calculateVolatility,
  calculateMaxDrawdown,
  calculateSharpeRatio,
  calculateSortinoRatio,
  calculateWinRate,
  findBestAndWorstYears,
  calculatePortfolioPerformance,
} from './portfolio-performance'

describe('Portfolio Performance Calculations', () => {
  describe('calculateAnnualReturns', () => {
    it('should calculate annual returns correctly', () => {
      const simulationResult: SimulationResult = {
        2023: { startkapital: 10000, endkapital: 10500, zinsen: 500, bezahlteSteuer: 0, genutzterFreibetrag: 0, vorabpauschale: 0, vorabpauschaleAccumulated: 0 },
        2024: { startkapital: 10500, endkapital: 11000, zinsen: 500, bezahlteSteuer: 0, genutzterFreibetrag: 0, vorabpauschale: 0, vorabpauschaleAccumulated: 0 },
        2025: { startkapital: 11000, endkapital: 11550, zinsen: 550, bezahlteSteuer: 0, genutzterFreibetrag: 0, vorabpauschale: 0, vorabpauschaleAccumulated: 0 },
      }

      const returns = calculateAnnualReturns(simulationResult)

      expect(returns).toHaveLength(3)
      expect(returns[0]).toEqual({ year: 2023, return: 0.05 }) // 5% return
      expect(returns[1]).toEqual({ year: 2024, return: expect.closeTo(0.0476, 4) }) // ~4.76% return
      expect(returns[2]).toEqual({ year: 2025, return: 0.05 }) // 5% return
    })

    it('should handle zero start capital', () => {
      const simulationResult: SimulationResult = {
        2023: { startkapital: 0, endkapital: 1000, zinsen: 1000, bezahlteSteuer: 0, genutzterFreibetrag: 0, vorabpauschale: 0, vorabpauschaleAccumulated: 0 },
      }

      const returns = calculateAnnualReturns(simulationResult)

      expect(returns).toHaveLength(0)
    })

    it('should handle empty simulation result', () => {
      const simulationResult: SimulationResult = {}

      const returns = calculateAnnualReturns(simulationResult)

      expect(returns).toHaveLength(0)
    })
  })

  describe('calculateReturns', () => {
    it('should calculate total, annualized, and cumulative returns', () => {
      const simulationResult: SimulationResult = {
        2023: { startkapital: 10000, endkapital: 10500, zinsen: 500, bezahlteSteuer: 0, genutzterFreibetrag: 0, vorabpauschale: 0, vorabpauschaleAccumulated: 0 },
        2024: { startkapital: 10500, endkapital: 11000, zinsen: 500, bezahlteSteuer: 0, genutzterFreibetrag: 0, vorabpauschale: 0, vorabpauschaleAccumulated: 0 },
        2025: { startkapital: 11000, endkapital: 12000, zinsen: 1000, bezahlteSteuer: 0, genutzterFreibetrag: 0, vorabpauschale: 0, vorabpauschaleAccumulated: 0 },
      }

      const { totalReturn, annualizedReturn, cumulativeReturn } = calculateReturns(simulationResult)

      expect(totalReturn).toBeCloseTo(20, 1) // 20% total return
      expect(annualizedReturn).toBeCloseTo(9.54, 2) // ~9.54% annualized
      expect(cumulativeReturn).toBe(2000) // 2000 absolute return
    })

    it('should handle single year simulation', () => {
      const simulationResult: SimulationResult = {
        2023: { startkapital: 10000, endkapital: 10500, zinsen: 500, bezahlteSteuer: 0, genutzterFreibetrag: 0, vorabpauschale: 0, vorabpauschaleAccumulated: 0 },
      }

      const { totalReturn, annualizedReturn, cumulativeReturn } = calculateReturns(simulationResult)

      expect(totalReturn).toBe(5) // 5% total return
      expect(annualizedReturn).toBe(0) // 0 years difference
      expect(cumulativeReturn).toBe(500) // 500 absolute return
    })

    it('should handle zero initial capital', () => {
      const simulationResult: SimulationResult = {
        2023: { startkapital: 0, endkapital: 1000, zinsen: 1000, bezahlteSteuer: 0, genutzterFreibetrag: 0, vorabpauschale: 0, vorabpauschaleAccumulated: 0 },
        2024: { startkapital: 1000, endkapital: 1100, zinsen: 100, bezahlteSteuer: 0, genutzterFreibetrag: 0, vorabpauschale: 0, vorabpauschaleAccumulated: 0 },
      }

      const { totalReturn, annualizedReturn, cumulativeReturn } = calculateReturns(simulationResult)

      expect(totalReturn).toBe(0)
      expect(annualizedReturn).toBe(0)
      expect(cumulativeReturn).toBe(0)
    })

    it('should handle empty simulation result', () => {
      const simulationResult: SimulationResult = {}

      const { totalReturn, annualizedReturn, cumulativeReturn } = calculateReturns(simulationResult)

      expect(totalReturn).toBe(0)
      expect(annualizedReturn).toBe(0)
      expect(cumulativeReturn).toBe(0)
    })
  })

  describe('calculateVolatility', () => {
    it('should calculate volatility correctly', () => {
      const annualReturns = [
        { year: 2023, return: 0.05 },
        { year: 2024, return: 0.10 },
        { year: 2025, return: -0.05 },
        { year: 2026, return: 0.15 },
        { year: 2027, return: 0.03 },
      ]

      const volatility = calculateVolatility(annualReturns)

      expect(volatility).toBeGreaterThan(0)
      expect(volatility).toBeCloseTo(6.74, 1) // ~6.74% volatility
    })

    it('should return 0 for single year', () => {
      const annualReturns = [{ year: 2023, return: 0.05 }]

      const volatility = calculateVolatility(annualReturns)

      expect(volatility).toBe(0)
    })

    it('should return 0 for empty array', () => {
      const volatility = calculateVolatility([])

      expect(volatility).toBe(0)
    })

    it('should handle consistent returns (zero volatility)', () => {
      const annualReturns = [
        { year: 2023, return: 0.05 },
        { year: 2024, return: 0.05 },
        { year: 2025, return: 0.05 },
      ]

      const volatility = calculateVolatility(annualReturns)

      expect(volatility).toBeCloseTo(0, 10) // Consistent returns, nearly zero volatility due to floating point
    })
  })

  describe('calculateMaxDrawdown', () => {
    it('should calculate maximum drawdown correctly', () => {
      const simulationResult: SimulationResult = {
        2023: { startkapital: 10000, endkapital: 12000, zinsen: 2000, bezahlteSteuer: 0, genutzterFreibetrag: 0, vorabpauschale: 0, vorabpauschaleAccumulated: 0 },
        2024: { startkapital: 12000, endkapital: 10000, zinsen: -2000, bezahlteSteuer: 0, genutzterFreibetrag: 0, vorabpauschale: 0, vorabpauschaleAccumulated: 0 },
        2025: { startkapital: 10000, endkapital: 9000, zinsen: -1000, bezahlteSteuer: 0, genutzterFreibetrag: 0, vorabpauschale: 0, vorabpauschaleAccumulated: 0 },
        2026: { startkapital: 9000, endkapital: 11000, zinsen: 2000, bezahlteSteuer: 0, genutzterFreibetrag: 0, vorabpauschale: 0, vorabpauschaleAccumulated: 0 },
      }

      const { maxDrawdown, maxDrawdownStartYear, maxDrawdownEndYear } = calculateMaxDrawdown(simulationResult)

      expect(maxDrawdown).toBeCloseTo(25, 1) // 25% drawdown (from 12000 to 9000)
      expect(maxDrawdownStartYear).toBe(2023) // Peak year
      expect(maxDrawdownEndYear).toBe(2025) // Trough year
    })

    it('should return zero drawdown for rising portfolio', () => {
      const simulationResult: SimulationResult = {
        2023: { startkapital: 10000, endkapital: 11000, zinsen: 1000, bezahlteSteuer: 0, genutzterFreibetrag: 0, vorabpauschale: 0, vorabpauschaleAccumulated: 0 },
        2024: { startkapital: 11000, endkapital: 12000, zinsen: 1000, bezahlteSteuer: 0, genutzterFreibetrag: 0, vorabpauschale: 0, vorabpauschaleAccumulated: 0 },
        2025: { startkapital: 12000, endkapital: 13000, zinsen: 1000, bezahlteSteuer: 0, genutzterFreibetrag: 0, vorabpauschale: 0, vorabpauschaleAccumulated: 0 },
      }

      const { maxDrawdown } = calculateMaxDrawdown(simulationResult)

      expect(maxDrawdown).toBe(0)
    })

    it('should handle empty simulation result', () => {
      const simulationResult: SimulationResult = {}

      const { maxDrawdown, maxDrawdownStartYear, maxDrawdownEndYear } = calculateMaxDrawdown(simulationResult)

      expect(maxDrawdown).toBe(0)
      expect(maxDrawdownStartYear).toBe(0)
      expect(maxDrawdownEndYear).toBe(0)
    })
  })

  describe('calculateSharpeRatio', () => {
    it('should calculate Sharpe ratio correctly', () => {
      const annualizedReturn = 8 // 8%
      const volatility = 15 // 15%
      const riskFreeRate = 2 // 2%

      const sharpeRatio = calculateSharpeRatio(annualizedReturn, volatility, riskFreeRate)

      expect(sharpeRatio).toBeCloseTo(0.4, 2) // (8 - 2) / 15 = 0.4
    })

    it('should return 0 for zero volatility', () => {
      const sharpeRatio = calculateSharpeRatio(8, 0, 2)

      expect(sharpeRatio).toBe(0)
    })

    it('should handle negative Sharpe ratio', () => {
      const sharpeRatio = calculateSharpeRatio(-5, 15, 2)

      expect(sharpeRatio).toBeCloseTo(-0.467, 2) // (-5 - 2) / 15
    })

    it('should use default risk-free rate of 0', () => {
      const sharpeRatio = calculateSharpeRatio(10, 20)

      expect(sharpeRatio).toBeCloseTo(0.5, 2) // 10 / 20 = 0.5
    })
  })

  describe('calculateSortinoRatio', () => {
    it('should calculate Sortino ratio correctly', () => {
      const annualReturns = [
        { year: 2023, return: 0.10 },
        { year: 2024, return: -0.05 },
        { year: 2025, return: 0.15 },
        { year: 2026, return: -0.03 },
        { year: 2027, return: 0.08 },
      ]
      const annualizedReturn = 8 // 8%

      const sortinoRatio = calculateSortinoRatio(annualReturns, annualizedReturn)

      expect(sortinoRatio).toBeGreaterThan(0)
    })

    it('should return 0 when there are no negative returns', () => {
      const annualReturns = [
        { year: 2023, return: 0.10 },
        { year: 2024, return: 0.05 },
        { year: 2025, return: 0.15 },
      ]

      const sortinoRatio = calculateSortinoRatio(annualReturns, 10)

      expect(sortinoRatio).toBe(0)
    })

    it('should return 0 for single year', () => {
      const annualReturns = [{ year: 2023, return: 0.05 }]

      const sortinoRatio = calculateSortinoRatio(annualReturns, 5)

      expect(sortinoRatio).toBe(0)
    })

    it('should return 0 for empty array', () => {
      const sortinoRatio = calculateSortinoRatio([], 5)

      expect(sortinoRatio).toBe(0)
    })
  })

  describe('calculateWinRate', () => {
    it('should calculate win rate correctly', () => {
      const annualReturns = [
        { year: 2023, return: 0.10 },
        { year: 2024, return: -0.05 },
        { year: 2025, return: 0.15 },
        { year: 2026, return: -0.03 },
        { year: 2027, return: 0.08 },
      ]

      const winRate = calculateWinRate(annualReturns)

      expect(winRate).toBe(60) // 3 out of 5 positive years = 60%
    })

    it('should return 100 for all positive years', () => {
      const annualReturns = [
        { year: 2023, return: 0.10 },
        { year: 2024, return: 0.05 },
        { year: 2025, return: 0.15 },
      ]

      const winRate = calculateWinRate(annualReturns)

      expect(winRate).toBe(100)
    })

    it('should return 0 for all negative years', () => {
      const annualReturns = [
        { year: 2023, return: -0.10 },
        { year: 2024, return: -0.05 },
        { year: 2025, return: -0.15 },
      ]

      const winRate = calculateWinRate(annualReturns)

      expect(winRate).toBe(0)
    })

    it('should return 0 for empty array', () => {
      const winRate = calculateWinRate([])

      expect(winRate).toBe(0)
    })
  })

  describe('findBestAndWorstYears', () => {
    it('should find best and worst performing years', () => {
      const annualReturns = [
        { year: 2023, return: 0.10 },
        { year: 2024, return: -0.05 },
        { year: 2025, return: 0.25 },
        { year: 2026, return: -0.10 },
        { year: 2027, return: 0.08 },
      ]

      const { bestYear, worstYear } = findBestAndWorstYears(annualReturns)

      expect(bestYear).toEqual({ year: 2025, return: 25 })
      expect(worstYear).toEqual({ year: 2026, return: -10 })
    })

    it('should handle single year', () => {
      const annualReturns = [{ year: 2023, return: 0.10 }]

      const { bestYear, worstYear } = findBestAndWorstYears(annualReturns)

      expect(bestYear).toEqual({ year: 2023, return: 10 })
      expect(worstYear).toEqual({ year: 2023, return: 10 })
    })

    it('should return zeros for empty array', () => {
      const { bestYear, worstYear } = findBestAndWorstYears([])

      expect(bestYear).toEqual({ year: 0, return: 0 })
      expect(worstYear).toEqual({ year: 0, return: 0 })
    })
  })

  describe('calculatePortfolioPerformance', () => {
    it('should calculate all metrics for a typical portfolio', () => {
      const simulationResult: SimulationResult = {
        2023: { startkapital: 10000, endkapital: 10500, zinsen: 500, bezahlteSteuer: 0, genutzterFreibetrag: 0, vorabpauschale: 0, vorabpauschaleAccumulated: 0 },
        2024: { startkapital: 10500, endkapital: 11000, zinsen: 500, bezahlteSteuer: 0, genutzterFreibetrag: 0, vorabpauschale: 0, vorabpauschaleAccumulated: 0 },
        2025: { startkapital: 11000, endkapital: 11550, zinsen: 550, bezahlteSteuer: 0, genutzterFreibetrag: 0, vorabpauschale: 0, vorabpauschaleAccumulated: 0 },
        2026: { startkapital: 11550, endkapital: 12000, zinsen: 450, bezahlteSteuer: 0, genutzterFreibetrag: 0, vorabpauschale: 0, vorabpauschaleAccumulated: 0 },
      }

      const metrics = calculatePortfolioPerformance(simulationResult)

      expect(metrics.totalReturn).toBeCloseTo(20, 1)
      expect(metrics.annualizedReturn).toBeGreaterThan(0)
      expect(metrics.cumulativeReturn).toBe(2000)
      expect(metrics.volatility).toBeGreaterThanOrEqual(0)
      expect(metrics.maxDrawdown).toBeGreaterThanOrEqual(0)
      expect(metrics.sharpeRatio).toBeDefined()
      expect(metrics.sortinoRatio).toBeDefined()
      expect(metrics.winRate).toBeGreaterThanOrEqual(0)
      expect(metrics.winRate).toBeLessThanOrEqual(100)
      expect(metrics.bestYear).toBeDefined()
      expect(metrics.worstYear).toBeDefined()
      expect(metrics.averageReturn).toBeGreaterThan(0)
    })

    it('should handle portfolio with losses', () => {
      const simulationResult: SimulationResult = {
        2023: { startkapital: 10000, endkapital: 12000, zinsen: 2000, bezahlteSteuer: 0, genutzterFreibetrag: 0, vorabpauschale: 0, vorabpauschaleAccumulated: 0 },
        2024: { startkapital: 12000, endkapital: 9000, zinsen: -3000, bezahlteSteuer: 0, genutzterFreibetrag: 0, vorabpauschale: 0, vorabpauschaleAccumulated: 0 },
        2025: { startkapital: 9000, endkapital: 10000, zinsen: 1000, bezahlteSteuer: 0, genutzterFreibetrag: 0, vorabpauschale: 0, vorabpauschaleAccumulated: 0 },
      }

      const metrics = calculatePortfolioPerformance(simulationResult)

      expect(metrics.totalReturn).toBe(0) // Back to starting value
      expect(metrics.maxDrawdown).toBeGreaterThan(0) // Should capture the 25% drawdown
      expect(metrics.maxDrawdown).toBeCloseTo(25, 1)
      expect(metrics.winRate).toBeCloseTo(66.67, 1) // 2 out of 3 positive years
    })

    it('should handle empty simulation result', () => {
      const simulationResult: SimulationResult = {}

      const metrics = calculatePortfolioPerformance(simulationResult)

      expect(metrics.totalReturn).toBe(0)
      expect(metrics.annualizedReturn).toBe(0)
      expect(metrics.cumulativeReturn).toBe(0)
      expect(metrics.volatility).toBe(0)
      expect(metrics.maxDrawdown).toBe(0)
      expect(metrics.sharpeRatio).toBe(0)
      expect(metrics.winRate).toBe(0)
      expect(metrics.averageReturn).toBe(0)
    })

    it('should calculate metrics correctly for consistent growth', () => {
      const simulationResult: SimulationResult = {
        2023: { startkapital: 10000, endkapital: 10500, zinsen: 500, bezahlteSteuer: 0, genutzterFreibetrag: 0, vorabpauschale: 0, vorabpauschaleAccumulated: 0 },
        2024: { startkapital: 10500, endkapital: 11025, zinsen: 525, bezahlteSteuer: 0, genutzterFreibetrag: 0, vorabpauschale: 0, vorabpauschaleAccumulated: 0 },
        2025: { startkapital: 11025, endkapital: 11576, zinsen: 551, bezahlteSteuer: 0, genutzterFreibetrag: 0, vorabpauschale: 0, vorabpauschaleAccumulated: 0 },
      }

      const metrics = calculatePortfolioPerformance(simulationResult)

      expect(metrics.volatility).toBeCloseTo(0, 2) // Consistent 5% growth, nearly zero volatility due to floating point
      expect(metrics.maxDrawdown).toBe(0) // No drawdowns
      expect(metrics.winRate).toBe(100) // All positive years
      expect(metrics.totalReturn).toBeCloseTo(15.76, 1)
    })
  })
})
