/**
 * Glide Path (Gleitpfad) - Age-based dynamic asset allocation
 *
 * This module implements automatic portfolio risk adjustment based on age,
 * following the German "Lebensalter-Faustformel" (equity quota = 100 - age).
 *
 * Key Concepts:
 * - Gradually reduce risk exposure as investor approaches retirement
 * - Start with high equity allocation in youth, shift to bonds near retirement
 * - Multiple adjustment curves: linear, convex, concave
 * - Integration with multi-asset portfolio system
 */

import type { AssetClass, AssetClassConfig } from './multi-asset-portfolio'

/**
 * Glide path adjustment curve types
 */
export type GlidePathCurve =
  | 'linear' // Straight-line adjustment over time
  | 'convex' // Faster adjustment early (aggressive → conservative quickly)
  | 'concave' // Slower adjustment early (stay aggressive longer)

/**
 * Glide path configuration
 */
export interface GlidePathConfig {
  /** Whether glide path is enabled */
  enabled: boolean

  /** Starting equity allocation (e.g., 0.9 for 90% stocks at age 25) */
  startEquityAllocation: number

  /** Target equity allocation at retirement (e.g., 0.3 for 30% stocks at age 67) */
  targetEquityAllocation: number

  /** Starting age for the glide path (typically current age) */
  startAge: number

  /** Target age for reaching target allocation (typically retirement age) */
  targetAge: number

  /** Adjustment curve type */
  curve: GlidePathCurve

  /** Whether to use German "Lebensalter-Faustformel" (100 - age) */
  useGermanFormula: boolean

  /** Custom formula offset (used with German formula: offset - age) */
  formulaOffset: number
}

/**
 * Result of glide path calculation
 */
export interface GlidePathResult {
  /** Current age in the calculation */
  currentAge: number

  /** Calculated equity allocation for this age */
  equityAllocation: number

  /** Calculated bond allocation for this age */
  bondAllocation: number

  /** Years until target retirement age */
  yearsToRetirement: number

  /** Progress through glide path (0-1, where 1 is fully transitioned) */
  glidePathProgress: number

  /** Adjusted asset allocations following glide path */
  adjustedAllocations: Record<AssetClass, number>

  /** Original allocations before glide path adjustment */
  originalAllocations: Record<AssetClass, number>

  /** Whether allocations were adjusted */
  wasAdjusted: boolean

  /** Explanation of the adjustment in German */
  explanation: string
}

/**
 * Create default glide path configuration
 */
export function createDefaultGlidePathConfig(): GlidePathConfig {
  return {
    enabled: false,
    startEquityAllocation: 0.9, // 90% stocks at start
    targetEquityAllocation: 0.3, // 30% stocks at retirement
    startAge: 25, // Starting age
    targetAge: 67, // German standard retirement age
    curve: 'linear',
    useGermanFormula: false, // Use custom allocation by default
    formulaOffset: 100, // For German formula: 100 - age
  }
}

/**
 * Calculate equity allocation based on age using German formula
 *
 * @param age - Current age
 * @param offset - Formula offset (default 100 for "100 - age")
 * @returns Equity allocation (0-1)
 */
export function calculateGermanFormulaAllocation(age: number, offset = 100): number {
  // German "Lebensalter-Faustformel": Aktienquote = Offset - Lebensalter
  const equityPercentage = Math.max(0, Math.min(100, offset - age))
  return equityPercentage / 100
}

/**
 * Calculate progress through glide path
 *
 * @param currentAge - Current age
 * @param startAge - Starting age
 * @param targetAge - Target retirement age
 * @returns Progress (0-1)
 */
function calculateProgress(currentAge: number, startAge: number, targetAge: number): number {
  if (currentAge <= startAge) return 0
  if (currentAge >= targetAge) return 1

  const totalYears = targetAge - startAge
  const elapsedYears = currentAge - startAge

  return elapsedYears / totalYears
}

/**
 * Apply curve adjustment to linear progress
 *
 * @param progress - Linear progress (0-1)
 * @param curve - Curve type
 * @returns Adjusted progress (0-1)
 */
function applyCurveAdjustment(progress: number, curve: GlidePathCurve): number {
  switch (curve) {
    case 'linear':
      return progress

    case 'convex':
      // Faster adjustment early: x^0.5 (square root curve)
      return Math.sqrt(progress)

    case 'concave':
      // Slower adjustment early: x^2 (quadratic curve)
      return progress * progress

    default:
      return progress
  }
}

/**
 * Calculate equity allocation for a given age on the glide path
 *
 * @param config - Glide path configuration
 * @param currentAge - Current age to calculate allocation for
 * @returns Equity allocation (0-1)
 */
export function calculateEquityAllocation(config: GlidePathConfig, currentAge: number): number {
  // Use German formula if enabled
  if (config.useGermanFormula) {
    return calculateGermanFormulaAllocation(currentAge, config.formulaOffset)
  }

  // Calculate linear progress through glide path
  const linearProgress = calculateProgress(currentAge, config.startAge, config.targetAge)

  // Apply curve adjustment
  const adjustedProgress = applyCurveAdjustment(linearProgress, config.curve)

  // Calculate equity allocation by interpolating between start and target
  const allocationRange = config.startEquityAllocation - config.targetEquityAllocation
  const equityAllocation = config.startEquityAllocation - allocationRange * adjustedProgress

  // Ensure allocation is within valid range [0, 1]
  return Math.max(0, Math.min(1, equityAllocation))
}

/**
 * Categorize assets into equity-like and bond-like categories
 */
function categorizeAssets(enabledAssets: Array<[string, AssetClassConfig]>): {
  equityAssets: AssetClass[]
  bondAssets: AssetClass[]
  totalEquityAllocation: number
  totalBondAllocation: number
} {
  const equityAssets: AssetClass[] = []
  const bondAssets: AssetClass[] = []
  let totalEquityAllocation = 0
  let totalBondAllocation = 0

  enabledAssets.forEach(([assetClass, assetConfig]) => {
    const asset = assetClass as AssetClass
    const isEquityLike = assetConfig.taxCategory === 'equity' || assetConfig.taxCategory === 'reit'
    const isBondLike = assetConfig.taxCategory === 'bond' || assetConfig.taxCategory === 'cash'

    if (isEquityLike) {
      equityAssets.push(asset)
      totalEquityAllocation += assetConfig.targetAllocation
    } else if (isBondLike) {
      bondAssets.push(asset)
      totalBondAllocation += assetConfig.targetAllocation
    }
  })

  return { equityAssets, bondAssets, totalEquityAllocation, totalBondAllocation }
}

/**
 * Distribute target allocations across asset categories
 */
function distributeAllocations(
  equityAssets: AssetClass[],
  bondAssets: AssetClass[],
  assetClasses: Record<AssetClass, AssetClassConfig>,
  targetEquityAllocation: number,
  targetBondAllocation: number,
  totalEquityAllocation: number,
  totalBondAllocation: number,
): Record<AssetClass, number> {
  const adjustedAllocations: Record<AssetClass, number> = {} as Record<AssetClass, number>

  // Distribute equity allocation proportionally
  equityAssets.forEach((asset) => {
    const originalAllocation = assetClasses[asset].targetAllocation
    const proportion = totalEquityAllocation > 0 ? originalAllocation / totalEquityAllocation : 0
    adjustedAllocations[asset] = targetEquityAllocation * proportion
  })

  // Distribute bond allocation proportionally
  bondAssets.forEach((asset) => {
    const originalAllocation = assetClasses[asset].targetAllocation
    const proportion = totalBondAllocation > 0 ? originalAllocation / totalBondAllocation : 0
    adjustedAllocations[asset] = targetBondAllocation * proportion
  })

  // If no bond assets exist, allocate remaining to cash
  if (bondAssets.length === 0 && targetBondAllocation > 0) {
    adjustedAllocations.cash = targetBondAllocation
  }

  return adjustedAllocations
}

/**
 * Generate explanation text for glide path adjustment
 */
function generateExplanation(
  config: GlidePathConfig,
  currentAge: number,
  targetEquityAllocation: number,
  targetBondAllocation: number,
  yearsToRetirement: number,
  adjustedProgress: number,
): string {
  const curveText =
    config.curve === 'linear'
      ? 'linearer'
      : config.curve === 'convex'
        ? 'konvexer (schnell früh)'
        : 'konkaver (langsam früh)'

  const formulaText = config.useGermanFormula
    ? `Lebensalter-Faustformel (${config.formulaOffset} - Alter)`
    : `benutzerdefinierter ${curveText} Gleitpfad`

  return `Gleitpfad aktiv: ${formulaText}. Alter ${currentAge}, ${(targetEquityAllocation * 100).toFixed(0)}% Aktien, ${(targetBondAllocation * 100).toFixed(0)}% Anleihen. ${yearsToRetirement} Jahre bis Rente (${(adjustedProgress * 100).toFixed(0)}% Fortschritt).`
}

/**
 * Calculate progress metrics for glide path
 */
function calculateProgressMetrics(
  config: GlidePathConfig,
  currentAge: number,
): {
  targetEquityAllocation: number
  targetBondAllocation: number
  progress: number
  adjustedProgress: number
  yearsToRetirement: number
} {
  const targetEquityAllocation = calculateEquityAllocation(config, currentAge)
  const targetBondAllocation = 1 - targetEquityAllocation
  const progress = calculateProgress(currentAge, config.startAge, config.targetAge)
  const adjustedProgress = applyCurveAdjustment(progress, config.curve)
  const yearsToRetirement = Math.max(0, config.targetAge - currentAge)

  return {
    targetEquityAllocation,
    targetBondAllocation,
    progress,
    adjustedProgress,
    yearsToRetirement,
  }
}

/**
 * Create disabled glide path result
 */
function createDisabledResult(
  currentAge: number,
  targetAge: number,
  originalAllocations: Record<AssetClass, number>,
): GlidePathResult {
  return {
    currentAge,
    equityAllocation: 0,
    bondAllocation: 0,
    yearsToRetirement: targetAge - currentAge,
    glidePathProgress: 0,
    adjustedAllocations: { ...originalAllocations },
    originalAllocations,
    wasAdjusted: false,
    explanation: 'Gleitpfad deaktiviert - ursprüngliche Allokationen beibehalten',
  }
}

/**
 * Apply glide path adjustments to asset allocations
 *
 * @param config - Glide path configuration
 * @param assetClasses - Current asset class configurations
 * @param currentAge - Current age for calculation
 * @returns Glide path result with adjusted allocations
 */
export function applyGlidePath(
  config: GlidePathConfig,
  assetClasses: Record<AssetClass, AssetClassConfig>,
  currentAge: number,
): GlidePathResult {
  // Store original allocations
  const originalAllocations: Record<AssetClass, number> = {} as Record<AssetClass, number>
  const enabledAssets = Object.entries(assetClasses).filter(([, assetConfig]) => assetConfig.enabled)

  enabledAssets.forEach(([assetClass, assetConfig]) => {
    originalAllocations[assetClass as AssetClass] = assetConfig.targetAllocation
  })

  // If glide path is disabled, return original allocations
  if (!config.enabled) {
    return createDisabledResult(currentAge, config.targetAge, originalAllocations)
  }

  // Calculate progress metrics
  const { targetEquityAllocation, targetBondAllocation, adjustedProgress, yearsToRetirement } =
    calculateProgressMetrics(config, currentAge)

  // Categorize and distribute allocations
  const { equityAssets, bondAssets, totalEquityAllocation, totalBondAllocation } = categorizeAssets(enabledAssets)

  const adjustedAllocations = distributeAllocations(
    equityAssets,
    bondAssets,
    assetClasses,
    targetEquityAllocation,
    targetBondAllocation,
    totalEquityAllocation,
    totalBondAllocation,
  )

  const explanation = generateExplanation(
    config,
    currentAge,
    targetEquityAllocation,
    targetBondAllocation,
    yearsToRetirement,
    adjustedProgress,
  )

  return {
    currentAge,
    equityAllocation: targetEquityAllocation,
    bondAllocation: targetBondAllocation,
    yearsToRetirement,
    glidePathProgress: adjustedProgress,
    adjustedAllocations,
    originalAllocations,
    wasAdjusted: true,
    explanation,
  }
}

/**
 * Validate age ranges
 */
function validateAges(config: GlidePathConfig, errors: string[]): void {
  if (config.startAge < 18) {
    errors.push('Startalter muss mindestens 18 Jahre sein')
  }
  if (config.targetAge > 100) {
    errors.push('Zielalter darf maximal 100 Jahre sein')
  }
  if (config.startAge >= config.targetAge) {
    errors.push('Startalter muss kleiner als Zielalter sein')
  }
}

/**
 * Validate equity allocations
 */
function validateAllocations(config: GlidePathConfig, errors: string[]): void {
  const startInvalid = config.startEquityAllocation < 0 || config.startEquityAllocation > 1
  const targetInvalid = config.targetEquityAllocation < 0 || config.targetEquityAllocation > 1

  if (startInvalid) {
    errors.push('Start-Aktienquote muss zwischen 0% und 100% liegen')
  }
  if (targetInvalid) {
    errors.push('Ziel-Aktienquote muss zwischen 0% und 100% liegen')
  }
  if (config.startEquityAllocation <= config.targetEquityAllocation) {
    errors.push('Start-Aktienquote sollte höher als Ziel-Aktienquote sein')
  }
}

/**
 * Validate formula offset
 */
function validateFormulaOffset(config: GlidePathConfig, errors: string[]): void {
  const offsetInvalid = config.formulaOffset < 50 || config.formulaOffset > 120
  if (config.useGermanFormula && offsetInvalid) {
    errors.push('Formel-Offset sollte zwischen 50 und 120 liegen')
  }
}

/**
 * Validate glide path configuration
 *
 * @param config - Glide path configuration to validate
 * @returns Array of validation error messages (empty if valid)
 */
export function validateGlidePathConfig(config: GlidePathConfig): string[] {
  const errors: string[] = []

  validateAges(config, errors)
  validateAllocations(config, errors)
  validateFormulaOffset(config, errors)

  return errors
}

/**
 * Get description of glide path curve
 *
 * @param curve - Curve type
 * @returns German description of the curve
 */
export function getGlidePathCurveDescription(curve: GlidePathCurve): string {
  switch (curve) {
    case 'linear':
      return 'Lineare Anpassung - Gleichmäßige Reduzierung der Aktienquote über die Zeit'
    case 'convex':
      return 'Konvexe Anpassung - Schnelle Reduzierung zu Beginn, langsamer gegen Ende (Vorsichtig)'
    case 'concave':
      return 'Konkave Anpassung - Langsame Reduzierung zu Beginn, schneller gegen Ende (Aggressiv)'
    default:
      return 'Unbekannte Kurvenform'
  }
}
