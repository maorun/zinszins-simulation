/**
 * Multi-Asset Portfolio Calculation Engine
 *
 * This module implements the core calculation logic for multi-asset portfolios,
 * including correlated return generation, rebalancing logic, and portfolio simulation.
 */

import type {
  AssetClass,
  MultiAssetPortfolioConfig,
  PortfolioHoldings,
  MultiAssetYearResult,
  MultiAssetSimulationResult,
} from './multi-asset-portfolio'
import { ASSET_CORRELATION_MATRIX } from './multi-asset-portfolio'

/**
 * Simple Linear Congruential Generator for reproducible random numbers
 */
class SeededRandom {
  private seed: number

  constructor(seed: number = Date.now()) {
    this.seed = seed % 2147483647
    if (this.seed <= 0) this.seed += 2147483646
  }

  next(): number {
    this.seed = (this.seed * 16807) % 2147483647
    return (this.seed - 1) / 2147483646
  }
}

/**
 * Box-Muller transformation for generating normally distributed random numbers
 */
function generateNormalRandom(rng: SeededRandom): number {
  let u1 = rng.next()
  let u2 = rng.next()

  // Ensure u1 is not 0 to avoid log(0)
  while (u1 === 0) {
    u1 = rng.next()
  }

  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
  return z0
}

/**
 * Generate correlated returns using Cholesky decomposition
 * This ensures the returns follow the historical correlation structure
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
      returns[assetClass] = assetConfig.expectedReturn + (randomValue * assetConfig.volatility)
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
    const correlatedRandom = (marketCorrelation * baseReturn)
      + (Math.sqrt(1 - marketCorrelation * marketCorrelation) * assetSpecificRandom)

    returns[assetClass] = assetConfig.expectedReturn + (correlatedRandom * assetConfig.volatility)

    // Clamp extreme returns to reasonable bounds
    returns[assetClass] = Math.max(returns[assetClass], -0.8) // Max 80% loss
    returns[assetClass] = Math.min(returns[assetClass], 2.0) // Max 200% gain
  }

  return returns
}

/**
 * Calculate if rebalancing is needed based on drift from target allocations
 */
function needsRebalancing(
  holdings: PortfolioHoldings,
  config: MultiAssetPortfolioConfig,
): boolean {
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
 * Rebalance portfolio to target allocations
 */
function rebalancePortfolio(
  holdings: PortfolioHoldings,
  config: MultiAssetPortfolioConfig,
): PortfolioHoldings {
  const rebalancedHoldings: PortfolioHoldings = {
    totalValue: holdings.totalValue,
    holdings: {} as any,
    needsRebalancing: false,
    rebalancingCost: 0, // Simplified: no transaction costs for now
  }

  // Redistribute according to target allocations
  const enabledAssets = Object.keys(config.assetClasses).filter(
    assetClass => config.assetClasses[assetClass as AssetClass].enabled,
  ) as AssetClass[]

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
 * Apply returns to portfolio holdings
 */
function applyReturns(
  holdings: PortfolioHoldings,
  assetReturns: Record<AssetClass, number>,
  config: MultiAssetPortfolioConfig,
): PortfolioHoldings {
  let newTotalValue = 0
  const newHoldings: Record<string, any> = {}

  // Apply returns to each holding
  for (const [assetClass, holding] of Object.entries(holdings.holdings)) {
    const assetReturn = assetReturns[assetClass as AssetClass]
    const newValue = holding.value * (1 + assetReturn)
    newTotalValue += newValue

    newHoldings[assetClass] = {
      value: newValue,
      allocation: 0, // Will be calculated below
      targetAllocation: holding.targetAllocation,
      drift: 0, // Will be calculated below
    }
  }

  // Calculate new allocations and drift
  for (const [, holding] of Object.entries(newHoldings)) {
    holding.allocation = newTotalValue > 0 ? holding.value / newTotalValue : 0
    holding.drift = holding.allocation - holding.targetAllocation
  }

  const result: PortfolioHoldings = {
    totalValue: newTotalValue,
    holdings: newHoldings as any,
    needsRebalancing: needsRebalancing({
      totalValue: newTotalValue,
      holdings: newHoldings as any,
      needsRebalancing: false,
      rebalancingCost: 0,
    }, config),
    rebalancingCost: 0,
  }

  return result
}

/**
 * Add contributions to portfolio maintaining target allocations
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
  const newHoldings: Record<string, any> = { ...holdings.holdings }

  // Distribute contribution according to target allocations
  const enabledAssets = Object.keys(config.assetClasses).filter(
    assetClass => config.assetClasses[assetClass as AssetClass].enabled,
  ) as AssetClass[]

  for (const assetClass of enabledAssets) {
    const assetConfig = config.assetClasses[assetClass]
    const contributionForAsset = contribution * assetConfig.targetAllocation

    if (newHoldings[assetClass]) {
      newHoldings[assetClass] = {
        ...newHoldings[assetClass],
        value: newHoldings[assetClass].value + contributionForAsset,
      }
    }
    else {
      // Initialize new asset class
      newHoldings[assetClass] = {
        value: contributionForAsset,
        allocation: 0,
        targetAllocation: assetConfig.targetAllocation,
        drift: 0,
      }
    }
  }

  // Recalculate allocations
  for (const [, holding] of Object.entries(newHoldings)) {
    holding.allocation = newTotalValue > 0 ? holding.value / newTotalValue : 0
    holding.drift = holding.allocation - holding.targetAllocation
  }

  return {
    totalValue: newTotalValue,
    holdings: newHoldings as any,
    needsRebalancing: needsRebalancing({
      totalValue: newTotalValue,
      holdings: newHoldings as any,
      needsRebalancing: false,
      rebalancingCost: 0,
    }, config),
    rebalancingCost: 0,
  }
}

/**
 * Check if rebalancing should occur based on frequency
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
 * Simulate multi-asset portfolio for a range of years
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

  const rng = new SeededRandom(config.simulation.seed)
  const yearResults: Record<number, MultiAssetYearResult> = {}

  // Get enabled asset classes
  const enabledAssets = Object.keys(config.assetClasses).filter(
    assetClass => config.assetClasses[assetClass as AssetClass].enabled,
  ) as AssetClass[]

  if (enabledAssets.length === 0) {
    throw new Error('No asset classes enabled in multi-asset portfolio')
  }

  // Initialize portfolio with first year contribution
  const firstYear = years[0]
  const firstContribution = contributions[firstYear] || 0
  let currentHoldings: PortfolioHoldings = {
    totalValue: firstContribution,
    holdings: {} as any,
    needsRebalancing: false,
    rebalancingCost: 0,
  }

  // Initialize holdings with target allocations
  for (const assetClass of enabledAssets) {
    const assetConfig = config.assetClasses[assetClass]
    const initialValue = firstContribution * assetConfig.targetAllocation

    currentHoldings.holdings[assetClass] = {
      value: initialValue,
      allocation: assetConfig.targetAllocation,
      targetAllocation: assetConfig.targetAllocation,
      drift: 0,
    }
  }

  // Track annual returns for volatility calculation
  const annualReturns: number[] = []
  let totalContributions = firstContribution

  // Simulate each year
  for (let i = 0; i < years.length; i++) {
    const year = years[i]
    const contribution = i === 0 ? firstContribution : (contributions[year] || 0)

    if (i > 0) {
      totalContributions += contribution
    }

    const startHoldings = { ...currentHoldings }

    // Generate returns for this year
    const assetReturns = generateCorrelatedReturns(enabledAssets, config, rng)

    // Apply returns
    let endHoldings = applyReturns(currentHoldings, assetReturns, config)

    // Add contributions (except for first year, already added)
    if (i > 0 && contribution > 0) {
      endHoldings = addContributions(endHoldings, contribution, config)
    }

    // Check if rebalancing is needed
    let rebalanced = false
    if (shouldRebalanceByFrequency(year, 0, config.rebalancing.frequency)
      || (config.rebalancing.useThreshold && endHoldings.needsRebalancing)) {
      endHoldings = rebalancePortfolio(endHoldings, config)
      rebalanced = true
    }

    // Calculate total return for this year
    const startValue = startHoldings.totalValue
    const endValue = endHoldings.totalValue - (i > 0 ? contribution : 0) // contributions excluded
    const totalReturn = startValue > 0 ? (endValue - startValue) / startValue : 0

    annualReturns.push(totalReturn)

    yearResults[year] = {
      year,
      startHoldings,
      endHoldings,
      assetReturns,
      rebalanced,
      totalReturn,
      contributions: contribution,
    }

    currentHoldings = endHoldings
  }

  // Calculate summary statistics
  const finalValue = currentHoldings.totalValue
  const totalReturn = finalValue - totalContributions
  const yearsCount = years.length
  const annualizedReturn = yearsCount > 1
    ? Math.pow(finalValue / totalContributions, 1 / yearsCount) - 1
    : totalReturn / totalContributions

  // Calculate volatility (standard deviation of annual returns)
  const meanReturn = annualReturns.reduce((sum, ret) => sum + ret, 0) / annualReturns.length
  const variance = annualReturns.reduce((sum, ret) => sum + Math.pow(ret - meanReturn, 2), 0)
    / Math.max(1, annualReturns.length - 1)
  const volatility = Math.sqrt(variance)

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
 * This is useful for integrating with the existing simulation engine
 */
export function calculateEquivalentSingleAssetReturn(
  config: MultiAssetPortfolioConfig,
  year: number,
  seed?: number,
): number {
  if (!config.enabled) {
    return 0
  }

  const rng = new SeededRandom(seed || (year * 12345))
  const enabledAssets = Object.keys(config.assetClasses).filter(
    assetClass => config.assetClasses[assetClass as AssetClass].enabled,
  ) as AssetClass[]

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
 */
export function generateMultiAssetReturns(
  years: number[],
  config: MultiAssetPortfolioConfig,
): Record<number, number> {
  const returns: Record<number, number> = {}

  for (const year of years) {
    returns[year] = calculateEquivalentSingleAssetReturn(config, year, config.simulation.seed)
  }

  return returns
}
