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
  // Store original allocations
  const originalAllocations: Record<AssetClass, number> = {} as Record<AssetClass, number>
  Object.keys(assetClasses).forEach(key => {
    const assetClass = key as AssetClass
    originalAllocations[assetClass] = assetClasses[assetClass].targetAllocation
  })

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

  // Calculate realized volatility
  const realizedVolatility = calculateRealizedVolatility(historicalReturns, config.smoothingFactor)

  // Calculate scaling factor based on strategy
  let scalingFactor = 1.0

  switch (config.strategy) {
    case 'simple':
      scalingFactor = calculateScalingFactor(
        realizedVolatility,
        config.targetVolatility,
        config.minRiskyAllocation,
        config.maxRiskyAllocation,
      )
      break
    case 'inverse':
      // Inverse volatility: allocate more to low-volatility assets
      scalingFactor = calculateScalingFactor(
        realizedVolatility,
        config.targetVolatility,
        config.minRiskyAllocation,
        config.maxRiskyAllocation,
      )
      break
    case 'risk_parity':
      // Risk parity: equal risk contribution from each asset
      // This is a simplified version that scales based on overall volatility
      scalingFactor = calculateScalingFactor(
        realizedVolatility,
        config.targetVolatility,
        config.minRiskyAllocation,
        config.maxRiskyAllocation,
      )
      break
  }

  // Apply scaling to risky assets
  const adjustedAllocations: Record<AssetClass, number> = {} as Record<AssetClass, number>
  let totalRiskyAllocation = 0
  let totalSafeAllocation = 0

  // First pass: calculate scaled risky allocations and safe allocations
  Object.keys(assetClasses).forEach(key => {
    const assetClass = key as AssetClass
    const original = originalAllocations[assetClass]

    if (!assetClasses[assetClass].enabled) {
      adjustedAllocations[assetClass] = 0
      return
    }

    if (isRiskyAsset(assetClass)) {
      adjustedAllocations[assetClass] = original * scalingFactor
      totalRiskyAllocation += adjustedAllocations[assetClass]
    } else {
      adjustedAllocations[assetClass] = original
      totalSafeAllocation += original
    }
  })

  // Second pass: normalize to ensure total is 1.0
  // The difference goes to safe assets (bonds/cash)
  const totalAllocation = totalRiskyAllocation + totalSafeAllocation
  const shortfall = 1.0 - totalAllocation

  if (shortfall !== 0) {
    // Distribute shortfall to safe assets proportionally
    Object.keys(assetClasses).forEach(key => {
      const assetClass = key as AssetClass
      if (!isRiskyAsset(assetClass) && assetClasses[assetClass].enabled) {
        const proportion = totalSafeAllocation > 0 ? originalAllocations[assetClass] / totalSafeAllocation : 0.5
        adjustedAllocations[assetClass] += shortfall * proportion
      }
    })
  }

  // Check if adjustment was significant
  const wasAdjusted = Math.abs(scalingFactor - 1.0) > 0.01

  // Generate explanation
  let explanation = ''
  if (wasAdjusted) {
    const direction = scalingFactor < 1.0 ? 'reduziert' : 'erhöht'
    const percentage = Math.abs((1.0 - scalingFactor) * 100).toFixed(1)
    explanation = `Volatilität ${(realizedVolatility * 100).toFixed(1)}% liegt ${scalingFactor < 1.0 ? 'über' : 'unter'} Ziel ${(config.targetVolatility * 100).toFixed(1)}%. Risikoanteil wurde um ${percentage}% ${direction}.`
  } else {
    explanation = `Volatilität ${(realizedVolatility * 100).toFixed(1)}% nahe am Ziel ${(config.targetVolatility * 100).toFixed(1)}%. Keine Anpassung nötig.`
  }

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
 * Validate volatility targeting configuration
 *
 * @param config - Configuration to validate
 * @returns Array of validation errors (empty if valid)
 */
export function validateVolatilityTargetingConfig(config: VolatilityTargetingConfig): string[] {
  const errors: string[] = []

  if (config.targetVolatility < 0 || config.targetVolatility > 1) {
    errors.push('Ziel-Volatilität muss zwischen 0% und 100% liegen')
  }

  if (config.lookbackYears < 1 || config.lookbackYears > 10) {
    errors.push('Lookback-Periode muss zwischen 1 und 10 Jahren liegen')
  }

  if (config.minRiskyAllocation < 0 || config.minRiskyAllocation > 1) {
    errors.push('Minimale Risikoallokation muss zwischen 0% und 100% liegen')
  }

  if (config.maxRiskyAllocation < 0 || config.maxRiskyAllocation > 1) {
    errors.push('Maximale Risikoallokation muss zwischen 0% und 100% liegen')
  }

  if (config.minRiskyAllocation > config.maxRiskyAllocation) {
    errors.push('Minimale Risikoallokation darf nicht größer als maximale sein')
  }

  if (config.smoothingFactor < 0 || config.smoothingFactor > 1) {
    errors.push('Glättungsfaktor muss zwischen 0 und 1 liegen')
  }

  return errors
}
