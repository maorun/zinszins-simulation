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
 * Planning mode for health insurance configuration
 */
export type HealthCarePlanningMode = 'individual' | 'couple'

/**
 * Couple strategy for statutory health insurance
 */
export type CoupleHealthInsuranceStrategy = 'individual' | 'family' | 'optimize'

/**
 * Family insurance thresholds for German statutory health insurance
 */
export interface FamilyInsuranceThresholds {
  /** Regular employment limit (monthly, EUR) */
  regularEmploymentLimit: number
  /** Mini-job limit (monthly, EUR) */
  miniJobLimit: number
  /** Year these thresholds apply to */
  year: number
}

/**
 * Couple health insurance configuration for statutory insurance
 */
export interface CoupleHealthInsuranceConfig {
  /** Strategy for couple: individual insurance for both, family insurance, or optimize */
  strategy: CoupleHealthInsuranceStrategy

  /** Family insurance thresholds */
  familyInsuranceThresholds: FamilyInsuranceThresholds

  /** Person 1 configuration */
  person1: {
    /** Person name for display */
    name?: string
    /** Birth year for age calculations */
    birthYear?: number
    /** Share of withdrawal amount allocated to this person (0-1) */
    withdrawalShare: number
    /** Other income sources for this person */
    otherIncomeAnnual: number
    /** Additional care insurance for childless */
    additionalCareInsuranceForChildless: boolean
  }

  /** Person 2 configuration */
  person2: {
    /** Person name for display */
    name?: string
    /** Birth year for age calculations */
    birthYear?: number
    /** Share of withdrawal amount allocated to this person (0-1) */
    withdrawalShare: number
    /** Other income sources for this person */
    otherIncomeAnnual: number
    /** Additional care insurance for childless */
    additionalCareInsuranceForChildless: boolean
  }
}

/**
 * Configuration for German health and care insurance contributions
 */
export interface HealthCareInsuranceConfig {
  /** Whether health and care insurance contributions are enabled in the calculation */
  enabled: boolean

  /** Planning mode: individual or couple */
  planningMode: HealthCarePlanningMode

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

  /** Couple configuration (only used when planningMode is 'couple') */
  coupleConfig?: CoupleHealthInsuranceConfig

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
 * Individual person result for couple health insurance calculation
 */
export interface CoupleHealthInsurancePersonResult {
  /** Person identifier */
  personId: 1 | 2
  /** Person name */
  name: string
  /** Individual health insurance result for this person */
  healthInsuranceResult: HealthCareInsuranceYearResult
  /** Income allocated to this person */
  allocatedIncome: number
  /** Other income for this person */
  otherIncome: number
  /** Total income for this person */
  totalIncome: number
  /** Whether this person is covered by family insurance */
  coveredByFamilyInsurance: boolean
  /** Whether this person qualifies for family insurance based on income */
  qualifiesForFamilyInsurance: boolean
}

/**
 * Result of couple health insurance optimization for one year
 */
export interface CoupleHealthInsuranceYearResult {
  /** Strategy used: individual, family, or optimized choice */
  strategyUsed: CoupleHealthInsuranceStrategy
  /** Total annual cost for both persons */
  totalAnnual: number
  /** Total monthly cost for both persons */
  totalMonthly: number
  /** Individual results for each person */
  person1: CoupleHealthInsurancePersonResult
  person2: CoupleHealthInsurancePersonResult
  /** Comparison of different strategies */
  strategyComparison: {
    individual: { totalAnnual: number, totalMonthly: number }
    family: { totalAnnual: number, totalMonthly: number, primaryInsuredPerson: 1 | 2 }
    optimized: {
      totalAnnual: number
      totalMonthly: number
      recommendedStrategy: CoupleHealthInsuranceStrategy
      savings: number
    }
  }
  /** Family insurance details */
  familyInsuranceDetails: {
    threshold: number
    person1QualifiesForFamily: boolean
    person2QualifiesForFamily: boolean
    possibleFamilyInsuranceArrangements: Array<{
      primaryPerson: 1 | 2
      familyInsuredPerson: 1 | 2
      totalCost: number
      viable: boolean
    }>
  }
}

/**
 * Complete health and care insurance calculation result across years
 */
export interface HealthCareInsuranceResult {
  [year: number]: HealthCareInsuranceYearResult
}

/**
 * Complete couple health and care insurance calculation result across years
 */
export interface CoupleHealthCareInsuranceResult {
  [year: number]: CoupleHealthInsuranceYearResult
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
 * Calculate health insurance for one person in a couple scenario
 */
function calculatePersonHealthInsurance(
  config: HealthCareInsuranceConfig,
  year: number,
  allocatedIncome: number,
  otherIncome: number,
  currentAge: number,
  additionalCareInsuranceForChildless: boolean,
): HealthCareInsuranceYearResult {
  // Create individual config for this person
  const personConfig: HealthCareInsuranceConfig = {
    ...config,
    additionalCareInsuranceForChildless,
  }

  const totalIncome = allocatedIncome + otherIncome
  return calculateHealthCareInsuranceForYear(personConfig, year, totalIncome, 0, currentAge)
}

/**
 * Check if a person qualifies for family insurance based on their income
 */
function qualifiesForFamilyInsurance(
  monthlyIncome: number,
  thresholds: FamilyInsuranceThresholds,
): boolean {
  // Use regular employment limit as default, mini-job limit would need specific employment type
  return monthlyIncome <= thresholds.regularEmploymentLimit
}

/**
 * Calculate optimal health insurance strategy for couples
 */
export function calculateCoupleHealthInsuranceForYear(
  config: HealthCareInsuranceConfig,
  year: number,
  withdrawalAmount: number,
  pensionAmount: number = 0,
): CoupleHealthInsuranceYearResult {
  if (!config.enabled || config.planningMode !== 'couple' || !config.coupleConfig) {
    throw new Error('Couple health insurance calculation requires couple planning mode and couple config')
  }

  const coupleConfig = config.coupleConfig

  // Calculate income allocation
  const totalWithdrawal = withdrawalAmount + pensionAmount
  const person1Income = totalWithdrawal * coupleConfig.person1.withdrawalShare + coupleConfig.person1.otherIncomeAnnual
  const person2Income = totalWithdrawal * coupleConfig.person2.withdrawalShare + coupleConfig.person2.otherIncomeAnnual

  // Calculate ages
  const person1Age = coupleConfig.person1.birthYear ? year - coupleConfig.person1.birthYear : 30
  const person2Age = coupleConfig.person2.birthYear ? year - coupleConfig.person2.birthYear : 30

  // Check family insurance eligibility
  const person1QualifiesForFamily = qualifiesForFamilyInsurance(
    person1Income / 12,
    coupleConfig.familyInsuranceThresholds,
  )
  const person2QualifiesForFamily = qualifiesForFamilyInsurance(
    person2Income / 12,
    coupleConfig.familyInsuranceThresholds,
  )

  // Calculate individual insurance costs for both persons
  const person1IndividualResult = calculatePersonHealthInsurance(
    config,
    year,
    totalWithdrawal * coupleConfig.person1.withdrawalShare,
    coupleConfig.person1.otherIncomeAnnual,
    person1Age,
    coupleConfig.person1.additionalCareInsuranceForChildless,
  )

  const person2IndividualResult = calculatePersonHealthInsurance(
    config,
    year,
    totalWithdrawal * coupleConfig.person2.withdrawalShare,
    coupleConfig.person2.otherIncomeAnnual,
    person2Age,
    coupleConfig.person2.additionalCareInsuranceForChildless,
  )

  // Calculate individual strategy costs
  const individualTotalAnnual = person1IndividualResult.totalAnnual + person2IndividualResult.totalAnnual

  // Calculate family insurance scenarios
  const familyScenarios = []

  // Scenario 1: Person 1 primary, Person 2 family insured
  if (person2QualifiesForFamily) {
    familyScenarios.push({
      primaryPerson: 1 as const,
      familyInsuredPerson: 2 as const,
      totalCost: person1IndividualResult.totalAnnual,
      viable: true,
    })
  }

  // Scenario 2: Person 2 primary, Person 1 family insured
  if (person1QualifiesForFamily) {
    familyScenarios.push({
      primaryPerson: 2 as const,
      familyInsuredPerson: 1 as const,
      totalCost: person2IndividualResult.totalAnnual,
      viable: true,
    })
  }

  // Find best family insurance option
  const bestFamilyOption = familyScenarios.length > 0
    ? familyScenarios.reduce((best, current) =>
        current.totalCost < best.totalCost ? current : best,
      )
    : { primaryPerson: 1 as const, familyInsuredPerson: 2 as const, totalCost: Number.MAX_VALUE, viable: false }

  // Determine optimal strategy
  let strategyUsed: CoupleHealthInsuranceStrategy
  let finalPerson1Result: CoupleHealthInsurancePersonResult
  let finalPerson2Result: CoupleHealthInsurancePersonResult
  let totalAnnual: number

  if (coupleConfig.strategy === 'individual') {
    strategyUsed = 'individual'
    finalPerson1Result = {
      personId: 1,
      name: coupleConfig.person1.name || 'Person 1',
      healthInsuranceResult: person1IndividualResult,
      allocatedIncome: totalWithdrawal * coupleConfig.person1.withdrawalShare,
      otherIncome: coupleConfig.person1.otherIncomeAnnual,
      totalIncome: person1Income,
      coveredByFamilyInsurance: false,
      qualifiesForFamilyInsurance: person1QualifiesForFamily,
    }
    finalPerson2Result = {
      personId: 2,
      name: coupleConfig.person2.name || 'Person 2',
      healthInsuranceResult: person2IndividualResult,
      allocatedIncome: totalWithdrawal * coupleConfig.person2.withdrawalShare,
      otherIncome: coupleConfig.person2.otherIncomeAnnual,
      totalIncome: person2Income,
      coveredByFamilyInsurance: false,
      qualifiesForFamilyInsurance: person2QualifiesForFamily,
    }
    totalAnnual = individualTotalAnnual
  }
  else if (coupleConfig.strategy === 'family' && bestFamilyOption.viable) {
    strategyUsed = 'family'
    if (bestFamilyOption.primaryPerson === 1) {
      finalPerson1Result = {
        personId: 1,
        name: coupleConfig.person1.name || 'Person 1',
        healthInsuranceResult: person1IndividualResult,
        allocatedIncome: totalWithdrawal * coupleConfig.person1.withdrawalShare,
        otherIncome: coupleConfig.person1.otherIncomeAnnual,
        totalIncome: person1Income,
        coveredByFamilyInsurance: false,
        qualifiesForFamilyInsurance: person1QualifiesForFamily,
      }
      finalPerson2Result = {
        personId: 2,
        name: coupleConfig.person2.name || 'Person 2',
        healthInsuranceResult: {
          ...person2IndividualResult,
          totalAnnual: 0,
          totalMonthly: 0,
          healthInsuranceAnnual: 0,
          careInsuranceAnnual: 0,
          healthInsuranceMonthly: 0,
          careInsuranceMonthly: 0,
        },
        allocatedIncome: totalWithdrawal * coupleConfig.person2.withdrawalShare,
        otherIncome: coupleConfig.person2.otherIncomeAnnual,
        totalIncome: person2Income,
        coveredByFamilyInsurance: true,
        qualifiesForFamilyInsurance: person2QualifiesForFamily,
      }
    }
    else {
      finalPerson1Result = {
        personId: 1,
        name: coupleConfig.person1.name || 'Person 1',
        healthInsuranceResult: {
          ...person1IndividualResult,
          totalAnnual: 0,
          totalMonthly: 0,
          healthInsuranceAnnual: 0,
          careInsuranceAnnual: 0,
          healthInsuranceMonthly: 0,
          careInsuranceMonthly: 0,
        },
        allocatedIncome: totalWithdrawal * coupleConfig.person1.withdrawalShare,
        otherIncome: coupleConfig.person1.otherIncomeAnnual,
        totalIncome: person1Income,
        coveredByFamilyInsurance: true,
        qualifiesForFamilyInsurance: person1QualifiesForFamily,
      }
      finalPerson2Result = {
        personId: 2,
        name: coupleConfig.person2.name || 'Person 2',
        healthInsuranceResult: person2IndividualResult,
        allocatedIncome: totalWithdrawal * coupleConfig.person2.withdrawalShare,
        otherIncome: coupleConfig.person2.otherIncomeAnnual,
        totalIncome: person2Income,
        coveredByFamilyInsurance: false,
        qualifiesForFamilyInsurance: person2QualifiesForFamily,
      }
    }
    totalAnnual = bestFamilyOption.totalCost
  }
  else {
    // Optimize strategy
    const bestStrategy = bestFamilyOption.viable && bestFamilyOption.totalCost < individualTotalAnnual ? 'family' : 'individual'
    strategyUsed = bestStrategy

    if (bestStrategy === 'family') {
      // Use family insurance logic from above
      if (bestFamilyOption.primaryPerson === 1) {
        finalPerson1Result = {
          personId: 1,
          name: coupleConfig.person1.name || 'Person 1',
          healthInsuranceResult: person1IndividualResult,
          allocatedIncome: totalWithdrawal * coupleConfig.person1.withdrawalShare,
          otherIncome: coupleConfig.person1.otherIncomeAnnual,
          totalIncome: person1Income,
          coveredByFamilyInsurance: false,
          qualifiesForFamilyInsurance: person1QualifiesForFamily,
        }
        finalPerson2Result = {
          personId: 2,
          name: coupleConfig.person2.name || 'Person 2',
          healthInsuranceResult: {
            ...person2IndividualResult,
            totalAnnual: 0,
            totalMonthly: 0,
            healthInsuranceAnnual: 0,
            careInsuranceAnnual: 0,
            healthInsuranceMonthly: 0,
            careInsuranceMonthly: 0,
          },
          allocatedIncome: totalWithdrawal * coupleConfig.person2.withdrawalShare,
          otherIncome: coupleConfig.person2.otherIncomeAnnual,
          totalIncome: person2Income,
          coveredByFamilyInsurance: true,
          qualifiesForFamilyInsurance: person2QualifiesForFamily,
        }
      }
      else {
        finalPerson1Result = {
          personId: 1,
          name: coupleConfig.person1.name || 'Person 1',
          healthInsuranceResult: {
            ...person1IndividualResult,
            totalAnnual: 0,
            totalMonthly: 0,
            healthInsuranceAnnual: 0,
            careInsuranceAnnual: 0,
            healthInsuranceMonthly: 0,
            careInsuranceMonthly: 0,
          },
          allocatedIncome: totalWithdrawal * coupleConfig.person1.withdrawalShare,
          otherIncome: coupleConfig.person1.otherIncomeAnnual,
          totalIncome: person1Income,
          coveredByFamilyInsurance: true,
          qualifiesForFamilyInsurance: person1QualifiesForFamily,
        }
        finalPerson2Result = {
          personId: 2,
          name: coupleConfig.person2.name || 'Person 2',
          healthInsuranceResult: person2IndividualResult,
          allocatedIncome: totalWithdrawal * coupleConfig.person2.withdrawalShare,
          otherIncome: coupleConfig.person2.otherIncomeAnnual,
          totalIncome: person2Income,
          coveredByFamilyInsurance: false,
          qualifiesForFamilyInsurance: person2QualifiesForFamily,
        }
      }
      totalAnnual = bestFamilyOption.totalCost
    }
    else {
      // Use individual insurance logic
      finalPerson1Result = {
        personId: 1,
        name: coupleConfig.person1.name || 'Person 1',
        healthInsuranceResult: person1IndividualResult,
        allocatedIncome: totalWithdrawal * coupleConfig.person1.withdrawalShare,
        otherIncome: coupleConfig.person1.otherIncomeAnnual,
        totalIncome: person1Income,
        coveredByFamilyInsurance: false,
        qualifiesForFamilyInsurance: person1QualifiesForFamily,
      }
      finalPerson2Result = {
        personId: 2,
        name: coupleConfig.person2.name || 'Person 2',
        healthInsuranceResult: person2IndividualResult,
        allocatedIncome: totalWithdrawal * coupleConfig.person2.withdrawalShare,
        otherIncome: coupleConfig.person2.otherIncomeAnnual,
        totalIncome: person2Income,
        coveredByFamilyInsurance: false,
        qualifiesForFamilyInsurance: person2QualifiesForFamily,
      }
      totalAnnual = individualTotalAnnual
    }
  }

  return {
    strategyUsed,
    totalAnnual,
    totalMonthly: totalAnnual / 12,
    person1: finalPerson1Result,
    person2: finalPerson2Result,
    strategyComparison: {
      individual: {
        totalAnnual: individualTotalAnnual,
        totalMonthly: individualTotalAnnual / 12,
      },
      family: {
        totalAnnual: bestFamilyOption.totalCost,
        totalMonthly: bestFamilyOption.totalCost / 12,
        primaryInsuredPerson: bestFamilyOption.primaryPerson,
      },
      optimized: {
        totalAnnual,
        totalMonthly: totalAnnual / 12,
        recommendedStrategy: strategyUsed,
        savings: Math.max(0, individualTotalAnnual - totalAnnual),
      },
    },
    familyInsuranceDetails: {
      threshold: coupleConfig.familyInsuranceThresholds.regularEmploymentLimit,
      person1QualifiesForFamily: person1QualifiesForFamily,
      person2QualifiesForFamily: person2QualifiesForFamily,
      possibleFamilyInsuranceArrangements: familyScenarios,
    },
  }
}

/**
 * Calculate couple health insurance across multiple years
 */
export function calculateCoupleHealthCareInsurance(
  config: HealthCareInsuranceConfig,
  startYear: number,
  endYear: number,
  withdrawalAmounts: { [year: number]: number },
  pensionAmounts: { [year: number]: number } = {},
): CoupleHealthCareInsuranceResult {
  const result: CoupleHealthCareInsuranceResult = {}

  for (let year = startYear; year <= endYear; year++) {
    const withdrawalAmount = withdrawalAmounts[year] || 0
    const pensionAmount = pensionAmounts[year] || 0

    result[year] = calculateCoupleHealthInsuranceForYear(
      config,
      year,
      withdrawalAmount,
      pensionAmount,
    )
  }

  return result
}

/**
 * Create default health and care insurance configuration
 */
/**
 * Create default family insurance thresholds for the given year
 */
export function createDefaultFamilyInsuranceThresholds(year: number = 2025): FamilyInsuranceThresholds {
  return {
    regularEmploymentLimit: 505, // €505/month for 2025
    miniJobLimit: 538, // €538/month for mini-jobs in 2025
    year,
  }
}

/**
 * Create default couple health insurance configuration
 */
export function createDefaultCoupleHealthInsuranceConfig(): CoupleHealthInsuranceConfig {
  return {
    strategy: 'optimize',
    familyInsuranceThresholds: createDefaultFamilyInsuranceThresholds(),
    person1: {
      name: 'Person 1',
      withdrawalShare: 0.5, // 50% of withdrawal
      otherIncomeAnnual: 0,
      additionalCareInsuranceForChildless: false,
    },
    person2: {
      name: 'Person 2',
      withdrawalShare: 0.5, // 50% of withdrawal
      otherIncomeAnnual: 0,
      additionalCareInsuranceForChildless: false,
    },
  }
}

export function createDefaultHealthCareInsuranceConfig(): HealthCareInsuranceConfig {
  return {
    enabled: true, // Default: enabled for withdrawal simulations
    planningMode: 'individual', // Default: individual planning
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
    // Couple configuration
    coupleConfig: createDefaultCoupleHealthInsuranceConfig(),
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
