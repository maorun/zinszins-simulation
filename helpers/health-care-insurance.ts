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

  /** Health insurance contribution rate during pre-retirement phase (as percentage) */
  healthInsuranceRatePreRetirement: number

  /** Care insurance contribution rate during pre-retirement phase (as percentage) */
  careInsuranceRatePreRetirement: number

  /** Health insurance contribution rate during retirement phase (as percentage) */
  healthInsuranceRateRetirement: number

  /** Care insurance contribution rate during retirement phase (as percentage) */
  careInsuranceRateRetirement: number

  /** Year when retirement begins (switches from pre-retirement to retirement rates) */
  retirementStartYear: number

  /** Fixed monthly health insurance contribution (optional, overrides percentage-based calculation) */
  fixedHealthInsuranceMonthly?: number

  /** Fixed monthly care insurance contribution (optional, overrides percentage-based calculation) */
  fixedCareInsuranceMonthly?: number

  /** Whether to use fixed amounts instead of percentage-based calculation */
  useFixedAmounts: boolean

  /** Income threshold for health insurance contributions (Beitragsbemessungsgrenze) */
  healthInsuranceIncomeThreshold?: number

  /** Income threshold for care insurance contributions */
  careInsuranceIncomeThreshold?: number

  /** Additional care insurance contribution for childless individuals over 23 (default: 0.6%) */
  additionalCareInsuranceForChildless: boolean

  /** Age at which additional care insurance applies */
  additionalCareInsuranceAge: number
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

  /** Whether fixed amounts were used instead of percentage calculation */
  usedFixedAmounts: boolean

  /** Whether pre-retirement or retirement rates were applied */
  isRetirementPhase: boolean

  /** Effective health insurance rate applied (as percentage) */
  effectiveHealthInsuranceRate: number

  /** Effective care insurance rate applied (as percentage) */
  effectiveCareInsuranceRate: number

  /** Base income amount used for percentage calculation */
  baseIncomeForCalculation: number

  /** Whether additional care insurance for childless was applied */
  appliedAdditionalCareInsurance: boolean
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
      usedFixedAmounts: false,
      isRetirementPhase: false,
      effectiveHealthInsuranceRate: 0,
      effectiveCareInsuranceRate: 0,
      baseIncomeForCalculation: 0,
      appliedAdditionalCareInsurance: false,
    }
  }

  const isRetirementPhase = year >= config.retirementStartYear

  // Use fixed amounts if configured
  if (config.useFixedAmounts && config.fixedHealthInsuranceMonthly && config.fixedCareInsuranceMonthly) {
    const healthInsuranceMonthly = config.fixedHealthInsuranceMonthly
    const careInsuranceMonthly = config.fixedCareInsuranceMonthly

    return {
      healthInsuranceAnnual: healthInsuranceMonthly * 12,
      careInsuranceAnnual: careInsuranceMonthly * 12,
      totalAnnual: (healthInsuranceMonthly + careInsuranceMonthly) * 12,
      healthInsuranceMonthly,
      careInsuranceMonthly,
      totalMonthly: healthInsuranceMonthly + careInsuranceMonthly,
      usedFixedAmounts: true,
      isRetirementPhase,
      effectiveHealthInsuranceRate: 0,
      effectiveCareInsuranceRate: 0,
      baseIncomeForCalculation: 0,
      appliedAdditionalCareInsurance: false,
    }
  }

  // Calculate percentage-based contributions
  const baseIncome = withdrawalAmount + pensionAmount

  // Apply income thresholds if configured
  let healthInsuranceBaseIncome = baseIncome
  let careInsuranceBaseIncome = baseIncome

  if (config.healthInsuranceIncomeThreshold) {
    healthInsuranceBaseIncome = Math.min(baseIncome, config.healthInsuranceIncomeThreshold)
  }

  if (config.careInsuranceIncomeThreshold) {
    careInsuranceBaseIncome = Math.min(baseIncome, config.careInsuranceIncomeThreshold)
  }

  // Select appropriate rates based on retirement phase
  const healthInsuranceRate = isRetirementPhase
    ? config.healthInsuranceRateRetirement
    : config.healthInsuranceRatePreRetirement

  let careInsuranceRate = isRetirementPhase
    ? config.careInsuranceRateRetirement
    : config.careInsuranceRatePreRetirement

  // Add additional care insurance for childless individuals
  const appliedAdditionalCareInsurance = config.additionalCareInsuranceForChildless
    && currentAge >= config.additionalCareInsuranceAge

  if (appliedAdditionalCareInsurance) {
    careInsuranceRate += 0.6 // Additional 0.6% for childless individuals over 23
  }

  // Calculate annual contributions
  const healthInsuranceAnnual = healthInsuranceBaseIncome * (healthInsuranceRate / 100)
  const careInsuranceAnnual = careInsuranceBaseIncome * (careInsuranceRate / 100)

  return {
    healthInsuranceAnnual,
    careInsuranceAnnual,
    totalAnnual: healthInsuranceAnnual + careInsuranceAnnual,
    healthInsuranceMonthly: healthInsuranceAnnual / 12,
    careInsuranceMonthly: careInsuranceAnnual / 12,
    totalMonthly: (healthInsuranceAnnual + careInsuranceAnnual) / 12,
    usedFixedAmounts: false,
    isRetirementPhase,
    effectiveHealthInsuranceRate: healthInsuranceRate,
    effectiveCareInsuranceRate: careInsuranceRate,
    baseIncomeForCalculation: baseIncome,
    appliedAdditionalCareInsurance,
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
    enabled: false,
    // Pre-retirement rates (typical values for German public insurance)
    healthInsuranceRatePreRetirement: 14.6, // 14.6% health insurance (employee + employer)
    careInsuranceRatePreRetirement: 3.05, // 3.05% care insurance (+ 0.6% for childless)
    // Retirement rates (typically lower, only retiree portion)
    healthInsuranceRateRetirement: 7.3, // 7.3% health insurance (retiree only)
    careInsuranceRateRetirement: 3.05, // 3.05% care insurance (same rate)
    retirementStartYear: 2041,
    useFixedAmounts: false,
    additionalCareInsuranceForChildless: false,
    additionalCareInsuranceAge: 23,
    // Income thresholds (Beitragsbemessungsgrenzen 2024)
    healthInsuranceIncomeThreshold: 62550, // Annual threshold for health insurance
    careInsuranceIncomeThreshold: 62550, // Annual threshold for care insurance
  }
}

/**
 * Get display name for health and care insurance calculation type
 */
export function getHealthCareInsuranceDisplayInfo(config: HealthCareInsuranceConfig): {
  healthInsuranceType: 'fixed' | 'percentage'
  careInsuranceType: 'fixed' | 'percentage'
  displayText: string
} {
  if (config.useFixedAmounts) {
    return {
      healthInsuranceType: 'fixed',
      careInsuranceType: 'fixed',
      displayText: 'Feste monatliche Beiträge',
    }
  }

  return {
    healthInsuranceType: 'percentage',
    careInsuranceType: 'percentage',
    displayText: 'Prozentuale Beiträge basierend auf Einkommen',
  }
}
