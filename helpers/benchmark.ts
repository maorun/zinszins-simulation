/**
 * Benchmark Integration (Benchmark-Integration) Helper Functions
 *
 * This module implements benchmark comparison functionality for German financial planning.
 * Benchmarks allow users to compare their portfolio performance against common market indices.
 *
 * Key features:
 * - Common German and international index benchmarks
 * - Performance comparison calculations
 * - Outperformance/underperformance metrics
 * - Historical return data for major indices
 */

/**
 * Types of available benchmarks
 */
export type BenchmarkType =
  | 'dax' // German DAX index
  | 'msci-world' // MSCI World index
  | 'msci-acwi' // MSCI All Country World Index
  | 'sp500' // S&P 500 index
  | 'stoxx600' // STOXX Europe 600
  | 'msci-em' // MSCI Emerging Markets
  | 'custom' // User-defined custom benchmark

/**
 * Benchmark configuration
 */
export interface BenchmarkConfig {
  /** Whether benchmark comparison is enabled */
  enabled: boolean
  /** Type of benchmark to compare against */
  benchmarkType: BenchmarkType
  /** For custom benchmarks, the fixed annual return rate */
  customAnnualReturn?: number
  /** For custom benchmarks, the name/description */
  customName?: string
}

/**
 * Yearly benchmark data
 */
export interface YearlyBenchmarkData {
  /** Year */
  year: number
  /** Benchmark return for this year */
  benchmarkReturn: number
  /** Portfolio return for this year */
  portfolioReturn: number
  /** Outperformance (positive) or underperformance (negative) */
  difference: number
  /** Cumulative benchmark value (starting from 1.0) */
  cumulativeBenchmarkValue: number
  /** Cumulative portfolio value (starting from 1.0) */
  cumulativePortfolioValue: number
}

/**
 * Benchmark comparison result
 */
export interface BenchmarkComparisonResult {
  /** Benchmark type used */
  benchmarkType: BenchmarkType
  /** Benchmark name for display */
  benchmarkName: string
  /** Portfolio's average annual return */
  portfolioAverageReturn: number
  /** Benchmark's average annual return */
  benchmarkAverageReturn: number
  /** Average outperformance (positive) or underperformance (negative) */
  averageOutperformance: number
  /** Total portfolio return over the period */
  totalPortfolioReturn: number
  /** Total benchmark return over the period */
  totalBenchmarkReturn: number
  /** Yearly breakdown */
  yearlyData: YearlyBenchmarkData[]
  /** Number of years the portfolio outperformed the benchmark */
  yearsOutperformed: number
  /** Number of years the portfolio underperformed the benchmark */
  yearsUnderperformed: number
  /** Tracking error (volatility of the difference between returns) */
  trackingError: number
}

/**
 * Historical annual returns for major indices (2000-2023)
 * These are approximate historical returns for illustration purposes
 */
const BENCHMARK_HISTORICAL_RETURNS: Record<Exclude<BenchmarkType, 'custom'>, Record<number, number>> = {
  dax: {
    2000: -0.072,
    2001: -0.195,
    2002: -0.434,
    2003: 0.371,
    2004: 0.074,
    2005: 0.272,
    2006: 0.22,
    2007: 0.223,
    2008: -0.402,
    2009: 0.237,
    2010: 0.161,
    2011: -0.148,
    2012: 0.291,
    2013: 0.256,
    2014: 0.025,
    2015: 0.096,
    2016: 0.068,
    2017: 0.126,
    2018: -0.182,
    2019: 0.254,
    2020: 0.038,
    2021: 0.158,
    2022: -0.123,
    2023: 0.203,
  },
  'msci-world': {
    2000: -0.13,
    2001: -0.166,
    2002: -0.196,
    2003: 0.334,
    2004: 0.148,
    2005: 0.099,
    2006: 0.201,
    2007: 0.093,
    2008: -0.406,
    2009: 0.3,
    2010: 0.119,
    2011: -0.054,
    2012: 0.16,
    2013: 0.268,
    2014: 0.049,
    2015: -0.009,
    2016: 0.076,
    2017: 0.228,
    2018: -0.087,
    2019: 0.278,
    2020: 0.16,
    2021: 0.219,
    2022: -0.18,
    2023: 0.238,
  },
  'msci-acwi': {
    2000: -0.135,
    2001: -0.165,
    2002: -0.198,
    2003: 0.338,
    2004: 0.153,
    2005: 0.104,
    2006: 0.207,
    2007: 0.115,
    2008: -0.42,
    2009: 0.345,
    2010: 0.128,
    2011: -0.071,
    2012: 0.164,
    2013: 0.229,
    2014: 0.041,
    2015: -0.022,
    2016: 0.078,
    2017: 0.24,
    2018: -0.092,
    2019: 0.267,
    2020: 0.165,
    2021: 0.188,
    2022: -0.183,
    2023: 0.224,
  },
  sp500: {
    2000: -0.101,
    2001: -0.13,
    2002: -0.234,
    2003: 0.264,
    2004: 0.09,
    2005: 0.03,
    2006: 0.136,
    2007: 0.035,
    2008: -0.37,
    2009: 0.234,
    2010: 0.128,
    2011: 0.0,
    2012: 0.133,
    2013: 0.296,
    2014: 0.114,
    2015: -0.007,
    2016: 0.095,
    2017: 0.192,
    2018: -0.062,
    2019: 0.288,
    2020: 0.164,
    2021: 0.267,
    2022: -0.196,
    2023: 0.241,
  },
  stoxx600: {
    2000: -0.058,
    2001: -0.175,
    2002: -0.325,
    2003: 0.178,
    2004: 0.105,
    2005: 0.213,
    2006: 0.178,
    2007: 0.033,
    2008: -0.43,
    2009: 0.284,
    2010: 0.091,
    2011: -0.114,
    2012: 0.145,
    2013: 0.177,
    2014: 0.043,
    2015: 0.066,
    2016: -0.007,
    2017: 0.102,
    2018: -0.134,
    2019: 0.241,
    2020: -0.04,
    2021: 0.225,
    2022: -0.132,
    2023: 0.128,
  },
  'msci-em': {
    2000: -0.307,
    2001: -0.025,
    2002: -0.061,
    2003: 0.556,
    2004: 0.258,
    2005: 0.341,
    2006: 0.324,
    2007: 0.395,
    2008: -0.533,
    2009: 0.787,
    2010: 0.189,
    2011: -0.184,
    2012: 0.183,
    2013: -0.025,
    2014: -0.02,
    2015: -0.147,
    2016: 0.112,
    2017: 0.374,
    2018: -0.143,
    2019: 0.182,
    2020: 0.182,
    2021: -0.025,
    2022: -0.2,
    2023: 0.098,
  },
}

/**
 * Average long-term returns for benchmarks (for years without historical data)
 */
const BENCHMARK_AVERAGE_RETURNS: Record<Exclude<BenchmarkType, 'custom'>, number> = {
  dax: 0.08, // 8% average
  'msci-world': 0.075, // 7.5% average
  'msci-acwi': 0.075, // 7.5% average
  sp500: 0.1, // 10% average
  stoxx600: 0.065, // 6.5% average
  'msci-em': 0.085, // 8.5% average
}

/**
 * Benchmark names for display
 */
const BENCHMARK_NAMES: Record<BenchmarkType, string> = {
  dax: 'DAX (Deutscher Aktienindex)',
  'msci-world': 'MSCI World',
  'msci-acwi': 'MSCI ACWI (All Country World Index)',
  sp500: 'S&P 500',
  stoxx600: 'STOXX Europe 600',
  'msci-em': 'MSCI Emerging Markets',
  custom: 'Benutzerdefiniert',
}

/**
 * Get the name of a benchmark for display
 */
export function getBenchmarkName(config: BenchmarkConfig): string {
  if (config.benchmarkType === 'custom' && config.customName) {
    return config.customName
  }
  return BENCHMARK_NAMES[config.benchmarkType]
}

/**
 * Get the benchmark return for a specific year
 */
export function getBenchmarkReturn(benchmarkType: BenchmarkType, year: number, customReturn?: number): number {
  if (benchmarkType === 'custom') {
    return customReturn ?? 0.07 // Default to 7% if not specified
  }

  // Use historical data if available
  if (BENCHMARK_HISTORICAL_RETURNS[benchmarkType]?.[year] !== undefined) {
    return BENCHMARK_HISTORICAL_RETURNS[benchmarkType][year]
  }

  // Use average long-term return for years without historical data
  return BENCHMARK_AVERAGE_RETURNS[benchmarkType]
}

/**
 * Calculate portfolio returns from simulation results
 */
export function calculatePortfolioReturns(
  startYear: number,
  endYear: number,
  simulationResults: Record<number, { startkapital: number; endkapital: number }>,
): Record<number, number> {
  const portfolioReturns: Record<number, number> = {}

  for (let year = startYear; year <= endYear; year++) {
    const yearData = simulationResults[year]
    if (!yearData) continue

    const { startkapital, endkapital } = yearData
    if (startkapital > 0) {
      portfolioReturns[year] = (endkapital - startkapital) / startkapital
    } else {
      portfolioReturns[year] = 0
    }
  }

  return portfolioReturns
}

/**
 * Compare portfolio performance against a benchmark
 */
export function compareToBenchmark(
  config: BenchmarkConfig,
  startYear: number,
  endYear: number,
  portfolioReturns: Record<number, number>,
): BenchmarkComparisonResult {
  const yearlyData: YearlyBenchmarkData[] = []
  let cumulativeBenchmarkValue = 1.0
  let cumulativePortfolioValue = 1.0

  // Calculate yearly data
  for (let year = startYear; year <= endYear; year++) {
    const portfolioReturn = portfolioReturns[year] ?? 0
    const benchmarkReturn = getBenchmarkReturn(config.benchmarkType, year, config.customAnnualReturn)
    const difference = portfolioReturn - benchmarkReturn

    cumulativeBenchmarkValue *= 1 + benchmarkReturn
    cumulativePortfolioValue *= 1 + portfolioReturn

    yearlyData.push({
      year,
      benchmarkReturn,
      portfolioReturn,
      difference,
      cumulativeBenchmarkValue,
      cumulativePortfolioValue,
    })
  }

  // Calculate summary statistics
  const numYears = yearlyData.length
  const totalBenchmarkReturn = cumulativeBenchmarkValue - 1
  const totalPortfolioReturn = cumulativePortfolioValue - 1

  // Average annual returns
  const benchmarkAverageReturn = yearlyData.reduce((sum, d) => sum + d.benchmarkReturn, 0) / numYears
  const portfolioAverageReturn = yearlyData.reduce((sum, d) => sum + d.portfolioReturn, 0) / numYears
  const averageOutperformance = portfolioAverageReturn - benchmarkAverageReturn

  // Count years of outperformance/underperformance
  const yearsOutperformed = yearlyData.filter(d => d.difference > 0).length
  const yearsUnderperformed = yearlyData.filter(d => d.difference < 0).length

  // Calculate tracking error (standard deviation of return differences)
  const meanDifference = yearlyData.reduce((sum, d) => sum + d.difference, 0) / numYears
  const variance = yearlyData.reduce((sum, d) => sum + Math.pow(d.difference - meanDifference, 2), 0) / (numYears - 1)
  const trackingError = numYears > 1 ? Math.sqrt(variance) : 0

  return {
    benchmarkType: config.benchmarkType,
    benchmarkName: getBenchmarkName(config),
    portfolioAverageReturn,
    benchmarkAverageReturn,
    averageOutperformance,
    totalPortfolioReturn,
    totalBenchmarkReturn,
    yearlyData,
    yearsOutperformed,
    yearsUnderperformed,
    trackingError,
  }
}

/**
 * Get default benchmark configuration
 */
export function getDefaultBenchmarkConfig(): BenchmarkConfig {
  return {
    enabled: false,
    benchmarkType: 'msci-world',
    customAnnualReturn: 0.07,
    customName: 'Benutzerdefinierter Benchmark',
  }
}

/**
 * Validate benchmark configuration
 */
export function validateBenchmarkConfig(config: BenchmarkConfig): string[] {
  const errors: string[] = []

  if (config.benchmarkType === 'custom') {
    if (config.customAnnualReturn === undefined) {
      errors.push('Benutzerdefinierte Rendite muss angegeben werden')
    } else if (config.customAnnualReturn < -0.5 || config.customAnnualReturn > 1.0) {
      errors.push('Benutzerdefinierte Rendite muss zwischen -50% und 100% liegen')
    }
  }

  return errors
}

/**
 * Format outperformance as a percentage string
 */
export function formatOutperformance(outperformance: number): string {
  const percentage = (outperformance * 100).toFixed(2)
  const sign = outperformance >= 0 ? '+' : ''
  return `${sign}${percentage}%`
}

/**
 * Get performance category based on outperformance
 */
export function getPerformanceCategory(outperformance: number): 'excellent' | 'good' | 'neutral' | 'poor' | 'bad' {
  if (outperformance >= 0.03) return 'excellent' // 3%+ outperformance
  if (outperformance >= 0.01) return 'good' // 1-3% outperformance
  if (outperformance >= -0.01) return 'neutral' // ±1%
  if (outperformance >= -0.03) return 'poor' // 1-3% underperformance
  return 'bad' // 3%+ underperformance
}
