/**
 * German Pension Points (Rentenpunkte) Calculator
 * 
 * This module calculates pension entitlements based on the German statutory pension system,
 * specifically using the Rentenpunkte (pension points) methodology.
 * 
 * Key concepts:
 * - Pension Points = (Individual Gross Salary) / (Average Gross Salary in Germany)
 * - Monthly Pension = Total Pension Points × Current Pension Value (Rentenwert)
 * - The system considers contribution years, salary history, and the current pension value
 */

/**
 * Historical average gross salaries in Germany (preliminary points)
 * Source: Deutsche Rentenversicherung
 * These values are used to calculate pension points for each year
 */
export const AVERAGE_GROSS_SALARY_HISTORY: { [year: number]: number } = {
  2020: 40551,
  2021: 41541,
  2022: 43142,
  2023: 45358,
  2024: 45358, // Preliminary, will be updated
}

/**
 * Current pension value (Rentenwert) in EUR
 * This is the monthly pension amount for 1.0 pension points
 * Updated annually by the German government
 */
export const CURRENT_PENSION_VALUE_WEST = 37.60 // EUR per month (2024)
export const CURRENT_PENSION_VALUE_EAST = 37.60 // EUR per month (2024, same as West since 2024)

/**
 * Configuration for calculating pension points
 */
export interface PensionPointsConfig {
  /** Annual gross salary history: { year: grossSalary } */
  salaryHistory: { [year: number]: number }

  /** Region for pension calculation (affects Rentenwert) */
  region: 'west' | 'east'

  /** Custom average salary history (optional, uses default if not provided) */
  customAverageSalaryHistory?: { [year: number]: number }

  /** Custom pension value (optional, uses default if not provided) */
  customPensionValue?: number
}

/**
 * Result of pension points calculation for a single year
 */
export interface YearlyPensionPointsResult {
  /** Year of the calculation */
  year: number

  /** Gross salary for this year */
  grossSalary: number

  /** Average gross salary in Germany for this year */
  averageGrossSalary: number

  /** Pension points earned this year */
  pensionPoints: number
}

/**
 * Complete pension points calculation result
 */
export interface PensionPointsResult {
  /** Yearly breakdown of pension points */
  yearlyResults: YearlyPensionPointsResult[]

  /** Total pension points accumulated */
  totalPensionPoints: number

  /** Number of contribution years */
  contributionYears: number

  /** Calculated monthly pension amount in EUR */
  monthlyPension: number

  /** Calculated annual pension amount in EUR */
  annualPension: number

  /** Pension value (Rentenwert) used in calculation */
  pensionValue: number
}

/**
 * Calculate pension points for a single year
 */
export function calculatePensionPointsForYear(
  grossSalary: number,
  averageGrossSalary: number,
): number {
  if (averageGrossSalary <= 0) {
    return 0
  }
  return grossSalary / averageGrossSalary
}

/**
 * Get average gross salary for a given year
 * Uses custom history if provided, otherwise uses default
 */
export function getAverageGrossSalary(
  year: number,
  customHistory?: { [year: number]: number },
): number {
  const history = customHistory || AVERAGE_GROSS_SALARY_HISTORY

  // If exact year exists, use it
  if (history[year]) {
    return history[year]
  }

  // Otherwise, find the most recent year before the requested year
  const years = Object.keys(history)
    .map(Number)
    .sort((a, b) => a - b)

  let mostRecentYear = years[0]
  for (const y of years) {
    if (y <= year) {
      mostRecentYear = y
    } else {
      break
    }
  }

  return history[mostRecentYear] || 45358 // Default to 2024 value if not found
}

/**
 * Calculate total pension points and resulting pension
 */
export function calculatePensionPoints(config: PensionPointsConfig): PensionPointsResult {
  const yearlyResults: YearlyPensionPointsResult[] = []
  let totalPensionPoints = 0

  // Calculate pension points for each year in salary history
  const years = Object.keys(config.salaryHistory)
    .map(Number)
    .sort((a, b) => a - b)

  for (const year of years) {
    const grossSalary = config.salaryHistory[year]
    const averageGrossSalary = getAverageGrossSalary(year, config.customAverageSalaryHistory)
    const pensionPoints = calculatePensionPointsForYear(grossSalary, averageGrossSalary)

    yearlyResults.push({
      year,
      grossSalary,
      averageGrossSalary,
      pensionPoints,
    })

    totalPensionPoints += pensionPoints
  }

  // Determine pension value (Rentenwert)
  const pensionValue =
    config.customPensionValue ||
    (config.region === 'east' ? CURRENT_PENSION_VALUE_EAST : CURRENT_PENSION_VALUE_WEST)

  // Calculate monthly and annual pension
  const monthlyPension = totalPensionPoints * pensionValue
  const annualPension = monthlyPension * 12

  return {
    yearlyResults,
    totalPensionPoints,
    contributionYears: years.length,
    monthlyPension,
    annualPension,
    pensionValue,
  }
}

/**
 * Create a simple salary history based on starting salary and annual increase
 */
export function createSalaryHistory(
  startYear: number,
  endYear: number,
  startingSalary: number,
  annualIncreasePercent: number,
): { [year: number]: number } {
  const salaryHistory: { [year: number]: number } = {}
  let currentSalary = startingSalary

  for (let year = startYear; year <= endYear; year++) {
    salaryHistory[year] = Math.round(currentSalary)
    currentSalary *= 1 + annualIncreasePercent / 100
  }

  return salaryHistory
}

/**
 * Estimate future average gross salary based on historical growth
 */
export function estimateFutureAverageSalary(
  futureYear: number,
  historicalGrowthPercent = 2.5,
): number {
  const baseYear = 2024
  const baseSalary = AVERAGE_GROSS_SALARY_HISTORY[baseYear]

  if (futureYear <= baseYear) {
    return getAverageGrossSalary(futureYear)
  }

  const yearsDifference = futureYear - baseYear
  return Math.round(baseSalary * Math.pow(1 + historicalGrowthPercent / 100, yearsDifference))
}

/**
 * Create projected salary history including future years
 */
export function createProjectedSalaryHistory(
  startYear: number,
  endYear: number,
  startingSalary: number,
  annualIncreasePercent: number,
  customAverageSalaryGrowth?: number,
): { salaryHistory: { [year: number]: number }; averageSalaryHistory: { [year: number]: number } } {
  const salaryHistory = createSalaryHistory(startYear, endYear, startingSalary, annualIncreasePercent)

  // Create average salary history for future years
  const averageSalaryHistory: { [year: number]: number } = { ...AVERAGE_GROSS_SALARY_HISTORY }

  const currentYear = new Date().getFullYear()
  const avgGrowth = customAverageSalaryGrowth !== undefined ? customAverageSalaryGrowth : 2.5

  for (let year = currentYear + 1; year <= endYear; year++) {
    averageSalaryHistory[year] = estimateFutureAverageSalary(year, avgGrowth)
  }

  return {
    salaryHistory,
    averageSalaryHistory,
  }
}
