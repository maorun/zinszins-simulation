/**
 * Pension Top-Up Strategy (Renten-Auffüll-Strategie) Calculator
 *
 * This module implements calculations for voluntary pension contributions in the German
 * statutory pension system (Gesetzliche Rentenversicherung), focusing on:
 * 1. Nachkauf von Rentenpunkten (Purchasing additional pension points)
 * 2. Ausgleich von Rentenabschlägen (Offsetting pension deductions for early retirement)
 *
 * Legal basis: § 187a SGB VI (Sozialgesetzbuch)
 */

import { CURRENT_PENSION_VALUE_WEST, AVERAGE_GROSS_SALARY_HISTORY } from './pension-points'

/**
 * Standard retirement age for different birth years (Regelaltersgrenze)
 * According to § 35 SGB VI
 */
const STANDARD_RETIREMENT_AGE: { [birthYear: number]: number } = {
  1946: 65,
  1947: 65.08, // 65 years and 1 month
  1948: 65.17, // 65 years and 2 months
  1949: 65.25, // 65 years and 3 months
  1950: 65.33, // 65 years and 4 months
  1951: 65.42, // 65 years and 5 months
  1952: 65.5, // 65 years and 6 months
  1953: 65.58, // 65 years and 7 months
  1954: 65.67, // 65 years and 8 months
  1955: 65.75, // 65 years and 9 months
  1956: 65.83, // 65 years and 10 months
  1957: 65.92, // 65 years and 11 months
  1958: 66,
  1959: 66.17, // 66 years and 2 months
  1960: 66.33, // 66 years and 4 months
  1961: 66.5, // 66 years and 6 months
  1962: 66.67, // 66 years and 8 months
  1963: 66.83, // 66 years and 10 months
}

/**
 * Get standard retirement age for a given birth year
 */
export function getStandardRetirementAge(birthYear: number): number {
  // For years before 1946, return 65
  if (birthYear < 1946) return 65
  // For years from 1964 onwards, return 67
  if (birthYear >= 1964) return 67
  // Lookup in table
  return STANDARD_RETIREMENT_AGE[birthYear] || 67
}

/**
 * Pension deduction rate per month of early retirement (Rentenabschlag)
 * According to § 77 Abs. 2 SGB VI
 */
export const PENSION_DEDUCTION_RATE_PER_MONTH = 0.003 // 0.3% per month

/**
 * Maximum monthly contribution to statutory pension insurance (2024)
 * Based on contribution assessment ceiling (Beitragsbemessungsgrenze West)
 */
export const MAX_MONTHLY_CONTRIBUTION = 1404.00 // EUR (2024)

/**
 * Pension insurance contribution rate (2024)
 * Split equally between employer and employee in normal employment
 */
export const PENSION_INSURANCE_RATE = 0.186 // 18.6%

/**
 * Configuration for pension top-up calculation
 */
export interface PensionTopUpConfig {
  /** Birth year of the person */
  birthYear: number

  /** Desired retirement age (can be earlier than standard retirement age) */
  desiredRetirementAge: number

  /** Current number of pension points already earned */
  currentPensionPoints: number

  /** Target number of pension points desired (for Nachkauf) */
  targetPensionPoints?: number

  /** Custom pension value (optional, uses current value if not provided) */
  customPensionValue?: number

  /** Year of the voluntary contribution payment */
  paymentYear: number
}

/**
 * Result of pension deduction offset calculation
 */
export interface PensionDeductionOffsetResult {
  /** Standard retirement age in years */
  standardRetirementAge: number

  /** Desired retirement age in years */
  desiredRetirementAge: number

  /** Months of early retirement */
  monthsOfEarlyRetirement: number

  /** Total pension deduction percentage */
  totalDeductionPercentage: number

  /** Cost to fully offset the deduction in EUR */
  offsetCost: number

  /** Monthly pension lost due to early retirement (before offset) */
  monthlyPensionLost: number

  /** Tax deductibility as Vorsorgeaufwendungen (full deductibility) */
  taxDeductibility: number
}

/**
 * Result of pension points purchase calculation
 */
export interface PensionPointsPurchaseResult {
  /** Current pension points */
  currentPensionPoints: number

  /** Target pension points */
  targetPensionPoints: number

  /** Additional pension points to purchase */
  additionalPoints: number

  /** Cost per pension point in EUR */
  costPerPoint: number

  /** Total cost for purchasing additional points */
  totalCost: number

  /** Additional monthly pension from purchased points */
  additionalMonthlyPension: number

  /** Tax deductibility as Vorsorgeaufwendungen */
  taxDeductibility: number

  /** Pension value used in calculation */
  pensionValue: number
}

/**
 * Combined result showing both options
 */
export interface PensionTopUpResult {
  /** Pension deduction offset calculation result */
  deductionOffset: PensionDeductionOffsetResult

  /** Pension points purchase calculation result (if targetPensionPoints provided) */
  pointsPurchase?: PensionPointsPurchaseResult

  /** Break-even analysis */
  breakEvenAnalysis: {
    /** Years until break-even for deduction offset */
    yearsUntilBreakEvenDeduction: number
    /** Years until break-even for points purchase (if applicable) */
    yearsUntilBreakEvenPurchase?: number
  }
}

/**
 * Calculate the cost to offset pension deductions for early retirement
 * (Ausgleich von Rentenabschlägen)
 *
 * @param config - Pension top-up configuration
 * @returns Calculation result for offsetting deductions
 */
export function calculatePensionDeductionOffset(config: PensionTopUpConfig): PensionDeductionOffsetResult {
  const standardRetirementAge = getStandardRetirementAge(config.birthYear)
  const monthsOfEarlyRetirement = Math.max(0, Math.round((standardRetirementAge - config.desiredRetirementAge) * 12))
  const totalDeductionPercentage = monthsOfEarlyRetirement * PENSION_DEDUCTION_RATE_PER_MONTH
  
  const pensionValue = config.customPensionValue || CURRENT_PENSION_VALUE_WEST
  const monthlyPension = config.currentPensionPoints * pensionValue
  const monthlyPensionLost = monthlyPension * totalDeductionPercentage
  
  // Cost calculation based on actuarial formula (simplified)
  // Actual formula used by Deutsche Rentenversicherung is more complex
  // This uses the average gross salary as approximation for cost per point
  const averageGrossSalary = AVERAGE_GROSS_SALARY_HISTORY[2024] || 45358
  const pensionPointsLost = config.currentPensionPoints * totalDeductionPercentage
  const offsetCost = pensionPointsLost * averageGrossSalary

  return {
    standardRetirementAge,
    desiredRetirementAge: config.desiredRetirementAge,
    monthsOfEarlyRetirement,
    totalDeductionPercentage,
    offsetCost,
    monthlyPensionLost,
    taxDeductibility: 1.0, // 100% tax deductible as Vorsorgeaufwendungen
  }
}

/**
 * Calculate the cost and benefit of purchasing additional pension points
 * (Nachkauf von Rentenpunkten)
 *
 * @param config - Pension top-up configuration
 * @returns Calculation result for purchasing pension points
 */
export function calculatePensionPointsPurchase(config: PensionTopUpConfig): PensionPointsPurchaseResult | null {
  if (!config.targetPensionPoints) {
    return null
  }

  const additionalPoints = Math.max(0, config.targetPensionPoints - config.currentPensionPoints)
  
  // Cost per pension point is based on average gross salary
  // This is a simplified calculation - actual cost from Deutsche Rentenversicherung may vary
  const averageGrossSalary = AVERAGE_GROSS_SALARY_HISTORY[2024] || 45358
  const costPerPoint = averageGrossSalary
  const totalCost = additionalPoints * costPerPoint
  
  const pensionValue = config.customPensionValue || CURRENT_PENSION_VALUE_WEST
  const additionalMonthlyPension = additionalPoints * pensionValue

  return {
    currentPensionPoints: config.currentPensionPoints,
    targetPensionPoints: config.targetPensionPoints,
    additionalPoints,
    costPerPoint,
    totalCost,
    additionalMonthlyPension,
    taxDeductibility: 1.0, // 100% tax deductible as Vorsorgeaufwendungen in 2024+
    pensionValue,
  }
}

/**
 * Calculate break-even point for voluntary contributions
 *
 * @param monthlyBenefit - Additional monthly pension benefit in EUR
 * @param totalCost - Total cost of voluntary contribution in EUR
 * @returns Number of years until break-even
 */
export function calculateBreakEven(monthlyBenefit: number, totalCost: number): number {
  if (monthlyBenefit <= 0) {
    return Infinity
  }
  const annualBenefit = monthlyBenefit * 12
  return totalCost / annualBenefit
}

/**
 * Main function to calculate pension top-up strategy
 *
 * @param config - Pension top-up configuration
 * @returns Complete calculation result with recommendations
 */
export function calculatePensionTopUp(config: PensionTopUpConfig): PensionTopUpResult {
  const deductionOffset = calculatePensionDeductionOffset(config)
  const pointsPurchase = calculatePensionPointsPurchase(config)

  // Calculate break-even analysis
  const yearsUntilBreakEvenDeduction = calculateBreakEven(
    deductionOffset.monthlyPensionLost,
    deductionOffset.offsetCost
  )

  const yearsUntilBreakEvenPurchase = pointsPurchase
    ? calculateBreakEven(pointsPurchase.additionalMonthlyPension, pointsPurchase.totalCost)
    : undefined

  return {
    deductionOffset,
    pointsPurchase: pointsPurchase || undefined,
    breakEvenAnalysis: {
      yearsUntilBreakEvenDeduction,
      yearsUntilBreakEvenPurchase,
    },
  }
}

/**
 * Validate birth year range
 */
function validateBirthYear(birthYear: number): string | null {
  if (birthYear < 1940 || birthYear > 2020) {
    return 'Geburtsjahr muss zwischen 1940 und 2020 liegen'
  }
  return null
}

/**
 * Validate retirement age range
 */
function validateRetirementAge(desiredRetirementAge: number, birthYear: number): string[] {
  const errors: string[] = []
  
  if (desiredRetirementAge < 50 || desiredRetirementAge > 75) {
    errors.push('Gewünschtes Renteneintrittsalter muss zwischen 50 und 75 Jahren liegen')
  }
  
  const standardAge = getStandardRetirementAge(birthYear)
  if (desiredRetirementAge > standardAge) {
    errors.push(`Gewünschtes Renteneintrittsalter (${desiredRetirementAge}) liegt nach Regelaltersgrenze (${standardAge.toFixed(1)})`)
  }
  
  return errors
}

/**
 * Validate pension points
 */
function validatePensionPoints(currentPensionPoints: number, targetPensionPoints?: number): string[] {
  const errors: string[] = []
  
  if (currentPensionPoints < 0) {
    errors.push('Aktuelle Rentenpunkte können nicht negativ sein')
  }
  
  if (targetPensionPoints !== undefined && targetPensionPoints < currentPensionPoints) {
    errors.push('Ziel-Rentenpunkte müssen größer als aktuelle Rentenpunkte sein')
  }
  
  return errors
}

/**
 * Validate payment year
 */
function validatePaymentYear(paymentYear: number): string | null {
  if (paymentYear < 2000 || paymentYear > 2100) {
    return 'Zahlungsjahr muss zwischen 2000 und 2100 liegen'
  }
  return null
}

/**
 * Validate pension top-up configuration
 * @param config - Configuration to validate
 * @returns Array of validation error messages (empty if valid)
 */
export function validatePensionTopUpConfig(config: PensionTopUpConfig): string[] {
  const errors: string[] = []

  const birthYearError = validateBirthYear(config.birthYear)
  if (birthYearError) errors.push(birthYearError)

  const retirementAgeErrors = validateRetirementAge(config.desiredRetirementAge, config.birthYear)
  errors.push(...retirementAgeErrors)

  const pensionPointsErrors = validatePensionPoints(config.currentPensionPoints, config.targetPensionPoints)
  errors.push(...pensionPointsErrors)

  const paymentYearError = validatePaymentYear(config.paymentYear)
  if (paymentYearError) errors.push(paymentYearError)

  return errors
}

/**
 * Get default pension top-up configuration
 */
export function getDefaultPensionTopUpConfig(): PensionTopUpConfig {
  const currentYear = new Date().getFullYear()
  return {
    birthYear: 1980,
    desiredRetirementAge: 63,
    currentPensionPoints: 30,
    targetPensionPoints: undefined,
    paymentYear: currentYear,
  }
}
