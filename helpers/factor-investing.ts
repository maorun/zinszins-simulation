/**
 * Factor Investing (Faktor-Investing) utilities
 *
 * Implements academically-proven factor models for enhanced portfolio returns:
 * - Value: Companies with low price-to-book ratios
 * - Growth: Companies with high earnings growth
 * - Small-Cap: Smaller market capitalization companies
 * - Momentum: Recent price performance winners
 *
 * Based on research by Fama-French and other academic studies
 */

/**
 * Available investment factors based on academic research
 */
export type InvestmentFactor = 'value' | 'growth' | 'small-cap' | 'momentum'

/**
 * Factor configuration with expected premiums and risks
 */
export interface FactorConfig {
  /** Display name in German */
  name: string
  /** Description of the factor */
  description: string
  /** Historical risk premium over market (e.g., 0.03 for 3% annual premium) */
  historicalPremium: number
  /** Additional volatility from the factor (e.g., 0.05 for 5% additional volatility) */
  additionalVolatility: number
  /** Factor exposure/loading (0-1, where 1 = 100% exposure) */
  exposure: number
  /** Whether this factor is enabled */
  enabled: boolean
  /** Academic research references */
  researchBasis: string
}

/**
 * Default factor configurations based on historical German/European data
 * Historical premiums are based on academic research (Fama-French, etc.)
 */
export const DEFAULT_FACTOR_CONFIGS: Record<InvestmentFactor, FactorConfig> = {
  value: {
    name: 'Value-Faktor',
    description:
      'Investiert in Unternehmen mit niedrigen Bewertungskennzahlen (Kurs-Buchwert-Verhältnis). Langfristig höhere Renditen, aber zyklische Performance.',
    historicalPremium: 0.025, // 2.5% annual premium over market
    additionalVolatility: 0.03, // 3% additional volatility
    exposure: 0.0, // Default: no exposure
    enabled: false,
    researchBasis: 'Fama-French Three-Factor Model (1992), Langfristige Daten zeigen Value-Premium in Europa',
  },
  growth: {
    name: 'Growth-Faktor',
    description:
      'Fokussiert auf Unternehmen mit hohem Gewinnwachstum und Wachstumspotenzial. Höhere Bewertungen, aber starkes Momentum.',
    historicalPremium: 0.015, // 1.5% annual premium over market
    additionalVolatility: 0.04, // 4% additional volatility
    exposure: 0.0, // Default: no exposure
    enabled: false,
    researchBasis: 'Wachstumsaktien zeigen in bestimmten Marktphasen Outperformance (tech-getrieben)',
  },
  'small-cap': {
    name: 'Small-Cap-Faktor',
    description:
      'Investiert in Unternehmen mit kleinerer Marktkapitalisierung. Höheres Risiko, aber langfristig höhere Renditen (Size Premium).',
    historicalPremium: 0.03, // 3% annual premium over market
    additionalVolatility: 0.06, // 6% additional volatility
    exposure: 0.0, // Default: no exposure
    enabled: false,
    researchBasis:
      'Fama-French Size Premium, MSCI Small Cap Europe zeigt langfristige Outperformance gegenüber Large Caps',
  },
  momentum: {
    name: 'Momentum-Faktor',
    description:
      'Investiert in Aktien mit positiver Kursentwicklung der letzten 6-12 Monate. Basiert auf Verhaltensfinanz-Effekten (Herdenverhalten).',
    historicalPremium: 0.04, // 4% annual premium over market
    additionalVolatility: 0.05, // 5% additional volatility
    exposure: 0.0, // Default: no exposure
    enabled: false,
    researchBasis: 'Carhart Four-Factor Model (1997), Momentum-Effekt robust über verschiedene Märkte',
  },
}

/**
 * Factor portfolio configuration combining multiple factors
 */
export interface FactorPortfolioConfig {
  /** Individual factor configurations */
  factors: Record<InvestmentFactor, FactorConfig>
  /** Whether factor investing is enabled */
  enabled: boolean
  /** Base portfolio return (before factor premiums) */
  baseReturn: number
  /** Base portfolio volatility (before factor impacts) */
  baseVolatility: number
}

/**
 * Create default factor portfolio configuration
 */
export function createDefaultFactorPortfolioConfig(
  baseReturn = 0.07,
  baseVolatility = 0.15,
): FactorPortfolioConfig {
  // Deep copy the default factor configs
  const factors = Object.entries(DEFAULT_FACTOR_CONFIGS).reduce(
    (acc, [key, config]) => {
      acc[key as InvestmentFactor] = { ...config }
      return acc
    },
    {} as Record<InvestmentFactor, FactorConfig>,
  )

  return {
    factors,
    enabled: false,
    baseReturn,
    baseVolatility,
  }
}

/**
 * Calculate the enhanced return including factor premiums
 *
 * @param config - Factor portfolio configuration
 * @returns Enhanced annual return including factor premiums
 */
export function calculateFactorEnhancedReturn(config: FactorPortfolioConfig): number {
  if (!config.enabled) {
    return config.baseReturn
  }

  let totalPremium = 0
  const factors = Object.values(config.factors)

  for (const factor of factors) {
    if (factor.enabled && factor.exposure > 0) {
      // Factor premium is weighted by exposure
      totalPremium += factor.historicalPremium * factor.exposure
    }
  }

  return config.baseReturn + totalPremium
}

/**
 * Calculate the enhanced volatility including factor risks
 *
 * @param config - Factor portfolio configuration
 * @returns Enhanced volatility including factor-specific risks
 */
export function calculateFactorEnhancedVolatility(config: FactorPortfolioConfig): number {
  if (!config.enabled) {
    return config.baseVolatility
  }

  let additionalVariance = 0
  const factors = Object.values(config.factors)

  for (const factor of factors) {
    if (factor.enabled && factor.exposure > 0) {
      // Additional variance is weighted by exposure squared (risk contribution)
      const factorVariance = Math.pow(factor.additionalVolatility * factor.exposure, 2)
      additionalVariance += factorVariance
    }
  }

  // Combine base variance with factor variances
  const baseVariance = Math.pow(config.baseVolatility, 2)
  const totalVariance = baseVariance + additionalVariance

  return Math.sqrt(totalVariance)
}

/**
 * Calculate factor tilt statistics for display
 */
export interface FactorTiltStats {
  /** Total expected return premium from factors */
  totalPremium: number
  /** Total additional risk from factors */
  totalAdditionalRisk: number
  /** Number of active factors */
  activeFactorsCount: number
  /** Enhanced Sharpe Ratio (assuming risk-free rate of 1%) */
  enhancedSharpeRatio: number
}

/**
 * Calculate comprehensive factor tilt statistics
 *
 * @param config - Factor portfolio configuration
 * @returns Factor tilt statistics
 */
export function calculateFactorTiltStats(config: FactorPortfolioConfig): FactorTiltStats {
  const enhancedReturn = calculateFactorEnhancedReturn(config)
  const enhancedVolatility = calculateFactorEnhancedVolatility(config)

  const totalPremium = enhancedReturn - config.baseReturn
  const totalAdditionalRisk = enhancedVolatility - config.baseVolatility

  const activeFactorsCount = Object.values(config.factors).filter(
    factor => factor.enabled && factor.exposure > 0,
  ).length

  const riskFreeRate = 0.01 // 1% risk-free rate assumption
  const enhancedSharpeRatio = (enhancedReturn - riskFreeRate) / enhancedVolatility

  return {
    totalPremium,
    totalAdditionalRisk,
    activeFactorsCount,
    enhancedSharpeRatio,
  }
}

/**
 * Get factor display name
 */
export function getFactorName(factor: InvestmentFactor): string {
  return DEFAULT_FACTOR_CONFIGS[factor].name
}

/**
 * Get factor description
 */
export function getFactorDescription(factor: InvestmentFactor): string {
  return DEFAULT_FACTOR_CONFIGS[factor].description
}

/**
 * Get all available factors
 */
export function getAllFactors(): InvestmentFactor[] {
  return Object.keys(DEFAULT_FACTOR_CONFIGS) as InvestmentFactor[]
}

/**
 * Validate factor exposure is within valid range (0-1)
 */
function validateFactorExposure(factorKey: string, factor: FactorConfig): string | null {
  if (factor.enabled && (factor.exposure < 0 || factor.exposure > 1)) {
    return `${factorKey}: Exposure muss zwischen 0% und 100% liegen`
  }
  return null
}

/**
 * Validate that conflicting factors don't exceed 100% total exposure
 */
function validateConflictingFactors(config: FactorPortfolioConfig): string | null {
  const valueEnabled = config.factors.value.enabled && config.factors.value.exposure > 0
  const growthEnabled = config.factors.growth.enabled && config.factors.growth.exposure > 0

  if (valueEnabled && growthEnabled) {
    const totalExposure = config.factors.value.exposure + config.factors.growth.exposure
    if (totalExposure > 1) {
      return 'Value und Growth sind gegensätzliche Faktoren. Gesamtexposure sollte maximal 100% betragen.'
    }
  }
  return null
}

/**
 * Validate factor configuration
 * Ensures exposures are within valid ranges
 */
export function validateFactorConfig(config: FactorPortfolioConfig): string[] {
  const errors: string[] = []

  // Validate each factor exposure
  for (const [factorKey, factor] of Object.entries(config.factors)) {
    const error = validateFactorExposure(factorKey, factor)
    if (error) {
      errors.push(error)
    }
  }

  // Validate conflicting factor combinations
  const conflictError = validateConflictingFactors(config)
  if (conflictError) {
    errors.push(conflictError)
  }

  return errors
}

/**
 * Format factor exposure as percentage
 */
export function formatFactorExposure(exposure: number): string {
  return `${(exposure * 100).toFixed(0)}%`
}

/**
 * Format factor premium as percentage
 */
export function formatFactorPremium(premium: number): string {
  const sign = premium >= 0 ? '+' : ''
  return `${sign}${(premium * 100).toFixed(2)}%`
}
