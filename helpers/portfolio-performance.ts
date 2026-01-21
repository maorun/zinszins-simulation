import type { SimulationResult } from '../src/utils/simulate'

/**
 * Portfolio Performance Metrics for comprehensive analysis
 * Provides key performance indicators commonly used in portfolio management
 */

export interface PortfolioPerformanceMetrics {
  // Return Metrics
  totalReturn: number // Total return over the period (percentage)
  annualizedReturn: number // Annualized return (CAGR)
  cumulativeReturn: number // Cumulative return (absolute)

  // Risk Metrics
  volatility: number // Annualized standard deviation of returns
  maxDrawdown: number // Maximum peak-to-trough decline (percentage)
  maxDrawdownStartYear: number // Year when max drawdown started
  maxDrawdownEndYear: number // Year when max drawdown ended

  // Risk-Adjusted Metrics
  sharpeRatio: number // Sharpe ratio (return per unit of risk)
  sortinoRatio: number // Sortino ratio (downside risk-adjusted return)

  // Additional Metrics
  winRate: number // Percentage of positive return years
  bestYear: { year: number; return: number } // Best performing year
  worstYear: { year: number; return: number } // Worst performing year
  averageReturn: number // Average annual return
}

/**
 * Calculate annual returns from simulation results
 */
export function calculateAnnualReturns(simulationResult: SimulationResult): Array<{ year: number; return: number }> {
  const years = Object.keys(simulationResult)
    .map(Number)
    .sort((a, b) => a - b)

  const returns: Array<{ year: number; return: number }> = []

  for (let i = 0; i < years.length; i++) {
    const year = years[i]
    const data = simulationResult[year]

    if (data.startkapital > 0) {
      // Calculate return as (endkapital - startkapital) / startkapital
      const yearReturn = (data.endkapital - data.startkapital) / data.startkapital
      returns.push({ year, return: yearReturn })
    }
  }

  return returns
}

/**
 * Calculate total and annualized return
 */
export function calculateReturns(simulationResult: SimulationResult): {
  totalReturn: number
  annualizedReturn: number
  cumulativeReturn: number
} {
  const years = Object.keys(simulationResult)
    .map(Number)
    .sort((a, b) => a - b)

  if (years.length === 0) {
    return { totalReturn: 0, annualizedReturn: 0, cumulativeReturn: 0 }
  }

  const firstYear = years[0]
  const lastYear = years[years.length - 1]

  const initialCapital = simulationResult[firstYear].startkapital
  const finalCapital = simulationResult[lastYear].endkapital

  // Handle edge case of zero initial capital
  if (initialCapital === 0) {
    return { totalReturn: 0, annualizedReturn: 0, cumulativeReturn: 0 }
  }

  // Total return percentage
  const totalReturn = ((finalCapital - initialCapital) / initialCapital) * 100

  // Cumulative return (absolute value)
  const cumulativeReturn = finalCapital - initialCapital

  // Annualized return (CAGR)
  const numberOfYears = lastYear - firstYear
  const annualizedReturn = numberOfYears > 0 ? (Math.pow(finalCapital / initialCapital, 1 / numberOfYears) - 1) * 100 : 0

  return {
    totalReturn,
    annualizedReturn,
    cumulativeReturn,
  }
}

/**
 * Calculate volatility (standard deviation of returns)
 */
export function calculateVolatility(annualReturns: Array<{ year: number; return: number }>): number {
  if (annualReturns.length < 2) {
    return 0
  }

  const returns = annualReturns.map((r) => r.return)
  const meanReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length

  const squaredDiffs = returns.map((r) => Math.pow(r - meanReturn, 2))
  const variance = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / returns.length

  // Return annualized volatility as percentage
  return Math.sqrt(variance) * 100
}

/**
 * Calculate maximum drawdown
 */
export function calculateMaxDrawdown(simulationResult: SimulationResult): {
  maxDrawdown: number
  maxDrawdownStartYear: number
  maxDrawdownEndYear: number
} {
  const years = Object.keys(simulationResult)
    .map(Number)
    .sort((a, b) => a - b)

  if (years.length === 0) {
    return { maxDrawdown: 0, maxDrawdownStartYear: 0, maxDrawdownEndYear: 0 }
  }

  let peak = simulationResult[years[0]].endkapital
  let maxDrawdown = 0
  let maxDrawdownStartYear = years[0]
  let maxDrawdownEndYear = years[0]
  let currentPeakYear = years[0]

  for (const year of years) {
    const capital = simulationResult[year].endkapital

    if (capital > peak) {
      peak = capital
      currentPeakYear = year
    }

    const drawdown = peak > 0 ? ((peak - capital) / peak) * 100 : 0

    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown
      maxDrawdownStartYear = currentPeakYear
      maxDrawdownEndYear = year
    }
  }

  return {
    maxDrawdown,
    maxDrawdownStartYear,
    maxDrawdownEndYear,
  }
}

/**
 * Calculate Sharpe Ratio (risk-adjusted return)
 * Assumes risk-free rate of 0 for simplicity (can be parameterized later)
 */
export function calculateSharpeRatio(
  annualizedReturn: number,
  volatility: number,
  riskFreeRate = 0
): number {
  if (volatility === 0) {
    return 0
  }

  // Sharpe Ratio = (Return - Risk-Free Rate) / Volatility
  return (annualizedReturn - riskFreeRate) / volatility
}

/**
 * Calculate Sortino Ratio (downside risk-adjusted return)
 * Similar to Sharpe but only considers downside volatility
 */
export function calculateSortinoRatio(
  annualReturns: Array<{ year: number; return: number }>,
  annualizedReturn: number,
  riskFreeRate = 0
): number {
  if (annualReturns.length < 2) {
    return 0
  }

  // Filter only negative returns (downside)
  const negativeReturns = annualReturns.filter((r) => r.return < 0).map((r) => r.return)

  if (negativeReturns.length === 0) {
    return 0 // No downside volatility
  }

  // Calculate downside deviation
  const meanReturn = annualReturns.map((r) => r.return).reduce((sum, r) => sum + r, 0) / annualReturns.length
  const squaredDiffs = negativeReturns.map((r) => Math.pow(r - meanReturn, 2))
  const downsideVariance = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / annualReturns.length
  const downsideVolatility = Math.sqrt(downsideVariance) * 100

  if (downsideVolatility === 0) {
    return 0
  }

  // Sortino Ratio = (Return - Risk-Free Rate) / Downside Volatility
  return (annualizedReturn - riskFreeRate) / downsideVolatility
}

/**
 * Calculate win rate (percentage of positive return years)
 */
export function calculateWinRate(annualReturns: Array<{ year: number; return: number }>): number {
  if (annualReturns.length === 0) {
    return 0
  }

  const positiveYears = annualReturns.filter((r) => r.return > 0).length
  return (positiveYears / annualReturns.length) * 100
}

/**
 * Find best and worst performing years
 */
export function findBestAndWorstYears(annualReturns: Array<{ year: number; return: number }>): {
  bestYear: { year: number; return: number }
  worstYear: { year: number; return: number }
} {
  if (annualReturns.length === 0) {
    return {
      bestYear: { year: 0, return: 0 },
      worstYear: { year: 0, return: 0 },
    }
  }

  const sortedReturns = [...annualReturns].sort((a, b) => b.return - a.return)

  return {
    bestYear: { year: sortedReturns[0].year, return: sortedReturns[0].return * 100 },
    worstYear: { year: sortedReturns[sortedReturns.length - 1].year, return: sortedReturns[sortedReturns.length - 1].return * 100 },
  }
}

/**
 * Main function to calculate all portfolio performance metrics
 */
export function calculatePortfolioPerformance(simulationResult: SimulationResult): PortfolioPerformanceMetrics {
  // Calculate annual returns first
  const annualReturns = calculateAnnualReturns(simulationResult)

  // Calculate returns
  const { totalReturn, annualizedReturn, cumulativeReturn } = calculateReturns(simulationResult)

  // Calculate risk metrics
  const volatility = calculateVolatility(annualReturns)
  const { maxDrawdown, maxDrawdownStartYear, maxDrawdownEndYear } = calculateMaxDrawdown(simulationResult)

  // Calculate risk-adjusted metrics
  const sharpeRatio = calculateSharpeRatio(annualizedReturn, volatility)
  const sortinoRatio = calculateSortinoRatio(annualReturns, annualizedReturn)

  // Calculate additional metrics
  const winRate = calculateWinRate(annualReturns)
  const { bestYear, worstYear } = findBestAndWorstYears(annualReturns)
  const averageReturn = annualReturns.length > 0 ? annualReturns.map((r) => r.return * 100).reduce((sum, r) => sum + r, 0) / annualReturns.length : 0

  return {
    totalReturn,
    annualizedReturn,
    cumulativeReturn,
    volatility,
    maxDrawdown,
    maxDrawdownStartYear,
    maxDrawdownEndYear,
    sharpeRatio,
    sortinoRatio,
    winRate,
    bestYear,
    worstYear,
    averageReturn,
  }
}
