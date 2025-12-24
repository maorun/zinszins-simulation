/**
 * Types and utilities for German private long-term care insurance (Pflegezusatzversicherung)
 *
 * Private long-term care insurance supplements the statutory care insurance (gesetzliche Pflegeversicherung)
 * by providing additional benefits for long-term care needs.
 *
 * Key characteristics:
 * - Monthly premiums based on age, coverage type, and entry age
 * - Daily/monthly benefit payments when care is needed (Pflegegrad 1-5)
 * - Premiums generally not tax-deductible
 * - Benefits are tax-free (§ 3 Nr. 1a EStG)
 * - Three main types: Pflegetagegeld, Pflegekostenversicherung, Pflege-Bahr
 * - Pflege-Bahr receives state subsidy (5 EUR/month)
 *
 * German care system background:
 * - Statutory care insurance covers only basic costs (typically 50-70% of actual costs)
 * - Average care costs: 2,000-4,500 EUR/month depending on care level and setting
 * - Private insurance closes the gap between statutory benefits and actual costs
 */

/**
 * Care insurance policy type
 */
export type CareInsurancePolicyType =
  | 'pflegetagegeld' // Daily benefit - fixed amount per day regardless of actual costs
  | 'pflegekostenversicherung' // Cost reimbursement - reimburses actual costs up to limit
  | 'pflege-bahr' // State-subsidized care insurance (60 EUR max premium for 5 EUR subsidy)

/**
 * German care levels (Pflegegrade) according to SGB XI
 */
export type CareLevel = 1 | 2 | 3 | 4 | 5

/**
 * Configuration for private long-term care insurance
 */
export interface CareInsuranceConfig {
  /** Display name for this insurance policy */
  name: string

  /** Year when policy starts */
  startYear: number

  /** Year when policy ends (or when premiums stop, benefits may continue) */
  endYear: number

  /** Policy type */
  policyType: CareInsurancePolicyType

  /** Monthly premium in EUR */
  monthlyPremium: number

  /** For Pflegetagegeld: Daily benefit amount in EUR for care level 5 */
  dailyBenefitPflegegrad5: number

  /** Birth year of insured person */
  birthYear: number

  /** Gender of insured person (affects mortality and care need rates) */
  gender: 'male' | 'female'

  /** Whether this is a Pflege-Bahr policy (receives 5 EUR/month state subsidy) */
  isPflegeBahr: boolean

  /** Whether this insurance is enabled in calculations */
  enabled: boolean
}

/**
 * Yearly result of care insurance calculation
 */
export interface CareInsuranceYearResult {
  /** Year of calculation */
  year: number

  /** Age of insured person */
  age: number

  /** Annual premium paid (including state subsidy for Pflege-Bahr) */
  annualPremium: number

  /** State subsidy received (5 EUR/month for Pflege-Bahr) */
  stateSubsidy: number

  /** Net annual premium after subsidy */
  netAnnualPremium: number

  /** Cumulative premiums paid so far (net after subsidies) */
  totalNetPremiumsPaid: number

  /** Potential daily benefit for each care level */
  dailyBenefitByLevel: Record<CareLevel, number>

  /** Potential monthly benefit for each care level (30.42 days average) */
  monthlyBenefitByLevel: Record<CareLevel, number>

  /** Probability of needing care at this age (%) */
  careNeedProbability: number
}

/**
 * Summary of care insurance
 */
export interface CareInsuranceSummary {
  /** Policy configuration */
  config: CareInsuranceConfig

  /** All yearly calculations */
  yearlyResults: CareInsuranceYearResult[]

  /** Total net premiums paid over policy lifetime (after subsidies) */
  totalNetPremiumsPaid: number

  /** Total state subsidies received (Pflege-Bahr only) */
  totalStateSubsidies: number

  /** Average annual net premium */
  averageAnnualNetPremium: number

  /** Maximum monthly benefit (care level 5) */
  maxMonthlyBenefit: number

  /** Whether benefits are tax-free (always true in Germany) */
  benefitsTaxFree: boolean
}

/**
 * Care need probability by age (percentage)
 * Based on German statistics (Destatis)
 * Source: https://www.destatis.de/DE/Themen/Gesellschaft-Umwelt/Gesundheit/Pflege
 */
const CARE_NEED_PROBABILITY_BY_AGE: Record<number, number> = {
  50: 1.0,
  55: 1.5,
  60: 2.5,
  65: 4.0,
  70: 6.5,
  75: 11.0,
  80: 18.0,
  85: 30.0,
  90: 50.0,
  95: 70.0,
}

/**
 * Find surrounding age brackets for interpolation
 */
function findAgeBrackets(age: number, ages: number[]): { lower: number; upper: number } {
  let lowerAge = ages[0] ?? 50
  let upperAge = ages[ages.length - 1] ?? 95

  for (let i = 0; i < ages.length - 1; i++) {
    const currentAge = ages[i]
    const nextAge = ages[i + 1]
    if (currentAge !== undefined && nextAge !== undefined && age >= currentAge && age < nextAge) {
      lowerAge = currentAge
      upperAge = nextAge
      break
    }
  }

  return { lower: lowerAge, upper: upperAge }
}

/**
 * Interpolate probability between two age brackets
 */
function interpolateProbability(age: number, lowerAge: number, upperAge: number): number {
  const lowerProb = CARE_NEED_PROBABILITY_BY_AGE[lowerAge] ?? 1.0
  const upperProb = CARE_NEED_PROBABILITY_BY_AGE[upperAge] ?? 70.0
  const ageDiff = upperAge - lowerAge

  if (ageDiff === 0) {
    return lowerProb
  }

  const probDiff = upperProb - lowerProb
  return lowerProb + ((age - lowerAge) / ageDiff) * probDiff
}

/**
 * Get care need probability for a given age
 */
function getCareNeedProbability(age: number): number {
  // Before age 50, very low probability
  if (age < 50) {
    return 0.5
  }

  // After age 95, very high probability
  if (age >= 95) {
    return 70.0
  }

  // Find closest age brackets and interpolate
  const ages = Object.keys(CARE_NEED_PROBABILITY_BY_AGE)
    .map(Number)
    .sort((a, b) => a - b)

  const { lower, upper } = findAgeBrackets(age, ages)
  return interpolateProbability(age, lower, upper)
}

/**
 * Daily benefit amounts by care level as percentage of Pflegegrad 5 benefit
 * Based on typical market offerings
 */
const DAILY_BENEFIT_PERCENTAGE_BY_LEVEL: Record<CareLevel, number> = {
  1: 0.2, // 20% of Pflegegrad 5
  2: 0.4, // 40% of Pflegegrad 5
  3: 0.6, // 60% of Pflegegrad 5
  4: 0.8, // 80% of Pflegegrad 5
  5: 1.0, // 100% - full benefit
}

/**
 * Calculate daily benefit for a specific care level
 */
function calculateDailyBenefitForLevel(dailyBenefitPflegegrad5: number, careLevel: CareLevel): number {
  const percentage = DAILY_BENEFIT_PERCENTAGE_BY_LEVEL[careLevel] ?? 1.0
  return dailyBenefitPflegegrad5 * percentage
}

/**
 * Calculate monthly benefit (using average month length of 30.42 days)
 */
function calculateMonthlyBenefit(dailyBenefit: number): number {
  return dailyBenefit * 30.42 // Average days per month
}

/**
 * Pflege-Bahr state subsidy: 5 EUR per month if premium is at least 10 EUR/month
 */
const PFLEGE_BAHR_MONTHLY_SUBSIDY = 5.0
const PFLEGE_BAHR_MINIMUM_PREMIUM = 10.0

/**
 * Calculate annual state subsidy for Pflege-Bahr
 */
function calculateStateSubsidy(config: CareInsuranceConfig): number {
  if (!config.isPflegeBahr) {
    return 0
  }

  // Pflege-Bahr subsidy only applies if premium is at least 10 EUR/month
  if (config.monthlyPremium < PFLEGE_BAHR_MINIMUM_PREMIUM) {
    return 0
  }

  return PFLEGE_BAHR_MONTHLY_SUBSIDY * 12
}

/**
 * Calculate care insurance development over time
 */
export function calculateCareInsurance(config: CareInsuranceConfig): CareInsuranceSummary {
  const yearlyResults: CareInsuranceYearResult[] = []
  let totalNetPremiumsPaid = 0
  let totalStateSubsidies = 0

  for (let year = config.startYear; year <= config.endYear; year++) {
    const age = year - config.birthYear
    const annualPremium = config.monthlyPremium * 12
    const stateSubsidy = calculateStateSubsidy(config)
    const netAnnualPremium = annualPremium - stateSubsidy

    totalNetPremiumsPaid += netAnnualPremium
    totalStateSubsidies += stateSubsidy

    // Calculate benefits for each care level
    const dailyBenefitByLevel: Record<CareLevel, number> = {
      1: calculateDailyBenefitForLevel(config.dailyBenefitPflegegrad5, 1),
      2: calculateDailyBenefitForLevel(config.dailyBenefitPflegegrad5, 2),
      3: calculateDailyBenefitForLevel(config.dailyBenefitPflegegrad5, 3),
      4: calculateDailyBenefitForLevel(config.dailyBenefitPflegegrad5, 4),
      5: calculateDailyBenefitForLevel(config.dailyBenefitPflegegrad5, 5),
    }

    const monthlyBenefitByLevel: Record<CareLevel, number> = {
      1: calculateMonthlyBenefit(dailyBenefitByLevel[1]),
      2: calculateMonthlyBenefit(dailyBenefitByLevel[2]),
      3: calculateMonthlyBenefit(dailyBenefitByLevel[3]),
      4: calculateMonthlyBenefit(dailyBenefitByLevel[4]),
      5: calculateMonthlyBenefit(dailyBenefitByLevel[5]),
    }

    yearlyResults.push({
      year,
      age,
      annualPremium,
      stateSubsidy,
      netAnnualPremium,
      totalNetPremiumsPaid,
      dailyBenefitByLevel,
      monthlyBenefitByLevel,
      careNeedProbability: getCareNeedProbability(age),
    })
  }

  const policyYears = config.endYear - config.startYear + 1
  const averageAnnualNetPremium = policyYears > 0 ? totalNetPremiumsPaid / policyYears : 0
  const maxMonthlyBenefit = calculateMonthlyBenefit(config.dailyBenefitPflegegrad5)

  return {
    config,
    yearlyResults,
    totalNetPremiumsPaid,
    totalStateSubsidies,
    averageAnnualNetPremium,
    maxMonthlyBenefit,
    benefitsTaxFree: true, // Always true in Germany (§ 3 Nr. 1a EStG)
  }
}

/**
 * Calculate recommended daily benefit amount based on expected care costs
 */
export function calculateRecommendedDailyBenefit(
  expectedMonthlyCosts: number,
  statutoryMonthlyBenefit: number,
): {
  minimumDailyBenefit: number
  recommendedDailyBenefit: number
  comprehensiveDailyBenefit: number
} {
  // Gap between expected costs and statutory benefits
  const monthlyGap = Math.max(0, expectedMonthlyCosts - statutoryMonthlyBenefit)

  // Minimum: Cover 50% of the gap
  const minimumDailyBenefit = (monthlyGap * 0.5) / 30.42

  // Recommended: Cover 75% of the gap
  const recommendedDailyBenefit = (monthlyGap * 0.75) / 30.42

  // Comprehensive: Cover 100% of the gap
  const comprehensiveDailyBenefit = monthlyGap / 30.42

  return {
    minimumDailyBenefit: Math.round(minimumDailyBenefit),
    recommendedDailyBenefit: Math.round(recommendedDailyBenefit),
    comprehensiveDailyBenefit: Math.round(comprehensiveDailyBenefit),
  }
}

/**
 * Compare different policy types for the same person
 */
export function comparePolicyTypes(
  baseConfig: CareInsuranceConfig,
  policyTypes: CareInsurancePolicyType[],
): Array<{
  policyType: CareInsurancePolicyType
  totalNetPremiumsPaid: number
  averageAnnualNetPremium: number
  maxMonthlyBenefit: number
  totalStateSubsidies: number
}> {
  return policyTypes.map(policyType => {
    const config = { ...baseConfig, policyType }
    const summary = calculateCareInsurance(config)

    return {
      policyType,
      totalNetPremiumsPaid: summary.totalNetPremiumsPaid,
      averageAnnualNetPremium: summary.averageAnnualNetPremium,
      maxMonthlyBenefit: summary.maxMonthlyBenefit,
      totalStateSubsidies: summary.totalStateSubsidies,
    }
  })
}

/**
 * Create default care insurance configuration
 */
export function createDefaultCareInsuranceConfig(): CareInsuranceConfig {
  const currentYear = new Date().getFullYear()
  const birthYear = currentYear - 45 // 45 years old - typical entry age

  return {
    name: 'Pflegezusatzversicherung',
    startYear: currentYear,
    endYear: currentYear + 40, // Until age 85
    policyType: 'pflegetagegeld',
    monthlyPremium: 50, // Typical premium for middle coverage
    dailyBenefitPflegegrad5: 50, // 50 EUR per day = ~1,500 EUR/month
    birthYear,
    gender: 'male',
    isPflegeBahr: false,
    enabled: false,
  }
}
