/**
 * Pfändungsfreigrenzen (Garnishment Limits) Helper Functions
 *
 * This module implements calculations for garnishment-free amounts (Pfändungsfreigrenzen)
 * according to § 850c ZPO (German Code of Civil Procedure) and § 851c ZPO for retirement assets.
 *
 * German law context:
 * - § 850c ZPO: Defines income garnishment limits to protect livelihood
 * - § 851c ZPO: Protects retirement assets (Rürup-Rente, Riester-Rente) with limits
 * - Garnishment limits are updated annually on July 1st
 * - Current rates: Valid from July 1, 2024 to June 30, 2025
 */

/**
 * Garnishment limit configuration
 */
export interface PfaendungsfreigrenzeConfig {
  /** Monthly net income in EUR */
  monthlyNetIncome: number
  /** Number of dependents with maintenance obligations (Unterhaltspflichten) */
  numberOfDependents: number
  /** Year for calculation (affects the applicable limits) */
  year: number
}

/**
 * Asset protection configuration
 */
export interface AssetProtectionConfig {
  /** Rürup-Rente (Basis-Rente) accumulated capital in EUR */
  ruerupRenteCapital: number
  /** Riester-Rente accumulated capital in EUR */
  riesterRenteCapital: number
  /** Other private pension capital in EUR */
  otherPensionCapital: number
  /** Year for calculation */
  year: number
}

/**
 * Result of garnishment limit calculation
 */
export interface PfaendungsfreigrenzeResult {
  /** Total monthly net income */
  monthlyNetIncome: number
  /** Number of dependents */
  numberOfDependents: number
  /** Garnishment-free amount (protected income) */
  protectedAmount: number
  /** Garnishable amount */
  garnishableAmount: number
  /** Base protected amount (without dependents) */
  baseProtectedAmount: number
  /** Additional protected amount per dependent */
  additionalProtectionPerDependent: number[]
  /** Whether income is fully garnishable */
  isFullyGarnishable: boolean
}

/**
 * Result of asset protection assessment
 */
export interface AssetProtectionResult {
  /** Total retirement assets */
  totalAssets: number
  /** Protected Rürup-Rente amount */
  ruerupProtected: number
  /** Garnishable Rürup-Rente amount */
  ruerupGarnishable: number
  /** Protected Riester-Rente amount */
  riesterProtected: number
  /** Garnishable Riester-Rente amount */
  riesterGarnishable: number
  /** Protected other pension amount */
  otherProtected: number
  /** Garnishable other pension amount */
  otherGarnishable: number
  /** Total protected assets */
  totalProtected: number
  /** Total garnishable assets */
  totalGarnishable: number
  /** Recommendations for asset protection */
  recommendations: string[]
}

/**
 * Garnishment limits for 2024 (July 1, 2024 - June 30, 2025)
 * Source: § 850c ZPO, Bundesgesetzblatt
 */
const GARNISHMENT_LIMITS_2024 = {
  baseAmount: 1491.75, // Base protected amount without dependents
  firstDependent: 561.43, // Additional for first dependent
  additionalDependent: 312.78, // Additional per further dependent
  fullyGarnishableThreshold: 4573.1, // Above this, income is fully garnishable
}

/**
 * Asset protection limits according to § 851c ZPO
 */
const ASSET_PROTECTION_LIMITS = {
  ruerupAnnualContributionLimit: 7000, // Annual contribution limit for protection
  ruerupTotalCapitalLimit: 340000, // Total capital limit for full protection
  ruerupTripleLimit: 1020000, // Triple limit beyond which partial protection ends
  riesterFullProtection: true, // Riester is generally protected in accumulation phase
}

/**
 * Get garnishment limits for a specific year
 * @param year - Year for which to get limits
 * @returns Garnishment limits object
 */
function getGarnishmentLimitsForYear(year: number) {
  // For now, we only have 2024 data. In future, add historical and future data
  if (year >= 2024 && year <= 2025) {
    return GARNISHMENT_LIMITS_2024
  }
  // Default to 2024 limits for other years (should be updated annually)
  return GARNISHMENT_LIMITS_2024
}

/**
 * Calculate garnishment-free amount (Pfändungsfreibetrag) according to § 850c ZPO
 *
 * German garnishment law protects a basic livelihood amount from creditors.
 * The protected amount increases with the number of dependents.
 *
 * Calculation logic:
 * 1. Base amount (Grundbetrag): Protected for everyone
 * 2. First dependent: Additional protection amount
 * 3. Further dependents: Additional protection per person
 * 4. Income above threshold: Fully garnishable
 * 5. Between base and threshold: Partially garnishable (progressive table)
 *
 * @param config - Garnishment limit configuration
 * @returns Calculation result with protected and garnishable amounts
 */
export function calculatePfaendungsfreigrenze(config: PfaendungsfreigrenzeConfig): PfaendungsfreigrenzeResult {
  const limits = getGarnishmentLimitsForYear(config.year)

  // Calculate base protected amount
  let protectedAmount = limits.baseAmount

  // Add protection for dependents
  const additionalProtection: number[] = []
  for (let i = 0; i < config.numberOfDependents; i++) {
    const additionalAmount = i === 0 ? limits.firstDependent : limits.additionalDependent
    additionalProtection.push(additionalAmount)
    protectedAmount += additionalAmount
  }

  // Check if income exceeds fully garnishable threshold
  const isFullyGarnishable = config.monthlyNetIncome >= limits.fullyGarnishableThreshold

  // Calculate garnishable amount
  let garnishableAmount: number
  let finalProtectedAmount: number

  if (config.monthlyNetIncome <= protectedAmount) {
    // Income is fully protected
    garnishableAmount = 0
    finalProtectedAmount = config.monthlyNetIncome
  } else if (isFullyGarnishable) {
    // Income is fully garnishable above threshold
    garnishableAmount = config.monthlyNetIncome
    finalProtectedAmount = 0
  } else {
    // Income is partially garnishable (simplified calculation)
    // In reality, this uses a complex table. For MVP, we use a proportional approach.
    const excessIncome = config.monthlyNetIncome - protectedAmount
    const rangeToFullyGarnishable = limits.fullyGarnishableThreshold - protectedAmount

    // Progressive garnishment: starts at ~30% and increases to 100%
    const progressiveFactor = Math.min(1, excessIncome / rangeToFullyGarnishable)
    const effectiveGarnishmentRate = 0.3 + progressiveFactor * 0.7 // 30% to 100%
    garnishableAmount = excessIncome * effectiveGarnishmentRate
    finalProtectedAmount = protectedAmount
  }

  return {
    monthlyNetIncome: config.monthlyNetIncome,
    numberOfDependents: config.numberOfDependents,
    protectedAmount: finalProtectedAmount,
    garnishableAmount,
    baseProtectedAmount: limits.baseAmount,
    additionalProtectionPerDependent: additionalProtection,
    isFullyGarnishable,
  }
}

/**
 * Calculate Rürup-Rente protection amounts
 */
function calculateRuerupProtection(capital: number): { protected: number; garnishable: number } {
  if (capital === 0) {
    return { protected: 0, garnishable: 0 }
  }

  if (capital <= ASSET_PROTECTION_LIMITS.ruerupTotalCapitalLimit) {
    return { protected: capital, garnishable: 0 }
  }

  if (capital <= ASSET_PROTECTION_LIMITS.ruerupTripleLimit) {
    const protectedAmount =
      ASSET_PROTECTION_LIMITS.ruerupTotalCapitalLimit +
      (capital - ASSET_PROTECTION_LIMITS.ruerupTotalCapitalLimit) * 0.3
    return { protected: protectedAmount, garnishable: capital - protectedAmount }
  }

  return {
    protected: ASSET_PROTECTION_LIMITS.ruerupTotalCapitalLimit,
    garnishable: capital - ASSET_PROTECTION_LIMITS.ruerupTotalCapitalLimit,
  }
}

/**
 * Generate asset protection recommendations
 */
function generateAssetRecommendations(
  config: AssetProtectionConfig,
  ruerupGarnishable: number,
  otherGarnishable: number,
  totalProtected: number,
  totalAssets: number,
  totalGarnishable: number,
): string[] {
  const recommendations: string[] = []

  // Check for triple limit exceeded
  if (config.ruerupRenteCapital > ASSET_PROTECTION_LIMITS.ruerupTripleLimit) {
    recommendations.push(
      'Das Rürup-Renten-Kapital übersteigt die dreifache Obergrenze (1.020.000 €). Erwägen Sie eine Umstrukturierung.',
    )
  }

  if (ruerupGarnishable > 0) {
    recommendations.push(
      'Ein Teil Ihrer Rürup-Rente ist pfändbar. Prüfen Sie, ob eine Reduzierung oder Umschichtung sinnvoll ist.',
    )
  }

  if (otherGarnishable > 0) {
    recommendations.push(
      'Andere Altersvorsorgeformen sind oft nicht geschützt. Erwägen Sie eine Umschichtung in pfändungssichere Produkte wie Rürup- oder Riester-Rente.',
    )
  }

  if (totalProtected < totalAssets * 0.8 && totalGarnishable > 10000) {
    recommendations.push(
      'Nur ein Teil Ihres Vermögens ist geschützt. Eine strategische Umstrukturierung könnte Ihren Schutz erhöhen.',
    )
  }

  if (recommendations.length === 0 && totalAssets > 0) {
    recommendations.push('Ihre Altersvorsorge ist gut gegen Pfändung geschützt.')
  }

  return recommendations
}

/**
 * Assess asset protection according to § 851c ZPO
 *
 * German law protects certain retirement assets from garnishment:
 * - Rürup-Rente (Basis-Rente): Protected up to €340,000 total, €7,000 annual
 * - Riester-Rente: Generally protected during accumulation phase
 * - Other pensions: Limited or no protection depending on structure
 *
 * @param config - Asset protection configuration
 * @returns Assessment of protected and garnishable assets
 */
export function assessProtectedAssets(config: AssetProtectionConfig): AssetProtectionResult {
  // Calculate Rürup protection
  const { protected: ruerupProtected, garnishable: ruerupGarnishable } = calculateRuerupProtection(
    config.ruerupRenteCapital,
  )

  // Riester-Rente protection (fully protected in accumulation phase)
  const riesterProtected = config.riesterRenteCapital
  const riesterGarnishable = 0

  // Other pension capital (not protected)
  const otherProtected = 0
  const otherGarnishable = config.otherPensionCapital

  // Calculate totals
  const totalAssets = config.ruerupRenteCapital + config.riesterRenteCapital + config.otherPensionCapital
  const totalProtected = ruerupProtected + riesterProtected + otherProtected
  const totalGarnishable = ruerupGarnishable + riesterGarnishable + otherGarnishable

  // Generate recommendations
  const recommendations = generateAssetRecommendations(
    config,
    ruerupGarnishable,
    otherGarnishable,
    totalProtected,
    totalAssets,
    totalGarnishable,
  )

  return {
    totalAssets,
    ruerupProtected,
    ruerupGarnishable,
    riesterProtected,
    riesterGarnishable,
    otherProtected,
    otherGarnishable,
    totalProtected,
    totalGarnishable,
    recommendations,
  }
}

/**
 * Get default garnishment limit configuration
 */
export function getDefaultPfaendungsfreigrenzeConfig(year: number): PfaendungsfreigrenzeConfig {
  return {
    monthlyNetIncome: 0,
    numberOfDependents: 0,
    year,
  }
}

/**
 * Get default asset protection configuration
 */
export function getDefaultAssetProtectionConfig(year: number): AssetProtectionConfig {
  return {
    ruerupRenteCapital: 0,
    riesterRenteCapital: 0,
    otherPensionCapital: 0,
    year,
  }
}

/**
 * Validate garnishment limit configuration
 * @param config - Configuration to validate
 * @returns Array of validation error messages (empty if valid)
 */
export function validatePfaendungsfreigrenzeConfig(config: PfaendungsfreigrenzeConfig): string[] {
  const errors: string[] = []

  if (config.monthlyNetIncome < 0) {
    errors.push('Monatliches Nettoeinkommen kann nicht negativ sein')
  }

  if (config.numberOfDependents < 0) {
    errors.push('Anzahl der Unterhaltsberechtigten kann nicht negativ sein')
  }

  if (config.numberOfDependents > 10) {
    errors.push('Anzahl der Unterhaltsberechtigten erscheint unrealistisch hoch')
  }

  if (config.year < 2000 || config.year > 2100) {
    errors.push('Jahr muss zwischen 2000 und 2100 liegen')
  }

  return errors
}

/**
 * Validate asset protection configuration
 * @param config - Configuration to validate
 * @returns Array of validation error messages (empty if valid)
 */
export function validateAssetProtectionConfig(config: AssetProtectionConfig): string[] {
  const errors: string[] = []

  if (config.ruerupRenteCapital < 0) {
    errors.push('Rürup-Renten-Kapital kann nicht negativ sein')
  }

  if (config.riesterRenteCapital < 0) {
    errors.push('Riester-Renten-Kapital kann nicht negativ sein')
  }

  if (config.otherPensionCapital < 0) {
    errors.push('Sonstiges Altersvorsorge-Kapital kann nicht negativ sein')
  }

  if (config.year < 2000 || config.year > 2100) {
    errors.push('Jahr muss zwischen 2000 und 2100 liegen')
  }

  return errors
}

/**
 * Generate income-based recommendations
 */
function generateIncomeRecommendations(result: PfaendungsfreigrenzeResult): string[] {
  const recommendations: string[] = []

  if (result.garnishableAmount > result.protectedAmount) {
    recommendations.push(
      'Ein großer Teil Ihres Einkommens ist pfändbar. Prüfen Sie Möglichkeiten zur Schuldensanierung oder Privatinsolvenz.',
    )
  }

  if (result.numberOfDependents === 0 && result.garnishableAmount > 0) {
    recommendations.push(
      'Mit Unterhaltsberechtigten würde sich Ihr Pfändungsschutz erhöhen. Stellen Sie sicher, dass alle berechtigten Personen beim Finanzamt gemeldet sind.',
    )
  }

  return recommendations
}

/**
 * Generate general asset recommendations
 */
function generateGeneralAssetRecommendations(result: AssetProtectionResult): string[] {
  const recommendations: string[] = []

  if (result.totalGarnishable > result.totalProtected && result.totalGarnishable > 10000) {
    recommendations.push(
      'Ein erheblicher Teil Ihres Vermögens ist pfändbar. Erwägen Sie eine Umschichtung in pfändungssichere Altersvorsorge (Rürup, Riester).',
    )
  }

  if (result.ruerupProtected === 0 && result.totalGarnishable > 50000) {
    recommendations.push(
      'Eine Rürup-Rente bietet Pfändungsschutz bis 340.000 €. Bei Schuldenrisiko könnte dies eine strategische Absicherung sein.',
    )
  }

  if (result.riesterProtected === 0 && result.totalGarnishable > 20000) {
    recommendations.push(
      'Riester-Renten sind in der Ansparphase vollständig geschützt. Dies könnte eine Option zur Vermögensabsicherung sein.',
    )
  }

  return recommendations
}

/**
 * Generate combined income and asset recommendations
 */
function generateCombinedRecommendations(
  incomeResult: PfaendungsfreigrenzeResult,
  assetResult: AssetProtectionResult,
): string[] {
  const recommendations: string[] = []

  const hasHighRisk =
    incomeResult.isFullyGarnishable &&
    assetResult.totalProtected < 100000 &&
    assetResult.totalGarnishable > assetResult.totalProtected

  if (hasHighRisk) {
    recommendations.push(
      'Bei vollständig pfändbarem Einkommen ist der Schutz Ihrer Altersvorsorge besonders wichtig. Maximieren Sie pfändungssichere Anlagen.',
    )
  }

  return recommendations
}

/**
 * Get optimization recommendations for maximizing asset protection
 * @param incomeResult - Income garnishment result
 * @param assetResult - Asset protection result
 * @returns Array of recommendations
 */
export function getOptimizationRecommendations(
  incomeResult: PfaendungsfreigrenzeResult,
  assetResult: AssetProtectionResult,
): string[] {
  return [
    ...generateIncomeRecommendations(incomeResult),
    ...generateGeneralAssetRecommendations(assetResult),
    ...generateCombinedRecommendations(incomeResult, assetResult),
  ]
}
