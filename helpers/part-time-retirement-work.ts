/**
 * Types and utilities for part-time work during retirement (Zeitweise Rückkehr in den Arbeitsmarkt)
 * This module handles the simulation of part-time employment during retirement,
 * including tax implications, social security contributions, and portfolio withdrawal adjustments.
 */

/**
 * Configuration for a part-time work phase during retirement
 */
export interface PartTimeWorkPhase {
  /** Year when part-time work starts */
  startYear: number

  /** Year when part-time work ends */
  endYear: number

  /** Monthly gross income from part-time work in EUR */
  monthlyGrossIncome: number

  /** Hours worked per week (for documentation) */
  weeklyHours: number

  /** Description of the work (e.g., "Beratungstätigkeit", "Aushilfstätigkeit") */
  description: string
}

/**
 * Configuration for part-time retirement work simulation
 */
export interface PartTimeRetirementWorkConfig {
  /** List of part-time work phases */
  workPhases: PartTimeWorkPhase[]

  /** Whether to reduce portfolio withdrawals during work phases */
  reduceWithdrawals: boolean

  /** Percentage to reduce portfolio withdrawals by (0-100) when working */
  withdrawalReductionPercent: number

  /** Whether to automatically calculate social security contributions */
  calculateSocialSecurity: boolean
}

/**
 * Social security contribution rates for part-time workers in retirement
 * Based on German social security law (Sozialversicherung)
 */
export interface SocialSecurityRates {
  /** Health insurance contribution rate (Krankenversicherung) */
  healthInsuranceRate: number

  /** Long-term care insurance contribution rate (Pflegeversicherung) */
  careInsuranceRate: number

  /** Additional care insurance surcharge for childless persons (Kinderlosenzuschlag) */
  childlessSurcharge: number

  /** Whether pension insurance contributions are required (usually exempt for retirees) */
  requiresPensionContributions: boolean
}

/**
 * Result of part-time work calculation for a single year
 */
export interface PartTimeWorkResult {
  /** Year of calculation */
  year: number

  /** Whether the person is working part-time this year */
  isWorking: boolean

  /** Monthly gross income (if working) */
  monthlyGrossIncome: number

  /** Annual gross income (if working) */
  annualGrossIncome: number

  /** Annual net income after taxes and social security */
  annualNetIncome: number

  /** Income tax paid (Einkommensteuer) */
  incomeTax: number

  /** Social security contributions paid */
  socialSecurityContributions: number

  /** Health insurance contributions */
  healthInsuranceContributions: number

  /** Care insurance contributions */
  careInsuranceContributions: number

  /** Portfolio withdrawal amount (potentially reduced if working) */
  portfolioWithdrawal: number

  /** Original planned portfolio withdrawal (before reduction) */
  originalPortfolioWithdrawal: number

  /** Amount saved from portfolio due to work income */
  portfolioSavings: number

  /** Description of the work phase (if working) */
  workDescription: string
}

/**
 * Complete result of part-time retirement work simulation
 */
export interface PartTimeRetirementWorkSimulationResult {
  /** Year-by-year results */
  yearlyResults: PartTimeWorkResult[]

  /** Total gross income earned from part-time work */
  totalGrossIncome: number

  /** Total net income earned from part-time work */
  totalNetIncome: number

  /** Total taxes paid on work income */
  totalTaxesPaid: number

  /** Total social security contributions paid */
  totalSocialSecurityPaid: number

  /** Total portfolio savings (amount not withdrawn due to work income) */
  totalPortfolioSavings: number

  /** Number of years worked part-time */
  yearsWorked: number

  /** Average annual net income during work years */
  averageAnnualNetIncome: number
}

/**
 * Default social security rates for part-time retirees in Germany (2024)
 */
export const DEFAULT_SOCIAL_SECURITY_RATES: SocialSecurityRates = {
  healthInsuranceRate: 0.073, // 7.3% (employer + employee share)
  careInsuranceRate: 0.0305, // 3.05% base rate
  childlessSurcharge: 0.006, // 0.6% additional for childless persons over 23
  requiresPensionContributions: false, // Retirees are generally exempt
}

/**
 * Calculate net income from gross income for part-time retirees
 * Takes into account income tax and social security contributions
 *
 * @param grossIncome - Annual gross income in EUR
 * @param otherIncome - Other taxable income (pension, capital gains, etc.) in EUR
 * @param basicAllowance - Tax-free basic allowance (Grundfreibetrag) in EUR
 * @param socialSecurityRates - Social security contribution rates
 * @param isChildless - Whether the person is childless (for care insurance surcharge)
 * @returns Net income after all deductions
 */
export function calculatePartTimeNetIncome(
  grossIncome: number,
  otherIncome: number,
  basicAllowance: number,
  socialSecurityRates: SocialSecurityRates,
  isChildless: boolean
): {
  netIncome: number
  incomeTax: number
  socialSecurityTotal: number
  healthInsurance: number
  careInsurance: number
} {
  // Calculate social security contributions (on gross income)
  const healthInsurance = grossIncome * socialSecurityRates.healthInsuranceRate
  const careInsuranceRate =
    socialSecurityRates.careInsuranceRate + (isChildless ? socialSecurityRates.childlessSurcharge : 0)
  const careInsurance = grossIncome * careInsuranceRate
  const socialSecurityTotal = healthInsurance + careInsurance

  // Income after social security contributions (for tax calculation)
  const incomeAfterSocialSecurity = grossIncome - socialSecurityTotal

  // Total taxable income (work + other income)
  const totalTaxableIncome = incomeAfterSocialSecurity + otherIncome

  // Calculate income tax using German progressive tax system
  let incomeTax = 0
  if (totalTaxableIncome > basicAllowance) {
    const taxableAmount = totalTaxableIncome - basicAllowance
    incomeTax = calculateGermanIncomeTax(taxableAmount)
  }

  // Calculate net income
  const netIncome = grossIncome - socialSecurityTotal - incomeTax

  return {
    netIncome,
    incomeTax,
    socialSecurityTotal,
    healthInsurance,
    careInsurance,
  }
}

/**
 * Calculate German income tax (Einkommensteuer) using the 2024 progressive tax rates
 * Simplified calculation for illustrative purposes
 *
 * @param taxableIncome - Taxable income after deductions
 * @returns Income tax amount
 */
function calculateGermanIncomeTax(taxableIncome: number): number {
  if (taxableIncome <= 0) return 0

  // Zone 1: Basic allowance (already deducted)
  // Zone 2: 11,605€ - 17,005€ (14% - 24%)
  if (taxableIncome <= 17005) {
    const y = (taxableIncome - 11604) / 10000
    return (979.18 * y + 1400) * y
  }

  // Zone 3: 17,006€ - 66,760€ (24% - 42%)
  if (taxableIncome <= 66760) {
    const z = (taxableIncome - 17005) / 10000
    return (192.59 * z + 2397) * z + 966.53
  }

  // Zone 4: 66,761€ - 277,825€ (42%)
  if (taxableIncome <= 277825) {
    return 0.42 * taxableIncome - 9972.98
  }

  // Zone 5: Above 277,826€ (45% - "Reichensteuer")
  return 0.45 * taxableIncome - 18307.73
}

/**
 * Calculate income and contributions for a working year
 */
function calculateWorkingYearIncome(
  annualGrossIncome: number,
  otherIncome: number,
  basicAllowance: number,
  socialSecurityRates: SocialSecurityRates,
  isChildless: boolean,
  calculateSocialSecurity: boolean
) {
  if (!calculateSocialSecurity) {
    return {
      annualNetIncome: annualGrossIncome * 0.7,
      incomeTax: annualGrossIncome * 0.2,
      socialSecurityContributions: annualGrossIncome * 0.1,
      healthInsuranceContributions: annualGrossIncome * 0.073,
      careInsuranceContributions: annualGrossIncome * 0.0305,
    }
  }

  const netIncomeCalc = calculatePartTimeNetIncome(
    annualGrossIncome,
    otherIncome,
    basicAllowance,
    socialSecurityRates,
    isChildless
  )

  return {
    annualNetIncome: netIncomeCalc.netIncome,
    incomeTax: netIncomeCalc.incomeTax,
    socialSecurityContributions: netIncomeCalc.socialSecurityTotal,
    healthInsuranceContributions: netIncomeCalc.healthInsurance,
    careInsuranceContributions: netIncomeCalc.careInsurance,
  }
}

/**
 * Calculate portfolio withdrawal adjustment for a working year
 */
function calculateWithdrawalAdjustment(
  originalWithdrawal: number,
  isWorking: boolean,
  reduceWithdrawals: boolean,
  reductionPercent: number
): { portfolioWithdrawal: number; portfolioSavings: number } {
  if (!isWorking || !reduceWithdrawals) {
    return { portfolioWithdrawal: originalWithdrawal, portfolioSavings: 0 }
  }

  const reductionAmount = originalWithdrawal * (reductionPercent / 100)
  const portfolioWithdrawal = Math.max(0, originalWithdrawal - reductionAmount)
  const portfolioSavings = originalWithdrawal - portfolioWithdrawal

  return { portfolioWithdrawal, portfolioSavings }
}

/**
 * Get work information for a given year
 */
function getWorkInfo(year: number, workPhases: PartTimeWorkPhase[]) {
  const workPhase = workPhases.find((phase) => year >= phase.startYear && year <= phase.endYear)
  const isWorking = workPhase !== undefined
  const monthlyGrossIncome = isWorking ? workPhase.monthlyGrossIncome : 0
  const annualGrossIncome = monthlyGrossIncome * 12
  const workDescription = isWorking ? workPhase.description : ''

  return { isWorking, monthlyGrossIncome, annualGrossIncome, workDescription }
}

/**
 * Process a single year in the part-time retirement work simulation
 */
function processSimulationYear(
  year: number,
  yearIndex: number,
  config: PartTimeRetirementWorkConfig,
  plannedWithdrawals: number[],
  otherAnnualIncome: number[],
  basicAllowance: number,
  isChildless: boolean
): PartTimeWorkResult {
  const workInfo = getWorkInfo(year, config.workPhases)

  const income = workInfo.isWorking
    ? calculateWorkingYearIncome(
        workInfo.annualGrossIncome,
        otherAnnualIncome[yearIndex] || 0,
        basicAllowance,
        DEFAULT_SOCIAL_SECURITY_RATES,
        isChildless,
        config.calculateSocialSecurity
      )
    : {
        annualNetIncome: 0,
        incomeTax: 0,
        socialSecurityContributions: 0,
        healthInsuranceContributions: 0,
        careInsuranceContributions: 0,
      }

  const originalPortfolioWithdrawal = plannedWithdrawals[yearIndex] || 0
  const withdrawal = calculateWithdrawalAdjustment(
    originalPortfolioWithdrawal,
    workInfo.isWorking,
    config.reduceWithdrawals,
    config.withdrawalReductionPercent
  )

  return {
    year,
    ...workInfo,
    ...income,
    portfolioWithdrawal: withdrawal.portfolioWithdrawal,
    originalPortfolioWithdrawal,
    portfolioSavings: withdrawal.portfolioSavings,
  }
}

/**
 * Simulate part-time retirement work over multiple years
 */
export function simulatePartTimeRetirementWork(
  config: PartTimeRetirementWorkConfig,
  startYear: number,
  endYear: number,
  plannedWithdrawals: number[],
  otherAnnualIncome: number[],
  basicAllowance: number,
  isChildless = false
): PartTimeRetirementWorkSimulationResult {
  const yearlyResults: PartTimeWorkResult[] = []
  const totals = { gross: 0, net: 0, tax: 0, socialSecurity: 0, portfolioSavings: 0, yearsWorked: 0 }

  for (let year = startYear; year <= endYear; year++) {
    const yearResult = processSimulationYear(
      year,
      year - startYear,
      config,
      plannedWithdrawals,
      otherAnnualIncome,
      basicAllowance,
      isChildless
    )

    yearlyResults.push(yearResult)

    if (yearResult.isWorking) {
      totals.gross += yearResult.annualGrossIncome
      totals.net += yearResult.annualNetIncome
      totals.tax += yearResult.incomeTax
      totals.socialSecurity += yearResult.socialSecurityContributions
      totals.portfolioSavings += yearResult.portfolioSavings
      totals.yearsWorked++
    }
  }

  return {
    yearlyResults,
    totalGrossIncome: totals.gross,
    totalNetIncome: totals.net,
    totalTaxesPaid: totals.tax,
    totalSocialSecurityPaid: totals.socialSecurity,
    totalPortfolioSavings: totals.portfolioSavings,
    yearsWorked: totals.yearsWorked,
    averageAnnualNetIncome: totals.yearsWorked > 0 ? totals.net / totals.yearsWorked : 0,
  }
}

/**
 * Create a default part-time retirement work configuration
 */
export function createDefaultPartTimeRetirementWorkConfig(): PartTimeRetirementWorkConfig {
  return {
    workPhases: [],
    reduceWithdrawals: true,
    withdrawalReductionPercent: 50,
    calculateSocialSecurity: true,
  }
}

/**
 * Validate a part-time work phase
 */
export function validatePartTimeWorkPhase(phase: PartTimeWorkPhase): string[] {
  const validations = [
    { condition: phase.startYear >= 2020 && phase.startYear <= 2100, message: 'Startjahr muss zwischen 2020 und 2100 liegen' },
    { condition: phase.endYear >= phase.startYear, message: 'Endjahr muss nach dem Startjahr liegen' },
    {
      condition: phase.monthlyGrossIncome >= 0 && phase.monthlyGrossIncome <= 100000,
      message: 'Monatliches Bruttoeinkommen muss zwischen 0€ und 100.000€ liegen',
    },
    { condition: phase.weeklyHours >= 0 && phase.weeklyHours <= 40, message: 'Wochenstunden müssen zwischen 0 und 40 liegen' },
    { condition: phase.description.trim().length > 0, message: 'Beschreibung darf nicht leer sein' },
  ]

  return validations.filter((v) => !v.condition).map((v) => v.message)
}

/**
 * Calculate the impact of part-time work on portfolio longevity
 * Returns the additional years the portfolio can last due to reduced withdrawals
 */
export function calculatePortfolioLongevityImpact(
  totalPortfolioSavings: number,
  averageAnnualWithdrawal: number,
  portfolioReturnRate: number
): number {
  if (averageAnnualWithdrawal <= 0) return 0

  // Simple calculation: how many additional years can the savings support
  // This is a simplified calculation that doesn't account for compound interest
  const additionalYears = totalPortfolioSavings / averageAnnualWithdrawal

  // With compound interest, the impact is larger
  // Using a simple multiplier based on return rate
  const compoundMultiplier = 1 + portfolioReturnRate / 10
  return additionalYears * compoundMultiplier
}
