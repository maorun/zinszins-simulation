/**
 * Tail-Risk Hedging (Absicherungsstrategien gegen extreme Verluste)
 *
 * This module implements tail-risk hedging strategies for portfolio protection
 * against extreme market downturns. Tail-risk hedging aims to limit losses
 * during severe market crashes while allowing participation in normal market returns.
 *
 * Key concepts:
 * - Protective Put Strategy: Buying put options to limit downside
 * - Dynamic Hedging: Adjusting hedge ratio based on market conditions
 * - Cost-benefit analysis: Balancing protection costs against potential benefits
 * - German tax treatment: Consideration of Kapitalertragsteuer on hedging instruments
 */

/**
 * Available tail-risk hedging strategies
 */
export type HedgingStrategy =
  | 'none' // No hedging
  | 'protective-put' // Buy put options for downside protection
  | 'dynamic-cppi' // Constant Proportion Portfolio Insurance
  | 'tail-risk-fund' // Dedicated tail-risk hedge fund allocation
  | 'systematic-rebalancing' // Rebalancing-based risk management

/**
 * Configuration for tail-risk hedging
 */
export interface TailRiskHedgingConfig {
  /** Whether tail-risk hedging is enabled */
  enabled: boolean
  /** Hedging strategy to use */
  strategy: HedgingStrategy
  /** Protection level (e.g., 0.8 = protect against losses below 80% of portfolio value) */
  protectionLevel: number
  /** Percentage of portfolio to hedge (0-1, e.g., 0.5 = hedge 50% of portfolio) */
  hedgeRatio: number
  /** Annual cost of hedging as percentage of hedged amount (e.g., 0.02 = 2% annual cost) */
  annualCost: number
  /** Rebalancing frequency in months (1, 3, 6, 12) */
  rebalancingMonths: number
}

/**
 * Result of tail-risk hedging calculation for a single year
 */
export interface TailRiskHedgingResult {
  /** Original portfolio return before hedging */
  originalReturn: number
  /** Portfolio return after hedging costs */
  returnAfterCosts: number
  /** Return from hedging instrument (positive if hedge paid off) */
  hedgingReturn: number
  /** Total cost of hedging for the year */
  hedgingCost: number
  /** Whether the hedge was triggered (market loss exceeded protection threshold) */
  hedgeTriggered: boolean
  /** Amount of loss prevented by the hedge */
  lossPreventedAmount: number
  /** Net benefit of hedging (loss prevented minus costs) */
  netBenefit: number
}

/**
 * Summary statistics for tail-risk hedging over multiple years
 */
export interface TailRiskHedgingSummary {
  /** Total hedging costs over the period */
  totalCosts: number
  /** Total losses prevented by hedging */
  totalLossesPrevented: number
  /** Net benefit (losses prevented minus costs) */
  netBenefit: number
  /** Number of years the hedge was triggered */
  yearsHedgeTriggered: number
  /** Total years analyzed */
  totalYears: number
  /** Average annual cost as percentage */
  averageAnnualCostPercent: number
  /** Maximum single-year benefit from hedging */
  maxYearBenefit: number
  /** Portfolio value with hedging */
  finalValueWithHedging: number
  /** Portfolio value without hedging */
  finalValueWithoutHedging: number
}

/**
 * Default configuration for tail-risk hedging
 */
export function getDefaultTailRiskHedgingConfig(): TailRiskHedgingConfig {
  return {
    enabled: false,
    strategy: 'protective-put',
    protectionLevel: 0.85, // Protect against losses below 85% of portfolio value
    hedgeRatio: 0.5, // Hedge 50% of portfolio
    annualCost: 0.02, // 2% annual cost
    rebalancingMonths: 12, // Annual rebalancing
  }
}

/**
 * Strategy display names in German
 */
export const HEDGING_STRATEGY_NAMES: Record<HedgingStrategy, string> = {
  none: 'Keine Absicherung',
  'protective-put': 'Protective Put (Put-Optionen)',
  'dynamic-cppi': 'CPPI (Constant Proportion Portfolio Insurance)',
  'tail-risk-fund': 'Tail-Risk Fonds',
  'systematic-rebalancing': 'Systematisches Rebalancing',
}

/**
 * Strategy descriptions in German
 */
export const HEDGING_STRATEGY_DESCRIPTIONS: Record<HedgingStrategy, string> = {
  none: 'Portfolio ohne zusätzliche Absicherung gegen Tail-Risiken',
  'protective-put':
    'Kauf von Put-Optionen zum Schutz vor Kursverlusten. Bietet definierten Schutz zu bekannten Kosten (Optionsprämie).',
  'dynamic-cppi':
    'Dynamische Portfolioabsicherung durch Anpassung der Aktienquote basierend auf Marktbewegungen. Schützt Kapital durch automatisches Umschichten.',
  'tail-risk-fund':
    'Investition in spezialisierte Tail-Risk Fonds, die von extremen Marktbewegungen profitieren (z.B. durch Volatilitätsstrategien).',
  'systematic-rebalancing':
    'Regelmäßiges Rebalancing mit Stop-Loss-Mechanismen zum Schutz vor größeren Verlusten.',
}

/**
 * Calculate the cost of hedging for a given year
 *
 * @param config - Tail-risk hedging configuration
 * @param portfolioValue - Current portfolio value
 * @returns Annual hedging cost
 */
export function calculateHedgingCost(config: TailRiskHedgingConfig, portfolioValue: number): number {
  if (!config.enabled || config.strategy === 'none') {
    return 0
  }

  // Base cost is annual cost * hedged amount
  const hedgedAmount = portfolioValue * config.hedgeRatio
  let baseCost = hedgedAmount * config.annualCost

  // Strategy-specific cost adjustments
  switch (config.strategy) {
    case 'protective-put':
      // Put options typically cost 2-4% annually
      baseCost = hedgedAmount * Math.max(config.annualCost, 0.02)
      break
    case 'dynamic-cppi':
      // CPPI has lower costs but opportunity cost
      baseCost = hedgedAmount * Math.min(config.annualCost, 0.015)
      break
    case 'tail-risk-fund':
      // Tail-risk funds typically have higher fees
      baseCost = hedgedAmount * Math.max(config.annualCost, 0.015)
      break
    case 'systematic-rebalancing':
      // Lowest cost, mainly transaction costs
      baseCost = hedgedAmount * Math.min(config.annualCost, 0.01)
      break
    default:
      break
  }

  return baseCost
}

/**
 * Calculate payout for a specific hedging strategy
 */
function calculateStrategyPayout(
  strategy: HedgingStrategy,
  protectedLoss: number,
  hedgedAmount: number,
  loss: number,
  hedgeRatio: number,
  marketReturn: number,
): number {
  switch (strategy) {
    case 'protective-put':
      // Put option pays out based on hedged amount and actual loss
      // Limited by the smaller of: protected loss or hedged amount's exposure
      return Math.min(protectedLoss * hedgeRatio, hedgedAmount * Math.abs(marketReturn))
    case 'dynamic-cppi':
      return protectedLoss * 0.7 * hedgeRatio
    case 'tail-risk-fund':
      return Math.min(loss * 2.5 * hedgeRatio, hedgedAmount * 0.5)
    case 'systematic-rebalancing':
      return protectedLoss * 0.5 * hedgeRatio
    default:
      return 0
  }
}

/**
 * Calculate hedging benefit when market drops below protection level
 *
 * @param config - Tail-risk hedging configuration
 * @param portfolioValue - Portfolio value at start of year
 * @param marketReturn - Market return for the year (negative for losses)
 * @returns Hedging payout amount
 */
export function calculateHedgingBenefit(
  config: TailRiskHedgingConfig,
  portfolioValue: number,
  marketReturn: number,
): number {
  if (!config.enabled || config.strategy === 'none' || marketReturn >= 0) {
    return 0
  }

  const endValue = portfolioValue * (1 + marketReturn)
  const protectionThreshold = portfolioValue * config.protectionLevel

  // Check if protection threshold was breached
  if (endValue >= protectionThreshold) {
    return 0
  }

  const loss = portfolioValue - endValue
  const protectedLoss = portfolioValue - protectionThreshold
  const hedgedAmount = portfolioValue * config.hedgeRatio

  const payout = calculateStrategyPayout(
    config.strategy,
    protectedLoss,
    hedgedAmount,
    loss,
    config.hedgeRatio,
    marketReturn,
  )

  return Math.max(0, payout)
}

/**
 * Calculate tail-risk hedging result for a single year
 *
 * @param config - Tail-risk hedging configuration
 * @param portfolioValue - Portfolio value at start of year
 * @param marketReturn - Market return for the year
 * @returns Hedging result for the year
 */
export function calculateYearlyHedgingResult(
  config: TailRiskHedgingConfig,
  portfolioValue: number,
  marketReturn: number,
): TailRiskHedgingResult {
  if (!config.enabled) {
    return {
      originalReturn: marketReturn,
      returnAfterCosts: marketReturn,
      hedgingReturn: 0,
      hedgingCost: 0,
      hedgeTriggered: false,
      lossPreventedAmount: 0,
      netBenefit: 0,
    }
  }

  const hedgingCost = calculateHedgingCost(config, portfolioValue)
  const hedgingBenefit = calculateHedgingBenefit(config, portfolioValue, marketReturn)

  const originalEndValue = portfolioValue * (1 + marketReturn)
  const hedgeTriggered = hedgingBenefit > 0
  const endValueWithHedging = originalEndValue - hedgingCost + hedgingBenefit

  const returnAfterCosts = (endValueWithHedging - portfolioValue) / portfolioValue
  const hedgingReturn = hedgingBenefit / portfolioValue
  const netBenefit = hedgingBenefit - hedgingCost

  return {
    originalReturn: marketReturn,
    returnAfterCosts,
    hedgingReturn,
    hedgingCost,
    hedgeTriggered,
    lossPreventedAmount: hedgingBenefit,
    netBenefit,
  }
}

/**
 * Calculate tail-risk hedging summary over multiple years
 *
 * @param config - Tail-risk hedging configuration
 * @param yearlyData - Array of {portfolioValue, marketReturn} for each year
 * @returns Summary statistics for the hedging strategy
 */
export function calculateHedgingSummary(
  config: TailRiskHedgingConfig,
  yearlyData: Array<{ portfolioValue: number; marketReturn: number }>,
): TailRiskHedgingSummary {
  let totalCosts = 0
  let totalLossesPrevented = 0
  let yearsHedgeTriggered = 0
  let maxYearBenefit = 0
  let valueWithHedging = yearlyData[0]?.portfolioValue ?? 0
  let valueWithoutHedging = yearlyData[0]?.portfolioValue ?? 0

  for (const yearData of yearlyData) {
    const result = calculateYearlyHedgingResult(config, yearData.portfolioValue, yearData.marketReturn)

    totalCosts += result.hedgingCost
    totalLossesPrevented += result.lossPreventedAmount
    if (result.hedgeTriggered) {
      yearsHedgeTriggered++
    }
    maxYearBenefit = Math.max(maxYearBenefit, result.netBenefit)

    // Track cumulative values
    valueWithHedging *= 1 + result.returnAfterCosts
    valueWithoutHedging *= 1 + yearData.marketReturn
  }

  const netBenefit = totalLossesPrevented - totalCosts
  const averageAnnualCostPercent = yearlyData.length > 0 ? (totalCosts / yearlyData.length / valueWithoutHedging) * 100 : 0

  return {
    totalCosts,
    totalLossesPrevented,
    netBenefit,
    yearsHedgeTriggered,
    totalYears: yearlyData.length,
    averageAnnualCostPercent,
    maxYearBenefit,
    finalValueWithHedging: valueWithHedging,
    finalValueWithoutHedging: valueWithoutHedging,
  }
}

/**
 * Get typical cost range for a hedging strategy
 *
 * @param strategy - Hedging strategy
 * @returns [minCost, maxCost] as annual percentage
 */
export function getStrategyCostRange(strategy: HedgingStrategy): [number, number] {
  switch (strategy) {
    case 'none':
      return [0, 0]
    case 'protective-put':
      return [0.02, 0.04] // 2-4%
    case 'dynamic-cppi':
      return [0.01, 0.02] // 1-2%
    case 'tail-risk-fund':
      return [0.015, 0.03] // 1.5-3%
    case 'systematic-rebalancing':
      return [0.005, 0.015] // 0.5-1.5%
    default:
      return [0.01, 0.03]
  }
}

/**
 * Validate protection level
 */
function validateProtectionLevel(level: number): string | null {
  if (level < 0.5 || level > 1) {
    return 'Schutzniveau muss zwischen 50% und 100% liegen'
  }
  return null
}

/**
 * Validate hedge ratio
 */
function validateHedgeRatio(ratio: number): string | null {
  if (ratio < 0 || ratio > 1) {
    return 'Absicherungsquote muss zwischen 0% und 100% liegen'
  }
  return null
}

/**
 * Validate annual cost
 */
function validateAnnualCost(cost: number, strategy: HedgingStrategy): string | null {
  if (cost < 0 || cost > 0.1) {
    return 'Jährliche Kosten müssen zwischen 0% und 10% liegen'
  }

  const [minCost, maxCost] = getStrategyCostRange(strategy)
  if (cost < minCost * 0.5 || cost > maxCost * 2) {
    return `Unralistisch niedrige oder hohe Kosten für ${HEDGING_STRATEGY_NAMES[strategy]}. Typischer Bereich: ${(minCost * 100).toFixed(1)}%-${(maxCost * 100).toFixed(1)}%`
  }

  return null
}

/**
 * Validate rebalancing frequency
 */
function validateRebalancingFrequency(months: number): string | null {
  if (![1, 3, 6, 12].includes(months)) {
    return 'Rebalancing-Frequenz muss 1, 3, 6 oder 12 Monate sein'
  }
  return null
}

/**
 * Validate tail-risk hedging configuration
 *
 * @param config - Configuration to validate
 * @returns Error message if invalid, null if valid
 */
export function validateHedgingConfig(config: TailRiskHedgingConfig): string | null {
  if (!config.enabled) {
    return null
  }

  return (
    validateProtectionLevel(config.protectionLevel) ||
    validateHedgeRatio(config.hedgeRatio) ||
    validateAnnualCost(config.annualCost, config.strategy) ||
    validateRebalancingFrequency(config.rebalancingMonths)
  )
}
