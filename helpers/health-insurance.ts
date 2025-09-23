/**
 * Types and utilities for German health and care insurance (Kranken- und Pflegeversicherung)
 * integration in the withdrawal phase
 */

/**
 * Health insurance contribution configuration
 * Supports both percentage-based and fixed amount contributions
 */
export interface HealthInsuranceContribution {
  /** Whether to use percentage-based calculation */
  usePercentage: boolean
  /** Percentage rate (e.g., 14.6 for 14.6%) - only used if usePercentage is true */
  percentage?: number
  /** Fixed monthly amount in EUR - only used if usePercentage is false */
  fixedAmount?: number
}

/**
 * Care insurance contribution configuration
 * Supports both percentage-based and fixed amount contributions
 */
export interface CareInsuranceContribution {
  /** Whether to use percentage-based calculation */
  usePercentage: boolean
  /** Percentage rate (e.g., 3.05 for 3.05%) - only used if usePercentage is true */
  percentage?: number
  /** Fixed monthly amount in EUR - only used if usePercentage is false */
  fixedAmount?: number
  /** Additional rate for childless individuals (Kinderloser Zuschlag) */
  childlessSupplement?: number
}

/**
 * Configuration for German health and care insurance in retirement
 * Differentiates between pre-retirement (Vorrente) and retirement phases
 */
export interface HealthInsuranceConfig {
  /** Whether health and care insurance is enabled in the calculation */
  enabled: boolean

  /** Year when retirement begins (determines phase switch) */
  retirementStartYear: number

  /** Health insurance configuration for pre-retirement phase */
  preRetirement: {
    health: HealthInsuranceContribution
    care: CareInsuranceContribution
  }

  /** Health and care insurance configuration for retirement phase */
  retirement: {
    health: HealthInsuranceContribution
    care: CareInsuranceContribution
  }
}

/**
 * Result of health and care insurance calculation for a specific year
 */
export interface HealthInsuranceYearResult {
  /** Whether this is pre-retirement or retirement phase */
  phase: 'pre-retirement' | 'retirement'

  /** Health insurance contribution calculations */
  health: {
    /** Annual health insurance contribution in EUR */
    annualAmount: number
    /** Monthly health insurance contribution in EUR */
    monthlyAmount: number
    /** Whether calculated using percentage or fixed amount */
    calculationMethod: 'percentage' | 'fixed'
    /** Percentage used if calculation method is percentage */
    percentage?: number
    /** Base amount for percentage calculation (withdrawal amount) */
    baseAmount?: number
  }

  /** Care insurance contribution calculations */
  care: {
    /** Annual care insurance contribution in EUR */
    annualAmount: number
    /** Monthly care insurance contribution in EUR */
    monthlyAmount: number
    /** Whether calculated using percentage or fixed amount */
    calculationMethod: 'percentage' | 'fixed'
    /** Percentage used if calculation method is percentage */
    percentage?: number
    /** Base amount for percentage calculation (withdrawal amount) */
    baseAmount?: number
    /** Childless supplement amount if applicable */
    childlessSupplementAmount?: number
  }

  /** Total annual insurance contribution (health + care) */
  totalAnnualAmount: number
  /** Total monthly insurance contribution (health + care) */
  totalMonthlyAmount: number
}

/**
 * Default health insurance configuration with typical German rates
 */
export const defaultHealthInsuranceConfig: HealthInsuranceConfig = {
  enabled: false,
  retirementStartYear: 2040,
  preRetirement: {
    health: {
      usePercentage: true,
      percentage: 14.6, // Typical German health insurance rate
    },
    care: {
      usePercentage: true,
      percentage: 3.05, // Typical German care insurance rate
      childlessSupplement: 0.6, // Additional rate for childless individuals
    },
  },
  retirement: {
    health: {
      usePercentage: true,
      percentage: 7.3, // Reduced rate for retirees (employer portion typically covered)
    },
    care: {
      usePercentage: true,
      percentage: 3.05, // Same rate as pre-retirement
      childlessSupplement: 0.6, // Same supplement for childless
    },
  },
}

/**
 * Calculate health and care insurance contributions for a given year
 * @param year - The year to calculate contributions for
 * @param config - Health insurance configuration
 * @param grossWithdrawalAmount - Annual gross withdrawal amount before insurance deductions
 * @param childless - Whether the person is childless (for care insurance supplement)
 * @returns Health and care insurance calculation results
 */
export function calculateHealthInsurance(
  year: number,
  config: HealthInsuranceConfig,
  grossWithdrawalAmount: number,
  childless: boolean = false,
): HealthInsuranceYearResult {
  if (!config.enabled) {
    return {
      phase: year >= config.retirementStartYear ? 'retirement' : 'pre-retirement',
      health: {
        annualAmount: 0,
        monthlyAmount: 0,
        calculationMethod: 'fixed',
      },
      care: {
        annualAmount: 0,
        monthlyAmount: 0,
        calculationMethod: 'fixed',
      },
      totalAnnualAmount: 0,
      totalMonthlyAmount: 0,
    }
  }

  const phase = year >= config.retirementStartYear ? 'retirement' : 'pre-retirement'
  const phaseConfig = phase === 'retirement' ? config.retirement : config.preRetirement

  // Calculate health insurance
  let healthAnnualAmount = 0
  let healthCalculationMethod: 'percentage' | 'fixed' = 'fixed'
  let healthPercentage: number | undefined
  let healthBaseAmount: number | undefined

  if (phaseConfig.health.usePercentage && phaseConfig.health.percentage) {
    healthCalculationMethod = 'percentage'
    healthPercentage = phaseConfig.health.percentage
    healthBaseAmount = grossWithdrawalAmount
    healthAnnualAmount = grossWithdrawalAmount * (phaseConfig.health.percentage / 100)
  }
  else if (!phaseConfig.health.usePercentage && phaseConfig.health.fixedAmount) {
    healthCalculationMethod = 'fixed'
    healthAnnualAmount = phaseConfig.health.fixedAmount * 12 // Convert monthly to annual
  }

  // Calculate care insurance
  let careAnnualAmount = 0
  let careCalculationMethod: 'percentage' | 'fixed' = 'fixed'
  let carePercentage: number | undefined
  let careBaseAmount: number | undefined
  let childlessSupplementAmount: number | undefined

  if (phaseConfig.care.usePercentage && phaseConfig.care.percentage) {
    careCalculationMethod = 'percentage'
    carePercentage = phaseConfig.care.percentage
    careBaseAmount = grossWithdrawalAmount

    let totalCareRate = phaseConfig.care.percentage
    if (childless && phaseConfig.care.childlessSupplement) {
      totalCareRate += phaseConfig.care.childlessSupplement
      childlessSupplementAmount = grossWithdrawalAmount * (phaseConfig.care.childlessSupplement / 100)
    }

    careAnnualAmount = grossWithdrawalAmount * (totalCareRate / 100)
  }
  else if (!phaseConfig.care.usePercentage && phaseConfig.care.fixedAmount) {
    careCalculationMethod = 'fixed'
    careAnnualAmount = phaseConfig.care.fixedAmount * 12 // Convert monthly to annual

    // Add childless supplement if applicable and configured
    if (childless && phaseConfig.care.childlessSupplement) {
      childlessSupplementAmount = phaseConfig.care.childlessSupplement * 12
      careAnnualAmount += childlessSupplementAmount
    }
  }

  const totalAnnualAmount = healthAnnualAmount + careAnnualAmount

  return {
    phase,
    health: {
      annualAmount: healthAnnualAmount,
      monthlyAmount: healthAnnualAmount / 12,
      calculationMethod: healthCalculationMethod,
      percentage: healthPercentage,
      baseAmount: healthBaseAmount,
    },
    care: {
      annualAmount: careAnnualAmount,
      monthlyAmount: careAnnualAmount / 12,
      calculationMethod: careCalculationMethod,
      percentage: carePercentage,
      baseAmount: careBaseAmount,
      childlessSupplementAmount,
    },
    totalAnnualAmount,
    totalMonthlyAmount: totalAnnualAmount / 12,
  }
}

/**
 * Calculate net withdrawal amount after health and care insurance deductions
 * @param grossWithdrawalAmount - Annual gross withdrawal amount
 * @param healthInsuranceResult - Health insurance calculation result
 * @returns Net withdrawal amount after insurance deductions
 */
export function calculateNetWithdrawalAmount(
  grossWithdrawalAmount: number,
  healthInsuranceResult: HealthInsuranceYearResult,
): number {
  return Math.max(0, grossWithdrawalAmount - healthInsuranceResult.totalAnnualAmount)
}

/**
 * Get display name for health insurance calculation method
 */
export function getHealthInsuranceCalculationMethodName(method: 'percentage' | 'fixed'): string {
  switch (method) {
    case 'percentage':
      return 'Prozentual'
    case 'fixed':
      return 'Festbetrag'
  }
}

/**
 * Get display name for insurance phase
 */
export function getInsurancePhaseName(phase: 'pre-retirement' | 'retirement'): string {
  switch (phase) {
    case 'pre-retirement':
      return 'Vorrente'
    case 'retirement':
      return 'Rente'
  }
}
