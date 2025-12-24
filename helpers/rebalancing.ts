/**
 * Cost-based Rebalancing Strategy
 *
 * This module implements intelligent portfolio rebalancing with comprehensive
 * cost and tax considerations for German tax law.
 *
 * Features:
 * - Transaction cost calculations (percentage and fixed costs)
 * - Tax-optimized rebalancing (using losses, Freibetrag)
 * - Cost-benefit analysis to determine optimal rebalancing decisions
 * - Consideration of Teilfreistellungsquote for different asset classes
 */

import type { AssetClass } from './multi-asset-portfolio'

/**
 * Transaction cost configuration
 */
export interface TransactionCostConfig {
  /** Percentage-based transaction cost (e.g., 0.001 for 0.1% per trade) */
  percentageCost: number
  /** Fixed cost per transaction in EUR (e.g., 5 EUR per trade) */
  fixedCost: number
  /** Minimum transaction size to avoid (to minimize fixed costs) */
  minTransactionSize: number
}

/**
 * Tax configuration for rebalancing
 */
export interface RebalancingTaxConfig {
  /** Capital gains tax rate including solidarity surcharge (default: 26.375%) */
  kapitalertragsteuer: number
  /** Annual tax allowance (Freibetrag) available for the year */
  freibetragAvailable: number
  /** Partial exemption rates by asset tax category */
  teilfreistellungsquoten: {
    equity: number // e.g., 0.3 for 30% exemption
    bond: number // e.g., 0.0 for 0% exemption
    reit: number // e.g., 0.2 for 20% exemption
    commodity: number // e.g., 0.0 for 0% exemption
    cash: number // e.g., 0.0 for 0% exemption
  }
}

/**
 * Cost-benefit analysis result for a rebalancing decision
 */
export interface RebalancingCostBenefitAnalysis {
  /** Total transaction costs for the rebalancing */
  totalTransactionCosts: number
  /** Total tax costs (capital gains tax on realized gains) */
  totalTaxCosts: number
  /** Total costs (transaction + tax) */
  totalCosts: number
  /** Expected benefit from rebalancing (reduced portfolio drift) */
  expectedBenefit: number
  /** Net benefit (expected benefit - total costs) */
  netBenefit: number
  /** Whether rebalancing is recommended based on cost-benefit analysis */
  recommendRebalancing: boolean
  /** Reason for recommendation */
  reason: string
}

/**
 * Single rebalancing trade with cost analysis
 */
export interface RebalancingTrade {
  /** Asset class being traded */
  assetClass: AssetClass
  /** Trade type: 'buy' for purchases, 'sell' for sales */
  type: 'buy' | 'sell'
  /** Amount in EUR */
  amount: number
  /** Cost basis (for sells only) */
  costBasis?: number
  /** Capital gains (for sells only) */
  capitalGains?: number
  /** Taxable gains after Teilfreistellung (for sells only) */
  taxableGains?: number
  /** Tax on capital gains (for sells only) */
  tax?: number
  /** Transaction cost (percentage + fixed) */
  transactionCost: number
  /** Total cost of this trade (transaction cost + tax) */
  totalCost: number
}

/**
 * Result of tax-optimized rebalancing calculation
 */
export interface TaxOptimizedRebalancingResult {
  /** Optimized trades to execute */
  trades: RebalancingTrade[]
  /** Total transaction costs */
  totalTransactionCosts: number
  /** Total tax costs */
  totalTaxCosts: number
  /** Total costs (transaction + tax) */
  totalCosts: number
  /** Freibetrag utilized */
  freibetragUtilized: number
  /** Freibetrag remaining after rebalancing */
  freibetragRemaining: number
  /** Losses utilized for tax loss harvesting */
  lossesUtilized: number
  /** Whether tax optimization was successful */
  optimizationSuccessful: boolean
  /** Explanation of optimization strategy */
  optimizationExplanation: string
}

/**
 * Create default transaction cost configuration
 */
export function createDefaultTransactionCostConfig(): TransactionCostConfig {
  return {
    percentageCost: 0.001, // 0.1% per trade
    fixedCost: 0, // No fixed cost by default
    minTransactionSize: 100, // Minimum 100 EUR transaction to avoid excessive fixed costs
  }
}

/**
 * Create default rebalancing tax configuration
 */
export function createDefaultRebalancingTaxConfig(): RebalancingTaxConfig {
  return {
    kapitalertragsteuer: 0.26375, // 25% * 1.055 (with Soli)
    freibetragAvailable: 2000, // 2,000 EUR Freibetrag (2024 onwards)
    teilfreistellungsquoten: {
      equity: 0.3, // 30% exemption for equity funds
      bond: 0.0, // 0% exemption for bonds
      reit: 0.2, // 20% exemption for REITs
      commodity: 0.0, // 0% exemption for commodities
      cash: 0.0, // 0% exemption for cash
    },
  }
}

/**
 * Calculate transaction cost for a single trade
 */
export function calculateTransactionCost(tradeAmount: number, costConfig: TransactionCostConfig): number {
  const percentageCost = tradeAmount * costConfig.percentageCost
  const totalCost = percentageCost + costConfig.fixedCost
  return totalCost
}

/**
 * Calculate taxable gains after applying Teilfreistellung
 */
export function calculateTaxableGains(
  capitalGains: number,
  taxCategory: 'equity' | 'bond' | 'reit' | 'commodity' | 'cash',
  taxConfig: RebalancingTaxConfig,
): number {
  const teilfreistellung = taxConfig.teilfreistellungsquoten[taxCategory]
  const taxableGains = capitalGains * (1 - teilfreistellung)
  return taxableGains
}

/**
 * Calculate tax on capital gains with Freibetrag consideration
 */
export function calculateCapitalGainsTax(
  taxableGains: number,
  freibetragAvailable: number,
  taxConfig: RebalancingTaxConfig,
): { tax: number; freibetragUsed: number; freibetragRemaining: number } {
  if (taxableGains <= 0) {
    return { tax: 0, freibetragUsed: 0, freibetragRemaining: freibetragAvailable }
  }

  // Use Freibetrag first
  const gainsAfterFreibetrag = Math.max(0, taxableGains - freibetragAvailable)
  const freibetragUsed = Math.min(taxableGains, freibetragAvailable)

  // Calculate tax on remaining gains
  const tax = gainsAfterFreibetrag * taxConfig.kapitalertragsteuer

  return {
    tax,
    freibetragUsed,
    freibetragRemaining: freibetragAvailable - freibetragUsed,
  }
}

/**
 * Calculate cost-benefit analysis for rebalancing decision
 *
 * This function determines whether rebalancing is worthwhile by comparing
 * the total costs (transaction costs + taxes) against the expected benefit
 * of maintaining the target allocation.
 */
export function calculateRebalancingCostBenefit(
  totalTransactionCosts: number,
  totalTaxCosts: number,
  currentDrift: number,
  portfolioValue: number,
  costThreshold = 0.001, // Default: rebalance if costs < 0.1% of portfolio
): RebalancingCostBenefitAnalysis {
  const totalCosts = totalTransactionCosts + totalTaxCosts
  const costsAsPercentage = totalCosts / portfolioValue

  // Expected benefit: reduced risk from drift
  // This is a simplified model - more sophisticated models could use
  // portfolio variance reduction or expected utility
  const expectedBenefit = currentDrift * portfolioValue * 0.1 // 10% of drift value as benefit

  const netBenefit = expectedBenefit - totalCosts

  // Recommend rebalancing if costs are below threshold and net benefit is positive
  const recommendRebalancing = costsAsPercentage <= costThreshold && netBenefit >= 0

  let reason = ''
  if (!recommendRebalancing) {
    if (costsAsPercentage > costThreshold) {
      reason = `Rebalancing-Kosten (${(costsAsPercentage * 100).toFixed(2)}%) überschreiten Schwellenwert (${(costThreshold * 100).toFixed(2)}%)`
    } else if (netBenefit < 0) {
      reason = `Netto-Nutzen ist negativ (${netBenefit.toFixed(2)} €)`
    }
  } else {
    reason = `Rebalancing empfohlen: Kosten ${totalCosts.toFixed(2)} €, Nutzen ${expectedBenefit.toFixed(2)} €`
  }

  return {
    totalTransactionCosts,
    totalTaxCosts,
    totalCosts,
    expectedBenefit,
    netBenefit,
    recommendRebalancing,
    reason,
  }
}

/**
 * Process sell trades with tax optimization
 */
function processSellTrades(
  sells: Array<{
    assetClass: AssetClass
    amount: number
    costBasis?: number
    taxCategory: 'equity' | 'bond' | 'reit' | 'commodity' | 'cash'
  }>,
  costConfig: TransactionCostConfig,
  taxConfig: RebalancingTaxConfig,
  initialFreibetragRemaining: number,
): {
  trades: RebalancingTrade[]
  totalTransactionCosts: number
  totalTaxCosts: number
  freibetragRemaining: number
  lossesUtilized: number
} {
  const trades: RebalancingTrade[] = []
  let freibetragRemaining = initialFreibetragRemaining
  let totalTransactionCosts = 0
  let totalTaxCosts = 0
  let lossesUtilized = 0

  for (const trade of sells) {
    const capitalGains = trade.costBasis ? trade.amount - trade.costBasis : 0
    const taxableGains = calculateTaxableGains(capitalGains, trade.taxCategory, taxConfig)
    const taxResult = calculateCapitalGainsTax(taxableGains, freibetragRemaining, taxConfig)
    const transactionCost = calculateTransactionCost(trade.amount, costConfig)

    freibetragRemaining = taxResult.freibetragRemaining

    if (capitalGains < 0) {
      lossesUtilized += Math.abs(capitalGains)
    }

    trades.push({
      assetClass: trade.assetClass,
      type: 'sell',
      amount: trade.amount,
      costBasis: trade.costBasis,
      capitalGains,
      taxableGains,
      tax: taxResult.tax,
      transactionCost,
      totalCost: transactionCost + taxResult.tax,
    })

    totalTransactionCosts += transactionCost
    totalTaxCosts += taxResult.tax
  }

  return { trades, totalTransactionCosts, totalTaxCosts, freibetragRemaining, lossesUtilized }
}

/**
 * Process buy trades (no tax implications)
 */
function processBuyTrades(
  buys: Array<{
    assetClass: AssetClass
    amount: number
  }>,
  costConfig: TransactionCostConfig,
): {
  trades: RebalancingTrade[]
  totalTransactionCosts: number
} {
  const trades: RebalancingTrade[] = []
  let totalTransactionCosts = 0

  for (const trade of buys) {
    const transactionCost = calculateTransactionCost(trade.amount, costConfig)

    trades.push({
      assetClass: trade.assetClass,
      type: 'buy',
      amount: trade.amount,
      transactionCost,
      totalCost: transactionCost,
    })

    totalTransactionCosts += transactionCost
  }

  return { trades, totalTransactionCosts }
}

/**
 * Generate optimization explanation
 */
function generateOptimizationExplanation(
  lossesUtilized: number,
  freibetragUtilized: number,
): { optimizationSuccessful: boolean; optimizationExplanation: string } {
  const optimizationSuccessful = lossesUtilized > 0 || freibetragUtilized > 0

  let optimizationExplanation = ''
  if (optimizationSuccessful) {
    if (lossesUtilized > 0) {
      optimizationExplanation += `Tax Loss Harvesting: ${lossesUtilized.toFixed(2)} € Verluste genutzt. `
    }
    if (freibetragUtilized > 0) {
      optimizationExplanation += `Freibetrag genutzt: ${freibetragUtilized.toFixed(2)} €.`
    }
  } else {
    optimizationExplanation = 'Keine steuerliche Optimierung möglich (keine Verluste, kein Freibetrag verfügbar).'
  }

  return { optimizationSuccessful, optimizationExplanation }
}

/**
 * Optimize rebalancing trades to minimize taxes
 *
 * Strategy:
 * 1. Prioritize selling assets with losses (tax loss harvesting)
 * 2. Use available Freibetrag for gains
 * 3. Minimize transactions below minTransactionSize to avoid excessive fixed costs
 * 4. Consider Teilfreistellungsquote for different asset classes
 */
export function optimizeRebalancingTrades(
  requiredTrades: Array<{
    assetClass: AssetClass
    amount: number
    type: 'buy' | 'sell'
    costBasis?: number
    taxCategory: 'equity' | 'bond' | 'reit' | 'commodity' | 'cash'
  }>,
  costConfig: TransactionCostConfig,
  taxConfig: RebalancingTaxConfig,
): TaxOptimizedRebalancingResult {
  // Separate trades into sells and buys
  const sells = requiredTrades.filter(t => t.type === 'sell')
  const buys = requiredTrades.filter(t => t.type === 'buy')

  // Sort sells: prioritize losses first (tax loss harvesting), then smallest gains
  sells.sort((a, b) => {
    const gainsA = a.costBasis ? a.amount - a.costBasis : 0
    const gainsB = b.costBasis ? b.amount - b.costBasis : 0
    return gainsA - gainsB // Losses (negative) first
  })

  // Process sell trades with tax optimization
  const sellResult = processSellTrades(sells, costConfig, taxConfig, taxConfig.freibetragAvailable)

  // Process buy trades (no tax implications, only transaction costs)
  const buyResult = processBuyTrades(buys, costConfig)

  // Combine results
  const trades = [...sellResult.trades, ...buyResult.trades]
  const totalTransactionCosts = sellResult.totalTransactionCosts + buyResult.totalTransactionCosts
  const totalTaxCosts = sellResult.totalTaxCosts
  const freibetragUtilized = taxConfig.freibetragAvailable - sellResult.freibetragRemaining

  // Generate explanation
  const { optimizationSuccessful, optimizationExplanation } = generateOptimizationExplanation(
    sellResult.lossesUtilized,
    freibetragUtilized,
  )

  return {
    trades,
    totalTransactionCosts,
    totalTaxCosts,
    totalCosts: totalTransactionCosts + totalTaxCosts,
    freibetragUtilized,
    freibetragRemaining: sellResult.freibetragRemaining,
    lossesUtilized: sellResult.lossesUtilized,
    optimizationSuccessful,
    optimizationExplanation,
  }
}

/**
 * Determine if rebalancing should be skipped due to small transaction sizes
 *
 * Small transactions may not be worth executing due to fixed costs and
 * the hassle of many small trades.
 */
export function shouldSkipSmallTransactions(trades: RebalancingTrade[], costConfig: TransactionCostConfig): boolean {
  if (trades.length === 0) {
    return true
  }

  // Skip if all trades are below minimum size
  const allTradesSmall = trades.every(trade => trade.amount < costConfig.minTransactionSize)

  // If all trades are small, definitely skip
  if (allTradesSmall) {
    return true
  }

  // If there are some large trades, check if fixed costs dominate
  // Only skip if fixed costs are more than 50% of total costs AND we have fixed costs
  if (costConfig.fixedCost > 0) {
    const totalFixedCosts = trades.length * costConfig.fixedCost
    const totalCosts = trades.reduce((sum, trade) => sum + trade.totalCost, 0)
    const fixedCostsDominate = totalFixedCosts > totalCosts * 0.5

    return fixedCostsDominate
  }

  return false
}
