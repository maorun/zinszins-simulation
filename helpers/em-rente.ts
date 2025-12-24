/**
 * EM-Rente (Erwerbsminderungsrente) - German Statutory Disability Pension Calculator
 *
 * This module calculates disability pension from the German statutory pension insurance (GRV).
 * EM-Rente is different from private BU insurance - it's part of the public pension system.
 *
 * Key concepts:
 * - Volle EM-Rente (Full disability pension): For those unable to work 3+ hours per day
 * - Teilweise EM-Rente (Partial disability pension): For those able to work 3-6 hours per day
 * - Zurechnungszeiten: Attribution periods that extend the calculation base to age 67
 * - Abschläge: Pension reductions of up to 10.8% for early retirement due to disability
 * - Hinzuverdienst: Permissible additional income limits
 * - Besteuerung: Taxation according to German tax law (similar to regular pension)
 */

import { CURRENT_PENSION_VALUE_WEST, CURRENT_PENSION_VALUE_EAST } from './pension-points'

/**
 * Type of EM-Rente
 */
export type EMRenteType = 'volle' | 'teilweise'

/**
 * Configuration for EM-Rente calculation
 */
export interface EMRenteConfig {
  /** Whether EM-Rente calculation is enabled */
  enabled: boolean

  /** Type of disability pension (full or partial) */
  type: EMRenteType

  /** Year when disability started and EM-Rente begins */
  disabilityStartYear: number

  /** Birth year of the insured person */
  birthYear: number

  /** Accumulated pension points (Entgeltpunkte) at time of disability */
  accumulatedPensionPoints: number

  /** Years of contributions to statutory pension insurance */
  contributionYears: number

  /** Region (affects Rentenwert - pension value) */
  region: 'west' | 'east'

  /** Custom pension value (optional, uses current official value if not provided) */
  customPensionValue?: number

  /** Annual increase rate for pension adjustments (default: 1% based on historical data) */
  annualIncreaseRate: number

  /** Whether to apply Zurechnungszeiten (attribution periods) */
  applyZurechnungszeiten: boolean

  /** Whether to apply Abschläge (pension reductions) for early retirement */
  applyAbschlaege: boolean

  /** Percentage of pension subject to income tax (Steuerpflichtiger Anteil) */
  taxablePercentage: number

  /** Optional: Additional income from employment (Hinzuverdienst) per month */
  monthlyAdditionalIncome?: number
}

/**
 * Result of EM-Rente calculation for a specific year
 */
export interface EMRenteYearResult {
  /** Pension points used for calculation (includes Zurechnungszeiten if applicable) */
  pensionPoints: number

  /** Zurechnungszeiten contribution (additional points from attribution periods) */
  zurechnungszeitenPoints: number

  /** Full monthly pension before Abschläge (deductions) */
  grossMonthlyPensionBeforeAbschlaege: number

  /** Abschlag percentage applied (0-10.8%) */
  abschlagPercentage: number

  /** Abschlag amount deducted monthly */
  abschlagAmount: number

  /** Gross monthly pension after Abschläge */
  grossMonthlyPension: number

  /** Gross annual pension (before taxes) */
  grossAnnualPension: number

  /** Taxable portion of annual pension */
  taxableAmount: number

  /** Income tax on pension (if any) */
  incomeTax: number

  /** Net annual pension after taxes */
  netAnnualPension: number

  /** Adjustment factor applied this year (for annual increases) */
  adjustmentFactor: number

  /** Hinzuverdienstgrenze (permissible additional income limit) per month */
  hinzuverdienstgrenze: number

  /** Whether additional income exceeds limit */
  exceedsHinzuverdienstgrenze: boolean

  /** Reduction in pension due to exceeding Hinzuverdienstgrenze */
  hinzuverdienstReduction: number
}

/**
 * Complete EM-Rente calculation result across years
 */
export interface EMRenteResult {
  [year: number]: EMRenteYearResult
}

/**
 * Calculate Zurechnungszeiten (attribution periods) points
 *
 * Zurechnungszeiten extend the calculation base from the actual contribution years
 * to age 67 (as of 2024), giving credit for years the person would have worked.
 *
 * Formula: Average pension points per year × remaining years to age 67
 *
 * @param accumulatedPensionPoints - Total pension points at time of disability
 * @param contributionYears - Years of actual contributions
 * @param ageAtDisability - Age when disability started
 * @param targetAge - Target age for Zurechnungszeiten (67 as of 2024)
 * @returns Additional pension points from Zurechnungszeiten
 */
export function calculateZurechnungszeiten(
  accumulatedPensionPoints: number,
  contributionYears: number,
  ageAtDisability: number,
  targetAge = 67,
): number {
  // No Zurechnungszeiten if already at or past target age
  if (ageAtDisability >= targetAge) {
    return 0
  }

  // No Zurechnungszeiten if no contribution years
  if (contributionYears <= 0) {
    return 0
  }

  // Calculate average pension points per contribution year
  const averagePointsPerYear = accumulatedPensionPoints / contributionYears

  // Calculate remaining years to target age
  const remainingYears = targetAge - ageAtDisability

  // Zurechnungszeiten = average points per year × remaining years
  // Limited to a maximum based on the last 4 years before disability
  const zurechnungszeitenPoints = averagePointsPerYear * remainingYears

  return Math.max(0, zurechnungszeitenPoints)
}

/**
 * Calculate Abschlag (pension reduction) percentage
 *
 * For each month before the regular retirement age that EM-Rente begins,
 * there's a reduction of 0.3%. Maximum reduction is 10.8% (36 months).
 *
 * Regular retirement age is typically 67 (as of 2024).
 *
 * @param ageAtDisability - Age when disability started
 * @param regularRetirementAge - Regular retirement age (67 as of 2024)
 * @returns Abschlag percentage (0-10.8%)
 */
export function calculateAbschlag(ageAtDisability: number, regularRetirementAge = 67): number {
  // No Abschlag if at or past regular retirement age
  if (ageAtDisability >= regularRetirementAge) {
    return 0
  }

  // Calculate years before regular retirement
  const yearsBeforeRetirement = regularRetirementAge - ageAtDisability

  // 0.3% reduction per month, maximum 10.8% (36 months = 3 years)
  const monthsBeforeRetirement = yearsBeforeRetirement * 12
  const maxMonths = 36 // Maximum 36 months of reductions
  const effectiveMonths = Math.min(monthsBeforeRetirement, maxMonths)

  const abschlagPercentage = effectiveMonths * 0.3

  return Math.min(abschlagPercentage, 10.8)
}

/**
 * Calculate Hinzuverdienstgrenze (permissible additional income limit)
 *
 * For volle EM-Rente (full disability pension):
 * - Based on formula from German statutory pension insurance
 * - Calculation: (0.81 × reference amount × 14) / 12 gives annual limit
 * - Then divide by 12 again to get monthly limit
 * - Reference amount = average earnings of all insured persons (2024: ~45,358€)
 * - Results in approximately 3,572€/month (as of 2024)
 *
 * For teilweise EM-Rente (partial disability pension):
 * - Higher limit, approximately double the volle EM-Rente limit
 *
 * @param type - Type of EM-Rente (volle or teilweise)
 * @param referenceAmount - Average earnings reference (default: 45,358€ as of 2024)
 * @returns Monthly Hinzuverdienstgrenze in EUR
 */
export function calculateHinzuverdienstgrenze(type: EMRenteType, referenceAmount = 45358): number {
  if (type === 'volle') {
    // Step 1: Calculate annual base limit
    const annualBaseLimit = (0.81 * referenceAmount * 14) / 12
    // Step 2: Convert to monthly limit
    const monthlyLimit = annualBaseLimit / 12
    return Math.round(monthlyLimit)
  } else {
    // Teilweise EM-Rente: double the volle EM-Rente limit
    const volleAnnualLimit = (0.81 * referenceAmount * 14) / 12
    const teilweiseAnnualLimit = volleAnnualLimit * 2
    const monthlyLimit = teilweiseAnnualLimit / 12
    return Math.round(monthlyLimit)
  }
}

/**
 * Calculate pension reduction due to exceeding Hinzuverdienstgrenze
 *
 * If additional income exceeds the limit, the pension is reduced by 40%
 * of the amount exceeding the limit.
 *
 * @param monthlyAdditionalIncome - Monthly additional income in EUR
 * @param hinzuverdienstgrenze - Monthly limit in EUR
 * @returns Monthly pension reduction in EUR
 */
export function calculateHinzuverdienstReduction(
  monthlyAdditionalIncome: number,
  hinzuverdienstgrenze: number,
): number {
  if (monthlyAdditionalIncome <= hinzuverdienstgrenze) {
    return 0
  }

  const excessAmount = monthlyAdditionalIncome - hinzuverdienstgrenze
  // 40% of excess amount is deducted from pension
  return excessAmount * 0.4
}

/**
 * Get pension value (Rentenwert) based on region
 */
export function getPensionValue(region: 'west' | 'east', customValue?: number): number {
  if (customValue !== undefined) {
    return customValue
  }
  return region === 'west' ? CURRENT_PENSION_VALUE_WEST : CURRENT_PENSION_VALUE_EAST
}

/**
 * Calculate teilweise EM-Rente factor
 *
 * Teilweise EM-Rente (partial disability pension) is 50% of volle EM-Rente.
 */
export function getTeilweiseEMFactor(type: EMRenteType): number {
  return type === 'teilweise' ? 0.5 : 1.0
}

/**
 * Calculate pension points including Zurechnungszeiten
 */
function calculateTotalPensionPoints(
  config: EMRenteConfig,
  ageAtDisability: number,
): {
  pensionPoints: number
  zurechnungszeitenPoints: number
} {
  let pensionPoints = config.accumulatedPensionPoints
  let zurechnungszeitenPoints = 0

  if (config.applyZurechnungszeiten) {
    zurechnungszeitenPoints = calculateZurechnungszeiten(
      config.accumulatedPensionPoints,
      config.contributionYears,
      ageAtDisability,
    )
    pensionPoints += zurechnungszeitenPoints
  }

  return { pensionPoints, zurechnungszeitenPoints }
}

/**
 * Calculate Abschlag details
 */
function calculateAbschlagDetails(
  grossMonthlyPensionBeforeAbschlaege: number,
  ageAtDisability: number,
  applyAbschlaege: boolean,
): { abschlagPercentage: number; abschlagAmount: number } {
  if (!applyAbschlaege) {
    return { abschlagPercentage: 0, abschlagAmount: 0 }
  }

  const abschlagPercentage = calculateAbschlag(ageAtDisability)
  const abschlagAmount = grossMonthlyPensionBeforeAbschlaege * (abschlagPercentage / 100)

  return { abschlagPercentage, abschlagAmount }
}

/**
 * Calculate Hinzuverdienst details
 */
function calculateHinzuverdienstDetails(
  type: EMRenteType,
  monthlyAdditionalIncome: number,
): {
  hinzuverdienstgrenze: number
  exceedsHinzuverdienstgrenze: boolean
  hinzuverdienstReduction: number
} {
  const hinzuverdienstgrenze = calculateHinzuverdienstgrenze(type)
  const exceedsHinzuverdienstgrenze = monthlyAdditionalIncome > hinzuverdienstgrenze
  const hinzuverdienstReduction = calculateHinzuverdienstReduction(monthlyAdditionalIncome, hinzuverdienstgrenze)

  return { hinzuverdienstgrenze, exceedsHinzuverdienstgrenze, hinzuverdienstReduction }
}

/**
 * Calculate taxation
 */
function calculateTaxation(
  grossAnnualPension: number,
  taxablePercentage: number,
  grundfreibetragAmount: number,
  incomeTaxRate: number,
): { taxableAmount: number; incomeTax: number; netAnnualPension: number } {
  const taxableAmount = grossAnnualPension * (taxablePercentage / 100)
  const taxableAmountAboveAllowance = Math.max(0, taxableAmount - grundfreibetragAmount)
  const incomeTax = taxableAmountAboveAllowance * (incomeTaxRate / 100)
  const netAnnualPension = grossAnnualPension - incomeTax

  return { taxableAmount, incomeTax, netAnnualPension }
}

/**
 * Calculate EM-Rente for a specific year
 */
export function calculateEMRenteForYear(
  config: EMRenteConfig,
  year: number,
  incomeTaxRate = 0.0,
  grundfreibetragAmount = 0,
): EMRenteYearResult {
  if (!config.enabled || year < config.disabilityStartYear) {
    return createEmptyYearResult()
  }

  const ageAtDisability = config.disabilityStartYear - config.birthYear
  const yearsFromStart = year - config.disabilityStartYear
  const adjustmentFactor = Math.pow(1 + config.annualIncreaseRate / 100, yearsFromStart)

  const { pensionPoints, zurechnungszeitenPoints } = calculateTotalPensionPoints(config, ageAtDisability)

  const pensionValue = getPensionValue(config.region, config.customPensionValue)
  const teilweiseFactor = getTeilweiseEMFactor(config.type)
  const grossMonthlyPensionBeforeAbschlaege = pensionPoints * pensionValue * teilweiseFactor

  const { abschlagPercentage, abschlagAmount } = calculateAbschlagDetails(
    grossMonthlyPensionBeforeAbschlaege,
    ageAtDisability,
    config.applyAbschlaege,
  )

  let grossMonthlyPension = (grossMonthlyPensionBeforeAbschlaege - abschlagAmount) * adjustmentFactor

  const monthlyAdditionalIncome = config.monthlyAdditionalIncome || 0
  const { hinzuverdienstgrenze, exceedsHinzuverdienstgrenze, hinzuverdienstReduction } = calculateHinzuverdienstDetails(
    config.type,
    monthlyAdditionalIncome,
  )

  grossMonthlyPension = Math.max(0, grossMonthlyPension - hinzuverdienstReduction)

  const grossAnnualPension = grossMonthlyPension * 12

  const { taxableAmount, incomeTax, netAnnualPension } = calculateTaxation(
    grossAnnualPension,
    config.taxablePercentage,
    grundfreibetragAmount,
    incomeTaxRate,
  )

  return {
    pensionPoints,
    zurechnungszeitenPoints,
    grossMonthlyPensionBeforeAbschlaege: grossMonthlyPensionBeforeAbschlaege * adjustmentFactor,
    abschlagPercentage,
    abschlagAmount: abschlagAmount * adjustmentFactor,
    grossMonthlyPension,
    grossAnnualPension,
    taxableAmount,
    incomeTax,
    netAnnualPension,
    adjustmentFactor,
    hinzuverdienstgrenze,
    exceedsHinzuverdienstgrenze,
    hinzuverdienstReduction,
  }
}

/**
 * Create empty year result
 */
function createEmptyYearResult(): EMRenteYearResult {
  return {
    pensionPoints: 0,
    zurechnungszeitenPoints: 0,
    grossMonthlyPensionBeforeAbschlaege: 0,
    abschlagPercentage: 0,
    abschlagAmount: 0,
    grossMonthlyPension: 0,
    grossAnnualPension: 0,
    taxableAmount: 0,
    incomeTax: 0,
    netAnnualPension: 0,
    adjustmentFactor: 1,
    hinzuverdienstgrenze: 0,
    exceedsHinzuverdienstgrenze: false,
    hinzuverdienstReduction: 0,
  }
}

/**
 * Calculate EM-Rente across multiple years
 */
export function calculateEMRente(
  config: EMRenteConfig,
  startYear: number,
  endYear: number,
  incomeTaxRate = 0.0,
  grundfreibetragPerYear?: { [year: number]: number },
): EMRenteResult {
  const result: EMRenteResult = {}

  for (let year = startYear; year <= endYear; year++) {
    const grundfreibetrag = grundfreibetragPerYear?.[year] || 0
    result[year] = calculateEMRenteForYear(config, year, incomeTaxRate, grundfreibetrag)
  }

  return result
}

/**
 * Create default EM-Rente configuration
 */
export function createDefaultEMRenteConfig(): EMRenteConfig {
  const currentYear = new Date().getFullYear()
  const defaultBirthYear = currentYear - 45 // 45 years old by default

  return {
    enabled: false,
    type: 'volle',
    disabilityStartYear: currentYear,
    birthYear: defaultBirthYear,
    accumulatedPensionPoints: 25.0, // ~25 years of average contributions
    contributionYears: 25,
    region: 'west',
    annualIncreaseRate: 1.0, // 1% annual increase
    applyZurechnungszeiten: true, // Apply attribution periods by default
    applyAbschlaege: true, // Apply pension reductions by default
    taxablePercentage: 80, // 80% taxable (typical for current retirees)
  }
}

/**
 * Estimate pension points from monthly pension amount
 *
 * This is useful when users know their expected EM-Rente amount but not their pension points.
 */
export function estimatePensionPointsFromMonthlyPension(
  monthlyPension: number,
  region: 'west' | 'east' = 'west',
  type: EMRenteType = 'volle',
  customPensionValue?: number,
): number {
  const pensionValue = getPensionValue(region, customPensionValue)
  const teilweiseFactor = getTeilweiseEMFactor(type)

  if (pensionValue <= 0 || teilweiseFactor <= 0) {
    return 0
  }

  return monthlyPension / (pensionValue * teilweiseFactor)
}

/**
 * Estimate pension points from annual pension amount
 */
export function estimatePensionPointsFromAnnualPension(
  annualPension: number,
  region: 'west' | 'east' = 'west',
  type: EMRenteType = 'volle',
  customPensionValue?: number,
): number {
  return estimatePensionPointsFromMonthlyPension(annualPension / 12, region, type, customPensionValue)
}
