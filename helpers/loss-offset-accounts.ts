/**
 * Verlustverrechnungstöpfe (Loss Offset Accounts) System
 *
 * This module implements the German tax loss offset account system (Verlustverrechnungstöpfe)
 * which tracks losses from different investment types in separate pools and carries them forward
 * across years according to German tax law (EStG).
 *
 * Key German tax concepts:
 * - Aktienverlusttopf: Stock loss pool - can only offset stock gains
 * - Sonstiger Verlusttopf: Other capital loss pool - can offset any capital income
 * - Verlustvortrag: Unlimited carry-forward of losses to future years
 * - No time limit on loss carry-forward
 *
 * Reference: § 20 EStG (Einkommensteuergesetz)
 */

/**
 * Types of loss accounts according to German tax law
 */
export type LossAccountType = 'stock' | 'other'

/**
 * Loss offset account state for a specific year
 */
export interface LossAccountState {
  /** Stock losses available (Aktienverlusttopf) in EUR */
  stockLosses: number
  /** Other capital losses available (Sonstiger Verlusttopf) in EUR */
  otherLosses: number
  /** Year for which this state applies */
  year: number
}

/**
 * Configuration for realized losses in a specific year
 */
export interface RealizedLossesConfig {
  /** Realized stock losses (from selling stocks/equity funds) in EUR */
  stockLosses: number
  /** Realized other capital losses (bonds, mixed funds, etc.) in EUR */
  otherLosses: number
  /** Year when losses were realized */
  year: number
}

/**
 * Result of loss offset calculation for a specific year
 */
export interface LossOffsetResult {
  /** Capital gains before loss offset in EUR */
  capitalGainsBeforeOffset: number
  /** Stock gains portion in EUR */
  stockGains: number
  /** Other capital gains in EUR */
  otherGains: number
  /** Vorabpauschale amount in EUR */
  vorabpauschale: number
  /** Stock losses used for offset in EUR */
  stockLossesUsed: number
  /** Other losses used for offset in EUR */
  otherLossesUsed: number
  /** Total losses used in EUR */
  totalLossesUsed: number
  /** Taxable income after loss offset in EUR */
  taxableIncomeAfterOffset: number
  /** Tax savings from loss offset in EUR */
  taxSavings: number
  /** Remaining losses to carry forward */
  remainingLosses: LossAccountState
}

/**
 * Calculate loss offset for a specific year
 *
 * Applies German loss offset rules:
 * 1. Stock losses can only offset stock gains
 * 2. Other losses can offset any capital income including Vorabpauschale
 * 3. Losses are offset before calculating taxes
 * 4. Unused losses are carried forward to next year
 *
 * @param previousLosses - Loss account state from previous year
 * @param realizedLosses - New losses realized in current year
 * @param stockGains - Stock gains (from equity funds) in current year
 * @param otherGains - Other capital gains in current year
 * @param vorabpauschale - Vorabpauschale amount for current year
 * @param taxRate - Effective tax rate (Kapitalertragsteuer × (1 - Teilfreistellung))
 * @param year - Current year
 * @returns Loss offset calculation result
 */
export function calculateLossOffset(
  previousLosses: LossAccountState,
  realizedLosses: RealizedLossesConfig,
  stockGains: number,
  otherGains: number,
  vorabpauschale: number,
  taxRate: number,
  year: number,
): LossOffsetResult {
  // Available losses = previous year's carryforward + current year's realized losses
  const availableStockLosses = previousLosses.stockLosses + realizedLosses.stockLosses
  const availableOtherLosses = previousLosses.otherLosses + realizedLosses.otherLosses

  // Step 1: Offset stock losses against stock gains
  const stockLossesUsed = Math.min(availableStockLosses, stockGains)
  const remainingStockGains = stockGains - stockLossesUsed
  const remainingStockLosses = availableStockLosses - stockLossesUsed

  // Step 2: Calculate total taxable income after stock loss offset
  // Other losses can offset: remaining stock gains + other gains + Vorabpauschale
  const taxableBeforeOtherLossOffset = remainingStockGains + otherGains + vorabpauschale

  // Step 3: Offset other losses against all remaining taxable income
  const otherLossesUsed = Math.min(availableOtherLosses, taxableBeforeOtherLossOffset)
  const remainingOtherLosses = availableOtherLosses - otherLossesUsed

  // Final taxable income
  const taxableIncomeAfterOffset = Math.max(0, taxableBeforeOtherLossOffset - otherLossesUsed)

  // Calculate tax savings
  const totalLossesUsed = stockLossesUsed + otherLossesUsed
  const taxSavings = totalLossesUsed * taxRate

  return {
    capitalGainsBeforeOffset: stockGains + otherGains,
    stockGains,
    otherGains,
    vorabpauschale,
    stockLossesUsed,
    otherLossesUsed,
    totalLossesUsed,
    taxableIncomeAfterOffset,
    taxSavings,
    remainingLosses: {
      stockLosses: remainingStockLosses,
      otherLosses: remainingOtherLosses,
      year,
    },
  }
}

/**
 * Create initial empty loss account state
 * @param year - Year for the initial state
 * @returns Empty loss account state
 */
export function createInitialLossAccountState(year: number): LossAccountState {
  return {
    stockLosses: 0,
    otherLosses: 0,
    year,
  }
}

/**
 * Create default realized losses config (no losses)
 * @param year - Year for the config
 * @returns Default config with zero losses
 */
export function createDefaultRealizedLosses(year: number): RealizedLossesConfig {
  return {
    stockLosses: 0,
    otherLosses: 0,
    year,
  }
}

/**
 * Validate loss account state
 * @param state - Loss account state to validate
 * @returns Array of validation error messages (empty if valid)
 */
export function validateLossAccountState(state: LossAccountState): string[] {
  const errors: string[] = []

  if (state.stockLosses < 0) {
    errors.push('Aktienverlusttopf kann nicht negativ sein')
  }

  if (state.otherLosses < 0) {
    errors.push('Sonstiger Verlusttopf kann nicht negativ sein')
  }

  if (state.year < 2000 || state.year > 2100) {
    errors.push('Jahr muss zwischen 2000 und 2100 liegen')
  }

  return errors
}

/**
 * Validate realized losses configuration
 * @param config - Realized losses config to validate
 * @returns Array of validation error messages (empty if valid)
 */
export function validateRealizedLosses(config: RealizedLossesConfig): string[] {
  const errors: string[] = []

  if (config.stockLosses < 0) {
    errors.push('Realisierte Aktienverluste können nicht negativ sein')
  }

  if (config.otherLosses < 0) {
    errors.push('Realisierte sonstige Verluste können nicht negativ sein')
  }

  if (config.year < 2000 || config.year > 2100) {
    errors.push('Jahr muss zwischen 2000 und 2100 liegen')
  }

  return errors
}

/**
 * Format loss amount for display (German number format)
 * @param amount - Loss amount in EUR
 * @returns Formatted string with € symbol
 */
export function formatLossAmount(amount: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Get display name for loss account type
 * @param type - Loss account type
 * @returns German display name
 */
export function getLossAccountTypeName(type: LossAccountType): string {
  const names: Record<LossAccountType, string> = {
    stock: 'Aktienverlusttopf',
    other: 'Sonstiger Verlusttopf',
  }
  return names[type]
}

/**
 * Get description for loss account type
 * @param type - Loss account type
 * @returns German description
 */
export function getLossAccountTypeDescription(type: LossAccountType): string {
  const descriptions: Record<LossAccountType, string> = {
    stock: 'Verluste aus Aktienverkäufen können nur mit Aktiengewinnen verrechnet werden',
    other:
      'Verluste aus anderen Kapitalanlagen (Anleihen, Mischfonds, etc.) können mit allen Kapitalerträgen verrechnet werden',
  }
  return descriptions[type]
}

/**
 * Multi-year loss tracking configuration
 */
export interface MultiYearLossTracking {
  /** Loss account states for multiple years (year -> state) */
  yearlyStates: Record<number, LossAccountState>
  /** Realized losses for multiple years (year -> config) */
  yearlyRealizedLosses: Record<number, RealizedLossesConfig>
  /** Projected gains for planning purposes (year -> { stock, other }) */
  projectedGains: Record<number, { stockGains: number; otherGains: number }>
}

/**
 * Analysis result for a specific year
 */
export interface YearLossAnalysis {
  year: number
  availableLosses: LossAccountState
  projectedGains: { stockGains: number; otherGains: number }
  projectedLossUsage: { stockLossesUsed: number; otherLossesUsed: number; totalUsed: number }
  projectedTaxSavings: number
  carryForwardToNextYear: LossAccountState
  warnings: LossWarning[]
  recommendations: LossRecommendation[]
}

/**
 * Warning types for loss tracking
 */
export type LossWarningType = 'unused_losses' | 'inefficient_usage' | 'opportunity_missed' | 'high_carryforward'

/**
 * Warning about loss usage
 */
export interface LossWarning {
  type: LossWarningType
  severity: 'low' | 'medium' | 'high'
  message: string
  year: number
  affectedAmount?: number
}

/**
 * Recommendation types for optimization
 */
export type LossRecommendationType =
  | 'realize_gains'
  | 'defer_gains'
  | 'harvest_losses'
  | 'rebalance_portfolio'
  | 'optimize_timing'

/**
 * Recommendation for optimizing loss usage
 */
export interface LossRecommendation {
  type: LossRecommendationType
  priority: 'low' | 'medium' | 'high'
  title: string
  description: string
  year: number
  potentialSavings?: number
  actionRequired?: string
}

/**
 * Multi-year loss optimization result
 */
export interface MultiYearOptimizationResult {
  yearlyAnalyses: YearLossAnalysis[]
  totalProjectedSavings: number
  totalUnusedLosses: number
  overallRecommendations: LossRecommendation[]
  warningCount: { low: number; medium: number; high: number }
}

/**
 * Analyze loss usage across multiple years and generate optimization recommendations
 *
 * @param tracking - Multi-year loss tracking configuration
 * @param taxRate - Effective tax rate for calculating savings
 * @param startYear - First year to analyze
 * @param endYear - Last year to analyze
 * @returns Multi-year optimization analysis with recommendations
 */
export function analyzeMultiYearLossUsage(
  tracking: MultiYearLossTracking,
  taxRate: number,
  startYear: number,
  endYear: number,
): MultiYearOptimizationResult {
  const yearlyAnalyses: YearLossAnalysis[] = []
  let currentLossState: LossAccountState = tracking.yearlyStates[startYear] || createInitialLossAccountState(startYear)

  // Analyze each year sequentially
  for (let year = startYear; year <= endYear; year++) {
    const realizedLosses = tracking.yearlyRealizedLosses[year] || createDefaultRealizedLosses(year)
    const projectedGains = tracking.projectedGains[year] || { stockGains: 0, otherGains: 0 }

    // Calculate available losses for this year
    const availableLosses: LossAccountState = {
      stockLosses: currentLossState.stockLosses + realizedLosses.stockLosses,
      otherLosses: currentLossState.otherLosses + realizedLosses.otherLosses,
      year,
    }

    // Project how losses would be used with projected gains
    const stockLossesUsed = Math.min(availableLosses.stockLosses, projectedGains.stockGains)
    const remainingStockGains = projectedGains.stockGains - stockLossesUsed
    const otherLossesUsed = Math.min(availableLosses.otherLosses, remainingStockGains + projectedGains.otherGains)
    const totalUsed = stockLossesUsed + otherLossesUsed

    // Calculate projected tax savings
    const projectedTaxSavings = totalUsed * taxRate

    // Calculate carryforward to next year
    const carryForwardToNextYear: LossAccountState = {
      stockLosses: availableLosses.stockLosses - stockLossesUsed,
      otherLosses: availableLosses.otherLosses - otherLossesUsed,
      year: year + 1,
    }

    // Generate warnings
    const warnings = generateLossWarnings(
      availableLosses,
      projectedGains,
      { stockLossesUsed, otherLossesUsed, totalUsed },
      carryForwardToNextYear,
      year,
    )

    // Generate recommendations
    const recommendations = generateLossRecommendations(
      availableLosses,
      projectedGains,
      { stockLossesUsed, otherLossesUsed, totalUsed },
      carryForwardToNextYear,
      taxRate,
      year,
    )

    yearlyAnalyses.push({
      year,
      availableLosses,
      projectedGains,
      projectedLossUsage: { stockLossesUsed, otherLossesUsed, totalUsed },
      projectedTaxSavings,
      carryForwardToNextYear,
      warnings,
      recommendations,
    })

    // Update state for next year
    currentLossState = carryForwardToNextYear
  }

  // Calculate overall statistics
  const totalProjectedSavings = yearlyAnalyses.reduce((sum, analysis) => sum + analysis.projectedTaxSavings, 0)
  const finalYear = yearlyAnalyses[yearlyAnalyses.length - 1]
  const totalUnusedLosses = finalYear
    ? finalYear.carryForwardToNextYear.stockLosses + finalYear.carryForwardToNextYear.otherLosses
    : 0

  // Collect all warnings and count by severity
  const allWarnings = yearlyAnalyses.flatMap(analysis => analysis.warnings)
  const warningCount = {
    low: allWarnings.filter(w => w.severity === 'low').length,
    medium: allWarnings.filter(w => w.severity === 'medium').length,
    high: allWarnings.filter(w => w.severity === 'high').length,
  }

  // Generate overall recommendations spanning multiple years
  const overallRecommendations = generateOverallRecommendations(yearlyAnalyses, taxRate, totalUnusedLosses)

  return {
    yearlyAnalyses,
    totalProjectedSavings,
    totalUnusedLosses,
    overallRecommendations,
    warningCount,
  }
}

/**
 * Generate warnings for loss usage in a specific year
 */
function generateLossWarnings(
  availableLosses: LossAccountState,
  projectedGains: { stockGains: number; otherGains: number },
  projectedUsage: { stockLossesUsed: number; otherLossesUsed: number; totalUsed: number },
  carryForward: LossAccountState,
  year: number,
): LossWarning[] {
  const warnings: LossWarning[] = []
  const totalAvailable = availableLosses.stockLosses + availableLosses.otherLosses
  const totalGains = projectedGains.stockGains + projectedGains.otherGains

  // Warning: High unused losses with available gains
  if (totalAvailable > 10000 && projectedUsage.totalUsed === 0 && totalGains === 0) {
    warnings.push({
      type: 'unused_losses',
      severity: 'medium',
      message: `Hoher Verlustvortrag von ${formatLossAmount(totalAvailable)} ohne geplante Gewinne zur Verrechnung`,
      year,
      affectedAmount: totalAvailable,
    })
  }

  // Warning: Inefficient usage (could use more losses)
  if (totalAvailable > 0 && totalGains > projectedUsage.totalUsed && totalGains - projectedUsage.totalUsed > 1000) {
    warnings.push({
      type: 'inefficient_usage',
      severity: 'low',
      message: `Nicht alle verfügbaren Verluste werden genutzt (${formatLossAmount(totalAvailable - projectedUsage.totalUsed)} ungenutzt)`,
      year,
      affectedAmount: totalAvailable - projectedUsage.totalUsed,
    })
  }

  // Warning: Very high carryforward accumulating
  const totalCarryForward = carryForward.stockLosses + carryForward.otherLosses
  if (totalCarryForward > 50000) {
    warnings.push({
      type: 'high_carryforward',
      severity: 'high',
      message: `Sehr hoher Verlustvortrag akkumuliert sich (${formatLossAmount(totalCarryForward)})`,
      year,
      affectedAmount: totalCarryForward,
    })
  }

  // Warning: Opportunity missed (gains available but not using losses)
  if (availableLosses.stockLosses > 5000 && projectedGains.stockGains === 0) {
    warnings.push({
      type: 'opportunity_missed',
      severity: 'medium',
      message: `Aktienverluste von ${formatLossAmount(availableLosses.stockLosses)} könnten durch strategische Gewinnrealisierung genutzt werden`,
      year,
      affectedAmount: availableLosses.stockLosses,
    })
  }

  return warnings
}

/**
 * Generate optimization recommendations for a specific year
 */
function generateLossRecommendations(
  availableLosses: LossAccountState,
  projectedGains: { stockGains: number; otherGains: number },
  projectedUsage: { stockLossesUsed: number; otherLossesUsed: number; totalUsed: number },
  carryForward: LossAccountState,
  taxRate: number,
  year: number,
): LossRecommendation[] {
  const recommendations: LossRecommendation[] = []

  // Recommendation: Realize gains to use accumulated losses
  if (availableLosses.stockLosses > 5000 && projectedGains.stockGains < availableLosses.stockLosses * 0.3) {
    const potentialUsage = Math.min(availableLosses.stockLosses, 20000)
    recommendations.push({
      type: 'realize_gains',
      priority: 'high',
      title: 'Gewinne realisieren zur Verlustverrechnung',
      description: `Erwägen Sie die Realisierung von Aktiengewinnen bis zu ${formatLossAmount(potentialUsage)}, um vorhandene Verluste zu nutzen`,
      year,
      potentialSavings: potentialUsage * taxRate,
      actionRequired: 'Gewinnrealisierung durch Teilverkäufe',
    })
  }

  // Recommendation: Defer gains if no losses available
  if (availableLosses.stockLosses === 0 && availableLosses.otherLosses === 0 && projectedGains.stockGains > 10000) {
    recommendations.push({
      type: 'defer_gains',
      priority: 'medium',
      title: 'Gewinnrealisierung verschieben',
      description: 'Ohne verfügbare Verluste sollten Gewinnrealisierungen ggf. in Folgejahre verschoben werden',
      year,
      actionRequired: 'Prüfung der Verkaufsstrategie',
    })
  }

  // Recommendation: Harvest losses strategically
  if (
    availableLosses.stockLosses === 0 &&
    projectedGains.stockGains > 5000 &&
    carryForward.stockLosses + carryForward.otherLosses < 10000
  ) {
    recommendations.push({
      type: 'harvest_losses',
      priority: 'medium',
      title: 'Tax-Loss Harvesting erwägen',
      description: 'Bei erwarteten Gewinnen sollten strategische Verlustverkäufe zur Steueroptimierung erwogen werden',
      year,
      actionRequired: 'Identifikation von Positionen mit Verlusten',
    })
  }

  // Recommendation: Optimize timing across years
  const totalCarryForward = carryForward.stockLosses + carryForward.otherLosses
  if (totalCarryForward > 20000) {
    recommendations.push({
      type: 'optimize_timing',
      priority: 'medium',
      title: 'Mehrjährige Optimierung',
      description: `Mit ${formatLossAmount(totalCarryForward)} Verlustvortrag sollte die Gewinnrealisierung über mehrere Jahre optimiert werden`,
      year,
      actionRequired: 'Mehrjahresplanung erstellen',
    })
  }

  return recommendations
}

/**
 * Generate overall recommendations spanning multiple years
 */
function generateOverallRecommendations(
  yearlyAnalyses: YearLossAnalysis[],
  taxRate: number,
  totalUnusedLosses: number,
): LossRecommendation[] {
  const recommendations: LossRecommendation[] = []

  // Check for consistent high carryforwards
  const yearsWithHighCarryforward = yearlyAnalyses.filter(
    analysis => analysis.carryForwardToNextYear.stockLosses + analysis.carryForwardToNextYear.otherLosses > 30000,
  )

  if (yearsWithHighCarryforward.length >= 3) {
    const avgCarryforward =
      yearsWithHighCarryforward.reduce(
        (sum, analysis) => sum + analysis.carryForwardToNextYear.stockLosses + analysis.carryForwardToNextYear.otherLosses,
        0,
      ) / yearsWithHighCarryforward.length

    recommendations.push({
      type: 'rebalance_portfolio',
      priority: 'high',
      title: 'Portfolio-Rebalancing für Verlustnutzung',
      description: `Durchgehend hoher Verlustvortrag (Ø ${formatLossAmount(avgCarryforward)}) deutet auf Bedarf für strategisches Rebalancing hin`,
      year: yearlyAnalyses[0].year,
      potentialSavings: Math.min(avgCarryforward * 0.5, 50000) * taxRate,
      actionRequired: 'Umfassende Portfolio-Strategie entwickeln',
    })
  }

  // Check for years with very low loss usage despite available losses
  const inefficientYears = yearlyAnalyses.filter(
    analysis =>
      analysis.availableLosses.stockLosses + analysis.availableLosses.otherLosses > 10000 &&
      analysis.projectedLossUsage.totalUsed < 2000,
  )

  if (inefficientYears.length > 0) {
    recommendations.push({
      type: 'optimize_timing',
      priority: 'high',
      title: 'Zeitliche Optimierung der Gewinnrealisierung',
      description: `In ${inefficientYears.length} Jahr(en) werden verfügbare Verluste kaum genutzt`,
      year: inefficientYears[0].year,
      actionRequired: 'Gewinnrealisierungen in diese Jahre verlagern',
    })
  }

  return recommendations
}
