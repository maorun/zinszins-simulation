/**
 * ESG (Environmental, Social, Governance) Scoring System
 *
 * This module provides ESG scoring functionality for the multi-asset portfolio feature,
 * allowing investors to align their portfolio with sustainability and ethical criteria
 * according to EU regulations and German market standards.
 *
 * Key Principles:
 * - ESG scores based on EU taxonomy and SFDR (Sustainable Finance Disclosure Regulation)
 * - Asset class level scoring (not individual securities)
 * - Trade-off analysis between ESG criteria and financial returns
 * - Transparent methodology aligned with German retail investor needs
 */

import type { AssetClass } from './multi-asset-portfolio'

// Re-export AssetClass for use in tests and components
export type { AssetClass } from './multi-asset-portfolio'

/**
 * ESG scoring for each pillar (scale 1-10, where 10 is best)
 */
export interface ESGScore {
  /** Environmental score (climate impact, resource usage, pollution) */
  environmental: number
  /** Social score (labor practices, community impact, human rights) */
  social: number
  /** Governance score (board structure, ethics, transparency) */
  governance: number
  /** Overall ESG score (weighted average) */
  overall: number
}

/**
 * ESG filter configuration
 */
export interface ESGFilterConfig {
  /** Enable ESG filtering */
  enabled: boolean
  /** Minimum overall ESG score required (1-10 scale) */
  minimumOverallScore: number
  /** Minimum environmental score (optional, 1-10 scale) */
  minimumEnvironmentalScore?: number
  /** Minimum social score (optional, 1-10 scale) */
  minimumSocialScore?: number
  /** Minimum governance score (optional, 1-10 scale) */
  minimumGovernanceScore?: number
  /** Weight for environmental pillar (0-1, default 0.33) */
  environmentalWeight: number
  /** Weight for social pillar (0-1, default 0.33) */
  socialWeight: number
  /** Weight for governance pillar (0-1, default 0.34) */
  governanceWeight: number
}

/**
 * ESG scores for asset classes based on typical market data
 * These are representative scores for broad asset class categories
 *
 * Scoring methodology:
 * - 8-10: Excellent ESG performance, EU taxonomy aligned
 * - 6-7: Good ESG performance, some sustainability features
 * - 4-5: Average ESG performance, basic compliance
 * - 1-3: Poor ESG performance, significant concerns
 */
export const ASSET_CLASS_ESG_SCORES: Record<AssetClass, ESGScore> = {
  stocks_domestic: {
    environmental: 6,
    social: 7,
    governance: 8,
    overall: 7,
  },
  stocks_international: {
    environmental: 5,
    social: 6,
    governance: 7,
    overall: 6,
  },
  bonds_government: {
    environmental: 7,
    social: 8,
    governance: 9,
    overall: 8,
  },
  bonds_corporate: {
    environmental: 6,
    social: 7,
    governance: 8,
    overall: 7,
  },
  real_estate: {
    environmental: 5,
    social: 6,
    governance: 7,
    overall: 6,
  },
  commodities: {
    environmental: 3,
    social: 4,
    governance: 5,
    overall: 4,
  },
  cash: {
    environmental: 10,
    social: 10,
    governance: 10,
    overall: 10,
  },
}

/**
 * ESG category descriptions for German investors
 */
export const ESG_CATEGORY_DESCRIPTIONS: Record<AssetClass, string> = {
  stocks_domestic:
    'Deutsche/Europäische Aktien unterliegen strengen EU-Nachhaltigkeitsregeln (SFDR). Viele Unternehmen sind EU-Taxonomie-konform.',
  stocks_international:
    'Internationale Aktien haben unterschiedliche ESG-Standards. Fokus auf etablierte Märkte mit guten Governance-Strukturen.',
  bonds_government:
    'Staatsanleihen entwickelter Länder haben typischerweise gute ESG-Profile, insbesondere bei Governance.',
  bonds_corporate:
    'Unternehmensanleihen von EU-Unternehmen unterliegen SFDR-Offenlegungspflichten und zeigen zunehmende Nachhaltigkeitsorientierung.',
  real_estate:
    'REITs variieren stark in ihrer Nachhaltigkeit. Energieeffizienz und soziale Verantwortung werden zunehmend wichtiger.',
  commodities:
    'Rohstoffe haben oft niedrige ESG-Scores aufgrund von Umweltauswirkungen. Gold und Edelmetalle sind weniger problematisch.',
  cash:
    'Bargeld und Geldmarktfonds haben neutrale ESG-Auswirkungen und dienen primär der Liquiditätssicherung.',
}

/**
 * Calculate overall ESG score with custom weights
 *
 * @param environmental - Environmental score (1-10)
 * @param social - Social score (1-10)
 * @param governance - Governance score (1-10)
 * @param weights - Custom weights for each pillar
 * @returns Overall weighted ESG score
 */
export function calculateOverallESGScore(
  environmental: number,
  social: number,
  governance: number,
  weights: { environmental: number; social: number; governance: number } = {
    environmental: 1 / 3,
    social: 1 / 3,
    governance: 1 / 3,
  },
): number {
  const totalWeight = weights.environmental + weights.social + weights.governance
  return (
    (environmental * weights.environmental + social * weights.social + governance * weights.governance) / totalWeight
  )
}

/**
 * Check if an asset class meets ESG filter criteria
 *
 * @param assetClass - Asset class to check
 * @param config - ESG filter configuration
 * @returns True if asset class meets all criteria
 */
export function meetsESGCriteria(assetClass: AssetClass, config: ESGFilterConfig): boolean {
  if (!config.enabled) {
    return true
  }

  const score = ASSET_CLASS_ESG_SCORES[assetClass]

  return (
    meetsOverallScoreRequirement(score.overall, config.minimumOverallScore) &&
    meetsPillarRequirements(score, config)
  )
}

/**
 * Check if overall score meets minimum requirement
 */
function meetsOverallScoreRequirement(overallScore: number, minimumScore: number): boolean {
  return overallScore >= minimumScore
}

/**
 * Check if individual pillar scores meet requirements
 */
function meetsPillarRequirements(score: ESGScore, config: ESGFilterConfig): boolean {
  if (config.minimumEnvironmentalScore !== undefined && score.environmental < config.minimumEnvironmentalScore) {
    return false
  }

  if (config.minimumSocialScore !== undefined && score.social < config.minimumSocialScore) {
    return false
  }

  if (config.minimumGovernanceScore !== undefined && score.governance < config.minimumGovernanceScore) {
    return false
  }

  return true
}

/**
 * Get ESG score for an asset class
 *
 * @param assetClass - Asset class
 * @returns ESG score for the asset class
 */
export function getESGScore(assetClass: AssetClass): ESGScore {
  return ASSET_CLASS_ESG_SCORES[assetClass]
}

/**
 * Get ESG category description for an asset class
 *
 * @param assetClass - Asset class
 * @returns German description of ESG characteristics
 */
export function getESGDescription(assetClass: AssetClass): string {
  return ESG_CATEGORY_DESCRIPTIONS[assetClass]
}

/**
 * Calculate portfolio-weighted ESG score
 *
 * @param assetAllocations - Map of asset class to allocation percentage (0-1)
 * @param config - ESG filter configuration for weights
 * @returns Portfolio-weighted ESG score
 */
export function calculatePortfolioESGScore(
  assetAllocations: Partial<Record<AssetClass, number>>,
  config: ESGFilterConfig,
): ESGScore {
  let totalWeight = 0
  let weightedEnvironmental = 0
  let weightedSocial = 0
  let weightedGovernance = 0

  Object.entries(assetAllocations).forEach(([assetClass, allocation]) => {
    if (allocation && allocation > 0) {
      const score = ASSET_CLASS_ESG_SCORES[assetClass as AssetClass]
      weightedEnvironmental += score.environmental * allocation
      weightedSocial += score.social * allocation
      weightedGovernance += score.governance * allocation
      totalWeight += allocation
    }
  })

  if (totalWeight === 0) {
    return { environmental: 0, social: 0, governance: 0, overall: 0 }
  }

  const environmental = weightedEnvironmental / totalWeight
  const social = weightedSocial / totalWeight
  const governance = weightedGovernance / totalWeight
  const overall = calculateOverallESGScore(environmental, social, governance, {
    environmental: config.environmentalWeight,
    social: config.socialWeight,
    governance: config.governanceWeight,
  })

  return { environmental, social, governance, overall }
}

/**
 * Filter asset classes based on ESG criteria
 *
 * @param assetClasses - Array of asset classes to filter
 * @param config - ESG filter configuration
 * @returns Array of asset classes that meet ESG criteria
 */
export function filterAssetClassesByESG(assetClasses: AssetClass[], config: ESGFilterConfig): AssetClass[] {
  if (!config.enabled) {
    return assetClasses
  }

  return assetClasses.filter((assetClass) => meetsESGCriteria(assetClass, config))
}

/**
 * Create default ESG filter configuration
 *
 * @returns Default ESG filter configuration (disabled by default)
 */
export function createDefaultESGFilterConfig(): ESGFilterConfig {
  return {
    enabled: false,
    minimumOverallScore: 6, // Require "good" overall ESG score
    environmentalWeight: 1 / 3,
    socialWeight: 1 / 3,
    governanceWeight: 1 / 3,
  }
}

/**
 * Validate ESG filter configuration
 *
 * @param config - ESG filter configuration to validate
 * @returns Array of validation error messages (empty if valid)
 */
export function validateESGFilterConfig(config: ESGFilterConfig): string[] {
  return [
    ...validateScoreRanges(config),
    ...validateWeights(config),
  ]
}

/**
 * Validate score ranges
 */
function validateScoreRanges(config: ESGFilterConfig): string[] {
  const errors: string[] = []

  if (config.minimumOverallScore < 1 || config.minimumOverallScore > 10) {
    errors.push('Minimaler ESG-Score muss zwischen 1 und 10 liegen')
  }

  const pillarScores = [
    { score: config.minimumEnvironmentalScore, name: 'Umwelt-Score' },
    { score: config.minimumSocialScore, name: 'Sozial-Score' },
    { score: config.minimumGovernanceScore, name: 'Governance-Score' },
  ]

  pillarScores.forEach(({ score, name }) => {
    if (score !== undefined && (score < 1 || score > 10)) {
      errors.push(`Minimaler ${name} muss zwischen 1 und 10 liegen`)
    }
  })

  return errors
}

/**
 * Validate weights
 */
function validateWeights(config: ESGFilterConfig): string[] {
  const errors: string[] = []

  const totalWeight = config.environmentalWeight + config.socialWeight + config.governanceWeight
  if (Math.abs(totalWeight - 1.0) > 0.01) {
    errors.push('Gewichtungen müssen in Summe 1.0 (100%) ergeben')
  }

  const weights = [
    { weight: config.environmentalWeight, name: 'Umwelt-Gewichtung' },
    { weight: config.socialWeight, name: 'Sozial-Gewichtung' },
    { weight: config.governanceWeight, name: 'Governance-Gewichtung' },
  ]

  weights.forEach(({ weight, name }) => {
    if (weight < 0 || weight > 1) {
      errors.push(`${name} muss zwischen 0 und 1 liegen`)
    }
  })

  return errors
}

/**
 * Get ESG impact summary for filtering
 *
 * @param beforeFilter - Asset classes before ESG filtering
 * @param afterFilter - Asset classes after ESG filtering
 * @returns Summary of ESG filtering impact
 */
export function getESGFilterImpact(
  beforeFilter: AssetClass[],
  afterFilter: AssetClass[],
): {
  excluded: AssetClass[]
  included: AssetClass[]
  exclusionCount: number
} {
  const excluded = beforeFilter.filter((ac) => !afterFilter.includes(ac))
  const included = afterFilter

  return {
    excluded,
    included,
    exclusionCount: excluded.length,
  }
}
