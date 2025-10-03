/**
 * Types and utilities for German health and care insurance (Kranken- und Pflegeversicherung) integration
 *
 * German health and care insurance contributions vary significantly between:
 * - Pre-retirement (Vorrente): Higher contribution rates, typically based on income
 * - During retirement (Rente): Different contribution rates for retirees
 *
 * These contributions should be deducted from withdrawal amounts.
 */

/**
 * Configuration for German health and care insurance contributions
 */
export interface HealthCareInsuranceConfig {
  /** Whether health and care insurance contributions are enabled in the calculation */
  enabled: boolean

  /** Insurance type: 'statutory' for gesetzliche KV or 'private' for private KV */
  insuranceType: 'statutory' | 'private'

  /** For statutory insurance: Whether to include employer contributions in withdrawal phase (default: true) */
  includeEmployerContribution: boolean

  /** For statutory insurance: Health insurance contribution rate (fixed at 14.6% including employer portion) */
  statutoryHealthInsuranceRate: number

  /** For statutory insurance: Care insurance contribution rate (fixed at 3.05% including employer portion) */
  statutoryCareInsuranceRate: number

  /** For statutory insurance: Minimum contribution base amount (annual) */
  statutoryMinimumIncomeBase: number

  /** For statutory insurance: Maximum contribution base amount (annual) - Beitragsbemessungsgrenze */
  statutoryMaximumIncomeBase: number

  /** For private insurance: Monthly health insurance premium */
  privateHealthInsuranceMonthly: number

  /** For private insurance: Monthly care insurance premium */
  privateCareInsuranceMonthly: number

  /** For private insurance: Annual inflation rate for premium adjustment (default: 2%) */
  privateInsuranceInflationRate: number

  /** Year when retirement begins */
  retirementStartYear: number

  /** Additional care insurance contribution for childless individuals over 23 (default: 0.6%) */
  additionalCareInsuranceForChildless: boolean

  /** Age at which additional care insurance applies */
  additionalCareInsuranceAge: number

  /** Legacy property names for backward compatibility */
  /** @deprecated Use statutoryHealthInsuranceRate instead */
  healthInsuranceRatePreRetirement?: number
  /** @deprecated Use statutoryHealthInsuranceRate instead */
  healthInsuranceRateRetirement?: number
  /** @deprecated Use statutoryCareInsuranceRate instead */
  careInsuranceRatePreRetirement?: number
  /** @deprecated Use statutoryCareInsuranceRate instead */
  careInsuranceRateRetirement?: number

  /** Whether to use fixed monthly amounts instead of percentage calculation */
  useFixedAmounts?: boolean
  /** Fixed monthly health insurance amount */
  fixedHealthInsuranceMonthly?: number
  /** Fixed monthly care insurance amount */
  fixedCareInsuranceMonthly?: number

  /** Income thresholds for health and care insurance */
  healthInsuranceIncomeThreshold?: number
  careInsuranceIncomeThreshold?: number
}

/**
 * Result of health and care insurance calculation for a specific year
 */
export interface HealthCareInsuranceYearResult {
  /** Total annual health insurance contribution */
  healthInsuranceAnnual: number

  /** Total annual care insurance contribution */
  careInsuranceAnnual: number

  /** Total annual health and care insurance contribution */
  totalAnnual: number

  /** Monthly health insurance contribution */
  healthInsuranceMonthly: number

  /** Monthly care insurance contribution */
  careInsuranceMonthly: number

  /** Monthly total health and care insurance contribution */
  totalMonthly: number

  /** Insurance type used for calculation */
  insuranceType: 'statutory' | 'private'

  /** Whether this is during retirement phase */
  isRetirementPhase: boolean

  /** For statutory insurance: effective health insurance rate applied (as percentage) */
  effectiveHealthInsuranceRate?: number

  /** For statutory insurance: effective care insurance rate applied (as percentage) */
  effectiveCareInsuranceRate?: number

  /** For statutory insurance: base income amount used for percentage calculation */
  baseIncomeForCalculation?: number

  /** For statutory insurance: whether employer contributions are included */
  includesEmployerContribution?: boolean

  /** Whether additional care insurance for childless was applied */
  appliedAdditionalCareInsurance: boolean

  /** For private insurance: inflation adjustment factor applied */
  inflationAdjustmentFactor?: number

  /** Whether fixed amounts were used instead of percentage calculation */
  usedFixedAmounts?: boolean
}

/**
 * Complete health and care insurance calculation result across years
 */
export interface HealthCareInsuranceResult {
  [year: number]: HealthCareInsuranceYearResult
}

/**
 * Calculate health and care insurance contributions for a given year
 */
export function calculateHealthCareInsuranceForYear(
  config: HealthCareInsuranceConfig,
  year: number,
  withdrawalAmount: number,
  pensionAmount: number = 0,
  currentAge: number = 30,
): HealthCareInsuranceYearResult {
  if (!config.enabled) {
    return {
      healthInsuranceAnnual: 0,
      careInsuranceAnnual: 0,
      totalAnnual: 0,
      healthInsuranceMonthly: 0,
      careInsuranceMonthly: 0,
      totalMonthly: 0,
      insuranceType: config.insuranceType,
      isRetirementPhase: year >= config.retirementStartYear,
      appliedAdditionalCareInsurance: false,
      usedFixedAmounts: false,
    }
  }

  const isRetirementPhase = year >= config.retirementStartYear
  let healthInsuranceAnnual = 0
  let careInsuranceAnnual = 0
  let appliedAdditionalCareInsurance = false
  let inflationAdjustmentFactor: number | undefined
  let usedFixedAmounts = false

  // Check if we should use fixed amounts
  if (config.useFixedAmounts && config.fixedHealthInsuranceMonthly && config.fixedCareInsuranceMonthly) {
    usedFixedAmounts = true
    healthInsuranceAnnual = config.fixedHealthInsuranceMonthly * 12
    careInsuranceAnnual = config.fixedCareInsuranceMonthly * 12

    return {
      healthInsuranceAnnual,
      careInsuranceAnnual,
      totalAnnual: healthInsuranceAnnual + careInsuranceAnnual,
      healthInsuranceMonthly: config.fixedHealthInsuranceMonthly,
      careInsuranceMonthly: config.fixedCareInsuranceMonthly,
      totalMonthly: config.fixedHealthInsuranceMonthly + config.fixedCareInsuranceMonthly,
      insuranceType: config.insuranceType,
      isRetirementPhase,
      appliedAdditionalCareInsurance: false, // Fixed amounts don't include additional calculations
      usedFixedAmounts,
    }
  }

  if (config.insuranceType === 'statutory') {
    // Statutory insurance calculation based on income
    const totalIncome = withdrawalAmount + pensionAmount
    const maxIncomeBase = config.healthInsuranceIncomeThreshold || config.statutoryMaximumIncomeBase
    const baseIncome = Math.max(
      config.statutoryMinimumIncomeBase,
      Math.min(totalIncome, maxIncomeBase),
    )

    // Calculate base rates - support legacy property names
    let healthRate = config.statutoryHealthInsuranceRate
    let careRate = config.statutoryCareInsuranceRate

    // Handle legacy property names for pre-retirement
    if (!isRetirementPhase) {
      if (config.healthInsuranceRatePreRetirement !== undefined) {
        healthRate = config.healthInsuranceRatePreRetirement
      }
      if (config.careInsuranceRatePreRetirement !== undefined) {
        careRate = config.careInsuranceRatePreRetirement
      }
    }
    else {
      // Handle legacy property names for retirement
      if (config.healthInsuranceRateRetirement !== undefined) {
        healthRate = config.healthInsuranceRateRetirement
      }
      if (config.careInsuranceRateRetirement !== undefined) {
        careRate = config.careInsuranceRateRetirement
      }
      // In retirement phase, if not including employer contribution, halve the health insurance rate
      // (Care insurance rate stays the same as employee pays full amount)
      if (!config.includeEmployerContribution && !config.healthInsuranceRateRetirement) {
        healthRate = healthRate / 2 // Only employee portion
      }
    }

    // Apply additional care insurance for childless
    if (config.additionalCareInsuranceForChildless && currentAge >= config.additionalCareInsuranceAge) {
      careRate += 0.6 // Additional 0.6% for childless
      appliedAdditionalCareInsurance = true
    }

    healthInsuranceAnnual = baseIncome * (healthRate / 100)
    careInsuranceAnnual = baseIncome * (careRate / 100)

    return {
      healthInsuranceAnnual,
      careInsuranceAnnual,
      totalAnnual: healthInsuranceAnnual + careInsuranceAnnual,
      healthInsuranceMonthly: healthInsuranceAnnual / 12,
      careInsuranceMonthly: careInsuranceAnnual / 12,
      totalMonthly: (healthInsuranceAnnual + careInsuranceAnnual) / 12,
      insuranceType: 'statutory',
      isRetirementPhase,
      effectiveHealthInsuranceRate: healthRate,
      effectiveCareInsuranceRate: careRate,
      baseIncomeForCalculation: baseIncome,
      includesEmployerContribution: !isRetirementPhase || config.includeEmployerContribution,
      appliedAdditionalCareInsurance,
      usedFixedAmounts,
    }
  }
  else {
    // Private insurance calculation with inflation adjustment
    const yearsFromStart = Math.max(0, year - config.retirementStartYear)
    inflationAdjustmentFactor = Math.pow(1 + config.privateInsuranceInflationRate / 100, yearsFromStart)
    const adjustedHealthMonthly = config.privateHealthInsuranceMonthly * inflationAdjustmentFactor
    const adjustedCareMonthly = config.privateCareInsuranceMonthly * inflationAdjustmentFactor

    // Apply additional care insurance for childless (also applies to private insurance)
    let finalCareMonthly = adjustedCareMonthly
    if (config.additionalCareInsuranceForChildless && currentAge >= config.additionalCareInsuranceAge) {
      // For private insurance, additional care insurance is typically added as statutory contribution
      const additionalCareAnnual = (withdrawalAmount + pensionAmount) * 0.006 // 0.6%
      finalCareMonthly += additionalCareAnnual / 12
      appliedAdditionalCareInsurance = true
    }

    healthInsuranceAnnual = adjustedHealthMonthly * 12
    careInsuranceAnnual = finalCareMonthly * 12

    return {
      healthInsuranceAnnual,
      careInsuranceAnnual,
      totalAnnual: healthInsuranceAnnual + careInsuranceAnnual,
      healthInsuranceMonthly: adjustedHealthMonthly,
      careInsuranceMonthly: finalCareMonthly,
      totalMonthly: adjustedHealthMonthly + finalCareMonthly,
      insuranceType: 'private',
      isRetirementPhase,
      appliedAdditionalCareInsurance,
      inflationAdjustmentFactor,
      usedFixedAmounts,
    }
  }
}

/**
 * Calculate health and care insurance contributions across multiple years
 */
export function calculateHealthCareInsurance(
  config: HealthCareInsuranceConfig,
  startYear: number,
  endYear: number,
  withdrawalAmounts: { [year: number]: number },
  pensionAmounts: { [year: number]: number } = {},
  birthYear?: number,
): HealthCareInsuranceResult {
  const result: HealthCareInsuranceResult = {}

  for (let year = startYear; year <= endYear; year++) {
    const withdrawalAmount = withdrawalAmounts[year] || 0
    const pensionAmount = pensionAmounts[year] || 0
    const currentAge = birthYear ? year - birthYear : 30

    result[year] = calculateHealthCareInsuranceForYear(
      config,
      year,
      withdrawalAmount,
      pensionAmount,
      currentAge,
    )
  }

  return result
}

/**
 * Create default health and care insurance configuration
 */
export function createDefaultHealthCareInsuranceConfig(): HealthCareInsuranceConfig {
  return {
    enabled: true, // Default: enabled for withdrawal simulations
    insuranceType: 'statutory', // Default: statutory insurance
    includeEmployerContribution: true, // Default: include employer portion
    // Statutory insurance fixed rates (as per German law)
    statutoryHealthInsuranceRate: 14.6, // 14.6% total (7.3% employee + 7.3% employer)
    statutoryCareInsuranceRate: 3.05, // 3.05% total (1.525% employee + 1.525% employer)
    // Statutory insurance income limits (2024 values)
    statutoryMinimumIncomeBase: 13230, // Minimum assessment base (annual)
    statutoryMaximumIncomeBase: 62550, // Maximum assessment base (Beitragsbemessungsgrenze, annual)
    // Private insurance defaults
    privateHealthInsuranceMonthly: 450, // Default monthly private health insurance premium
    privateCareInsuranceMonthly: 60, // Default monthly private care insurance premium
    privateInsuranceInflationRate: 2.0, // Default 2% annual increase
    retirementStartYear: 2041,
    additionalCareInsuranceForChildless: false,
    additionalCareInsuranceAge: 23,
    // Backward compatibility and additional properties
    healthInsuranceRatePreRetirement: 14.6,
    healthInsuranceRateRetirement: 7.3,
    careInsuranceRatePreRetirement: 3.05,
    careInsuranceRateRetirement: 3.05,
    useFixedAmounts: false,
    healthInsuranceIncomeThreshold: 62550,
    careInsuranceIncomeThreshold: 62550,
  }
}

/**
 * Get display name for health and care insurance configuration
 */
export function getHealthCareInsuranceDisplayInfo(config: HealthCareInsuranceConfig): {
  insuranceType: 'statutory' | 'private'
  displayText: string
  detailText: string
  healthInsuranceType: 'fixed' | 'percentage'
  careInsuranceType: 'fixed' | 'percentage'
} {
  const healthInsuranceType = config.useFixedAmounts && config.fixedHealthInsuranceMonthly ? 'fixed' : 'percentage'
  const careInsuranceType = config.useFixedAmounts && config.fixedCareInsuranceMonthly ? 'fixed' : 'percentage'

  if (config.useFixedAmounts) {
    return {
      insuranceType: config.insuranceType,
      displayText: 'Feste monatliche Beiträge',
      detailText: `Feste Beiträge: ${config.fixedHealthInsuranceMonthly || 0}€ KV, ${config.fixedCareInsuranceMonthly || 0}€ PV monatlich`,
      healthInsuranceType,
      careInsuranceType,
    }
  }

  if (config.insuranceType === 'statutory') {
    const employerText = config.includeEmployerContribution ? 'mit Arbeitgeberanteil' : 'nur Arbeitnehmeranteil'
    return {
      insuranceType: 'statutory',
      displayText: 'Prozentuale Beiträge basierend auf Einkommen',
      detailText: `Beitragssätze: ${config.statutoryHealthInsuranceRate}% KV, ${config.statutoryCareInsuranceRate}% PV (${employerText})`,
      healthInsuranceType,
      careInsuranceType,
    }
  }

  return {
    insuranceType: 'private',
    displayText: 'Private Krankenversicherung',
    detailText: `Monatliche Beiträge mit ${config.privateInsuranceInflationRate}% jährlicher Anpassung`,
    healthInsuranceType,
    careInsuranceType,
  }
}
