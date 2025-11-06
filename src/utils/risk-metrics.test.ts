import { describe, test, expect } from 'vitest'
import {
  calculateReturns,
  calculateVaR,
  calculateDrawdown,
  calculateSharpeRatio,
  calculateSortinoRatio,
  calculateCalmarRatio,
  calculateVolatility,
  calculateRiskMetrics,
  formatRiskMetric,
  type PortfolioData,
} from './risk-metrics'

describe('Risk Metrics Calculations', () => {
  describe('calculateReturns', () => {
    test('calculates annual returns correctly', () => {
      const values = [100, 110, 105, 120]
      const returns = calculateReturns(values)

      expect(returns).toHaveLength(3)
      expect(returns[0]).toBeCloseTo(0.1, 3) // (110-100)/100 = 0.1
      expect(returns[1]).toBeCloseTo(-0.0454, 3) // (105-110)/110 ≈ -0.0454
      expect(returns[2]).toBeCloseTo(0.1429, 3) // (120-105)/105 ≈ 0.1429
    })

    test('handles empty array', () => {
      expect(calculateReturns([])).toEqual([])
    })

    test('handles single value', () => {
      expect(calculateReturns([100])).toEqual([])
    })

    test('handles zero values correctly', () => {
      const values = [0, 100, 0]
      const returns = calculateReturns(values)
      expect(returns[0]).toBe(Infinity) // (100-0)/0 = Infinity
      expect(returns[1]).toBe(-1) // (0-100)/100
    })
  })

  describe('calculateVaR', () => {
    test('calculates 95% VaR correctly', () => {
      const returns = [-0.15, -0.1, -0.05, 0.05, 0.1, 0.15, 0.2]
      const var95 = calculateVaR(returns, 0.95)

      // 5% of 7 values = 0.35, so index 0 (worst case)
      expect(var95).toBe(0.15)
    })

    test('calculates 99% VaR correctly', () => {
      const returns = [-0.15, -0.1, -0.05, 0.05, 0.1, 0.15, 0.2]
      const var99 = calculateVaR(returns, 0.99)

      // 1% of 7 values = 0.07, so index 0 (worst case)
      expect(var99).toBe(0.15)
    })

    test('handles empty returns', () => {
      expect(calculateVaR([], 0.95)).toBe(0)
    })
  })

  describe('calculateDrawdown', () => {
    test('calculates maximum drawdown correctly', () => {
      const values = [100, 120, 80, 90, 110]
      const { maxDrawdown, drawdownSeries } = calculateDrawdown(values)

      // Max value was 120, min after that was 80, so drawdown = (120-80)/120 = 33.33%
      expect(maxDrawdown).toBeCloseTo(33.33, 2)
      expect(drawdownSeries).toHaveLength(5)
      expect(drawdownSeries[2].drawdown).toBeCloseTo(33.33, 2) // At index 2 (value 80)
    })

    test('handles increasing values (no drawdown)', () => {
      const values = [100, 110, 120, 130]
      const { maxDrawdown, drawdownSeries } = calculateDrawdown(values)

      expect(maxDrawdown).toBe(0)
      expect(drawdownSeries.every(point => point.drawdown === 0)).toBe(true)
    })

    test('handles empty values', () => {
      const { maxDrawdown, drawdownSeries } = calculateDrawdown([])
      expect(maxDrawdown).toBe(0)
      expect(drawdownSeries).toEqual([])
    })
  })

  describe('calculateSharpeRatio', () => {
    test('calculates Sharpe ratio correctly', () => {
      const returns = [0.08, 0.12, 0.05, 0.15, -0.02]
      const riskFreeRate = 0.03
      const sharpeRatio = calculateSharpeRatio(returns, riskFreeRate)

      // Expected calculation:
      // Average return = (0.08 + 0.12 + 0.05 + 0.15 - 0.02) / 5 = 0.076
      // Excess return = 0.076 - 0.03 = 0.046
      // Calculate variance and standard deviation manually to verify
      expect(sharpeRatio).toBeCloseTo(0.782, 2)
    })

    test('handles zero standard deviation', () => {
      const returns = [0.05, 0.05, 0.05]
      const sharpeRatio = calculateSharpeRatio(returns, 0.03)
      expect(sharpeRatio).toBe(0) // Should handle division by zero
    })

    test('handles empty returns', () => {
      expect(calculateSharpeRatio([], 0.03)).toBe(0)
    })
  })

  describe('calculateSortinoRatio', () => {
    test('calculates Sortino ratio correctly', () => {
      const returns = [0.08, 0.12, -0.05, 0.15, -0.02]
      const riskFreeRate = 0.03
      const sortinoRatio = calculateSortinoRatio(returns, riskFreeRate)

      // Should only consider downside deviation from negative returns
      expect(sortinoRatio).toBeGreaterThan(0)
      expect(typeof sortinoRatio).toBe('number')
    })

    test('handles no downside risk', () => {
      const returns = [0.05, 0.08, 0.12]
      const riskFreeRate = 0.03
      const sortinoRatio = calculateSortinoRatio(returns, riskFreeRate)
      expect(sortinoRatio).toBe(999.999)
    })

    test('handles empty returns', () => {
      expect(calculateSortinoRatio([], 0.03)).toBe(0)
    })
  })

  describe('calculateCalmarRatio', () => {
    test('calculates Calmar ratio correctly', () => {
      const returns = [0.08, 0.12, 0.05, 0.15]
      const maxDrawdown = 15 // 15%
      const calmarRatio = calculateCalmarRatio(returns, maxDrawdown)

      // Average return = 0.1 = 10%
      // Calmar ratio = 10 / 15 = 0.667
      expect(calmarRatio).toBeCloseTo(0.667, 3)
    })

    test('handles zero drawdown', () => {
      const returns = [0.08, 0.12, 0.05, 0.15]
      const calmarRatio = calculateCalmarRatio(returns, 0)
      expect(calmarRatio).toBe(999.999)
    })

    test('handles empty returns', () => {
      expect(calculateCalmarRatio([], 10)).toBe(0)
    })
  })

  describe('calculateVolatility', () => {
    test('calculates volatility correctly', () => {
      const returns = [0.1, 0.05, 0.15, -0.05]
      const volatility = calculateVolatility(returns)

      // Standard deviation * 100 to get percentage
      expect(volatility).toBeGreaterThan(0)
      expect(typeof volatility).toBe('number')
    })

    test('handles empty returns', () => {
      expect(calculateVolatility([])).toBe(0)
    })

    test('handles constant returns', () => {
      const returns = [0.05, 0.05, 0.05]
      const volatility = calculateVolatility(returns)
      expect(volatility).toBe(0)
    })
  })

  describe('calculateRiskMetrics', () => {
    test('calculates comprehensive risk metrics', () => {
      const portfolioData: PortfolioData = {
        years: [2020, 2021, 2022, 2023, 2024],
        values: [100000, 105000, 102000, 108000, 95000],
        riskFreeRate: 0.02,
      }

      const metrics = calculateRiskMetrics(portfolioData)

      expect(metrics.valueAtRisk5).toBeGreaterThan(0)
      expect(metrics.valueAtRisk1).toBeGreaterThan(0)
      expect(metrics.maxDrawdown).toBeGreaterThan(0)
      expect(typeof metrics.sharpeRatio).toBe('number')
      expect(typeof metrics.sortinoRatio).toBe('number')
      expect(typeof metrics.calmarRatio).toBe('number')
      expect(metrics.volatility).toBeGreaterThan(0)

      expect(metrics.drawdownSeries).toBeDefined()
      expect(metrics.returnSeries).toBeDefined()
      expect(metrics.drawdownSeries!.length).toBe(5)
      expect(metrics.returnSeries!.length).toBe(4) // n-1 returns from n values
    })

    test('uses provided returns when available', () => {
      const portfolioData: PortfolioData = {
        years: [2020, 2021, 2022],
        values: [100000, 105000, 102000],
        returns: [0.05, -0.0286],
        riskFreeRate: 0.03,
      }

      const metrics = calculateRiskMetrics(portfolioData)

      expect(metrics.returnSeries).toBeDefined()
      expect(metrics.returnSeries!.length).toBe(2)
      expect(metrics.returnSeries![0].return).toBeCloseTo(5, 1) // 0.05 * 100
      expect(metrics.returnSeries![1].return).toBeCloseTo(-2.86, 1) // -0.0286 * 100
    })
  })

  describe('formatRiskMetric', () => {
    test('formats percentage correctly', () => {
      expect(formatRiskMetric(15.678, 'percentage')).toBe('15.68%')
      expect(formatRiskMetric(0.123, 'percentage')).toBe('0.12%')
    })

    test('formats ratio correctly', () => {
      expect(formatRiskMetric(1.23456, 'ratio')).toBe('1.235')
      expect(formatRiskMetric(0.789, 'ratio')).toBe('0.789')
    })

    test('formats currency correctly', () => {
      const result = formatRiskMetric(1234.56, 'currency')
      expect(result).toMatch(/1\.234,56\s*€/)

      const zeroResult = formatRiskMetric(0, 'currency')
      expect(zeroResult).toMatch(/0,00\s*€/)
    })
  })

  describe('Edge Cases', () => {
    test('handles all zero values', () => {
      const portfolioData: PortfolioData = {
        years: [2020, 2021, 2022],
        values: [0, 0, 0],
      }

      const metrics = calculateRiskMetrics(portfolioData)

      expect(metrics.maxDrawdown).toBe(0)
      expect(metrics.volatility).toBe(0)
      expect(metrics.valueAtRisk5).toBe(0)
      expect(metrics.valueAtRisk1).toBe(0)
    })

    test('handles single value', () => {
      const portfolioData: PortfolioData = {
        years: [2020],
        values: [100000],
      }

      const metrics = calculateRiskMetrics(portfolioData)

      expect(metrics.drawdownSeries).toHaveLength(1)
      expect(metrics.returnSeries).toHaveLength(0)
      expect(metrics.volatility).toBe(0)
    })

    test('handles extreme values', () => {
      const portfolioData: PortfolioData = {
        years: [2020, 2021, 2022],
        values: [100000, 1000000, 1], // Extreme volatility
      }

      const metrics = calculateRiskMetrics(portfolioData)

      expect(metrics.volatility).toBeGreaterThan(0)
      expect(metrics.maxDrawdown).toBeGreaterThan(0)
      expect(isFinite(metrics.sharpeRatio)).toBe(true)
    })
  })
})
