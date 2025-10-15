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
  pensionAmount = 0,
  currentAge = 30,
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

type CreatePersonResultParams = {
  personId: 1 | 2
  name: string
  healthInsuranceResult: HealthCareInsuranceYearResult
  allocatedIncome: number
  otherIncome: number
  totalIncome: number
  coveredByFamilyInsurance: boolean
  qualifiesForFamilyInsurance: boolean
}

function createPersonResult(
  params: CreatePersonResultParams,
): CoupleHealthInsurancePersonResult {
  return {
    personId: params.personId,
    name: params.name,
    healthInsuranceResult: params.healthInsuranceResult,
    allocatedIncome: params.allocatedIncome,
    otherIncome: params.otherIncome,
    totalIncome: params.totalIncome,
    coveredByFamilyInsurance: params.coveredByFamilyInsurance,
    qualifiesForFamilyInsurance: params.qualifiesForFamilyInsurance,
  }
}

function createZeroInsuranceResult(
  baseResult: HealthCareInsuranceYearResult,
): HealthCareInsuranceYearResult {
  return {
    ...baseResult,
    totalAnnual: 0,
    totalMonthly: 0,
    healthInsuranceAnnual: 0,
    careInsuranceAnnual: 0,
    healthInsuranceMonthly: 0,
    careInsuranceMonthly: 0,
  }
}

type FamilyInsuranceScenario = {
  primaryPerson: 1 | 2
  familyInsuredPerson: 1 | 2
  totalCost: number
  viable: boolean
}

function calculateFamilyScenarios(
  person1QualifiesForFamily: boolean,
  person2QualifiesForFamily: boolean,
  person1IndividualCost: number,
  person2IndividualCost: number,
): FamilyInsuranceScenario[] {
  const scenarios: FamilyInsuranceScenario[] = []

  if (person2QualifiesForFamily) {
    scenarios.push({
      primaryPerson: 1,
      familyInsuredPerson: 2,
      totalCost: person1IndividualCost,
      viable: true,
    })
  }

  if (person1QualifiesForFamily) {
    scenarios.push({
      primaryPerson: 2,
      familyInsuredPerson: 1,
      totalCost: person2IndividualCost,
      viable: true,
    })
  }

  return scenarios
}

function getBestFamilyOption(
  scenarios: FamilyInsuranceScenario[],
): FamilyInsuranceScenario {
  if (scenarios.length === 0) {
    return {
      primaryPerson: 1,
      familyInsuredPerson: 2,
      totalCost: Number.MAX_VALUE,
      viable: false,
    }
  }

  return scenarios.reduce((best, current) =>
    current.totalCost < best.totalCost ? current : best,
  )
}

type PersonData = {
  config: CoupleHealthInsuranceConfig['person1']
  income: number
  qualifiesForFamily: boolean
  individualResult: HealthCareInsuranceYearResult
  totalWithdrawal: number
}

type ApplyStrategyParams = {
  strategy: CoupleHealthInsuranceStrategy
  person1Data: PersonData
  person2Data: PersonData
  bestFamilyOption: FamilyInsuranceScenario
  individualTotalAnnual: number
}

function applyIndividualStrategy(params: ApplyStrategyParams) {
  const { person1Data, person2Data, individualTotalAnnual } = params

  return {
    strategyUsed: 'individual' as const,
    person1: createPersonResult({
      personId: 1,
      name: person1Data.config.name || 'Person 1',
      healthInsuranceResult: person1Data.individualResult,
      allocatedIncome: person1Data.totalWithdrawal * person1Data.config.withdrawalShare,
      otherIncome: person1Data.config.otherIncomeAnnual,
      totalIncome: person1Data.income,
      coveredByFamilyInsurance: false,
      qualifiesForFamilyInsurance: person1Data.qualifiesForFamily,
    }),
    person2: createPersonResult({
      personId: 2,
      name: person2Data.config.name || 'Person 2',
      healthInsuranceResult: person2Data.individualResult,
      allocatedIncome: person2Data.totalWithdrawal * person2Data.config.withdrawalShare,
      otherIncome: person2Data.config.otherIncomeAnnual,
      totalIncome: person2Data.income,
      coveredByFamilyInsurance: false,
      qualifiesForFamilyInsurance: person2Data.qualifiesForFamily,
    }),
    totalAnnual: individualTotalAnnual,
  }
}

function applyFamilyStrategy(params: ApplyStrategyParams) {
  const { person1Data, person2Data, bestFamilyOption } = params

  if (bestFamilyOption.primaryPerson === 1) {
    return {
      strategyUsed: 'family' as const,
      person1: createPersonResult({
        personId: 1,
        name: person1Data.config.name || 'Person 1',
        healthInsuranceResult: person1Data.individualResult,
        allocatedIncome: person1Data.totalWithdrawal * person1Data.config.withdrawalShare,
        otherIncome: person1Data.config.otherIncomeAnnual,
        totalIncome: person1Data.income,
        coveredByFamilyInsurance: false,
        qualifiesForFamilyInsurance: person1Data.qualifiesForFamily,
      }),
      person2: createPersonResult({
        personId: 2,
        name: person2Data.config.name || 'Person 2',
        healthInsuranceResult: createZeroInsuranceResult(person2Data.individualResult),
        allocatedIncome: person2Data.totalWithdrawal * person2Data.config.withdrawalShare,
        otherIncome: person2Data.config.otherIncomeAnnual,
        totalIncome: person2Data.income,
        coveredByFamilyInsurance: true,
        qualifiesForFamilyInsurance: person2Data.qualifiesForFamily,
      }),
      totalAnnual: bestFamilyOption.totalCost,
    }
  }

  return {
    strategyUsed: 'family' as const,
    person1: createPersonResult({
      personId: 1,
      name: person1Data.config.name || 'Person 1',
      healthInsuranceResult: createZeroInsuranceResult(person1Data.individualResult),
      allocatedIncome: person1Data.totalWithdrawal * person1Data.config.withdrawalShare,
      otherIncome: person1Data.config.otherIncomeAnnual,
      totalIncome: person1Data.income,
      coveredByFamilyInsurance: true,
      qualifiesForFamilyInsurance: person1Data.qualifiesForFamily,
    }),
    person2: createPersonResult({
      personId: 2,
      name: person2Data.config.name || 'Person 2',
      healthInsuranceResult: person2Data.individualResult,
      allocatedIncome: person2Data.totalWithdrawal * person2Data.config.withdrawalShare,
      otherIncome: person2Data.config.otherIncomeAnnual,
      totalIncome: person2Data.income,
      coveredByFamilyInsurance: false,
      qualifiesForFamilyInsurance: person2Data.qualifiesForFamily,
    }),
    totalAnnual: bestFamilyOption.totalCost,
  }
}

/**
 * Calculate individual person income
 */
function calculatePersonIncome(
  totalWithdrawal: number,
  withdrawalShare: number,
  otherIncomeAnnual: number,
): number {
  return totalWithdrawal * withdrawalShare + otherIncomeAnnual
}

/**
 * Calculate person age
 */
function calculatePersonAge(birthYear: number | undefined, year: number): number {
  return birthYear ? year - birthYear : 30
}

/**
 * Create person data for couple health insurance
 */
function createPersonData(
  personConfig: CoupleHealthInsuranceConfig['person1'],
  totalWithdrawal: number,
  income: number,
  qualifiesForFamily: boolean,
  individualResult: HealthCareInsuranceYearResult,
): PersonData {
  return {
    config: personConfig,
    income,
    qualifiesForFamily,
    individualResult,
    totalWithdrawal,
  }
}

/**
 * Determine best strategy and apply it
 */
function applyBestStrategy(params: ApplyStrategyParams) {
  const { strategy, bestFamilyOption, individualTotalAnnual } = params

  if (strategy === 'individual') {
    return applyIndividualStrategy(params)
  }

  if (strategy === 'family' && bestFamilyOption.viable) {
    return applyFamilyStrategy(params)
  }

  // Auto-optimize strategy
  const bestStrategy = bestFamilyOption.viable && bestFamilyOption.totalCost < individualTotalAnnual
    ? 'family'
    : 'individual'

  return bestStrategy === 'family'
    ? applyFamilyStrategy({ ...params, strategy: 'family' })
    : applyIndividualStrategy({ ...params, strategy: 'individual' })
}

/**
 * Calculate optimal health insurance strategy for couples
 */
export function calculateCoupleHealthInsuranceForYear(
  config: HealthCareInsuranceConfig,
  year: number,
  withdrawalAmount: number,
  pensionAmount = 0,
): CoupleHealthInsuranceYearResult {
  if (!config.enabled || config.planningMode !== 'couple' || !config.coupleConfig) {
    throw new Error('Couple health insurance calculation requires couple planning mode and couple config')
  }

  const coupleConfig = config.coupleConfig
  const totalWithdrawal = withdrawalAmount + pensionAmount

  const person1Income = calculatePersonIncome(
    totalWithdrawal,
    coupleConfig.person1.withdrawalShare,
    coupleConfig.person1.otherIncomeAnnual,
  )
  const person2Income = calculatePersonIncome(
    totalWithdrawal,
    coupleConfig.person2.withdrawalShare,
    coupleConfig.person2.otherIncomeAnnual,
  )

  const person1Age = calculatePersonAge(coupleConfig.person1.birthYear, year)
  const person2Age = calculatePersonAge(coupleConfig.person2.birthYear, year)

  const person1QualifiesForFamily = qualifiesForFamilyInsurance(
    person1Income / 12,
    coupleConfig.familyInsuranceThresholds,
  )
  const person2QualifiesForFamily = qualifiesForFamilyInsurance(
    person2Income / 12,
    coupleConfig.familyInsuranceThresholds,
  )

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

  const individualTotalAnnual = person1IndividualResult.totalAnnual + person2IndividualResult.totalAnnual

  const familyScenarios = calculateFamilyScenarios(
    person1QualifiesForFamily,
    person2QualifiesForFamily,
    person1IndividualResult.totalAnnual,
    person2IndividualResult.totalAnnual,
  )

  const bestFamilyOption = getBestFamilyOption(familyScenarios)

  const person1Data = createPersonData(
    coupleConfig.person1,
    totalWithdrawal,
    person1Income,
    person1QualifiesForFamily,
    person1IndividualResult,
  )

  const person2Data = createPersonData(
    coupleConfig.person2,
    totalWithdrawal,
    person2Income,
    person2QualifiesForFamily,
    person2IndividualResult,
  )

  const strategyParams: ApplyStrategyParams = {
    strategy: coupleConfig.strategy,
    person1Data,
    person2Data,
    bestFamilyOption,
    individualTotalAnnual,
  }

  const result = applyBestStrategy(strategyParams)

  return {
    strategyUsed: result.strategyUsed,
    totalAnnual: result.totalAnnual,
    totalMonthly: result.totalAnnual / 12,
    person1: result.person1,
    person2: result.person2,
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
        totalAnnual: result.totalAnnual,
        totalMonthly: result.totalAnnual / 12,
        recommendedStrategy: result.strategyUsed,
        savings: Math.max(0, individualTotalAnnual - result.totalAnnual),
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
export function createDefaultFamilyInsuranceThresholds(year = 2025): FamilyInsuranceThresholds {
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
 * Get fixed amounts display details
 */
function getFixedAmountsDisplayDetails(config: HealthCareInsuranceConfig) {
  return {
    displayText: 'Feste monatliche Beiträge',
    detailText: `Feste Beiträge: ${config.fixedHealthInsuranceMonthly || 0}€ KV, ${config.fixedCareInsuranceMonthly || 0}€ PV monatlich`,
  }
}

/**
 * Get statutory insurance display details
 */
function getStatutoryInsuranceDisplayDetails(config: HealthCareInsuranceConfig) {
  const employerText = config.includeEmployerContribution ? 'mit Arbeitgeberanteil' : 'nur Arbeitnehmeranteil'
  return {
    displayText: 'Prozentuale Beiträge basierend auf Einkommen',
    detailText: `Beitragssätze: ${config.statutoryHealthInsuranceRate}% KV, ${config.statutoryCareInsuranceRate}% PV (${employerText})`,
  }
}

/**
 * Get private insurance display details
 */
function getPrivateInsuranceDisplayDetails(config: HealthCareInsuranceConfig) {
  return {
    displayText: 'Private Krankenversicherung',
    detailText: `Monatliche Beiträge mit ${config.privateInsuranceInflationRate}% jährlicher Anpassung`,
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

  let details
  if (config.useFixedAmounts) {
    details = getFixedAmountsDisplayDetails(config)
  }
  else if (config.insuranceType === 'statutory') {
    details = getStatutoryInsuranceDisplayDetails(config)
  }
  else {
    details = getPrivateInsuranceDisplayDetails(config)
  }

  return {
    insuranceType: config.insuranceType,
    ...details,
    healthInsuranceType,
    careInsuranceType,
  }
}
