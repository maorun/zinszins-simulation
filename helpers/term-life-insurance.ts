/**
 * Types and utilities for German term life insurance (Risikolebensversicherung)
 *
 * Term life insurance provides pure death benefit protection without investment component.
 * Key characteristics:
 * - Annual premiums based on coverage amount, age, health status, and contract duration
 * - No capital accumulation (pure risk protection)
 * - Premiums generally not tax-deductible
 * - Death benefits are tax-free for beneficiaries (§ 20 Abs. 1 Nr. 6 EStG)
 * - Common options: level coverage, decreasing coverage
 *
 * This is distinct from capital life insurance (Kapitallebensversicherung) which has
 * a savings component, and fund-linked life insurance which combines investment with insurance.
 */

/**
 * Coverage type for term life insurance
 */
export type TermLifeInsuranceCoverageType = 'level' | 'decreasing'

/**
 * Health status category for premium calculation
 */
export type HealthStatus = 'excellent' | 'good' | 'average' | 'fair' | 'poor'

/**
 * Smoking status (significantly affects premiums)
 */
export type SmokingStatus = 'non-smoker' | 'smoker' | 'former-smoker'

/**
 * Configuration for term life insurance
 */
export interface TermLifeInsuranceConfig {
  /** Display name for this insurance policy */
  name: string

  /** Year when policy starts */
  startYear: number

  /** Year when policy ends */
  endYear: number

  /** Initial coverage amount in EUR */
  coverageAmount: number

  /** Coverage type: level (constant) or decreasing */
  coverageType: TermLifeInsuranceCoverageType

  /** For decreasing coverage: annual reduction rate in percent */
  annualDecreasePercent: number

  /** Birth year of insured person */
  birthYear: number

  /** Gender of insured person (affects mortality rates) */
  gender: 'male' | 'female'

  /** Health status of insured person */
  healthStatus: HealthStatus

  /** Smoking status of insured person */
  smokingStatus: SmokingStatus

  /** Whether this insurance is enabled in calculations */
  enabled: boolean
}

/**
 * Yearly result of term life insurance calculation
 */
export interface TermLifeInsuranceYearResult {
  /** Year of calculation */
  year: number

  /** Age of insured person */
  age: number

  /** Coverage amount for this year */
  coverageAmount: number

  /** Annual premium for this year */
  annualPremium: number

  /** Cumulative premiums paid so far */
  totalPremiumsPaid: number

  /** Death benefit payout if death occurs this year (tax-free) */
  deathBenefitAmount: number
}

/**
 * Summary of term life insurance
 */
export interface TermLifeInsuranceSummary {
  /** Policy configuration */
  config: TermLifeInsuranceConfig

  /** All yearly calculations */
  yearlyResults: TermLifeInsuranceYearResult[]

  /** Total premiums paid over policy lifetime */
  totalPremiumsPaid: number

  /** Average annual premium */
  averageAnnualPremium: number

  /** Initial coverage amount */
  initialCoverageAmount: number

  /** Final coverage amount (may differ for decreasing coverage) */
  finalCoverageAmount: number

  /** Whether death benefits are tax-free (always true in Germany) */
  deathBenefitTaxFree: boolean
}

/**
 * Base mortality rate per 1000 people by age
 * Based on German mortality tables (simplified)
 */
const BASE_MORTALITY_RATES: Record<number, number> = {
  20: 0.5,
  25: 0.6,
  30: 0.7,
  35: 0.9,
  40: 1.2,
  45: 1.8,
  50: 2.8,
  55: 4.5,
  60: 7.0,
  65: 11.0,
  70: 17.0,
  75: 27.0,
}

/**
 * Get base mortality rate for a given age
 */
function getBaseMortalityRate(age: number): number {
  // Find closest age bracket
  const ages = Object.keys(BASE_MORTALITY_RATES)
    .map(Number)
    .sort((a, b) => a - b)

  let closestAge = ages[0] ?? 30
  for (const ageKey of ages) {
    if (age >= ageKey) {
      closestAge = ageKey
    } else {
      break
    }
  }

  return BASE_MORTALITY_RATES[closestAge] ?? 1.0
}

/**
 * Health status multiplier for premium calculation
 */
const HEALTH_STATUS_MULTIPLIERS: Record<HealthStatus, number> = {
  excellent: 0.85,
  good: 1.0,
  average: 1.15,
  fair: 1.35,
  poor: 1.7,
}

/**
 * Smoking status multiplier for premium calculation
 */
const SMOKING_STATUS_MULTIPLIERS: Record<SmokingStatus, number> = {
  'non-smoker': 1.0,
  'former-smoker': 1.25,
  smoker: 1.8,
}

/**
 * Gender multiplier (women typically live longer, lower premiums)
 */
const GENDER_MULTIPLIERS = {
  male: 1.0,
  female: 0.85,
}

/**
 * Calculate annual premium for term life insurance
 */
function calculateAnnualPremium(
  coverageAmount: number,
  age: number,
  gender: 'male' | 'female',
  healthStatus: HealthStatus,
  smokingStatus: SmokingStatus,
): number {
  // Base mortality rate per 1000 people
  const baseMortality = getBaseMortalityRate(age)

  // Apply multipliers for risk factors
  const healthMultiplier = HEALTH_STATUS_MULTIPLIERS[healthStatus] ?? 1.0
  const smokingMultiplier = SMOKING_STATUS_MULTIPLIERS[smokingStatus] ?? 1.0
  const genderMultiplier = GENDER_MULTIPLIERS[gender] ?? 1.0

  // Calculate risk-adjusted mortality rate
  const adjustedMortality = baseMortality * healthMultiplier * smokingMultiplier * genderMultiplier

  // Base premium per 1000 EUR coverage (typical German market: 0.3-2.0 EUR)
  const basePremiumPer1000 = 0.8

  // Calculate annual premium with safety margin and overhead costs
  const riskPremium = (coverageAmount / 1000) * (adjustedMortality / 1000) * coverageAmount
  const administrativeCosts = coverageAmount * 0.0002 // 0.02% for admin
  const safetyMargin = 1.25 // 25% safety margin

  const annualPremium =
    (riskPremium + administrativeCosts + (coverageAmount / 1000) * basePremiumPer1000) * safetyMargin

  return Math.round(annualPremium * 100) / 100
}

/**
 * Calculate coverage amount for a given year
 */
function calculateCoverageAmount(
  config: TermLifeInsuranceConfig,
  year: number,
): number {
  if (config.coverageType === 'level') {
    return config.coverageAmount
  }

  // Decreasing coverage
  const yearsElapsed = year - config.startYear
  const decreaseMultiplier = Math.pow(1 - config.annualDecreasePercent / 100, yearsElapsed)
  return Math.max(0, config.coverageAmount * decreaseMultiplier)
}

/**
 * Calculate term life insurance development over time
 */
export function calculateTermLifeInsurance(
  config: TermLifeInsuranceConfig,
): TermLifeInsuranceSummary {
  const yearlyResults: TermLifeInsuranceYearResult[] = []
  let totalPremiumsPaid = 0

  for (let year = config.startYear; year <= config.endYear; year++) {
    const age = year - config.birthYear
    const coverageAmount = calculateCoverageAmount(config, year)

    const annualPremium = calculateAnnualPremium(
      coverageAmount,
      age,
      config.gender,
      config.healthStatus,
      config.smokingStatus,
    )

    totalPremiumsPaid += annualPremium

    yearlyResults.push({
      year,
      age,
      coverageAmount,
      annualPremium,
      totalPremiumsPaid,
      deathBenefitAmount: coverageAmount, // Always tax-free in Germany
    })
  }

  const policyYears = config.endYear - config.startYear + 1
  const averageAnnualPremium = policyYears > 0 ? totalPremiumsPaid / policyYears : 0

  return {
    config,
    yearlyResults,
    totalPremiumsPaid,
    averageAnnualPremium,
    initialCoverageAmount: config.coverageAmount,
    finalCoverageAmount:
      yearlyResults[yearlyResults.length - 1]?.coverageAmount ?? config.coverageAmount,
    deathBenefitTaxFree: true, // Always true in Germany (§ 20 Abs. 1 Nr. 6 EStG)
  }
}

/**
 * Compare cost efficiency of different coverage amounts
 */
export function compareCoverageAmounts(
  baseConfig: TermLifeInsuranceConfig,
  coverageAmounts: number[],
): Array<{
  coverageAmount: number
  totalPremiumsPaid: number
  averageAnnualPremium: number
  costPerThousandEUR: number
}> {
  return coverageAmounts.map((coverageAmount) => {
    const config = { ...baseConfig, coverageAmount }
    const summary = calculateTermLifeInsurance(config)

    const costPerThousandEUR =
      coverageAmount > 0 ? (summary.totalPremiumsPaid / coverageAmount) * 1000 : 0

    return {
      coverageAmount,
      totalPremiumsPaid: summary.totalPremiumsPaid,
      averageAnnualPremium: summary.averageAnnualPremium,
      costPerThousandEUR,
    }
  })
}

/**
 * Calculate optimal coverage amount based on financial obligations
 */
export function calculateOptimalCoverage(
  outstandingMortgage: number,
  annualLivingExpenses: number,
  yearsToSupport: number,
  existingSavings: number,
): {
  minimumCoverage: number
  recommendedCoverage: number
  comprehensiveCoverage: number
} {
  // Minimum: Cover outstanding debts
  const minimumCoverage = Math.max(0, outstandingMortgage - existingSavings)

  // Recommended: Cover debts + 5 years of living expenses
  const recommendedCoverage = outstandingMortgage + annualLivingExpenses * 5 - existingSavings

  // Comprehensive: Cover all obligations until independence
  const comprehensiveCoverage =
    outstandingMortgage + annualLivingExpenses * yearsToSupport - existingSavings

  return {
    minimumCoverage: Math.max(0, minimumCoverage),
    recommendedCoverage: Math.max(0, recommendedCoverage),
    comprehensiveCoverage: Math.max(0, comprehensiveCoverage),
  }
}

/**
 * Create default term life insurance configuration
 */
export function createDefaultTermLifeInsuranceConfig(): TermLifeInsuranceConfig {
  const currentYear = new Date().getFullYear()
  const birthYear = currentYear - 35 // 35 years old

  return {
    name: 'Risikolebensversicherung',
    startYear: currentYear,
    endYear: currentYear + 20, // 20 years protection
    coverageAmount: 250000, // 250,000 EUR typical coverage
    coverageType: 'level',
    annualDecreasePercent: 5, // For decreasing coverage
    birthYear,
    gender: 'male',
    healthStatus: 'good',
    smokingStatus: 'non-smoker',
    enabled: false,
  }
}
