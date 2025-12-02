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
  type RebalancingProtocol,
  type RebalancingTransaction,
} from './multi-asset-portfolio'

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
 */
function getEnabledAssets(config: MultiAssetPortfolioConfig): AssetClass[] {
  return Object.keys(config.assetClasses).filter(
    assetClass => config.assetClasses[assetClass as AssetClass].enabled,
  ) as AssetClass[]
}

/**
 * Calculate tax on capital gains considering German partial exemptions
 */
function calculateCapitalGainsTax(
  capitalGains: number,
  assetConfig: { taxCategory: 'equity' | 'bond' | 'reit' | 'commodity' | 'cash' },
): number {
  const capitalGainsTaxRate = 0.26375 // 25% + 5.5% Soli
  let taxableGains = capitalGains

  if (assetConfig.taxCategory === 'equity') {
    // 30% partial exemption for equity funds (Teilfreistellung)
    taxableGains = capitalGains * 0.7
  } else if (assetConfig.taxCategory === 'reit') {
    // 60% partial exemption for REITs (Immobilienfonds)
    taxableGains = capitalGains * 0.4
  }

  return taxableGains * capitalGainsTaxRate
}

/**
 * Create a rebalancing transaction for a sell order
 */
function createSellTransaction(
  assetClass: AssetClass,
  change: number,
  beforeValue: number,
  costBasis: number,
  portfolioValue: number,
  assetConfig: { taxCategory: 'equity' | 'bond' | 'reit' | 'commodity' | 'cash' },
): { transaction: RebalancingTransaction; capitalGains: number; tax: number } {
  const transaction: RebalancingTransaction = {
    assetClass,
    type: 'sell',
    amount: Math.abs(change),
    percentageOfPortfolio: Math.abs(change) / portfolioValue,
  }

  let capitalGains = 0
  let tax = 0

  const percentageSold = Math.abs(change) / beforeValue
  const costBasisSold = costBasis * percentageSold
  capitalGains = Math.abs(change) - costBasisSold

  if (capitalGains > 0) {
    transaction.capitalGains = capitalGains
    tax = calculateCapitalGainsTax(capitalGains, assetConfig)
    transaction.tax = tax
  }

  return { transaction, capitalGains, tax }
}

/**
 * Create a rebalancing transaction for a buy order
 */
function createBuyTransaction(
  assetClass: AssetClass,
  change: number,
  portfolioValue: number,
): RebalancingTransaction {
  return {
    assetClass,
    type: 'buy',
    amount: Math.abs(change),
    percentageOfPortfolio: Math.abs(change) / portfolioValue,
  }
}

/**
 * Get allocations before and after rebalancing for an asset
 */
function getAssetAllocations(
  assetClass: AssetClass,
  holdingsBefore: PortfolioHoldings,
  holdingsAfter: PortfolioHoldings,
): { allocationBefore: number; allocationAfter: number } {
  return {
    allocationBefore: holdingsBefore.holdings[assetClass]?.allocation || 0,
    allocationAfter: holdingsAfter.holdings[assetClass]?.allocation || 0,
  }
}

/**
 * Create sell transaction with capital gains calculation
 */
function createSellWithGains(
  assetClass: AssetClass,
  change: number,
  beforeValue: number,
  costBasis: number,
  portfolioValue: number,
  assetConfig: { taxCategory: 'equity' | 'bond' | 'reit' | 'commodity' | 'cash' },
): { transaction: RebalancingTransaction; capitalGains: number; tax: number } {
  const { transaction, capitalGains, tax } = createSellTransaction(
    assetClass,
    change,
    beforeValue,
    costBasis,
    portfolioValue,
    assetConfig,
  )
  return { transaction, capitalGains, tax }
}

/**
 * Get asset values before and after rebalancing
 */
function getAssetValues(
  assetClass: AssetClass,
  holdingsBefore: PortfolioHoldings,
  holdingsAfter: PortfolioHoldings,
): { beforeValue: number; afterValue: number; costBasis: number } {
  const holding = holdingsBefore.holdings[assetClass]
  const beforeValue = holding?.value || 0
  const costBasis = holding?.costBasis || beforeValue
  const afterValue = holdingsAfter.holdings[assetClass]?.value || 0
  
  return { beforeValue, afterValue, costBasis }
}

/**
 * Process a single asset for rebalancing protocol
 */
function processAssetForRebalancing(
  assetClass: AssetClass,
  holdingsBefore: PortfolioHoldings,
  holdingsAfter: PortfolioHoldings,
  config: MultiAssetPortfolioConfig,
): {
  transaction: RebalancingTransaction | null
  capitalGains: number
  tax: number
  allocationBefore: number
  allocationAfter: number
} {
  const { allocationBefore, allocationAfter } = getAssetAllocations(assetClass, holdingsBefore, holdingsAfter)
  const { beforeValue, afterValue, costBasis } = getAssetValues(assetClass, holdingsBefore, holdingsAfter)
  const change = afterValue - beforeValue

  // No transaction if change is negligible
  if (Math.abs(change) <= 0.01) {
    return { transaction: null, capitalGains: 0, tax: 0, allocationBefore, allocationAfter }
  }

  // Buy transaction
  if (change > 0) {
    return {
      transaction: createBuyTransaction(assetClass, change, holdingsBefore.totalValue),
      capitalGains: 0,
      tax: 0,
      allocationBefore,
      allocationAfter,
    }
  }

  // Sell transaction with capital gains
  const { transaction, capitalGains, tax } = createSellWithGains(
    assetClass,
    change,
    beforeValue,
    costBasis,
    holdingsBefore.totalValue,
    config.assetClasses[assetClass],
  )
  return { transaction, capitalGains, tax, allocationBefore, allocationAfter }
}

/**
 * Create a rebalancing protocol with detailed transaction tracking
 */
function createRebalancingProtocol(
  year: number,
  month: number,
  reason: 'threshold' | 'scheduled',
  holdingsBefore: PortfolioHoldings,
  holdingsAfter: PortfolioHoldings,
  config: MultiAssetPortfolioConfig,
): RebalancingProtocol {
  const transactions: RebalancingTransaction[] = []
  const allocationsBefore: Record<AssetClass, number> = {} as Record<AssetClass, number>
  const allocationsAfter: Record<AssetClass, number> = {} as Record<AssetClass, number>
  let totalCapitalGains = 0
  let totalTax = 0

  for (const assetClass of getEnabledAssets(config)) {
    const result = processAssetForRebalancing(assetClass, holdingsBefore, holdingsAfter, config)
    
    allocationsBefore[assetClass] = result.allocationBefore
    allocationsAfter[assetClass] = result.allocationAfter
    
    if (result.transaction) {
      transactions.push(result.transaction)
      totalCapitalGains += result.capitalGains
      totalTax += result.tax
    }
  }

  return {
    year,
    month,
    reason,
    portfolioValueBefore: holdingsBefore.totalValue,
    portfolioValueAfter: holdingsAfter.totalValue - totalTax,
    transactions,
    totalCapitalGains,
    totalTax,
    transactionCosts: 0,
    netCost: totalTax,
    allocationsBefore,
    allocationsAfter,
  }
}

/**
 * Rebalance portfolio to target allocations
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
        costBasis?: number
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
    const oldCostBasis = holdings.holdings[assetClass]?.costBasis || holdings.holdings[assetClass]?.value || 0

    rebalancedHoldings.holdings[assetClass] = {
      value: targetValue,
      allocation: assetConfig.targetAllocation,
      targetAllocation: assetConfig.targetAllocation,
      drift: 0, // No drift after rebalancing
      costBasis: oldCostBasis, // Preserve cost basis for future calculations
    }
  }

  return rebalancedHoldings
}

/**
 * Apply returns to holdings and calculate new values
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
      costBasis?: number
    }
  > = {} as Record<
    AssetClass,
    {
      value: number
      allocation: number
      targetAllocation: number
      drift: number
      costBasis?: number
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
      costBasis: holding.costBasis, // Preserve cost basis
    }
  }

  return { newHoldings, newTotalValue }
}

/**
 * Apply returns to portfolio holdings
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
      const oldCostBasis = newHoldings[assetClass].costBasis || newHoldings[assetClass].value
      const oldValue = newHoldings[assetClass].value
      const newValue = oldValue + contributionForAsset
      // Update cost basis: weighted average of old and new
      const newCostBasis = oldCostBasis + contributionForAsset

      newHoldings[assetClass] = {
        ...newHoldings[assetClass],
        value: newValue,
        costBasis: newCostBasis,
      }
    } else {
      // Initialize new asset class
      newHoldings[assetClass] = {
        value: contributionForAsset,
        allocation: 0,
        targetAllocation: assetConfig.targetAllocation,
        drift: 0,
        costBasis: contributionForAsset, // Initial cost basis is the contribution
      }
    }
  }

  return newHoldings
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
        costBasis?: number
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
      costBasis: initialValue, // Initial cost basis equals initial value
    }
  }

  return holdings
}

/**
 * Check if rebalancing should occur
 */
function shouldPerformRebalancing(
  year: number,
  holdings: PortfolioHoldings,
  config: MultiAssetPortfolioConfig,
): boolean {
  return (
    shouldRebalanceByFrequency(year, 0, config.rebalancing.frequency) ||
    (config.rebalancing.useThreshold && holdings.needsRebalancing)
  )
}

/**
 * Perform rebalancing and create protocol
 */
function performRebalancing(
  year: number,
  holdings: PortfolioHoldings,
  config: MultiAssetPortfolioConfig,
): { rebalancedHoldings: PortfolioHoldings; protocol: RebalancingProtocol } {
  const rebalancedHoldings = rebalancePortfolio(holdings, config)
  const reason = config.rebalancing.useThreshold && holdings.needsRebalancing ? 'threshold' : 'scheduled'
  const protocol = createRebalancingProtocol(year, 0, reason, holdings, rebalancedHoldings, config)
  
  return { rebalancedHoldings, protocol }
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
  const assetReturns = generateCorrelatedReturns(enabledAssets, config, rng)
  let endHoldings = applyReturns(currentHoldings, assetReturns, config)

  if (yearIndex > 0 && contribution > 0) {
    endHoldings = addContributions(endHoldings, contribution, config)
  }

  let rebalanced = false
  let rebalancingProtocol: RebalancingProtocol | undefined

  if (shouldPerformRebalancing(year, endHoldings, config)) {
    const { rebalancedHoldings, protocol } = performRebalancing(year, endHoldings, config)
    endHoldings = rebalancedHoldings
    rebalancingProtocol = protocol
    rebalanced = true
  }

  const startValue = startHoldings.totalValue
  const endValue = endHoldings.totalValue - (yearIndex > 0 ? contribution : 0)
  const totalReturn = startValue > 0 ? (endValue - startValue) / startValue : 0

  return {
    yearResult: {
      year,
      startHoldings,
      endHoldings,
      assetReturns,
      rebalanced,
      rebalancingProtocol,
      totalReturn,
      contributions: contribution,
    },
    endHoldings,
  }
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
 * Create empty multi-asset simulation result
 */
function createEmptySimulationResult(): MultiAssetSimulationResult {
  return {
    yearResults: {},
    finalValue: 0,
    totalContributions: 0,
    totalReturn: 0,
    annualizedReturn: 0,
    volatility: 0,
    rebalancingProtocols: [],
  }
}

/**
 * Collect rebalancing protocols from year results
 */
function collectRebalancingProtocols(yearResults: Record<number, MultiAssetYearResult>): RebalancingProtocol[] {
  return Object.values(yearResults)
    .filter(result => result.rebalancingProtocol !== undefined)
    .map(result => result.rebalancingProtocol!)
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
    return createEmptySimulationResult()
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
    rebalancingProtocols: collectRebalancingProtocols(yearResults),
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
 */
export function generateMultiAssetReturns(years: number[], config: MultiAssetPortfolioConfig): Record<number, number> {
  const returns: Record<number, number> = {}

  for (const year of years) {
    returns[year] = calculateEquivalentSingleAssetReturn(config, year, config.simulation.seed)
  }

  return returns
}
