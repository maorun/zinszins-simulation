/**
 * Portfolio-based Teilfreistellungsquote Calculator
 *
 * This module calculates weighted Teilfreistellungsquoten (partial exemption quotas)
 * for complex fund portfolios according to German tax law (§ 20 InvStG).
 *
 * Key Features:
 * - Calculate weighted partial exemption for mixed portfolios
 * - Support multiple fund types with different exemption rates
 * - Scenario comparison for different portfolio allocations
 * - Tax savings calculations for portfolio optimization
 *
 * Reference: Investmentsteuergesetz (InvStG) § 20
 */

import { type AssetClass, DEFAULT_TEILFREISTELLUNGSQUOTEN, getAssetClassName } from './asset-class'

/**
 * Portfolio holding with allocation and fund type
 */
export interface PortfolioHolding {
  /** Asset class type */
  assetClass: AssetClass
  /** Allocation percentage (0-1, e.g., 0.4 for 40%) */
  allocation: number
  /** Optional custom Teilfreistellungsquote for 'custom' asset class */
  customQuote?: number
}

/**
 * Weighted Teilfreistellungsquote result
 */
export interface WeightedTeilfreistellungsquote {
  /** Weighted average Teilfreistellungsquote (0-1) */
  weightedQuote: number
  /** Individual contributions by asset class */
  contributions: Array<{
    assetClass: AssetClass
    allocation: number
    quote: number
    contribution: number
    displayName: string
  }>
  /** Total allocation (should be 1.0 for valid portfolios) */
  totalAllocation: number
}

/**
 * Tax impact comparison between scenarios
 */
export interface TaxScenarioComparison {
  /** Scenario A (e.g., current portfolio) */
  scenarioA: {
    name: string
    weightedQuote: number
    taxRate: number
    effectiveTaxRate: number
  }
  /** Scenario B (e.g., optimized portfolio) */
  scenarioB: {
    name: string
    weightedQuote: number
    taxRate: number
    effectiveTaxRate: number
  }
  /** Tax savings (percentage points) */
  taxSavings: number
  /** Relative improvement (percentage) */
  relativeImprovement: number
}

/**
 * Calculate weighted Teilfreistellungsquote for a portfolio
 *
 * Formula: Σ (allocation_i × quote_i) for all holdings i
 *
 * @param holdings - Array of portfolio holdings with allocations
 * @returns Weighted Teilfreistellungsquote result with breakdown
 *
 * @example
 * ```typescript
 * const portfolio = [
 *   { assetClass: 'equity-fund', allocation: 0.6 },
 *   { assetClass: 'bond-fund', allocation: 0.4 },
 * ]
 * const result = calculateWeightedTeilfreistellungsquote(portfolio)
 * // result.weightedQuote = 0.18 (18% exemption)
 * // 60% × 30% + 40% × 0% = 18%
 * ```
 */
export function calculateWeightedTeilfreistellungsquote(holdings: PortfolioHolding[]): WeightedTeilfreistellungsquote {
  let weightedQuote = 0
  let totalAllocation = 0
  const contributions: WeightedTeilfreistellungsquote['contributions'] = []

  for (const holding of holdings) {
    const quote =
      holding.assetClass === 'custom' && holding.customQuote !== undefined
        ? holding.customQuote
        : DEFAULT_TEILFREISTELLUNGSQUOTEN[holding.assetClass]

    const contribution = holding.allocation * quote
    weightedQuote += contribution
    totalAllocation += holding.allocation

    contributions.push({
      assetClass: holding.assetClass,
      allocation: holding.allocation,
      quote,
      contribution,
      displayName: getAssetClassName(holding.assetClass),
    })
  }

  return {
    weightedQuote,
    contributions,
    totalAllocation,
  }
}

/**
 * Calculate effective tax rate considering Teilfreistellung
 *
 * Effective Tax Rate = Capital Gains Tax Rate × (1 - Teilfreistellungsquote)
 *
 * @param capitalGainsTaxRate - German capital gains tax rate (default 26.375% including Soli)
 * @param teilfreistellungsquote - Teilfreistellungsquote as decimal (0-1)
 * @returns Effective tax rate as decimal
 *
 * @example
 * ```typescript
 * // Equity fund with 30% exemption
 * const effectiveRate = calculateEffectiveTaxRate(0.26375, 0.3)
 * // = 0.26375 × 0.7 = 0.184625 (18.46%)
 * ```
 */
export function calculateEffectiveTaxRate(capitalGainsTaxRate: number, teilfreistellungsquote: number): number {
  return capitalGainsTaxRate * (1 - teilfreistellungsquote)
}

/**
 * Calculate tax amount on capital gains considering Teilfreistellung
 *
 * @param capitalGains - Capital gains amount in EUR
 * @param capitalGainsTaxRate - German capital gains tax rate (default 26.375%)
 * @param teilfreistellungsquote - Teilfreistellungsquote as decimal (0-1)
 * @returns Tax amount in EUR
 */
export function calculateTaxOnGains(
  capitalGains: number,
  capitalGainsTaxRate: number,
  teilfreistellungsquote: number,
): number {
  const taxableGains = capitalGains * (1 - teilfreistellungsquote)
  return taxableGains * capitalGainsTaxRate
}

/**
 * Compare tax impact between two portfolio scenarios
 *
 * @param scenarioAHoldings - Portfolio A holdings
 * @param scenarioBHoldings - Portfolio B holdings
 * @param scenarioAName - Name for scenario A (e.g., "Aktuelles Portfolio")
 * @param scenarioBName - Name for scenario B (e.g., "Optimiertes Portfolio")
 * @param capitalGainsTaxRate - German capital gains tax rate (default 26.375%)
 * @returns Tax scenario comparison with savings analysis
 */
export function compareTaxScenarios(
  scenarioAHoldings: PortfolioHolding[],
  scenarioBHoldings: PortfolioHolding[],
  scenarioAName = 'Szenario A',
  scenarioBName = 'Szenario B',
  capitalGainsTaxRate = 0.26375,
): TaxScenarioComparison {
  const scenarioA = calculateWeightedTeilfreistellungsquote(scenarioAHoldings)
  const scenarioB = calculateWeightedTeilfreistellungsquote(scenarioBHoldings)

  const effectiveTaxRateA = calculateEffectiveTaxRate(capitalGainsTaxRate, scenarioA.weightedQuote)
  const effectiveTaxRateB = calculateEffectiveTaxRate(capitalGainsTaxRate, scenarioB.weightedQuote)

  const taxSavings = effectiveTaxRateA - effectiveTaxRateB
  const relativeImprovement = effectiveTaxRateA > 0 ? (taxSavings / effectiveTaxRateA) * 100 : 0

  return {
    scenarioA: {
      name: scenarioAName,
      weightedQuote: scenarioA.weightedQuote,
      taxRate: capitalGainsTaxRate,
      effectiveTaxRate: effectiveTaxRateA,
    },
    scenarioB: {
      name: scenarioBName,
      weightedQuote: scenarioB.weightedQuote,
      taxRate: capitalGainsTaxRate,
      effectiveTaxRate: effectiveTaxRateB,
    },
    taxSavings,
    relativeImprovement,
  }
}

/**
 * Validate portfolio holdings
 *
 * Checks:
 * - Total allocation sums to 100% (within tolerance)
 * - No negative allocations
 * - No allocations over 100%
 *
 * @param holdings - Portfolio holdings to validate
 * @param tolerance - Tolerance for allocation sum (default 0.001 = 0.1%)
 * @returns Array of validation error messages (empty if valid)
 */
export function validatePortfolioHoldings(holdings: PortfolioHolding[], tolerance = 0.001): string[] {
  const errors: string[] = []

  if (holdings.length === 0) {
    errors.push('Portfolio muss mindestens eine Position enthalten')
    return errors
  }

  const totalAllocation = holdings.reduce((sum, h) => sum + h.allocation, 0)

  if (Math.abs(totalAllocation - 1.0) > tolerance) {
    errors.push(`Gesamtallokation muss 100% betragen (aktuell: ${(totalAllocation * 100).toFixed(1)}%)`)
  }

  for (const holding of holdings) {
    if (holding.allocation < 0) {
      errors.push(`${getAssetClassName(holding.assetClass)}: Allokation darf nicht negativ sein`)
    }

    if (holding.allocation > 1) {
      errors.push(`${getAssetClassName(holding.assetClass)}: Allokation darf nicht über 100% liegen`)
    }
  }

  return errors
}

/**
 * Optimize portfolio for maximum Teilfreistellung
 *
 * Returns suggestions for improving tax efficiency through higher
 * Teilfreistellungsquoten allocation.
 *
 * @param currentHoldings - Current portfolio holdings
 * @returns Optimization suggestions
 */
export function suggestPortfolioOptimization(currentHoldings: PortfolioHolding[]): {
  currentWeightedQuote: number
  potentialImprovement: number
  suggestions: string[]
} {
  const current = calculateWeightedTeilfreistellungsquote(currentHoldings)
  const suggestions: string[] = []

  // Find holdings with low or zero Teilfreistellung
  const lowExemptionHoldings = current.contributions.filter(c => c.quote < 0.15)

  if (lowExemptionHoldings.length > 0 && lowExemptionHoldings.some(h => h.allocation > 0.1)) {
    suggestions.push('Reduzieren Sie Anlageklassen mit niedriger Teilfreistellung (z.B. Rentenfonds, REITs)')
  }

  // Check if equity allocation could be increased
  const equityHolding = current.contributions.find(c => c.assetClass === 'equity-fund')
  if (!equityHolding || equityHolding.allocation < 0.51) {
    suggestions.push('Erhöhen Sie den Aktienfonds-Anteil (≥ 51%) für maximale Teilfreistellung von 30%')
  }

  // Calculate potential improvement with 100% equity allocation
  const maxPossibleQuote = 0.3 // Maximum with 100% equity funds
  const potentialImprovement = maxPossibleQuote - current.weightedQuote

  if (suggestions.length === 0) {
    suggestions.push('Ihre Portfolio-Struktur ist bereits gut für die Teilfreistellung optimiert')
  }

  return {
    currentWeightedQuote: current.weightedQuote,
    potentialImprovement,
    suggestions,
  }
}

/**
 * Format Teilfreistellungsquote for display
 *
 * @param quote - Quote as decimal (0-1)
 * @param decimals - Number of decimal places (default 1)
 * @returns Formatted string with percentage
 */
export function formatWeightedQuote(quote: number, decimals = 1): string {
  return `${(quote * 100).toFixed(decimals)} %`
}
