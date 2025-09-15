/**
 * Types and utilities for German statutory pension (Gesetzliche Rente) integration
 */

/**
 * Configuration for German statutory pension
 * Based on typical data available from tax returns (Steuerbescheid)
 */
export interface StatutoryPensionConfig {
  /** Whether statutory pension is enabled in the calculation */
  enabled: boolean

  /** Starting year for pension payments */
  startYear: number

  /** Monthly pension amount in EUR (before taxes) */
  monthlyAmount: number

  /** Annual increase rate for pension adjustments (default: 1% based on historical data) */
  annualIncreaseRate: number

  /** Percentage of pension subject to income tax (Steuerpflichtiger Anteil) */
  taxablePercentage: number

  /** Tax return specific data */
  taxReturnData?: {
    /** Year of the tax return */
    taxYear: number
    /** Annual pension received according to tax return */
    annualPensionReceived: number
    /** Taxable portion according to tax return */
    taxablePortion: number
  }

  /** Optional: Expected retirement age for automatic start year calculation */
  retirementAge?: number
  /** Optional: Birth year for calculating start year from retirement age */
  birthYear?: number
}

/**
 * Result of statutory pension calculation for a specific year
 */
export interface StatutoryPensionYearResult {
  /** Total annual pension received (before taxes) */
  grossAnnualAmount: number
  /** Monthly pension amount (before taxes) */
  grossMonthlyAmount: number
  /** Taxable portion of annual pension */
  taxableAmount: number
  /** Income tax on pension (if any) */
  incomeTax: number
  /** Net annual pension after taxes */
  netAnnualAmount: number
  /** Adjustment factor applied this year */
  adjustmentFactor: number
}

/**
 * Complete statutory pension calculation result across years
 */
export interface StatutoryPensionResult {
  [year: number]: StatutoryPensionYearResult
}

/**
 * Calculate statutory pension for a given year
 */
export function calculateStatutoryPensionForYear(
  config: StatutoryPensionConfig,
  year: number,
  incomeTaxRate: number = 0.0, // Income tax rate for pension taxation
  grundfreibetragAmount: number = 0, // Basic tax allowance
): StatutoryPensionYearResult {
  if (!config.enabled || year < config.startYear) {
    return {
      grossAnnualAmount: 0,
      grossMonthlyAmount: 0,
      taxableAmount: 0,
      incomeTax: 0,
      netAnnualAmount: 0,
      adjustmentFactor: 1,
    }
  }

  // Calculate adjustment factor for pension increases
  const yearsFromStart = year - config.startYear
  const adjustmentFactor = Math.pow(1 + config.annualIncreaseRate / 100, yearsFromStart)

  // Calculate gross amounts
  const grossMonthlyAmount = config.monthlyAmount * adjustmentFactor
  const grossAnnualAmount = grossMonthlyAmount * 12

  // Calculate taxable amount
  const taxableAmount = grossAnnualAmount * (config.taxablePercentage / 100)

  // Calculate income tax (only on amount above Grundfreibetrag)
  const taxableAmountAboveAllowance = Math.max(0, taxableAmount - grundfreibetragAmount)
  const incomeTax = taxableAmountAboveAllowance * (incomeTaxRate / 100)

  // Calculate net amount
  const netAnnualAmount = grossAnnualAmount - incomeTax

  return {
    grossAnnualAmount,
    grossMonthlyAmount,
    taxableAmount,
    incomeTax,
    netAnnualAmount,
    adjustmentFactor,
  }
}

/**
 * Calculate statutory pension across multiple years
 */
export function calculateStatutoryPension(
  config: StatutoryPensionConfig,
  startYear: number,
  endYear: number,
  incomeTaxRate: number = 0.0,
  grundfreibetragPerYear?: { [year: number]: number },
): StatutoryPensionResult {
  const result: StatutoryPensionResult = {}

  for (let year = startYear; year <= endYear; year++) {
    const grundfreibetrag = grundfreibetragPerYear?.[year] || 0
    result[year] = calculateStatutoryPensionForYear(
      config,
      year,
      incomeTaxRate,
      grundfreibetrag,
    )
  }

  return result
}

/**
 * Create default statutory pension configuration
 */
export function createDefaultStatutoryPensionConfig(): StatutoryPensionConfig {
  return {
    enabled: false,
    startYear: 2041, // Default retirement year
    monthlyAmount: 1500, // Default monthly pension amount in EUR
    annualIncreaseRate: 1.0, // 1% annual increase
    taxablePercentage: 80, // 80% taxable (typical for current retirees)
    retirementAge: 67, // Standard retirement age in Germany
  }
}

/**
 * Calculate start year from birth year and retirement age
 */
export function calculatePensionStartYear(birthYear: number, retirementAge: number = 67): number {
  return birthYear + retirementAge
}

/**
 * Estimate monthly pension from tax return data
 */
export function estimateMonthlyPensionFromTaxReturn(
  taxReturnData: NonNullable<StatutoryPensionConfig['taxReturnData']>,
): number {
  return taxReturnData.annualPensionReceived / 12
}

/**
 * Estimate taxable percentage from tax return data
 */
export function estimateTaxablePercentageFromTaxReturn(
  taxReturnData: NonNullable<StatutoryPensionConfig['taxReturnData']>,
): number {
  if (taxReturnData.annualPensionReceived === 0) {
    return 80 // Default fallback
  }
  return (taxReturnData.taxablePortion / taxReturnData.annualPensionReceived) * 100
}
