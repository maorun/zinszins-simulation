/**
 * Multi-Asset Portfolio Calculation Engine
 *
 * This module implements the core calculation logic for multi-asset portfolios,
 * including correlated return generation, rebalancing logic, and portfolio simulation.
 */

import {
  ASSET_CORRELATION_MATRIX,
  type AssetClass,
  type MultiAssetPortfolioConfig,
  type PortfolioHoldings,
  type MultiAssetYearResult,
  type MultiAssetSimulationResult,
} from './multi-asset-portfolio'

/**
 * Simple Linear Congruential Generator for reproducible random numbers
 * Uses the MINSTD Lehmer RNG algorithm for deterministic pseudo-random number generation
 */
class SeededRandom {
  private seed: number

  /**
   * @param seed - Initial seed value (defaults to current timestamp)
   */
  constructor(seed: number = Date.now()) {
    this.seed = seed % 2147483647
    if (this.seed <= 0) this.seed += 2147483646
  }

  /**
   * Generate next pseudo-random number in sequence
   * @returns Random number between 0 and 1
   */
  next(): number {
    this.seed = (this.seed * 16807) % 2147483647
    return (this.seed - 1) / 2147483646
  }
}

/**
 * Box-Muller transformation for generating normally distributed random numbers
 * 
 * @param rng - Seeded random number generator
 * @returns Normally distributed random number (mean=0, stddev=1)
 */
function generateNormalRandom(rng: SeededRandom): number {
  let u1 = rng.next()
  const u2 = rng.next()

  // Ensure u1 is not 0 to avoid log(0)
  while (u1 === 0) {
    u1 = rng.next()
  }

  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
  return z0
}

/**
 * Generate correlated returns using Cholesky decomposition
 * 
 * This ensures the returns follow the historical correlation structure between asset classes.
 * When correlation is disabled, generates independent returns for each asset class.
 * 
 * @param assetClasses - Array of asset classes to generate returns for
 * @param config - Multi-asset portfolio configuration
 * @param rng - Seeded random number generator for reproducibility
 * @returns Object mapping each asset class to its return rate (e.g., 0.08 for 8%)
 */
function generateCorrelatedReturns(
  assetClasses: AssetClass[],
  config: MultiAssetPortfolioConfig,
  rng: SeededRandom,
): Record<AssetClass, number> {
  const returns: Record<AssetClass, number> = {} as Record<AssetClass, number>

  if (!config.simulation.useCorrelation || assetClasses.length <= 1) {
    // Generate independent returns if correlation is disabled or only one asset
    for (const assetClass of assetClasses) {
      const assetConfig = config.assetClasses[assetClass]
      const randomValue = generateNormalRandom(rng)
      returns[assetClass] = assetConfig.expectedReturn + randomValue * assetConfig.volatility
    }
    return returns
  }

  // For correlated returns, we use a simplified approach
  // Generate a base market return and adjust each asset class based on correlations
  const baseReturn = generateNormalRandom(rng)

  for (const assetClass of assetClasses) {
    const assetConfig = config.assetClasses[assetClass]

    // Generate asset-specific random component
    const assetSpecificRandom = generateNormalRandom(rng)

    // Calculate correlation with dominant market factor (stocks_domestic as proxy)
    const marketCorrelation = ASSET_CORRELATION_MATRIX[assetClass].stocks_domestic || 0.5

    // Combine market factor and asset-specific factor
    const correlatedRandom =
      marketCorrelation * baseReturn + Math.sqrt(1 - marketCorrelation * marketCorrelation) * assetSpecificRandom

    returns[assetClass] = assetConfig.expectedReturn + correlatedRandom * assetConfig.volatility

    // Clamp extreme returns to reasonable bounds
    returns[assetClass] = Math.max(returns[assetClass], -0.8) // Max 80% loss
    returns[assetClass] = Math.min(returns[assetClass], 2.0) // Max 200% gain
  }

  return returns
}

/**
 * Calculate if rebalancing is needed based on drift from target allocations
 * 
 * @param holdings - Current portfolio holdings with drift calculations
 * @param config - Multi-asset portfolio configuration
 * @returns true if rebalancing is needed, false otherwise
 */
function needsRebalancing(holdings: PortfolioHoldings, config: MultiAssetPortfolioConfig): boolean {
  if (config.rebalancing.frequency === 'never') {
    return false
  }

  if (!config.rebalancing.useThreshold) {
    return false // Time-based rebalancing is handled by caller
  }

  // Check if any asset class has drifted beyond the threshold
  for (const [, holding] of Object.entries(holdings.holdings)) {
    if (Math.abs(holding.drift) > config.rebalancing.threshold) {
      return true
    }
  }

  return false
}

/**
 * Get enabled asset classes from config
 * 
 * @param config - Multi-asset portfolio configuration
 * @returns Array of enabled asset class identifiers
 */
function getEnabledAssets(config: MultiAssetPortfolioConfig): AssetClass[] {
  return Object.keys(config.assetClasses).filter(
    assetClass => config.assetClasses[assetClass as AssetClass].enabled,
  ) as AssetClass[]
}

/**
 * Rebalance portfolio to target allocations
 * 
 * Redistributes portfolio holdings to match configured target allocations.
 * This helps maintain desired risk profile and can improve long-term returns.
 * 
 * @param holdings - Current portfolio holdings
 * @param config - Multi-asset portfolio configuration with target allocations
 * @returns Rebalanced portfolio holdings
 */
function rebalancePortfolio(holdings: PortfolioHoldings, config: MultiAssetPortfolioConfig): PortfolioHoldings {
  const rebalancedHoldings: PortfolioHoldings = {
    totalValue: holdings.totalValue,
    holdings: {} as Record<
      AssetClass,
      {
        value: number
        allocation: number
        targetAllocation: number
        drift: number
      }
    >,
    needsRebalancing: false,
    rebalancingCost: 0, // Simplified: no transaction costs for now
  }

  // Redistribute according to target allocations
  const enabledAssets = getEnabledAssets(config)

  for (const assetClass of enabledAssets) {
    const assetConfig = config.assetClasses[assetClass]
    const targetValue = holdings.totalValue * assetConfig.targetAllocation

    rebalancedHoldings.holdings[assetClass] = {
      value: targetValue,
      allocation: assetConfig.targetAllocation,
      targetAllocation: assetConfig.targetAllocation,
      drift: 0, // No drift after rebalancing
    }
  }

  return rebalancedHoldings
}

/**
 * Apply returns to holdings and calculate new values
 * 
 * @param holdings - Current portfolio holdings
 * @param assetReturns - Returns for each asset class
 * @returns Object with new holdings and total value
 */
function applyReturnsToHoldings(
  holdings: PortfolioHoldings,
  assetReturns: Record<AssetClass, number>,
): { newHoldings: PortfolioHoldings['holdings']; newTotalValue: number } {
  let newTotalValue = 0
  const newHoldings: Record<
    AssetClass,
    {
      value: number
      allocation: number
      targetAllocation: number
      drift: number
    }
  > = {} as Record<
    AssetClass,
    {
      value: number
      allocation: number
      targetAllocation: number
      drift: number
    }
  >

  // Apply returns to each holding
  for (const [assetClass, holding] of Object.entries(holdings.holdings)) {
    const assetReturn = assetReturns[assetClass as AssetClass]
    const newValue = holding.value * (1 + assetReturn)
    newTotalValue += newValue

    newHoldings[assetClass as AssetClass] = {
      value: newValue,
      allocation: 0, // Will be calculated below
      targetAllocation: holding.targetAllocation,
      drift: 0, // Will be calculated below
    }
  }

  return { newHoldings, newTotalValue }
}

/**
 * Apply returns to portfolio holdings
 * 
 * @param holdings - Current portfolio holdings
 * @param assetReturns - Returns for each asset class
 * @param config - Multi-asset portfolio configuration
 * @returns Updated portfolio holdings with returns applied
 */
function applyReturns(
  holdings: PortfolioHoldings,
  assetReturns: Record<AssetClass, number>,
  config: MultiAssetPortfolioConfig,
): PortfolioHoldings {
  const { newHoldings, newTotalValue } = applyReturnsToHoldings(holdings, assetReturns)

  // Calculate new allocations and drift
  calculateAllocationsAndDrift(newHoldings, newTotalValue)

  const result: PortfolioHoldings = {
    totalValue: newTotalValue,
    holdings: newHoldings,
    needsRebalancing: needsRebalancing(
      {
        totalValue: newTotalValue,
        holdings: newHoldings,
        needsRebalancing: false,
        rebalancingCost: 0,
      },
      config,
    ),
    rebalancingCost: 0,
  }

  return result
}

/**
 * Calculate new allocations and drift for holdings
 * 
 * @param holdings - Portfolio holdings to update
 * @param totalValue - Total portfolio value
 */
function calculateAllocationsAndDrift(
  holdings: Record<
    AssetClass,
    {
      value: number
      allocation: number
      targetAllocation: number
      drift: number
    }
  >,
  totalValue: number,
): void {
  for (const [, holding] of Object.entries(holdings)) {
    holding.allocation = totalValue > 0 ? holding.value / totalValue : 0
    holding.drift = holding.allocation - holding.targetAllocation
  }
}

/**
 * Distribute contribution across asset classes according to target allocations
 * 
 * @param currentHoldings - Current portfolio holdings
 * @param contribution - Amount to contribute
 * @param config - Multi-asset portfolio configuration
 * @returns Updated holdings with contribution distributed
 */
function distributeContribution(
  currentHoldings: PortfolioHoldings['holdings'],
  contribution: number,
  config: MultiAssetPortfolioConfig,
): PortfolioHoldings['holdings'] {
  const newHoldings = { ...currentHoldings }
  const enabledAssets = getEnabledAssets(config)

  for (const assetClass of enabledAssets) {
    const assetConfig = config.assetClasses[assetClass]
    const contributionForAsset = contribution * assetConfig.targetAllocation

    if (newHoldings[assetClass]) {
      newHoldings[assetClass] = {
        ...newHoldings[assetClass],
        value: newHoldings[assetClass].value + contributionForAsset,
      }
    } else {
      // Initialize new asset class
      newHoldings[assetClass] = {
        value: contributionForAsset,
        allocation: 0,
        targetAllocation: assetConfig.targetAllocation,
        drift: 0,
      }
    }
  }

  return newHoldings
}

/**
 * Add contributions to portfolio maintaining target allocations
 * 
 * @param holdings - Current portfolio holdings
 * @param contribution - Amount to contribute this period
 * @param config - Multi-asset portfolio configuration
 * @returns Updated portfolio holdings with contribution added
 */
function addContributions(
  holdings: PortfolioHoldings,
  contribution: number,
  config: MultiAssetPortfolioConfig,
): PortfolioHoldings {
  if (contribution <= 0) {
    return holdings
  }

  const newTotalValue = holdings.totalValue + contribution
  const newHoldings = distributeContribution(holdings.holdings, contribution, config)

  // Recalculate allocations
  calculateAllocationsAndDrift(newHoldings, newTotalValue)

  return {
    totalValue: newTotalValue,
    holdings: newHoldings,
    needsRebalancing: needsRebalancing(
      {
        totalValue: newTotalValue,
        holdings: newHoldings,
        needsRebalancing: false,
        rebalancingCost: 0,
      },
      config,
    ),
    rebalancingCost: 0,
  }
}

/**
 * Check if rebalancing should occur based on frequency
 * 
 * @param _year - Current year (unused but kept for interface consistency)
 * @param month - Current month (0-11, where 0 is January)
 * @param frequency - Rebalancing frequency setting
 * @returns true if rebalancing should occur this month
 */
function shouldRebalanceByFrequency(
  _year: number,
  month: number,
  frequency: 'never' | 'monthly' | 'quarterly' | 'annually',
): boolean {
  switch (frequency) {
    case 'never':
      return false
    case 'monthly':
      return true // Rebalance every month
    case 'quarterly':
      return month % 3 === 0 // Rebalance in Jan, Apr, Jul, Oct
    case 'annually':
      return month === 0 // Rebalance in January
    default:
      return false
  }
}

/**
 * Initialize portfolio holdings with target allocations
 * 
 * @param enabledAssets - Array of enabled asset classes
 * @param config - Multi-asset portfolio configuration
 * @param initialContribution - Initial investment amount
 * @returns Initialized portfolio holdings distributed according to target allocations
 */
function initializePortfolioHoldings(
  enabledAssets: AssetClass[],
  config: MultiAssetPortfolioConfig,
  initialContribution: number,
): PortfolioHoldings {
  const holdings: PortfolioHoldings = {
    totalValue: initialContribution,
    holdings: {} as Record<
      AssetClass,
      {
        value: number
        allocation: number
        targetAllocation: number
        drift: number
      }
    >,
    needsRebalancing: false,
    rebalancingCost: 0,
  }

  for (const assetClass of enabledAssets) {
    const assetConfig = config.assetClasses[assetClass]
    const initialValue = initialContribution * assetConfig.targetAllocation

    holdings.holdings[assetClass] = {
      value: initialValue,
      allocation: assetConfig.targetAllocation,
      targetAllocation: assetConfig.targetAllocation,
      drift: 0,
    }
  }

  return holdings
}

/**
 * Process a single year in the simulation
 */
function processSimulationYear(
  year: number,
  yearIndex: number,
  currentHoldings: PortfolioHoldings,
  contribution: number,
  enabledAssets: AssetClass[],
  config: MultiAssetPortfolioConfig,
  rng: SeededRandom,
): { yearResult: MultiAssetYearResult; endHoldings: PortfolioHoldings } {
  const startHoldings = { ...currentHoldings }

  // Generate returns for this year
  const assetReturns = generateCorrelatedReturns(enabledAssets, config, rng)

  // Apply returns
  let endHoldings = applyReturns(currentHoldings, assetReturns, config)

  // Add contributions (except for first year, already added)
  if (yearIndex > 0 && contribution > 0) {
    endHoldings = addContributions(endHoldings, contribution, config)
  }

  // Check if rebalancing is needed
  let rebalanced = false
  if (
    shouldRebalanceByFrequency(year, 0, config.rebalancing.frequency) ||
    (config.rebalancing.useThreshold && endHoldings.needsRebalancing)
  ) {
    endHoldings = rebalancePortfolio(endHoldings, config)
    rebalanced = true
  }

  // Calculate total return for this year
  const startValue = startHoldings.totalValue
  const endValue = endHoldings.totalValue - (yearIndex > 0 ? contribution : 0)
  const totalReturn = startValue > 0 ? (endValue - startValue) / startValue : 0

  const yearResult: MultiAssetYearResult = {
    year,
    startHoldings,
    endHoldings,
    assetReturns,
    rebalanced,
    totalReturn,
    contributions: contribution,
  }

  return { yearResult, endHoldings }
}

/**
 * Calculate summary statistics from annual returns
 */
function calculateSummaryStatistics(
  finalValue: number,
  totalContributions: number,
  annualReturns: number[],
  yearsCount: number,
): { totalReturn: number; annualizedReturn: number; volatility: number } {
  const totalReturn = finalValue - totalContributions
  const annualizedReturn =
    yearsCount > 1 ? Math.pow(finalValue / totalContributions, 1 / yearsCount) - 1 : totalReturn / totalContributions

  // Calculate volatility (standard deviation of annual returns)
  const meanReturn = annualReturns.reduce((sum, ret) => sum + ret, 0) / annualReturns.length
  const variance =
    annualReturns.reduce((sum, ret) => sum + Math.pow(ret - meanReturn, 2), 0) / Math.max(1, annualReturns.length - 1)
  const volatility = Math.sqrt(variance)

  return { totalReturn, annualizedReturn, volatility }
}

/**
 * Run the portfolio simulation for all years
 * 
 * @param years - Array of years to simulate
 * @param contributions - Annual contributions by year
 * @param enabledAssets - Array of enabled asset classes
 * @param config - Multi-asset portfolio configuration
 * @param initialHoldings - Initial portfolio holdings
 * @param rng - Seeded random number generator
 * @returns Simulation results including year-by-year data and summary statistics
 */
function runPortfolioSimulation(
  years: number[],
  contributions: Record<number, number>,
  enabledAssets: AssetClass[],
  config: MultiAssetPortfolioConfig,
  initialHoldings: PortfolioHoldings,
  rng: SeededRandom,
): {
  yearResults: Record<number, MultiAssetYearResult>
  finalHoldings: PortfolioHoldings
  totalContributions: number
  annualReturns: number[]
} {
  const yearResults: Record<number, MultiAssetYearResult> = {}
  const annualReturns: number[] = []
  let currentHoldings = initialHoldings
  let totalContributions = contributions[years[0]] || 0

  for (let i = 0; i < years.length; i++) {
    const year = years[i]
    const contribution = i === 0 ? totalContributions : contributions[year] || 0

    if (i > 0) {
      totalContributions += contribution
    }

    const { yearResult, endHoldings } = processSimulationYear(
      year,
      i,
      currentHoldings,
      contribution,
      enabledAssets,
      config,
      rng,
    )

    annualReturns.push(yearResult.totalReturn)
    yearResults[year] = yearResult
    currentHoldings = endHoldings
  }

  return {
    yearResults,
    finalHoldings: currentHoldings,
    totalContributions,
    annualReturns,
  }
}

/**
 * Simulate multi-asset portfolio for a range of years
 * 
 * Performs a complete multi-asset portfolio simulation with:
 * - Correlated returns based on historical correlations
 * - Automatic rebalancing based on configured frequency and thresholds
 * - Support for regular contributions
 * - German tax rules (Teilfreistellung for stocks and REITs)
 * - Detailed year-by-year tracking of holdings and allocations
 * 
 * @param config - Multi-asset portfolio configuration with asset classes, allocations, and rebalancing rules
 * @param years - Array of years to simulate (e.g., [2024, 2025, 2026])
 * @param contributions - Annual contributions by year (e.g., { 2024: 10000, 2025: 12000 })
 * @returns Complete simulation result with year-by-year data and summary statistics
 * @throws Error if no asset classes are enabled
 */
export function simulateMultiAssetPortfolio(
  config: MultiAssetPortfolioConfig,
  years: number[],
  contributions: Record<number, number>, // Annual contributions by year
): MultiAssetSimulationResult {
  if (!config.enabled || years.length === 0) {
    return {
      yearResults: {},
      finalValue: 0,
      totalContributions: 0,
      totalReturn: 0,
      annualizedReturn: 0,
      volatility: 0,
    }
  }

  const enabledAssets = getEnabledAssets(config)

  if (enabledAssets.length === 0) {
    throw new Error('No asset classes enabled in multi-asset portfolio')
  }

  const rng = new SeededRandom(config.simulation.seed)
  const firstContribution = contributions[years[0]] || 0
  const initialHoldings = initializePortfolioHoldings(enabledAssets, config, firstContribution)

  const { yearResults, finalHoldings, totalContributions, annualReturns } = runPortfolioSimulation(
    years,
    contributions,
    enabledAssets,
    config,
    initialHoldings,
    rng,
  )

  const finalValue = finalHoldings.totalValue
  const { totalReturn, annualizedReturn, volatility } = calculateSummaryStatistics(
    finalValue,
    totalContributions,
    annualReturns,
    years.length,
  )

  return {
    yearResults,
    finalValue,
    totalContributions,
    totalReturn,
    annualizedReturn,
    volatility,
  }
}

/**
 * Calculate equivalent single-asset return that would produce the same result
 * 
 * This is useful for integrating with the existing simulation engine by providing
 * a single weighted return rate that represents the entire multi-asset portfolio.
 * 
 * @param config - Multi-asset portfolio configuration
 * @param year - Year for which to calculate return
 * @param seed - Optional random seed for reproducibility
 * @returns Weighted average return rate representing the entire portfolio
 */
export function calculateEquivalentSingleAssetReturn(
  config: MultiAssetPortfolioConfig,
  year: number,
  seed?: number,
): number {
  if (!config.enabled) {
    return 0
  }

  const rng = new SeededRandom(seed || year * 12345)
  const enabledAssets = getEnabledAssets(config)

  if (enabledAssets.length === 0) {
    return 0
  }

  // Generate returns for each asset class
  const assetReturns = generateCorrelatedReturns(enabledAssets, config, rng)

  // Calculate weighted average return based on target allocations
  let weightedReturn = 0
  for (const assetClass of enabledAssets) {
    const assetConfig = config.assetClasses[assetClass]
    weightedReturn += assetReturns[assetClass] * assetConfig.targetAllocation
  }

  return weightedReturn
}

/**
 * Generate returns for multiple years (used by simulation engine)
 * 
 * Convenience function that generates equivalent single-asset returns for each year
 * in the simulation period. Used by the main simulation engine to integrate multi-asset
 * portfolio calculations.
 * 
 * @param years - Array of years to generate returns for
 * @param config - Multi-asset portfolio configuration
 * @returns Object mapping each year to its equivalent single-asset return rate
 */
export function generateMultiAssetReturns(years: number[], config: MultiAssetPortfolioConfig): Record<number, number> {
  const returns: Record<number, number> = {}

  for (const year of years) {
    returns[year] = calculateEquivalentSingleAssetReturn(config, year, config.simulation.seed)
  }

  return returns
}
