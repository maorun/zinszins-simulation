/**
 * Business Risk Integration for Self-Employed
 *
 * This module implements income risk modeling for self-employed individuals,
 * including income volatility, emergency reserves, daily sickness allowance insurance,
 * and seasonal business cycles.
 *
 * Key features:
 * - Income volatility simulation (varying monthly/yearly income)
 * - Enhanced emergency reserves (12-18 months for self-employed)
 * - Krankentagegeld (daily sickness allowance) insurance integration
 * - Seasonal business cycle modeling
 * - Income failure/loss scenarios
 *
 * German context:
 * - Selbstständige face higher income volatility than employees
 * - Recommended emergency fund: 12-18 months of living expenses
 * - Krankentagegeld insurance is essential due to no employer coverage
 * - Many businesses have seasonal revenue patterns
 */

/**
 * Employment status for risk assessment
 */
export type EmploymentStatus = 'selbstständig' | 'angestellt' | 'freiberufler'

/**
 * Income volatility level
 */
export type IncomeVolatilityLevel = 'low' | 'medium' | 'high' | 'very_high'

/**
 * Seasonal pattern type
 */
export type SeasonalPattern = 'none' | 'spring_summer' | 'autumn_winter' | 'quarterly' | 'custom'

/**
 * Krankentagegeld (daily sickness allowance) insurance configuration
 */
export interface KrankentagegeldConfig {
  /** Whether insurance is enabled */
  enabled: boolean
  /** Daily benefit amount in EUR */
  dailyBenefit: number
  /** Waiting period in days before benefits start (Karenzzeit) */
  waitingPeriodDays: number
  /** Monthly premium in EUR */
  monthlyPremium: number
  /** Maximum benefit duration in days per year */
  maxBenefitDays: number
  /** Percentage of income covered (typically 80-100%) */
  incomeCoveragePercent: number
}

/**
 * Seasonal business cycle configuration
 */
export interface SeasonalCycleConfig {
  /** Seasonal pattern type */
  pattern: SeasonalPattern
  /** Monthly revenue multipliers (1.0 = average, 1.5 = +50%, 0.5 = -50%) */
  monthlyMultipliers: number[]
  /** Description of the seasonal pattern */
  description?: string
}

/**
 * Income failure scenario configuration
 */
export interface IncomeFailureScenario {
  /** Year when income failure occurs */
  failureYear: number
  /** Duration of income loss in months */
  durationMonths: number
  /** Percentage of income lost (0-1, where 1 = 100% loss) */
  incomeLossPercent: number
  /** Reason for failure (for documentation) */
  reason?: string
  /** Whether Krankentagegeld covers this scenario */
  coveredByKrankentagegeld: boolean
}

/**
 * Emergency reserve strategy for self-employed
 */
export interface EmergencyReserveStrategy {
  /** Target number of months of expenses to reserve */
  targetMonths: number
  /** Whether to prioritize building emergency fund before investing */
  prioritizeBeforeInvesting: boolean
  /** Monthly amount allocated to building emergency fund */
  monthlyAllocation: number
  /** Current emergency fund balance */
  currentBalance: number
  /** Target balance (auto-calculated from monthly expenses) */
  targetBalance: number
}

/**
 * Complete business risk configuration
 */
export interface BusinessRiskConfig {
  /** Whether business risk modeling is enabled */
  enabled: boolean
  /** Employment status */
  employmentStatus: EmploymentStatus
  /** Average monthly business income in EUR */
  averageMonthlyIncome: number
  /** Income volatility level */
  volatilityLevel: IncomeVolatilityLevel
  /** Custom volatility percentage (overrides volatilityLevel if set) */
  customVolatilityPercent?: number
  /** Krankentagegeld insurance configuration */
  krankentagegeld: KrankentagegeldConfig
  /** Seasonal business cycle configuration */
  seasonalCycle: SeasonalCycleConfig
  /** Emergency reserve strategy */
  emergencyReserve: EmergencyReserveStrategy
  /** Potential income failure scenarios */
  failureScenarios: IncomeFailureScenario[]
}

/**
 * Monthly income calculation result
 */
export interface MonthlyIncomeResult {
  /** Month (1-12) */
  month: number
  /** Year */
  year: number
  /** Base income before adjustments */
  baseIncome: number
  /** Seasonal adjustment multiplier */
  seasonalMultiplier: number
  /** Volatility adjustment (positive or negative) */
  volatilityAdjustment: number
  /** Final income after all adjustments */
  finalIncome: number
  /** Whether income failure occurred */
  incomeFailure: boolean
  /** Krankentagegeld benefit received (if applicable) */
  krankentagegeldBenefit: number
}

/**
 * Yearly business risk analysis
 */
export interface YearlyBusinessRiskAnalysis {
  /** Year */
  year: number
  /** Total income for the year */
  totalIncome: number
  /** Average monthly income */
  averageMonthlyIncome: number
  /** Minimum monthly income (lowest point) */
  minMonthlyIncome: number
  /** Maximum monthly income (highest point) */
  maxMonthlyIncome: number
  /** Income volatility (standard deviation) */
  incomeVolatility: number
  /** Number of months with income below average */
  monthsBelowAverage: number
  /** Total Krankentagegeld benefits received */
  totalKrankentagegeldBenefits: number
  /** Total Krankentagegeld premiums paid */
  totalKrankentagegeldPremiums: number
  /** Emergency reserve status at year end */
  emergencyReserveBalance: number
  /** Whether emergency reserve target was met */
  emergencyReserveTargetMet: boolean
}

/**
 * Default volatility percentages by level
 */
export const DEFAULT_VOLATILITY_LEVELS: Record<IncomeVolatilityLevel, number> = {
  low: 0.10, // 10% variation
  medium: 0.20, // 20% variation
  high: 0.35, // 35% variation
  very_high: 0.50, // 50% variation
}

/**
 * Default Krankentagegeld configurations
 */
export const DEFAULT_KRANKENTAGEGELD_CONFIG: KrankentagegeldConfig = {
  enabled: false,
  dailyBenefit: 0,
  waitingPeriodDays: 42, // Typical: 6 weeks
  monthlyPremium: 0,
  maxBenefitDays: 365,
  incomeCoveragePercent: 80,
}

/**
 * Predefined seasonal patterns
 */
export const PREDEFINED_SEASONAL_PATTERNS: Record<SeasonalPattern, number[]> = {
  none: [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0],
  spring_summer: [0.6, 0.7, 0.9, 1.2, 1.4, 1.5, 1.4, 1.3, 1.1, 0.9, 0.7, 0.6], // Higher in spring/summer
  autumn_winter: [1.4, 1.5, 1.3, 1.0, 0.8, 0.6, 0.6, 0.7, 0.9, 1.1, 1.3, 1.5], // Higher in autumn/winter
  quarterly: [1.2, 1.0, 1.5, 1.2, 1.0, 1.5, 1.2, 1.0, 1.5, 1.2, 1.0, 1.5], // Peaks every 3 months
  custom: [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0], // User-defined
}

/**
 * Get volatility percentage for a given level
 */
export function getVolatilityPercent(level: IncomeVolatilityLevel): number {
  return DEFAULT_VOLATILITY_LEVELS[level]
}

/**
 * Get seasonal pattern name in German
 */
export function getSeasonalPatternName(pattern: SeasonalPattern): string {
  const names: Record<SeasonalPattern, string> = {
    none: 'Keine Saisonalität',
    spring_summer: 'Frühjahr/Sommer-Geschäft',
    autumn_winter: 'Herbst/Winter-Geschäft',
    quarterly: 'Quartalsweise Schwankungen',
    custom: 'Benutzerdefiniert',
  }
  return names[pattern]
}

/**
 * Get employment status name in German
 */
export function getEmploymentStatusName(status: EmploymentStatus): string {
  const names: Record<EmploymentStatus, string> = {
    selbstständig: 'Selbstständig',
    angestellt: 'Angestellt',
    freiberufler: 'Freiberufler',
  }
  return names[status]
}

/**
 * Calculate recommended emergency reserve months based on employment status
 */
export function getRecommendedEmergencyMonths(status: EmploymentStatus): number {
  const recommendations: Record<EmploymentStatus, number> = {
    angestellt: 3, // 3 months for employees
    freiberufler: 12, // 12 months for freelancers
    selbstständig: 15, // 15 months for self-employed business owners
  }
  return recommendations[status]
}

/**
 * Calculate monthly income with business risk factors
 *
 * @param config - Business risk configuration
 * @param month - Month (1-12)
 * @param year - Year
 * @param randomSeed - Random seed for volatility (for reproducibility)
 * @returns Monthly income calculation result
 */
export function calculateMonthlyBusinessIncome(
  config: BusinessRiskConfig,
  month: number,
  year: number,
  randomSeed?: number,
): MonthlyIncomeResult {
  if (!config.enabled) {
    return {
      month,
      year,
      baseIncome: config.averageMonthlyIncome,
      seasonalMultiplier: 1.0,
      volatilityAdjustment: 0,
      finalIncome: config.averageMonthlyIncome,
      incomeFailure: false,
      krankentagegeldBenefit: 0,
    }
  }

  const baseIncome = config.averageMonthlyIncome

  // Apply seasonal adjustment
  const monthIndex = month - 1
  const seasonalMultiplier = config.seasonalCycle.monthlyMultipliers[monthIndex] || 1.0

  // Calculate volatility adjustment using pseudo-random based on seed
  const volatilityPercent =
    config.customVolatilityPercent !== undefined
      ? config.customVolatilityPercent / 100
      : getVolatilityPercent(config.volatilityLevel)

  // Use seed for reproducible randomness
  const seed = randomSeed !== undefined ? randomSeed : year * 12 + month
  const pseudoRandom = Math.sin(seed * 12345) // Simple pseudo-random between -1 and 1
  const volatilityAdjustment = baseIncome * seasonalMultiplier * volatilityPercent * pseudoRandom

  // Calculate income before failure scenarios
  let incomeBeforeFailure = baseIncome * seasonalMultiplier + volatilityAdjustment

  // Check for income failure scenarios
  const failureScenario = config.failureScenarios.find(scenario => {
    const failureEndYear = scenario.failureYear + Math.floor(scenario.durationMonths / 12)
    const failureEndMonth = scenario.durationMonths % 12

    const isInFailurePeriod =
      (year === scenario.failureYear && month >= 1) ||
      (year > scenario.failureYear && year < failureEndYear) ||
      (year === failureEndYear && month <= failureEndMonth)

    return isInFailurePeriod
  })

  let incomeFailure = false
  let krankentagegeldBenefit = 0
  let finalIncome = incomeBeforeFailure

  if (failureScenario) {
    incomeFailure = true
    const incomeLoss = incomeBeforeFailure * failureScenario.incomeLossPercent
    finalIncome = incomeBeforeFailure - incomeLoss

    // Calculate Krankentagegeld benefit if applicable
    if (failureScenario.coveredByKrankentagegeld && config.krankentagegeld.enabled) {
      const daysInMonth = 30 // Simplified
      const waitingPeriodPassed = true // Simplified: assume waiting period has passed
      
      if (waitingPeriodPassed) {
        krankentagegeldBenefit = config.krankentagegeld.dailyBenefit * daysInMonth
        krankentagegeldBenefit = Math.min(
          krankentagegeldBenefit,
          (config.averageMonthlyIncome * config.krankentagegeld.incomeCoveragePercent) / 100,
        )
        finalIncome += krankentagegeldBenefit
      }
    }
  }

  return {
    month,
    year,
    baseIncome,
    seasonalMultiplier,
    volatilityAdjustment,
    finalIncome: Math.max(0, finalIncome), // Ensure non-negative
    incomeFailure,
    krankentagegeldBenefit,
  }
}

/**
 * Calculate yearly business risk analysis
 *
 * @param config - Business risk configuration
 * @param year - Year to analyze
 * @param monthlyExpenses - Average monthly expenses for emergency reserve calculation
 * @returns Yearly analysis result
 */
export function calculateYearlyBusinessRisk(
  config: BusinessRiskConfig,
  year: number,
  monthlyExpenses: number,
): YearlyBusinessRiskAnalysis {
  const monthlyResults: MonthlyIncomeResult[] = []

  // Calculate income for each month
  for (let month = 1; month <= 12; month++) {
    const result = calculateMonthlyBusinessIncome(config, month, year)
    monthlyResults.push(result)
  }

  // Aggregate statistics
  const totalIncome = monthlyResults.reduce((sum, r) => sum + r.finalIncome, 0)
  const averageMonthlyIncome = totalIncome / 12
  const minMonthlyIncome = Math.min(...monthlyResults.map(r => r.finalIncome))
  const maxMonthlyIncome = Math.max(...monthlyResults.map(r => r.finalIncome))

  // Calculate income volatility (standard deviation)
  const variance =
    monthlyResults.reduce((sum, r) => sum + Math.pow(r.finalIncome - averageMonthlyIncome, 2), 0) / 12
  const incomeVolatility = Math.sqrt(variance)

  const monthsBelowAverage = monthlyResults.filter(r => r.finalIncome < averageMonthlyIncome).length

  const totalKrankentagegeldBenefits = monthlyResults.reduce((sum, r) => sum + r.krankentagegeldBenefit, 0)
  const totalKrankentagegeldPremiums = config.krankentagegeld.enabled ? config.krankentagegeld.monthlyPremium * 12 : 0

  // Emergency reserve calculation
  const targetEmergencyReserve = monthlyExpenses * config.emergencyReserve.targetMonths
  const emergencyReserveBalance = config.emergencyReserve.currentBalance
  const emergencyReserveTargetMet = emergencyReserveBalance >= targetEmergencyReserve

  return {
    year,
    totalIncome,
    averageMonthlyIncome,
    minMonthlyIncome,
    maxMonthlyIncome,
    incomeVolatility,
    monthsBelowAverage,
    totalKrankentagegeldBenefits,
    totalKrankentagegeldPremiums,
    emergencyReserveBalance,
    emergencyReserveTargetMet,
  }
}

/**
 * Create default business risk configuration
 */
export function createDefaultBusinessRiskConfig(averageMonthlyIncome = 3000): BusinessRiskConfig {
  return {
    enabled: false,
    employmentStatus: 'selbstständig',
    averageMonthlyIncome,
    volatilityLevel: 'medium',
    krankentagegeld: { ...DEFAULT_KRANKENTAGEGELD_CONFIG },
    seasonalCycle: {
      pattern: 'none',
      monthlyMultipliers: [...PREDEFINED_SEASONAL_PATTERNS.none],
    },
    emergencyReserve: {
      targetMonths: 15,
      prioritizeBeforeInvesting: true,
      monthlyAllocation: 0,
      currentBalance: 0,
      targetBalance: 0,
    },
    failureScenarios: [],
  }
}

/**
 * Validate business risk configuration
 *
 * @param config - Configuration to validate
 * @returns Array of validation error messages (empty if valid)
 */
export function validateBusinessRiskConfig(config: BusinessRiskConfig): string[] {
  const errors: string[] = []

  if (config.enabled) {
    if (config.averageMonthlyIncome < 0) {
      errors.push('Durchschnittseinkommen kann nicht negativ sein')
    }

    if (config.customVolatilityPercent !== undefined) {
      if (config.customVolatilityPercent < 0 || config.customVolatilityPercent > 100) {
        errors.push('Volatilität muss zwischen 0% und 100% liegen')
      }
    }

    if (config.seasonalCycle.monthlyMultipliers.length !== 12) {
      errors.push('Saisonale Multiplikatoren müssen genau 12 Werte enthalten (einen pro Monat)')
    }

    if (config.krankentagegeld.enabled) {
      if (config.krankentagegeld.dailyBenefit < 0) {
        errors.push('Krankentagegeld-Leistung kann nicht negativ sein')
      }

      if (config.krankentagegeld.waitingPeriodDays < 0) {
        errors.push('Karenzzeit kann nicht negativ sein')
      }

      if (config.krankentagegeld.monthlyPremium < 0) {
        errors.push('Krankentagegeld-Beitrag kann nicht negativ sein')
      }

      if (
        config.krankentagegeld.incomeCoveragePercent < 0 ||
        config.krankentagegeld.incomeCoveragePercent > 100
      ) {
        errors.push('Einkommensabsicherung muss zwischen 0% und 100% liegen')
      }
    }

    if (config.emergencyReserve.targetMonths < 0) {
      errors.push('Notfallreserve-Ziel kann nicht negativ sein')
    }

    if (config.emergencyReserve.monthlyAllocation < 0) {
      errors.push('Monatliche Notfallreserve-Zuteilung kann nicht negativ sein')
    }

    if (config.emergencyReserve.currentBalance < 0) {
      errors.push('Aktueller Notfallreserve-Stand kann nicht negativ sein')
    }

    // Validate failure scenarios
    for (const scenario of config.failureScenarios) {
      if (scenario.durationMonths <= 0) {
        errors.push('Ausfalldauer muss mindestens 1 Monat betragen')
      }

      if (scenario.incomeLossPercent < 0 || scenario.incomeLossPercent > 1) {
        errors.push('Einkommensverlust muss zwischen 0% und 100% liegen')
      }
    }
  }

  return errors
}

/**
 * Format currency amount for display (German format)
 */
export function formatBusinessCurrency(amount: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Format percentage for display
 */
export function formatBusinessPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`
}

/**
 * Get volatility level name in German
 */
export function getVolatilityLevelName(level: IncomeVolatilityLevel): string {
  const names: Record<IncomeVolatilityLevel, string> = {
    low: 'Niedrig (±10%)',
    medium: 'Mittel (±20%)',
    high: 'Hoch (±35%)',
    very_high: 'Sehr hoch (±50%)',
  }
  return names[level]
}
