import { describe, test, expect } from 'vitest'
import {
  type BenchmarkConfig,
  type BenchmarkType,
  getBenchmarkName,
  getBenchmarkReturn,
  calculatePortfolioReturns,
  compareToBenchmark,
  getDefaultBenchmarkConfig,
  validateBenchmarkConfig,
  formatOutperformance,
  getPerformanceCategory,
} from './benchmark'

describe('Benchmark Helper Functions', () => {
  describe('getBenchmarkName', () => {
    test('should return correct name for standard benchmarks', () => {
      const daxConfig: BenchmarkConfig = {
        enabled: true,
        benchmarkType: 'dax',
      }
      expect(getBenchmarkName(daxConfig)).toBe('DAX (Deutscher Aktienindex)')

      const msciConfig: BenchmarkConfig = {
        enabled: true,
        benchmarkType: 'msci-world',
      }
      expect(getBenchmarkName(msciConfig)).toBe('MSCI World')
    })

    test('should return custom name for custom benchmark', () => {
      const config: BenchmarkConfig = {
        enabled: true,
        benchmarkType: 'custom',
        customName: 'Mein Portfolio',
        customAnnualReturn: 0.08,
      }
      expect(getBenchmarkName(config)).toBe('Mein Portfolio')
    })

    test('should return default custom name if not specified', () => {
      const config: BenchmarkConfig = {
        enabled: true,
        benchmarkType: 'custom',
        customAnnualReturn: 0.08,
      }
      expect(getBenchmarkName(config)).toBe('Benutzerdefiniert')
    })
  })

  describe('getBenchmarkReturn', () => {
    test('should return historical data for known years', () => {
      // DAX had approximately 25.6% return in 2013
      const return2013 = getBenchmarkReturn('dax', 2013)
      expect(return2013).toBeCloseTo(0.256, 3)

      // MSCI World had approximately 26.8% return in 2013
      const msciReturn2013 = getBenchmarkReturn('msci-world', 2013)
      expect(msciReturn2013).toBeCloseTo(0.268, 3)
    })

    test('should return average return for unknown years', () => {
      // For future years, should return average
      const futureReturn = getBenchmarkReturn('dax', 2030)
      expect(futureReturn).toBe(0.08) // 8% average for DAX
    })

    test('should return custom return for custom benchmark', () => {
      const customReturn = getBenchmarkReturn('custom', 2023, 0.12)
      expect(customReturn).toBe(0.12)
    })

    test('should return default 7% for custom benchmark without specified return', () => {
      const customReturn = getBenchmarkReturn('custom', 2023)
      expect(customReturn).toBe(0.07)
    })
  })

  describe('calculatePortfolioReturns', () => {
    test('should calculate correct returns for simple scenario', () => {
      const simulationResults = {
        2023: { startkapital: 10000, endkapital: 10500 },
        2024: { startkapital: 10500, endkapital: 11000 },
        2025: { startkapital: 11000, endkapital: 11500 },
      }

      const returns = calculatePortfolioReturns(2023, 2025, simulationResults)

      expect(returns[2023]).toBeCloseTo(0.05, 4) // 5% return
      expect(returns[2024]).toBeCloseTo(0.0476, 4) // ~4.76% return
      expect(returns[2025]).toBeCloseTo(0.0455, 4) // ~4.55% return
    })

    test('should handle zero starting capital', () => {
      const simulationResults = {
        2023: { startkapital: 0, endkapital: 1000 },
      }

      const returns = calculatePortfolioReturns(2023, 2023, simulationResults)
      expect(returns[2023]).toBe(0)
    })

    test('should handle negative returns', () => {
      const simulationResults = {
        2023: { startkapital: 10000, endkapital: 9000 },
      }

      const returns = calculatePortfolioReturns(2023, 2023, simulationResults)
      expect(returns[2023]).toBeCloseTo(-0.1, 4) // -10% return
    })
  })

  describe('compareToBenchmark', () => {
    test('should correctly compare portfolio to benchmark', () => {
      const config: BenchmarkConfig = {
        enabled: true,
        benchmarkType: 'custom',
        customAnnualReturn: 0.07, // 7% benchmark
      }

      const portfolioReturns = {
        2023: 0.1, // 10% portfolio return
        2024: 0.08, // 8% portfolio return
        2025: 0.06, // 6% portfolio return
      }

      const result = compareToBenchmark(config, 2023, 2025, portfolioReturns)

      expect(result.benchmarkName).toBe('Benutzerdefiniert')
      expect(result.portfolioAverageReturn).toBeCloseTo(0.08, 4) // (10+8+6)/3 = 8%
      expect(result.benchmarkAverageReturn).toBe(0.07)
      expect(result.averageOutperformance).toBeCloseTo(0.01, 4) // 1% outperformance

      expect(result.yearlyData).toHaveLength(3)
      expect(result.yearlyData[0].difference).toBeCloseTo(0.03, 4) // 10% - 7% = 3%
      expect(result.yearlyData[1].difference).toBeCloseTo(0.01, 4) // 8% - 7% = 1%
      expect(result.yearlyData[2].difference).toBeCloseTo(-0.01, 4) // 6% - 7% = -1%

      expect(result.yearsOutperformed).toBe(2)
      expect(result.yearsUnderperformed).toBe(1)
    })

    test('should calculate cumulative values correctly', () => {
      const config: BenchmarkConfig = {
        enabled: true,
        benchmarkType: 'custom',
        customAnnualReturn: 0.1, // 10% benchmark
      }

      const portfolioReturns = {
        2023: 0.1, // 10% portfolio return
        2024: 0.1, // 10% portfolio return
      }

      const result = compareToBenchmark(config, 2023, 2024, portfolioReturns)

      // After year 1: 1.0 * 1.10 = 1.10
      expect(result.yearlyData[0].cumulativeBenchmarkValue).toBeCloseTo(1.1, 4)
      expect(result.yearlyData[0].cumulativePortfolioValue).toBeCloseTo(1.1, 4)

      // After year 2: 1.10 * 1.10 = 1.21
      expect(result.yearlyData[1].cumulativeBenchmarkValue).toBeCloseTo(1.21, 4)
      expect(result.yearlyData[1].cumulativePortfolioValue).toBeCloseTo(1.21, 4)

      expect(result.totalBenchmarkReturn).toBeCloseTo(0.21, 4) // 21% total return
      expect(result.totalPortfolioReturn).toBeCloseTo(0.21, 4) // 21% total return
    })

    test('should calculate tracking error correctly', () => {
      const config: BenchmarkConfig = {
        enabled: true,
        benchmarkType: 'custom',
        customAnnualReturn: 0.07,
      }

      const portfolioReturns = {
        2023: 0.1, // +3% vs benchmark
        2024: 0.08, // +1% vs benchmark
        2025: 0.04, // -3% vs benchmark
      }

      const result = compareToBenchmark(config, 2023, 2025, portfolioReturns)

      // Tracking error should be > 0 when returns deviate from benchmark
      expect(result.trackingError).toBeGreaterThan(0)
      expect(result.trackingError).toBeCloseTo(0.0306, 3) // ~3.06% tracking error
    })

    test('should use historical data for standard benchmarks', () => {
      const config: BenchmarkConfig = {
        enabled: true,
        benchmarkType: 'dax',
      }

      const portfolioReturns = {
        2023: 0.2, // 20% portfolio return
      }

      const result = compareToBenchmark(config, 2023, 2023, portfolioReturns)

      // DAX had approximately 20.3% return in 2023
      expect(result.benchmarkAverageReturn).toBeCloseTo(0.203, 3)
      expect(result.yearlyData[0].benchmarkReturn).toBeCloseTo(0.203, 3)
    })
  })

  describe('getDefaultBenchmarkConfig', () => {
    test('should return valid default configuration', () => {
      const config = getDefaultBenchmarkConfig()

      expect(config.enabled).toBe(false)
      expect(config.benchmarkType).toBe('msci-world')
      expect(config.customAnnualReturn).toBe(0.07)
      expect(config.customName).toBe('Benutzerdefinierter Benchmark')
    })
  })

  describe('validateBenchmarkConfig', () => {
    test('should validate correct custom configuration', () => {
      const config: BenchmarkConfig = {
        enabled: true,
        benchmarkType: 'custom',
        customAnnualReturn: 0.08,
        customName: 'My Benchmark',
      }

      const errors = validateBenchmarkConfig(config)
      expect(errors).toHaveLength(0)
    })

    test('should require custom return for custom benchmark', () => {
      const config: BenchmarkConfig = {
        enabled: true,
        benchmarkType: 'custom',
      }

      const errors = validateBenchmarkConfig(config)
      expect(errors).toHaveLength(1)
      expect(errors[0]).toContain('Benutzerdefinierte Rendite muss angegeben werden')
    })

    test('should reject invalid custom return values', () => {
      const configTooLow: BenchmarkConfig = {
        enabled: true,
        benchmarkType: 'custom',
        customAnnualReturn: -0.6, // -60%
      }

      const errorsLow = validateBenchmarkConfig(configTooLow)
      expect(errorsLow).toHaveLength(1)
      expect(errorsLow[0]).toContain('zwischen -50% und 100% liegen')

      const configTooHigh: BenchmarkConfig = {
        enabled: true,
        benchmarkType: 'custom',
        customAnnualReturn: 1.5, // 150%
      }

      const errorsHigh = validateBenchmarkConfig(configTooHigh)
      expect(errorsHigh).toHaveLength(1)
      expect(errorsHigh[0]).toContain('zwischen -50% und 100% liegen')
    })

    test('should validate standard benchmarks without errors', () => {
      const benchmarkTypes: BenchmarkType[] = ['dax', 'msci-world', 'msci-acwi', 'sp500', 'stoxx600', 'msci-em']

      benchmarkTypes.forEach(type => {
        const config: BenchmarkConfig = {
          enabled: true,
          benchmarkType: type,
        }
        const errors = validateBenchmarkConfig(config)
        expect(errors).toHaveLength(0)
      })
    })
  })

  describe('formatOutperformance', () => {
    test('should format positive outperformance with + sign', () => {
      expect(formatOutperformance(0.05)).toBe('+5.00%')
      expect(formatOutperformance(0.123)).toBe('+12.30%')
    })

    test('should format negative outperformance', () => {
      expect(formatOutperformance(-0.03)).toBe('-3.00%')
      expect(formatOutperformance(-0.0987)).toBe('-9.87%')
    })

    test('should format zero outperformance', () => {
      expect(formatOutperformance(0)).toBe('+0.00%')
    })
  })

  describe('getPerformanceCategory', () => {
    test('should categorize excellent performance', () => {
      expect(getPerformanceCategory(0.05)).toBe('excellent') // 5%
      expect(getPerformanceCategory(0.03)).toBe('excellent') // 3%
    })

    test('should categorize good performance', () => {
      expect(getPerformanceCategory(0.02)).toBe('good') // 2%
      expect(getPerformanceCategory(0.01)).toBe('good') // 1%
    })

    test('should categorize neutral performance', () => {
      expect(getPerformanceCategory(0.005)).toBe('neutral') // 0.5%
      expect(getPerformanceCategory(0)).toBe('neutral') // 0%
      expect(getPerformanceCategory(-0.005)).toBe('neutral') // -0.5%
    })

    test('should categorize poor performance', () => {
      expect(getPerformanceCategory(-0.015)).toBe('poor') // -1.5%
      expect(getPerformanceCategory(-0.025)).toBe('poor') // -2.5%
    })

    test('should categorize bad performance', () => {
      expect(getPerformanceCategory(-0.04)).toBe('bad') // -4%
      expect(getPerformanceCategory(-0.1)).toBe('bad') // -10%
    })
  })

  describe('Integration test: Real-world scenario', () => {
    test('should compare realistic portfolio against MSCI World', () => {
      const config: BenchmarkConfig = {
        enabled: true,
        benchmarkType: 'msci-world',
      }

      // Simulate a portfolio with varying returns
      const portfolioReturns = {
        2020: 0.18, // Good year
        2021: 0.22, // Great year
        2022: -0.15, // Bad year (market crash)
        2023: 0.25, // Recovery year
      }

      const result = compareToBenchmark(config, 2020, 2023, portfolioReturns)

      expect(result.benchmarkName).toBe('MSCI World')
      expect(result.yearlyData).toHaveLength(4)

      // Check that cumulative values compound correctly
      expect(result.yearlyData[3].cumulativePortfolioValue).toBeGreaterThan(1)

      // Verify tracking error is calculated
      expect(result.trackingError).toBeGreaterThan(0)

      // Verify outperformance counts
      const totalYears = result.yearsOutperformed + result.yearsUnderperformed
      expect(totalYears).toBeLessThanOrEqual(4) // Some years might have exactly 0 difference
    })
  })
})
