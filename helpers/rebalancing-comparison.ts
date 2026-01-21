/**
 * Rebalancing Strategy Comparison Tool
 *
 * This module implements a comprehensive comparison framework for different
 * rebalancing strategies, enabling users to evaluate and optimize their
 * portfolio rebalancing approach based on German tax law and transaction costs.
 *
 * Features:
 * - 5 distinct rebalancing strategies (Calendar, Threshold, Hybrid, Tax-Optimized, Opportunistic)
 * - Long-term backtesting (10-20 years)
 * - Comprehensive metrics (returns, costs, tax burden, tracking error, Sharpe ratio)
 * - Visual comparisons and recommendations
 */

import type { AssetClass } from './multi-asset-portfolio'
import {
  type RebalancingTaxConfig,
  type TransactionCostConfig,
  calculateTransactionCost,
  calculateTaxableGains,
  calculateCapitalGainsTax,
} from './rebalancing'

/**
 * Rebalancing strategy types
 */
export type RebalancingStrategyType =
  | 'calendar' // Fixed intervals (monthly, quarterly, yearly)
  | 'threshold' // Rebalance when deviation > X% from target
  | 'hybrid' // Combination of calendar and threshold
  | 'tax-optimized' // Minimize tax burden
  | 'opportunistic' // Only on extreme market movements

/**
 * Rebalancing frequency for calendar-based strategies
 */
export type RebalancingFrequency = 'monthly' | 'quarterly' | 'yearly'

/**
 * Configuration for a specific rebalancing strategy
 */
export interface RebalancingStrategyConfig {
  /** Strategy type */
  type: RebalancingStrategyType
  /** Strategy name (for display) */
  name: string
  /** Strategy description */
  description: string

  // Calendar-based parameters
  /** Rebalancing frequency (for calendar and hybrid strategies) */
  frequency?: RebalancingFrequency

  // Threshold-based parameters
  /** Threshold percentage for rebalancing (e.g., 0.05 for 5%) */
  threshold?: number

  // Opportunistic parameters
  /** Market movement threshold for opportunistic rebalancing (e.g., 0.15 for 15%) */
  marketMovementThreshold?: number
}

/**
 * Asset allocation at a point in time
 */
export interface AssetAllocation {
  /** Total portfolio value */
  totalValue: number
  /** Allocation by asset class (value in EUR) */
  allocations: Record<AssetClass, number>
  /** Target allocation percentages */
  targetAllocations: Record<AssetClass, number>
}

/**
 * Single rebalancing event
 */
export interface RebalancingEvent {
  /** Year of rebalancing */
  year: number
  /** Number of transactions */
  transactionCount: number
  /** Total transaction costs */
  transactionCosts: number
  /** Total tax costs */
  taxCosts: number
  /** Total costs (transaction + tax) */
  totalCosts: number
  /** Portfolio drift before rebalancing (RMS deviation from target) */
  driftBeforeRebalancing: number
  /** Portfolio value before rebalancing */
  portfolioValueBefore: number
  /** Portfolio value after rebalancing */
  portfolioValueAfter: number
}

/**
 * Year-by-year simulation data
 */
export interface YearlySimulationData {
  /** Year */
  year: number
  /** Portfolio value at start of year */
  startValue: number
  /** Portfolio value at end of year */
  endValue: number
  /** Returns for the year */
  returns: number
  /** Returns percentage */
  returnsPercentage: number
  /** Rebalancing event (if any) */
  rebalancingEvent?: RebalancingEvent
  /** Current allocation drift (RMS deviation from target) */
  allocationDrift: number
}

/**
 * Result of strategy comparison
 */
export interface StrategyComparisonResult {
  /** Strategy configuration */
  strategy: RebalancingStrategyConfig
  /** Portfolio after-tax return (annualized) */
  annualizedReturn: number
  /** Total rebalancing transactions */
  totalTransactions: number
  /** Total transaction costs */
  totalTransactionCosts: number
  /** Total tax burden */
  totalTaxBurden: number
  /** Total costs (transaction + tax) */
  totalCosts: number
  /** Average tracking error to target allocation */
  averageTrackingError: number
  /** Sharpe ratio */
  sharpeRatio: number
  /** Final portfolio value */
  finalValue: number
  /** Yearly simulation data */
  yearlyData: YearlySimulationData[]
}

/**
 * Calculate root mean square (RMS) deviation from target allocation
 * This is used as the tracking error metric
 */
export function calculateAllocationDrift(
  currentAllocations: Record<AssetClass, number>,
  targetAllocations: Record<AssetClass, number>,
  totalValue: number
): number {
  if (totalValue === 0) return 0

  const assetClasses = Object.keys(currentAllocations) as AssetClass[]
  let sumSquaredDeviations = 0

  for (const assetClass of assetClasses) {
    const currentPct = currentAllocations[assetClass] / totalValue
    const targetPct = targetAllocations[assetClass]
    const deviation = currentPct - targetPct
    sumSquaredDeviations += deviation * deviation
  }

  return Math.sqrt(sumSquaredDeviations)
}

/**
 * Check if rebalancing should be triggered based on strategy
 */
export function shouldRebalance(
  strategy: RebalancingStrategyConfig,
  currentYear: number,
  lastRebalanceYear: number,
  allocationDrift: number,
  marketReturn: number
): boolean {
  switch (strategy.type) {
    case 'calendar':
      return shouldRebalanceCalendar(strategy.frequency!, currentYear, lastRebalanceYear)

    case 'threshold':
      return shouldRebalanceThreshold(strategy.threshold!, allocationDrift)

    case 'hybrid':
      // Hybrid: rebalance if either calendar OR threshold is met
      return (
        shouldRebalanceCalendar(strategy.frequency!, currentYear, lastRebalanceYear) ||
        shouldRebalanceThreshold(strategy.threshold!, allocationDrift)
      )

    case 'tax-optimized':
      // Tax-optimized: similar to threshold but more conservative
      // Use a slightly higher threshold to minimize transactions
      return shouldRebalanceThreshold(strategy.threshold! * 1.5, allocationDrift)

    case 'opportunistic':
      // Opportunistic: only on extreme market movements
      return Math.abs(marketReturn) >= strategy.marketMovementThreshold!

    default:
      return false
  }
}

/**
 * Check if calendar-based rebalancing should trigger
 */
function shouldRebalanceCalendar(
  frequency: RebalancingFrequency,
  currentYear: number,
  lastRebalanceYear: number
): boolean {
  const yearsSinceRebalance = currentYear - lastRebalanceYear

  switch (frequency) {
    case 'monthly':
      // For yearly simulation, treat as yearly
      return yearsSinceRebalance >= 1
    case 'quarterly':
      // For yearly simulation, rebalance every year
      return yearsSinceRebalance >= 1
    case 'yearly':
      return yearsSinceRebalance >= 1
    default:
      return false
  }
}

/**
 * Check if threshold-based rebalancing should trigger
 */
function shouldRebalanceThreshold(threshold: number, allocationDrift: number): boolean {
  return allocationDrift > threshold
}

/**
 * Create default strategy configurations
 */
export function createDefaultStrategyConfigs(): RebalancingStrategyConfig[] {
  return [
    {
      type: 'calendar',
      name: 'Kalenderbasiert (Jährlich)',
      description: 'Rebalancing einmal pro Jahr an festem Datum',
      frequency: 'yearly',
    },
    {
      type: 'calendar',
      name: 'Kalenderbasiert (Quartalsweise)',
      description: 'Rebalancing alle drei Monate',
      frequency: 'quarterly',
    },
    {
      type: 'threshold',
      name: 'Schwellenwertbasiert (5%)',
      description: 'Rebalancing bei Abweichung > 5% von Zielallokation',
      threshold: 0.05,
    },
    {
      type: 'hybrid',
      name: 'Hybridansatz',
      description: 'Kombination aus jährlichem Kalender und 5% Schwellenwert',
      frequency: 'yearly',
      threshold: 0.05,
    },
    {
      type: 'tax-optimized',
      name: 'Steueroptimiert',
      description: 'Minimierung der Steuerlast durch konservatives Rebalancing',
      threshold: 0.05,
    },
    {
      type: 'opportunistic',
      name: 'Opportunistisch',
      description: 'Rebalancing nur bei extremen Marktbewegungen (>15%)',
      marketMovementThreshold: 0.15,
    },
  ]
}

/**
 * Initialize allocations to target distribution
 */
function initializeAllocations(
  initialValue: number,
  targetAllocations: Record<AssetClass, number>
): Record<AssetClass, number> {
  const currentAllocations: Record<AssetClass, number> = {} as Record<AssetClass, number>
  const assetClasses = Object.keys(targetAllocations) as AssetClass[]
  for (const assetClass of assetClasses) {
    currentAllocations[assetClass] = initialValue * targetAllocations[assetClass]
  }
  return currentAllocations
}

/**
 * Apply returns to all asset classes
 */
function applyReturns(
  currentAllocations: Record<AssetClass, number>,
  yearReturn: number
): number {
  const assetClasses = Object.keys(currentAllocations) as AssetClass[]
  for (const assetClass of assetClasses) {
    currentAllocations[assetClass] *= 1 + yearReturn
  }
  return assetClasses.reduce((sum, ac) => sum + currentAllocations[ac], 0)
}

/**
 * Calculate final metrics from simulation
 */
function calculateFinalMetrics(
  initialValue: number,
  finalValue: number,
  yearlyData: YearlySimulationData[],
  totalTrackingError: number,
  totalTransactionCosts: number,
  totalTaxBurden: number
): {
  annualizedReturn: number
  averageTrackingError: number
  totalCosts: number
  sharpeRatio: number
} {
  const years = yearlyData.length
  const annualizedReturn = Math.pow(finalValue / initialValue, 1 / years) - 1
  const averageTrackingError = totalTrackingError / years
  const totalCosts = totalTransactionCosts + totalTaxBurden

  // Calculate Sharpe ratio (simplified - risk-free rate = 2%)
  const riskFreeRate = 0.02
  const returns = yearlyData.map(d => d.returnsPercentage / 100)
  const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length
  const stdDev = Math.sqrt(variance)
  const sharpeRatio = stdDev > 0 ? (avgReturn - riskFreeRate) / stdDev : 0

  return {
    annualizedReturn: annualizedReturn * 100,
    averageTrackingError: averageTrackingError * 100,
    totalCosts,
    sharpeRatio,
  }
}

/**
 * Process a single year of simulation
 */
function processYearSimulation(
  year: number,
  yearReturn: number,
  portfolioValue: number,
  currentAllocations: Record<AssetClass, number>,
  targetAllocations: Record<AssetClass, number>,
  strategy: RebalancingStrategyConfig,
  lastRebalanceYear: number,
  taxConfig: RebalancingTaxConfig,
  costConfig: TransactionCostConfig
): {
  yearData: YearlySimulationData
  newPortfolioValue: number
  newLastRebalanceYear: number
  rebalancingCosts: { transactions: number; taxCosts: number; transactionCosts: number }
} {
  const startValue = portfolioValue

  // Apply returns and calculate new portfolio value
  const newPortfolioValue = applyReturns(currentAllocations, yearReturn)

  // Calculate drift
  const drift = calculateAllocationDrift(currentAllocations, targetAllocations, newPortfolioValue)

  // Check if rebalancing should occur
  const shouldRebal = shouldRebalance(strategy, year, lastRebalanceYear, drift, yearReturn)

  let rebalancingEvent: RebalancingEvent | undefined
  let finalValue = newPortfolioValue
  let newLastRebalanceYear = lastRebalanceYear
  const costs = { transactions: 0, taxCosts: 0, transactionCosts: 0 }

  if (shouldRebal) {
    // Perform rebalancing
    const event = performRebalancing(currentAllocations, targetAllocations, newPortfolioValue, taxConfig, costConfig, year)

    rebalancingEvent = event
    newLastRebalanceYear = year
    costs.transactions = event.transactionCount
    costs.taxCosts = event.taxCosts
    costs.transactionCosts = event.transactionCosts

    // Update portfolio value after costs
    finalValue = event.portfolioValueAfter
  }

  const yearData: YearlySimulationData = {
    year,
    startValue,
    endValue: finalValue,
    returns: finalValue - startValue,
    returnsPercentage: ((finalValue - startValue) / startValue) * 100,
    rebalancingEvent,
    allocationDrift: drift,
  }

  return {
    yearData,
    newPortfolioValue: finalValue,
    newLastRebalanceYear,
    rebalancingCosts: costs,
  }
}

/**
 * Initialize simulation state
 */
function initializeSimulationState(
  initialValue: number,
  targetAllocations: Record<AssetClass, number>,
  startYear: number
): {
  portfolioValue: number
  lastRebalanceYear: number
  totalTransactions: number
  totalTransactionCosts: number
  totalTaxBurden: number
  totalTrackingError: number
  currentAllocations: Record<AssetClass, number>
} {
  return {
    portfolioValue: initialValue,
    lastRebalanceYear: startYear - 1,
    totalTransactions: 0,
    totalTransactionCosts: 0,
    totalTaxBurden: 0,
    totalTrackingError: 0,
    currentAllocations: initializeAllocations(initialValue, targetAllocations),
  }
}

/**
 * Run the year-by-year simulation loop
 */
function runYearlySimulation(
  strategy: RebalancingStrategyConfig,
  initialValue: number,
  targetAllocations: Record<AssetClass, number>,
  yearlyReturns: number[],
  taxConfig: RebalancingTaxConfig,
  costConfig: TransactionCostConfig
): {
  yearlyData: YearlySimulationData[]
  finalValue: number
  totalTransactions: number
  totalTransactionCosts: number
  totalTaxBurden: number
  totalTrackingError: number
} {
  const startYear = 2024
  const years = yearlyReturns.length
  const yearlyData: YearlySimulationData[] = []

  const state = initializeSimulationState(initialValue, targetAllocations, startYear)

  for (let i = 0; i < years; i++) {
    const year = startYear + i
    const yearReturn = yearlyReturns[i]

    const result = processYearSimulation(
      year,
      yearReturn,
      state.portfolioValue,
      state.currentAllocations,
      targetAllocations,
      strategy,
      state.lastRebalanceYear,
      taxConfig,
      costConfig
    )

    yearlyData.push(result.yearData)
    state.portfolioValue = result.newPortfolioValue
    state.lastRebalanceYear = result.newLastRebalanceYear
    state.totalTransactions += result.rebalancingCosts.transactions
    state.totalTransactionCosts += result.rebalancingCosts.transactionCosts
    state.totalTaxBurden += result.rebalancingCosts.taxCosts
    state.totalTrackingError += result.yearData.allocationDrift
  }

  return {
    yearlyData,
    finalValue: state.portfolioValue,
    totalTransactions: state.totalTransactions,
    totalTransactionCosts: state.totalTransactionCosts,
    totalTaxBurden: state.totalTaxBurden,
    totalTrackingError: state.totalTrackingError,
  }
}

/**
 * Simulate a single rebalancing strategy over a time period
 *
 * This function runs a simplified simulation to compare strategies.
 * For more accurate results, integrate with the full portfolio simulation.
 */
export function simulateRebalancingStrategy(
  strategy: RebalancingStrategyConfig,
  initialValue: number,
  targetAllocations: Record<AssetClass, number>,
  yearlyReturns: number[],
  taxConfig: RebalancingTaxConfig,
  costConfig: TransactionCostConfig
): StrategyComparisonResult {
  // Run simulation
  const simulation = runYearlySimulation(strategy, initialValue, targetAllocations, yearlyReturns, taxConfig, costConfig)

  // Calculate final metrics
  const metrics = calculateFinalMetrics(
    initialValue,
    simulation.finalValue,
    simulation.yearlyData,
    simulation.totalTrackingError,
    simulation.totalTransactionCosts,
    simulation.totalTaxBurden
  )

  return {
    strategy,
    annualizedReturn: metrics.annualizedReturn,
    totalTransactions: simulation.totalTransactions,
    totalTransactionCosts: simulation.totalTransactionCosts,
    totalTaxBurden: simulation.totalTaxBurden,
    totalCosts: metrics.totalCosts,
    averageTrackingError: metrics.averageTrackingError,
    sharpeRatio: metrics.sharpeRatio,
    finalValue: simulation.finalValue,
    yearlyData: simulation.yearlyData,
  }
}

/**
 * Perform rebalancing and calculate costs
 * Simplified version for comparison purposes
 */
function performRebalancing(
  currentAllocations: Record<AssetClass, number>,
  targetAllocations: Record<AssetClass, number>,
  portfolioValue: number,
  taxConfig: RebalancingTaxConfig,
  costConfig: TransactionCostConfig,
  year: number
): RebalancingEvent {
  const assetClasses = Object.keys(currentAllocations) as AssetClass[]
  let transactionCount = 0
  let transactionCosts = 0
  let taxCosts = 0

  const driftBefore = calculateAllocationDrift(currentAllocations, targetAllocations, portfolioValue)

  // Calculate target values
  const targetValues: Record<AssetClass, number> = {} as Record<AssetClass, number>
  for (const assetClass of assetClasses) {
    targetValues[assetClass] = portfolioValue * targetAllocations[assetClass]
  }

  // Calculate trades needed
  for (const assetClass of assetClasses) {
    const current = currentAllocations[assetClass]
    const target = targetValues[assetClass]
    const difference = target - current

    if (Math.abs(difference) > costConfig.minTransactionSize) {
      transactionCount++

      // Calculate transaction cost
      const tradeCost = calculateTransactionCost(Math.abs(difference), costConfig)
      transactionCosts += tradeCost

      // Simplified tax calculation (assume 50% of portfolio has gains)
      if (difference < 0) {
        // Selling
        const capitalGains = Math.abs(difference) * 0.5 // Simplified
        const taxCategory = getAssetTaxCategory(assetClass)
        const taxableGains = calculateTaxableGains(capitalGains, taxCategory, taxConfig)
        const taxResult = calculateCapitalGainsTax(taxableGains, taxConfig.freibetragAvailable, taxConfig)
        taxCosts += taxResult.tax
      }

      // Update allocation
      currentAllocations[assetClass] = target
    }
  }

  const portfolioAfterCosts = portfolioValue - transactionCosts - taxCosts

  return {
    year,
    transactionCount,
    transactionCosts,
    taxCosts,
    totalCosts: transactionCosts + taxCosts,
    driftBeforeRebalancing: driftBefore * 100,
    portfolioValueBefore: portfolioValue,
    portfolioValueAfter: portfolioAfterCosts,
  }
}

/**
 * Get tax category for an asset class
 * Simplified mapping for comparison purposes
 */
function getAssetTaxCategory(assetClass: AssetClass): 'equity' | 'bond' | 'reit' | 'commodity' | 'cash' {
  if (assetClass === 'stocks_domestic' || assetClass === 'stocks_international') {
    return 'equity'
  } else if (assetClass === 'bonds_government' || assetClass === 'bonds_corporate') {
    return 'bond'
  } else if (assetClass === 'real_estate') {
    return 'reit'
  } else if (assetClass === 'commodities') {
    return 'commodity'
  } else {
    return 'cash'
  }
}

/**
 * Compare multiple rebalancing strategies
 */
export function compareRebalancingStrategies(
  strategies: RebalancingStrategyConfig[],
  initialValue: number,
  targetAllocations: Record<AssetClass, number>,
  yearlyReturns: number[],
  taxConfig: RebalancingTaxConfig,
  costConfig: TransactionCostConfig
): StrategyComparisonResult[] {
  return strategies.map(strategy =>
    simulateRebalancingStrategy(strategy, initialValue, targetAllocations, yearlyReturns, taxConfig, costConfig)
  )
}

/**
 * Recommend the best strategy based on multiple criteria
 */
export function recommendBestStrategy(
  results: StrategyComparisonResult[]
): { bestOverall: StrategyComparisonResult; bestByCriteria: Record<string, StrategyComparisonResult> } {
  if (results.length === 0) {
    throw new Error('No strategies to compare')
  }

  // Find best by different criteria
  const bestByReturn = results.reduce((best, curr) =>
    curr.annualizedReturn > best.annualizedReturn ? curr : best
  )

  const bestByLowCost = results.reduce((best, curr) => (curr.totalCosts < best.totalCosts ? curr : best))

  const bestBySharpe = results.reduce((best, curr) => (curr.sharpeRatio > best.sharpeRatio ? curr : best))

  const bestByTrackingError = results.reduce((best, curr) =>
    curr.averageTrackingError < best.averageTrackingError ? curr : best
  )

  // Overall best: weighted score
  const scoredResults = results.map(result => {
    // Normalize and weight each metric (0-1 scale)
    const maxReturn = Math.max(...results.map(r => r.annualizedReturn))
    const minCost = Math.min(...results.map(r => r.totalCosts))
    const maxSharpe = Math.max(...results.map(r => r.sharpeRatio))
    const minTracking = Math.min(...results.map(r => r.averageTrackingError))

    const returnScore = maxReturn > 0 ? result.annualizedReturn / maxReturn : 0
    const costScore = result.totalCosts > 0 ? minCost / result.totalCosts : 1
    const sharpeScore = maxSharpe > 0 ? result.sharpeRatio / maxSharpe : 0
    const trackingScore = result.averageTrackingError > 0 ? minTracking / result.averageTrackingError : 1

    // Weighted average: return (40%), cost (30%), Sharpe (20%), tracking (10%)
    const score = returnScore * 0.4 + costScore * 0.3 + sharpeScore * 0.2 + trackingScore * 0.1

    return { result, score }
  })

  const bestOverall = scoredResults.reduce((best, curr) => (curr.score > best.score ? curr : best)).result

  return {
    bestOverall,
    bestByCriteria: {
      return: bestByReturn,
      cost: bestByLowCost,
      sharpe: bestBySharpe,
      tracking: bestByTrackingError,
    },
  }
}
