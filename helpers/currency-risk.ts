/**
 * Currency Risk Management for German Investors
 *
 * This module implements currency risk calculations for international investments,
 * helping German investors understand and manage foreign exchange exposure in their
 * portfolios. All calculations are from the perspective of Euro (EUR) as the base currency.
 */

/**
 * Supported currencies for international investments
 */
export type Currency = 'EUR' | 'USD' | 'GBP' | 'CHF' | 'JPY' | 'CNY' | 'AUD' | 'CAD'

/**
 * Currency hedging strategies
 */
export type HedgingStrategy = 'unhedged' | 'fully_hedged' | 'partial_hedged'

/**
 * Currency exposure in a portfolio
 */
export interface CurrencyExposure {
  /** Currency code */
  currency: Currency
  /** Exposure amount in EUR */
  amountEUR: number
  /** Percentage of total portfolio */
  percentageOfPortfolio: number
  /** Expected currency volatility against EUR */
  volatility: number
}

/**
 * Currency hedging configuration
 */
export interface CurrencyHedgingConfig {
  /** Hedging strategy to apply */
  strategy: HedgingStrategy
  /** Hedging ratio for partial hedging (0-1, only used for partial_hedged) */
  hedgingRatio: number
  /** Annual cost of hedging as percentage (e.g., 0.01 for 1%) */
  hedgingCostPercent: number
}

/**
 * Currency risk calculation result
 */
export interface CurrencyRiskResult {
  /** Total currency exposure by currency */
  exposures: CurrencyExposure[]
  /** Total unhedged exposure in EUR */
  totalUnhedgedExposure: number
  /** Portfolio currency risk (volatility contribution) */
  portfolioCurrencyRisk: number
  /** Annual hedging cost in EUR */
  annualHedgingCost: number
  /** Effective hedging ratio applied */
  effectiveHedgingRatio: number
  /** Currency risk after hedging */
  hedgedCurrencyRisk: number
}

/**
 * Default currency volatilities against EUR (annual standard deviation)
 * Based on historical data (approximate values)
 */
export const DEFAULT_CURRENCY_VOLATILITIES: Record<Currency, number> = {
  EUR: 0.0, // Base currency - no volatility
  USD: 0.10, // ~10% annual volatility vs EUR
  GBP: 0.08, // ~8% annual volatility vs EUR
  CHF: 0.06, // ~6% annual volatility vs EUR (historically stable)
  JPY: 0.12, // ~12% annual volatility vs EUR
  CNY: 0.05, // ~5% annual volatility vs EUR (managed float)
  AUD: 0.14, // ~14% annual volatility vs EUR (commodity currency)
  CAD: 0.11, // ~11% annual volatility vs EUR (commodity currency)
}

/**
 * Currency display names in German
 */
export const CURRENCY_NAMES: Record<Currency, string> = {
  EUR: 'Euro (EUR)',
  USD: 'US-Dollar (USD)',
  GBP: 'Britisches Pfund (GBP)',
  CHF: 'Schweizer Franken (CHF)',
  JPY: 'Japanischer Yen (JPY)',
  CNY: 'Chinesischer Yuan (CNY)',
  AUD: 'Australischer Dollar (AUD)',
  CAD: 'Kanadischer Dollar (CAD)',
}

/**
 * Hedging strategy display names in German
 */
export const HEDGING_STRATEGY_NAMES: Record<HedgingStrategy, string> = {
  unhedged: 'Ungesichert (volles Währungsrisiko)',
  fully_hedged: 'Vollständig gesichert',
  partial_hedged: 'Teilweise gesichert',
}

/**
 * Default hedging configuration
 */
export const DEFAULT_HEDGING_CONFIG: CurrencyHedgingConfig = {
  strategy: 'unhedged',
  hedgingRatio: 0.5, // 50% for partial hedging
  hedgingCostPercent: 0.01, // 1% annual cost
}

/**
 * Calculate currency exposure from portfolio allocation
 *
 * @param portfolioValue - Total portfolio value in EUR
 * @param currencyAllocations - Map of currency to allocation percentage (0-1)
 * @returns Array of currency exposures
 */
export function calculateCurrencyExposure(
  portfolioValue: number,
  currencyAllocations: Map<Currency, number>
): CurrencyExposure[] {
  const exposures: CurrencyExposure[] = []

  for (const [currency, allocation] of currencyAllocations.entries()) {
    if (allocation <= 0) continue

    const amountEUR = portfolioValue * allocation
    const volatility = DEFAULT_CURRENCY_VOLATILITIES[currency]

    exposures.push({
      currency,
      amountEUR,
      percentageOfPortfolio: allocation,
      volatility,
    })
  }

  return exposures.sort((a, b) => b.amountEUR - a.amountEUR)
}

/**
 * Calculate portfolio currency risk (volatility contribution)
 *
 * @param exposures - Currency exposures
 * @param portfolioValue - Total portfolio value in EUR
 * @returns Portfolio currency risk as standard deviation
 */
export function calculatePortfolioCurrencyRisk(
  exposures: CurrencyExposure[],
  portfolioValue: number
): number {
  if (portfolioValue <= 0) return 0

  // Simplified calculation: weighted average of currency volatilities
  // In reality, correlations between currencies should be considered
  let weightedVolatility = 0

  for (const exposure of exposures) {
    const weight = exposure.amountEUR / portfolioValue
    weightedVolatility += weight * exposure.volatility
  }

  return weightedVolatility
}

/**
 * Calculate annual hedging cost
 *
 * @param hedgingConfig - Hedging configuration
 * @param totalForeignExposure - Total foreign currency exposure in EUR
 * @returns Annual hedging cost in EUR
 */
export function calculateHedgingCost(
  hedgingConfig: CurrencyHedgingConfig,
  totalForeignExposure: number
): number {
  if (hedgingConfig.strategy === 'unhedged') return 0

  const hedgingRatio =
    hedgingConfig.strategy === 'fully_hedged' ? 1.0 : hedgingConfig.hedgingRatio

  return totalForeignExposure * hedgingRatio * hedgingConfig.hedgingCostPercent
}

/**
 * Calculate effective hedging ratio based on strategy
 *
 * @param hedgingConfig - Hedging configuration
 * @returns Effective hedging ratio (0-1)
 */
export function calculateEffectiveHedgingRatio(
  hedgingConfig: CurrencyHedgingConfig
): number {
  switch (hedgingConfig.strategy) {
    case 'unhedged':
      return 0
    case 'fully_hedged':
      return 1.0
    case 'partial_hedged':
      return Math.max(0, Math.min(1, hedgingConfig.hedgingRatio))
  }
}

/**
 * Calculate hedged currency risk
 *
 * @param unhedgedRisk - Unhedged currency risk
 * @param hedgingRatio - Effective hedging ratio (0-1)
 * @returns Hedged currency risk
 */
export function calculateHedgedRisk(unhedgedRisk: number, hedgingRatio: number): number {
  // Hedging reduces risk proportionally
  return unhedgedRisk * (1 - hedgingRatio)
}

/**
 * Main function to calculate complete currency risk analysis
 *
 * @param portfolioValue - Total portfolio value in EUR
 * @param currencyAllocations - Map of currency to allocation percentage (0-1)
 * @param hedgingConfig - Hedging configuration
 * @returns Complete currency risk analysis
 */
export function calculateCurrencyRisk(
  portfolioValue: number,
  currencyAllocations: Map<Currency, number>,
  hedgingConfig: CurrencyHedgingConfig = DEFAULT_HEDGING_CONFIG
): CurrencyRiskResult {
  // Calculate exposures
  const exposures = calculateCurrencyExposure(portfolioValue, currencyAllocations)

  // Calculate total foreign exposure (exclude EUR)
  const totalUnhedgedExposure = exposures
    .filter((e) => e.currency !== 'EUR')
    .reduce((sum, e) => sum + e.amountEUR, 0)

  // Calculate portfolio currency risk
  const portfolioCurrencyRisk = calculatePortfolioCurrencyRisk(exposures, portfolioValue)

  // Calculate hedging cost
  const annualHedgingCost = calculateHedgingCost(hedgingConfig, totalUnhedgedExposure)

  // Calculate effective hedging ratio
  const effectiveHedgingRatio = calculateEffectiveHedgingRatio(hedgingConfig)

  // Calculate hedged currency risk
  const hedgedCurrencyRisk = calculateHedgedRisk(
    portfolioCurrencyRisk,
    effectiveHedgingRatio
  )

  return {
    exposures,
    totalUnhedgedExposure,
    portfolioCurrencyRisk,
    annualHedgingCost,
    effectiveHedgingRatio,
    hedgedCurrencyRisk,
  }
}

/**
 * Adjust portfolio return for currency hedging costs
 *
 * @param baseReturn - Base portfolio return before hedging costs
 * @param hedgingCost - Annual hedging cost in EUR
 * @param portfolioValue - Total portfolio value in EUR
 * @returns Adjusted return after hedging costs
 */
export function adjustReturnForHedgingCost(
  baseReturn: number,
  hedgingCost: number,
  portfolioValue: number
): number {
  if (portfolioValue <= 0) return baseReturn

  const hedgingCostRatio = hedgingCost / portfolioValue
  return baseReturn - hedgingCostRatio
}

/**
 * Estimate currency risk impact on returns
 *
 * This provides a simplified estimate of how currency risk affects portfolio returns
 * using variance drag (reduction in geometric mean due to volatility)
 *
 * @param currencyRisk - Currency risk (volatility)
 * @returns Expected return drag from currency risk
 */
export function estimateCurrencyRiskImpact(currencyRisk: number): number {
  // Variance drag formula: approximately -0.5 * variance
  return -0.5 * currencyRisk * currencyRisk
}
