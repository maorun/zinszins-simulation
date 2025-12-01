/**
 * Types and utilities for Rürup-Rente (Basis-Rente) integration
 * 
 * Rürup-Rente is a German pension product designed primarily for self-employed
 * individuals and high earners, offering tax-deductible contributions with
 * deferred taxation on benefits.
 */

/**
 * Configuration for Rürup-Rente (Basis-Rente)
 */
export interface RuerupRenteConfig {
  /** Whether Rürup-Rente is enabled in the calculation */
  enabled: boolean

  /** Annual contribution amount in EUR */
  annualContribution: number

  /** Starting year for pension payments (retirement) */
  pensionStartYear: number

  /** Expected monthly pension amount in EUR (before taxes) */
  expectedMonthlyPension: number

  /** Civil status for contribution limits (single/married) */
  civilStatus: 'single' | 'married'

  /** Annual increase rate for pension adjustments during payout (default: 1%) */
  pensionIncreaseRate: number
}

/**
 * Tax deductibility limits for Rürup-Rente contributions
 * Based on German tax law (§ 10 Abs. 1 Nr. 2 Buchst. b EStG)
 */
export interface RuerupDeductibilityLimits {
  /** Maximum deductible amount for single individuals */
  maxAmountSingle: number

  /** Maximum deductible amount for married couples */
  maxAmountMarried: number

  /** Percentage of contribution that is tax-deductible (increases yearly until 100% in 2025) */
  deductiblePercentage: number
}

/**
 * Result of Rürup-Rente tax deduction calculation for a specific year
 */
export interface RuerupTaxDeductionResult {
  /** Actual contribution amount */
  contribution: number

  /** Maximum deductible amount based on limits */
  maxDeductible: number

  /** Deductible percentage for the year */
  deductiblePercentage: number

  /** Actual deductible amount (may be limited) */
  deductibleAmount: number

  /** Tax savings based on personal tax rate */
  estimatedTaxSavings: number
}

/**
 * Result of Rürup-Rente pension payout taxation for a specific year
 */
export interface RuerupPensionTaxationResult {
  /** Gross annual pension amount */
  grossAnnualPension: number

  /** Gross monthly pension amount */
  grossMonthlyPension: number

  /** Taxable percentage based on retirement year */
  taxablePercentage: number

  /** Taxable amount of pension */
  taxableAmount: number

  /** Income tax on pension (calculated with other income) */
  incomeTax: number

  /** Net annual pension after taxes */
  netAnnualPension: number
}

/**
 * Get tax deductibility limits for Rürup-Rente for a specific year
 * 
 * @param year - Tax year
 * @returns Deductibility limits including percentage and maximum amounts
 * 
 * @remarks
 * - Limits are based on § 10 Abs. 1 Nr. 2 Buchst. b EStG
 * - Maximum amounts are tied to contribution assessment ceiling (Beitragsbemessungsgrenze)
 *   in the statutory pension insurance
 * - Deductible percentage increases from 76% (2012) to 100% (2025 and beyond)
 * - 2024: €27,566 (single) / €55,132 (married) with 100% deductibility
 * - 2025 onwards: Full deductibility (100%)
 */
export function getRuerupDeductibilityLimits(year: number): RuerupDeductibilityLimits {
  // Base limits for 2024 (reference year)
  const baseLimitsSingle2024 = 27566
  const baseLimitsMarried2024 = 55132

  // Deductible percentage progression
  // 2012: 74%, increases by 2% each year until 100% in 2025
  let deductiblePercentage: number
  
  if (year <= 2012) {
    deductiblePercentage = 0.74
  } else if (year >= 2025) {
    deductiblePercentage = 1.0
  } else {
    // Linear increase: 74% + 2% per year from 2012
    deductiblePercentage = 0.74 + 0.02 * (year - 2012)
  }

  // Adjust limits for years after 2024 based on typical 2-3% annual increases
  // This is a simplified model; actual limits depend on Beitragsbemessungsgrenze
  const yearDiff = year - 2024
  const inflationAdjustment = yearDiff > 0 ? Math.pow(1.025, yearDiff) : 1.0

  const maxAmountSingle = Math.round(baseLimitsSingle2024 * inflationAdjustment)
  const maxAmountMarried = Math.round(baseLimitsMarried2024 * inflationAdjustment)

  return {
    maxAmountSingle,
    maxAmountMarried,
    deductiblePercentage,
  }
}

/**
 * Calculate tax deduction for Rürup-Rente contribution
 * 
 * @param contribution - Annual contribution amount
 * @param year - Tax year
 * @param civilStatus - Civil status ('single' or 'married')
 * @param personalTaxRate - Personal income tax rate (0-1) for estimating savings
 * @returns Tax deduction calculation result
 * 
 * @example
 * ```typescript
 * const result = calculateRuerupTaxDeduction(20000, 2024, 'single', 0.42)
 * // result.deductibleAmount: 20000 (fully deductible)
 * // result.estimatedTaxSavings: 8400 (42% of 20000)
 * ```
 */
export function calculateRuerupTaxDeduction(
  contribution: number,
  year: number,
  civilStatus: 'single' | 'married',
  personalTaxRate: number
): RuerupTaxDeductionResult {
  const limits = getRuerupDeductibilityLimits(year)
  const maxDeductible = civilStatus === 'single' ? limits.maxAmountSingle : limits.maxAmountMarried

  // Calculate deductible amount: min(contribution, maxDeductible) * deductiblePercentage
  const theoreticalDeductible = contribution * limits.deductiblePercentage
  const deductibleAmount = Math.min(theoreticalDeductible, maxDeductible)

  // Estimate tax savings based on personal tax rate
  const estimatedTaxSavings = deductibleAmount * personalTaxRate

  return {
    contribution,
    maxDeductible,
    deductiblePercentage: limits.deductiblePercentage,
    deductibleAmount,
    estimatedTaxSavings,
  }
}

/**
 * Get taxable percentage for Rürup-Rente pension based on retirement year
 * 
 * @param retirementYear - Year when pension payments start
 * @returns Taxable percentage (0-1)
 * 
 * @remarks
 * - Taxable percentage depends on the year pension payments begin
 * - 2005 and earlier: 50% taxable
 * - Increases by 2% per year from 2006 to 2020
 * - Increases by 1% per year from 2021 to 2040
 * - 2040 and later: 100% taxable
 * - Based on § 22 Nr. 1 Satz 3 Buchst. a Doppelbuchst. aa EStG
 */
export function getRuerupPensionTaxablePercentage(retirementYear: number): number {
  if (retirementYear <= 2005) {
    return 0.50
  } else if (retirementYear >= 2040) {
    return 1.0
  } else if (retirementYear <= 2020) {
    // 2006: 52%, increases by 2% per year
    return 0.50 + 0.02 * (retirementYear - 2005)
  } else {
    // 2021: 81%, increases by 1% per year
    return 0.81 + 0.01 * (retirementYear - 2021)
  }
}

/**
 * Calculate taxation of Rürup-Rente pension payout
 * 
 * @param grossMonthlyPension - Gross monthly pension amount
 * @param retirementYear - Year when pension started
 * @param currentYear - Current year for calculation
 * @param pensionIncreaseRate - Annual increase rate for pension adjustments
 * @param personalTaxRate - Personal income tax rate (0-1)
 * @returns Pension taxation calculation result
 * 
 * @example
 * ```typescript
 * const result = calculateRuerupPensionTaxation(2000, 2030, 2031, 0.01, 0.25)
 * // For someone who retired in 2030 and is in 2031 with 1% pension increase
 * ```
 */
export function calculateRuerupPensionTaxation(
  grossMonthlyPension: number,
  retirementYear: number,
  currentYear: number,
  pensionIncreaseRate: number,
  personalTaxRate: number
): RuerupPensionTaxationResult {
  // Calculate adjusted pension based on years since retirement
  const yearsSinceRetirement = currentYear - retirementYear
  const adjustmentFactor = yearsSinceRetirement > 0 
    ? Math.pow(1 + pensionIncreaseRate, yearsSinceRetirement)
    : 1.0

  const adjustedMonthlyPension = grossMonthlyPension * adjustmentFactor
  const grossAnnualPension = adjustedMonthlyPension * 12

  // Get taxable percentage based on retirement year
  const taxablePercentage = getRuerupPensionTaxablePercentage(retirementYear)
  const taxableAmount = grossAnnualPension * taxablePercentage

  // Calculate income tax (simplified - in reality depends on total income)
  const incomeTax = taxableAmount * personalTaxRate

  const netAnnualPension = grossAnnualPension - incomeTax

  return {
    grossAnnualPension,
    grossMonthlyPension: adjustedMonthlyPension,
    taxablePercentage,
    taxableAmount,
    incomeTax,
    netAnnualPension,
  }
}

/**
 * Create default Rürup-Rente configuration
 * 
 * @returns Default configuration with disabled state
 */
export function createDefaultRuerupConfig(): RuerupRenteConfig {
  return {
    enabled: false,
    annualContribution: 10000,
    pensionStartYear: 2040,
    expectedMonthlyPension: 1500,
    civilStatus: 'single',
    pensionIncreaseRate: 0.01,
  }
}
