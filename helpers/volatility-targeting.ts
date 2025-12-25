/**
 * Volatility Targeting - Dynamic allocation based on market volatility
 *
 * This module implements volatility targeting strategies that dynamically adjust
 * portfolio allocation based on realized and expected volatility levels.
 *
 * Key Concepts:
 * - When volatility is high, reduce risk exposure (shift to safer assets)
 * - When volatility is low, increase risk exposure (shift to riskier assets)
 * - Maintain a target volatility level for more consistent risk exposure
 */

import type { AssetClass, AssetClassConfig } from './multi-asset-portfolio'

/**
 * Volatility targeting strategy types
 */
export type VolatilityTargetingStrategy =
  | 'none' // No volatility targeting
  | 'simple' // Simple scaling based on realized volatility
  | 'inverse' // Inverse volatility weighting
  | 'risk_parity' // Risk parity approach (equal risk contribution)

/**
 * Volatility targeting configuration
 */
export interface VolatilityTargetingConfig {
  /** Whether volatility targeting is enabled */
  enabled: boolean

  /** Target volatility level (e.g., 0.10 for 10% annual volatility) */
  targetVolatility: number

  /** Strategy to use for volatility targeting */
  strategy: VolatilityTargetingStrategy

  /** Lookback period in years for calculating realized volatility */
  lookbackYears: number

  /** Minimum allocation to risky assets (prevents going to 100% cash) */
  minRiskyAllocation: number

  /** Maximum allocation to risky assets (prevents over-leveraging) */
  maxRiskyAllocation: number

  /** Smoothing factor for volatility estimates (0-1, higher = more smoothing) */
  smoothingFactor: number
}

/**
 * Result of volatility targeting calculation
 */
export interface VolatilityTargetingResult {
  /** Realized portfolio volatility based on recent returns */
  realizedVolatility: number

  /** Target volatility from configuration */
  targetVolatility: number

  /** Scaling factor to apply to risky assets (e.g., 0.8 = reduce to 80%) */
  scalingFactor: number

  /** Adjusted asset allocations */
  adjustedAllocations: Record<AssetClass, number>

  /** Original allocations before adjustment */
  originalAllocations: Record<AssetClass, number>

  /** Whether allocations were adjusted */
  wasAdjusted: boolean

  /** Explanation of the adjustment in German */
  explanation: string
}

/**
 * Historical return data for volatility calculation
 */
export interface HistoricalReturns {
  /** Array of historical portfolio returns */
  returns: number[]

  /** Number of periods in the data */
  periods: number
}

/**
 * Create default volatility targeting configuration
 */
export function createDefaultVolatilityTargetingConfig(): VolatilityTargetingConfig {
  return {
    enabled: false,
    targetVolatility: 0.1, // 10% target volatility
    strategy: 'simple',
    lookbackYears: 3, // Use 3 years of historical data
    minRiskyAllocation: 0.2, // Minimum 20% in risky assets
    maxRiskyAllocation: 1.0, // Maximum 100% in risky assets
    smoothingFactor: 0.3, // 30% smoothing (exponential weighted moving average)
  }
}

/**
 * Calculate realized volatility from historical returns
 *
 * @param historicalReturns - Historical return data
 * @param smoothingFactor - Smoothing factor for exponential weighting (0-1)
 * @returns Annualized volatility
 */
export function calculateRealizedVolatility(
  historicalReturns: HistoricalReturns,
  smoothingFactor = 0.3,
): number {
  const { returns } = historicalReturns

  if (returns.length === 0) {
    return 0
  }

  // Calculate mean return
  const meanReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length

  // Calculate variance with exponential weighting (more recent data weighted higher)
  let weightedVariance = 0
  let totalWeight = 0

  returns.forEach((ret, index) => {
    // Weight recent returns more heavily
    const weight = Math.exp(smoothingFactor * index)
    const deviation = ret - meanReturn
    weightedVariance += weight * deviation * deviation
    totalWeight += weight
  })

  const variance = weightedVariance / totalWeight

  // Return standard deviation (volatility)
  return Math.sqrt(variance)
}

/**
 * Calculate scaling factor for simple volatility targeting
 *
 * @param realizedVolatility - Current realized volatility
 * @param targetVolatility - Target volatility level
 * @param minScale - Minimum scaling factor
 * @param maxScale - Maximum scaling factor
 * @returns Scaling factor to apply to risky assets
 */
export function calculateScalingFactor(
  realizedVolatility: number,
  targetVolatility: number,
  minScale = 0.2,
  maxScale = 1.0,
): number {
  if (realizedVolatility === 0) {
    return 1.0
  }

  // Simple inverse relationship: scale = target / realized
  const rawScale = targetVolatility / realizedVolatility

  // Constrain to min/max bounds
  return Math.max(minScale, Math.min(maxScale, rawScale))
}

/**
 * Classify assets as risky or safe
 *
 * @param assetClass - Asset class to classify
 * @returns true if risky, false if safe
 */
export function isRiskyAsset(assetClass: AssetClass): boolean {
  const safeAssets: AssetClass[] = ['bonds_government', 'cash']
  return !safeAssets.includes(assetClass)
}

/**
 * Extract original allocations from asset classes
 */
function extractOriginalAllocations(assetClasses: Record<AssetClass, AssetClassConfig>): Record<AssetClass, number> {
  const allocations: Record<AssetClass, number> = {} as Record<AssetClass, number>
  Object.keys(assetClasses).forEach(key => {
    const assetClass = key as AssetClass
    allocations[assetClass] = assetClasses[assetClass].targetAllocation
  })
  return allocations
}

/**
 * Calculate strategy-based scaling factor
 * Note: Currently all strategies use the same calculation method.
 * This function provides a placeholder for future strategy-specific implementations.
 */
function getStrategyScalingFactor(
  _strategy: VolatilityTargetingStrategy,
  realizedVolatility: number,
  config: VolatilityTargetingConfig,
): number {
  return calculateScalingFactor(
    realizedVolatility,
    config.targetVolatility,
    config.minRiskyAllocation,
    config.maxRiskyAllocation,
  )
}

/**
 * Apply scaling to asset allocations
 */
function applyScalingToAllocations(
  assetClasses: Record<AssetClass, AssetClassConfig>,
  originalAllocations: Record<AssetClass, number>,
  scalingFactor: number,
): { adjusted: Record<AssetClass, number>; totalRisky: number; totalSafe: number } {
  const adjusted: Record<AssetClass, number> = {} as Record<AssetClass, number>
  let totalRisky = 0
  let totalSafe = 0

  Object.keys(assetClasses).forEach(key => {
    const assetClass = key as AssetClass
    const original = originalAllocations[assetClass]

    if (!assetClasses[assetClass].enabled) {
      adjusted[assetClass] = 0
      return
    }

    if (isRiskyAsset(assetClass)) {
      adjusted[assetClass] = original * scalingFactor
      totalRisky += adjusted[assetClass]
    } else {
      adjusted[assetClass] = original
      totalSafe += original
    }
  })

  return { adjusted, totalRisky, totalSafe }
}

/**
 * Normalize allocations to sum to 1.0
 */
function normalizeAllocations(
  assetClasses: Record<AssetClass, AssetClassConfig>,
  allocations: Record<AssetClass, number>,
  originalAllocations: Record<AssetClass, number>,
  totalSafe: number,
): Record<AssetClass, number> {
  const total = Object.values(allocations).reduce((sum, val) => sum + val, 0)
  const shortfall = 1.0 - total

  if (shortfall !== 0) {
    Object.keys(assetClasses).forEach(key => {
      const assetClass = key as AssetClass
      if (!isRiskyAsset(assetClass) && assetClasses[assetClass].enabled) {
        const proportion = totalSafe > 0 ? originalAllocations[assetClass] / totalSafe : 0.5
        allocations[assetClass] += shortfall * proportion
      }
    })
  }

  return allocations
}

/**
 * Generate explanation for volatility targeting adjustment
 */
function generateExplanation(
  realizedVolatility: number,
  targetVolatility: number,
  scalingFactor: number,
  wasAdjusted: boolean,
): string {
  if (!wasAdjusted) {
    return `Volatilität ${(realizedVolatility * 100).toFixed(1)}% nahe am Ziel ${(targetVolatility * 100).toFixed(1)}%. Keine Anpassung nötig.`
  }

  const direction = scalingFactor < 1.0 ? 'reduziert' : 'erhöht'
  const percentage = Math.abs((1.0 - scalingFactor) * 100).toFixed(1)
  const comparison = scalingFactor < 1.0 ? 'über' : 'unter'
  return `Volatilität ${(realizedVolatility * 100).toFixed(1)}% liegt ${comparison} Ziel ${(targetVolatility * 100).toFixed(1)}%. Risikoanteil wurde um ${percentage}% ${direction}.`
}

/**
 * Apply volatility targeting to asset allocations
 *
 * @param assetClasses - Current asset class configurations
 * @param historicalReturns - Historical return data for volatility calculation
 * @param config - Volatility targeting configuration
 * @returns Adjusted allocations and metrics
 */
export function applyVolatilityTargeting(
  assetClasses: Record<AssetClass, AssetClassConfig>,
  historicalReturns: HistoricalReturns,
  config: VolatilityTargetingConfig,
): VolatilityTargetingResult {
  const originalAllocations = extractOriginalAllocations(assetClasses)

  // If disabled, return original allocations
  if (!config.enabled || config.strategy === 'none') {
    return {
      realizedVolatility: 0,
      targetVolatility: config.targetVolatility,
      scalingFactor: 1.0,
      adjustedAllocations: originalAllocations,
      originalAllocations,
      wasAdjusted: false,
      explanation: 'Volatilitäts-Targeting ist deaktiviert',
    }
  }

  const realizedVolatility = calculateRealizedVolatility(historicalReturns, config.smoothingFactor)
  const scalingFactor = getStrategyScalingFactor(config.strategy, realizedVolatility, config)

  const { adjusted, totalSafe } = applyScalingToAllocations(assetClasses, originalAllocations, scalingFactor)
  const adjustedAllocations = normalizeAllocations(assetClasses, adjusted, originalAllocations, totalSafe)

  const wasAdjusted = Math.abs(scalingFactor - 1.0) > 0.01
  const explanation = generateExplanation(realizedVolatility, config.targetVolatility, scalingFactor, wasAdjusted)

  return {
    realizedVolatility,
    targetVolatility: config.targetVolatility,
    scalingFactor,
    adjustedAllocations,
    originalAllocations,
    wasAdjusted,
    explanation,
  }
}

/**
 * Get human-readable strategy name in German
 *
 * @param strategy - Volatility targeting strategy
 * @returns German name for the strategy
 */
export function getStrategyName(strategy: VolatilityTargetingStrategy): string {
  const names: Record<VolatilityTargetingStrategy, string> = {
    none: 'Keine',
    simple: 'Einfache Skalierung',
    inverse: 'Inverse Volatilitätsgewichtung',
    risk_parity: 'Risk Parity',
  }
  return names[strategy]
}

/**
 * Get strategy description in German
 *
 * @param strategy - Volatility targeting strategy
 * @returns Description of the strategy
 */
export function getStrategyDescription(strategy: VolatilityTargetingStrategy): string {
  const descriptions: Record<VolatilityTargetingStrategy, string> = {
    none: 'Keine dynamische Anpassung der Allokation',
    simple:
      'Skaliert riskante Assets basierend auf realisierter Volatilität. Bei hoher Volatilität wird Risikoanteil reduziert, bei niedriger erhöht.',
    inverse:
      'Gewichtet Assets invers zur Volatilität. Niedrig-volatile Assets erhalten höheres Gewicht für stabilere Gesamtrenditen.',
    risk_parity:
      'Zielt auf gleichen Risikobeitrag aller Assets ab. Balanciert Portfolio so, dass jedes Asset gleich viel zum Gesamtrisiko beiträgt.',
  }
  return descriptions[strategy]
}

/**
 * Helper to validate a range
 */
function validateRange(value: number, min: number, max: number, errorMessage: string): string | null {
  if (value < min || value > max) {
    return errorMessage
  }
  return null
}

/**
 * Validate volatility targeting configuration
 *
 * @param config - Configuration to validate
 * @returns Array of validation errors (empty if valid)
 */
export function validateVolatilityTargetingConfig(config: VolatilityTargetingConfig): string[] {
  const validations = [
    validateRange(config.targetVolatility, 0, 1, 'Ziel-Volatilität muss zwischen 0% und 100% liegen'),
    validateRange(config.lookbackYears, 1, 10, 'Lookback-Periode muss zwischen 1 und 10 Jahren liegen'),
    validateRange(config.minRiskyAllocation, 0, 1, 'Minimale Risikoallokation muss zwischen 0% und 100% liegen'),
    validateRange(config.maxRiskyAllocation, 0, 1, 'Maximale Risikoallokation muss zwischen 0% und 100% liegen'),
    validateRange(config.smoothingFactor, 0, 1, 'Glättungsfaktor muss zwischen 0 und 1 liegen'),
  ]

  const errors = validations.filter((e): e is string => e !== null)

  if (config.minRiskyAllocation > config.maxRiskyAllocation) {
    errors.push('Minimale Risikoallokation darf nicht größer als maximale sein')
  }

  return errors
}
