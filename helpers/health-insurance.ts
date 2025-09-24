/**
 * Types and utilities for German health and care insurance (Kranken- und Pflegeversicherung)
 * integration in the withdrawal phase
 */

/**
 * Types of health insurance systems in Germany
 */
export type HealthInsuranceType = 'statutory' | 'private'

/**
 * Statutory health insurance configuration (Gesetzliche Krankenversicherung)
 * Uses fixed percentage rates with contribution limits
 */
export interface StatutoryHealthInsuranceConfig {
  type: 'statutory'

  /** Health insurance rate (default: 14.6% for employees, 7.3% for retirees) */
  healthRate: number

  /** Care insurance rate (default: 3.05%) */
  careRate: number

  /** Additional care insurance rate for childless individuals (default: 0.6%) */
  childlessSupplementRate: number

  /** Minimum monthly contribution (Mindestbeitrag) */
  minimumMonthlyContribution: number

  /** Maximum monthly contribution (Höchstbeitrag) */
  maximumMonthlyContribution: number

  /** Annual contribution assessment ceiling (Beitragsbemessungsgrenze) */
  contributionAssessmentCeiling: number
}

/**
 * Private health insurance configuration (Private Krankenversicherung)
 * Uses fixed monthly premiums with annual adjustments
 */
export interface PrivateHealthInsuranceConfig {
  type: 'private'

  /** Monthly base premium for health insurance */
  monthlyHealthPremium: number

  /** Monthly base premium for care insurance */
  monthlyCareRemium: number

  /** Annual adjustment rate (e.g., 3% = 1.03) */
  annualAdjustmentRate: number

  /** Starting year for the premium calculation */
  baseYear: number
}

/**
 * Overall health insurance configuration for retirement planning
 */
export interface HealthInsuranceConfig {
  /** Whether health insurance is enabled in calculations */
  enabled: boolean

  /** Year when retirement phase begins (for statutory insurance rate changes) */
  retirementStartYear: number

  /** Whether the person is childless (affects care insurance) */
  childless: boolean

  /** Whether to pay only employee portion (true) or full contribution (false, default for retirees) */
  employeeOnly: boolean

  /** Insurance type for pre-retirement phase */
  preRetirementType: HealthInsuranceType

  /** Insurance type for retirement phase */
  retirementType: HealthInsuranceType

  /** Configuration for pre-retirement phase */
  preRetirement: {
    statutory?: StatutoryHealthInsuranceConfig
    private?: PrivateHealthInsuranceConfig
  }

  /** Configuration for retirement phase */
  retirement: {
    statutory?: StatutoryHealthInsuranceConfig
    private?: PrivateHealthInsuranceConfig
  }
}

/**
 * Result of health insurance calculation for a specific year
 */
export interface HealthInsuranceCalculationResult {
  /** Year of calculation */
  year: number

  /** Which phase: 'pre-retirement' or 'retirement' */
  phase: 'pre-retirement' | 'retirement'

  /** Type of insurance system used */
  insuranceType: HealthInsuranceType

  /** Health insurance details */
  health: {
    /** Calculation method used */
    calculationMethod: 'percentage' | 'fixed-premium' | 'minimum-contribution' | 'maximum-contribution'
    /** Percentage rate used (for statutory) */
    percentage?: number
    /** Monthly amount */
    monthlyAmount: number
    /** Annual amount */
    annualAmount: number
  }

  /** Care insurance details */
  care: {
    /** Calculation method used */
    calculationMethod: 'percentage' | 'fixed-premium' | 'minimum-contribution' | 'maximum-contribution'
    /** Percentage rate used (for statutory) */
    percentage?: number
    /** Monthly amount */
    monthlyAmount: number
    /** Annual amount */
    annualAmount: number
    /** Additional amount for childless individuals */
    childlessSupplementAmount?: number
  }

  /** Total insurance cost */
  totalMonthlyAmount: number
  totalAnnualAmount: number
}

/**
 * Default configuration for German statutory health insurance
 */
export const defaultStatutoryHealthInsuranceConfig: StatutoryHealthInsuranceConfig = {
  type: 'statutory',
  healthRate: 14.6, // Standard rate for employees
  careRate: 3.05,
  childlessSupplementRate: 0.6,
  minimumMonthlyContribution: 166.69, // 2024 values (approximate)
  maximumMonthlyContribution: 884.87, // 2024 values (approximate)
  contributionAssessmentCeiling: 62100, // 2024 value (approximate)
}

/**
 * Default configuration for German statutory health insurance in retirement
 */
export const defaultStatutoryHealthInsuranceConfigRetirement: StatutoryHealthInsuranceConfig = {
  type: 'statutory',
  healthRate: 7.3, // Reduced rate for retirees (no employer contribution)
  careRate: 3.05,
  childlessSupplementRate: 0.6,
  minimumMonthlyContribution: 166.69,
  maximumMonthlyContribution: 884.87,
  contributionAssessmentCeiling: 62100,
}

/**
 * Default configuration for private health insurance
 */
export const defaultPrivateHealthInsuranceConfig: PrivateHealthInsuranceConfig = {
  type: 'private',
  monthlyHealthPremium: 400,
  monthlyCareRemium: 80,
  annualAdjustmentRate: 1.03, // 3% annual increase
  baseYear: new Date().getFullYear(),
}

/**
 * Default overall health insurance configuration
 */
export const defaultHealthInsuranceConfig: HealthInsuranceConfig = {
  enabled: false,
  retirementStartYear: new Date().getFullYear() + 15,
  childless: false,
  preRetirement: defaultStatutoryHealthInsuranceConfig,
  retirement: defaultStatutoryHealthInsuranceConfigRetirement,
}

/**
 * Calculate statutory health insurance contribution for a given year and withdrawal amount
 */
function calculateStatutoryHealthInsurance(
  year: number,
  config: StatutoryHealthInsuranceConfig,
  annualWithdrawalAmount: number,
  childless: boolean,
): { health: HealthInsuranceCalculationResult['health'], care: HealthInsuranceCalculationResult['care'] } {
  const monthlyWithdrawal = annualWithdrawalAmount / 12

  // Check contribution limits
  const monthlyAssessmentBase = Math.min(monthlyWithdrawal, config.contributionAssessmentCeiling / 12)

  // Calculate health insurance
  const healthPercentageAmount = monthlyAssessmentBase * (config.healthRate / 100)
  const healthMonthlyAmount = Math.max(
    Math.min(healthPercentageAmount, config.maximumMonthlyContribution * 0.6), // Rough split between health and care
    config.minimumMonthlyContribution * 0.6,
  )

  // Determine calculation method for health insurance
  let healthCalculationMethod: HealthInsuranceCalculationResult['health']['calculationMethod'] = 'percentage'
  if (healthMonthlyAmount === config.minimumMonthlyContribution * 0.6) {
    healthCalculationMethod = 'minimum-contribution'
  }
  else if (healthMonthlyAmount === config.maximumMonthlyContribution * 0.6) {
    healthCalculationMethod = 'maximum-contribution'
  }

  // Calculate care insurance
  const careBaseRate = childless ? config.careRate + config.childlessSupplementRate : config.careRate
  const carePercentageAmount = monthlyAssessmentBase * (careBaseRate / 100)
  const careMonthlyAmount = Math.max(
    Math.min(carePercentageAmount, config.maximumMonthlyContribution * 0.4), // Rough split
    config.minimumMonthlyContribution * 0.4,
  )

  // Determine calculation method for care insurance
  let careCalculationMethod: HealthInsuranceCalculationResult['care']['calculationMethod'] = 'percentage'
  if (careMonthlyAmount === config.minimumMonthlyContribution * 0.4) {
    careCalculationMethod = 'minimum-contribution'
  }
  else if (careMonthlyAmount === config.maximumMonthlyContribution * 0.4) {
    careCalculationMethod = 'maximum-contribution'
  }

  const childlessSupplementAmount = childless
    ? monthlyAssessmentBase * (config.childlessSupplementRate / 100)
    : 0

  return {
    health: {
      calculationMethod: healthCalculationMethod,
      percentage: config.healthRate,
      monthlyAmount: healthMonthlyAmount,
      annualAmount: healthMonthlyAmount * 12,
    },
    care: {
      calculationMethod: careCalculationMethod,
      percentage: careBaseRate,
      monthlyAmount: careMonthlyAmount,
      annualAmount: careMonthlyAmount * 12,
      childlessSupplementAmount: childlessSupplementAmount * 12,
    },
  }
}

/**
 * Calculate private health insurance contribution for a given year
 */
function calculatePrivateHealthInsurance(
  year: number,
  config: PrivateHealthInsuranceConfig,
): { health: HealthInsuranceCalculationResult['health'], care: HealthInsuranceCalculationResult['care'] } {
  const yearsFromBase = year - config.baseYear
  const adjustmentFactor = Math.pow(config.annualAdjustmentRate, yearsFromBase)

  const healthMonthlyAmount = config.monthlyHealthPremium * adjustmentFactor
  const careMonthlyAmount = config.monthlyCareRemium * adjustmentFactor

  return {
    health: {
      calculationMethod: 'fixed-premium',
      monthlyAmount: healthMonthlyAmount,
      annualAmount: healthMonthlyAmount * 12,
    },
    care: {
      calculationMethod: 'fixed-premium',
      monthlyAmount: careMonthlyAmount,
      annualAmount: careMonthlyAmount * 12,
    },
  }
}

/**
 * Calculate health insurance contribution for a specific year and withdrawal amount
 */
export function calculateHealthInsurance(
  year: number,
  config: HealthInsuranceConfig,
  annualWithdrawalAmount: number,
  childless?: boolean,
): HealthInsuranceCalculationResult {
  if (!config.enabled) {
    return {
      year,
      phase: 'pre-retirement',
      insuranceType: 'statutory',
      health: {
        calculationMethod: 'percentage',
        percentage: 0,
        monthlyAmount: 0,
        annualAmount: 0,
      },
      care: {
        calculationMethod: 'percentage',
        percentage: 0,
        monthlyAmount: 0,
        annualAmount: 0,
      },
      totalMonthlyAmount: 0,
      totalAnnualAmount: 0,
    }
  }

  const phase = year >= config.retirementStartYear ? 'retirement' : 'pre-retirement'
  const insuranceType = phase === 'retirement' ? config.retirementType : config.preRetirementType
  const phaseConfig = phase === 'retirement'
    ? (insuranceType === 'statutory' ? config.retirement.statutory : config.retirement.private)
    : (insuranceType === 'statutory' ? config.preRetirement.statutory : config.preRetirement.private)

  if (!phaseConfig) {
    // Return zero contribution if config is missing
    return {
      year,
      phase,
      insuranceType,
      health: {
        calculationMethod: 'percentage',
        percentage: 0,
        monthlyAmount: 0,
        annualAmount: 0,
      },
      care: {
        calculationMethod: 'percentage',
        percentage: 0,
        monthlyAmount: 0,
        annualAmount: 0,
      },
      totalMonthlyAmount: 0,
      totalAnnualAmount: 0,
    }
  }

  const isChildless = childless ?? config.childless

  let healthResult: HealthInsuranceCalculationResult['health']
  let careResult: HealthInsuranceCalculationResult['care']

  if (phaseConfig.type === 'statutory') {
    const result = calculateStatutoryHealthInsurance(year, phaseConfig, annualWithdrawalAmount, isChildless)
    healthResult = result.health
    careResult = result.care

    // Apply employee-only factor if enabled (typically half the contribution)
    if (config.employeeOnly) {
      healthResult = {
        ...healthResult,
        monthlyAmount: healthResult.monthlyAmount * 0.5,
        annualAmount: healthResult.annualAmount * 0.5,
      }
      careResult = {
        ...careResult,
        monthlyAmount: careResult.monthlyAmount * 0.5,
        annualAmount: careResult.annualAmount * 0.5,
      }
    }
  }
  else {
    const result = calculatePrivateHealthInsurance(year, phaseConfig)
    healthResult = result.health
    careResult = result.care
    // Private insurance premiums are not affected by employee/employer split
  }

  const totalMonthlyAmount = healthResult.monthlyAmount + careResult.monthlyAmount
  const totalAnnualAmount = healthResult.annualAmount + careResult.annualAmount

  return {
    year,
    phase,
    insuranceType,
    health: healthResult,
    care: careResult,
    totalMonthlyAmount,
    totalAnnualAmount,
  }
}

/**
 * Calculate net withdrawal amount after health insurance deductions
 */
export function calculateNetWithdrawalAmount(
  grossWithdrawalAmount: number,
  healthInsurance: HealthInsuranceCalculationResult,
): number {
  return Math.max(0, grossWithdrawalAmount - healthInsurance.totalAnnualAmount)
}
