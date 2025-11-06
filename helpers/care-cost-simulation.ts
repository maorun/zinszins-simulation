/**
 * Types and utilities for German care cost simulation (Pflegekosten-Simulation)
 *
 * German care system operates with 5 care levels (Pflegegrade):
 * - Pflegegrad 1: Geringe Beeinträchtigung der Selbständigkeit (slight impairment)
 * - Pflegegrad 2: Erhebliche Beeinträchtigung der Selbständigkeit (considerable impairment)
 * - Pflegegrad 3: Schwere Beeinträchtigung der Selbständigkeit (severe impairment)
 * - Pflegegrad 4: Schwerste Beeinträchtigung der Selbständigkeit (most severe impairment)
 * - Pflegegrad 5: Schwerste Beeinträchtigung mit besonderen Anforderungen (most severe with special requirements)
 */

/**
 * German care levels (Pflegegrade) with their characteristics and typical monthly costs
 */
export type CareLevel = 1 | 2 | 3 | 4 | 5

/**
 * Care level information with benefits and typical costs
 */
export interface CareLevelInfo {
  /** Care level (1-5) */
  level: CareLevel
  /** German name */
  name: string
  /** Description of impairment level */
  description: string
  /** Monthly care allowance from statutory insurance (Pflegegeld) in EUR */
  careAllowance: number
  /** Maximum care service benefit from statutory insurance (Pflegesachleistung) in EUR */
  careServiceBenefit: number
  /** Typical monthly out-of-pocket costs in EUR (can be customized) */
  typicalMonthlyCost: number
  /** Whether professional care is typically needed */
  requiresProfessionalCare: boolean
}

/**
 * Default care level information based on 2024 German care insurance benefits
 */
export const DEFAULT_CARE_LEVELS: Record<CareLevel, CareLevelInfo> = {
  1: {
    level: 1,
    name: 'Pflegegrad 1',
    description: 'Geringe Beeinträchtigung der Selbständigkeit',
    careAllowance: 0, // No cash benefit for level 1
    careServiceBenefit: 0, // Only 125€ relief amount not included here
    typicalMonthlyCost: 200,
    requiresProfessionalCare: false,
  },
  2: {
    level: 2,
    name: 'Pflegegrad 2',
    description: 'Erhebliche Beeinträchtigung der Selbständigkeit',
    careAllowance: 332,
    careServiceBenefit: 760,
    typicalMonthlyCost: 800,
    requiresProfessionalCare: false,
  },
  3: {
    level: 3,
    name: 'Pflegegrad 3',
    description: 'Schwere Beeinträchtigung der Selbständigkeit',
    careAllowance: 573,
    careServiceBenefit: 1432,
    typicalMonthlyCost: 1500,
    requiresProfessionalCare: true,
  },
  4: {
    level: 4,
    name: 'Pflegegrad 4',
    description: 'Schwerste Beeinträchtigung der Selbständigkeit',
    careAllowance: 765,
    careServiceBenefit: 1778,
    typicalMonthlyCost: 2500,
    requiresProfessionalCare: true,
  },
  5: {
    level: 5,
    name: 'Pflegegrad 5',
    description: 'Schwerste Beeinträchtigung mit besonderen Anforderungen',
    careAllowance: 947,
    careServiceBenefit: 2200,
    typicalMonthlyCost: 3500,
    requiresProfessionalCare: true,
  },
}

/**
 * Care cost configuration for simulation
 */
export interface CareCostConfiguration {
  /** Whether care cost simulation is enabled */
  enabled: boolean

  /** Year when care needs are expected to begin */
  startYear: number

  /** Expected care level (1-5) */
  careLevel: CareLevel

  /** Custom monthly care costs (overrides typical costs if provided) */
  customMonthlyCosts?: number

  /** Annual inflation rate for care costs (default: 3%) */
  careInflationRate: number

  /** Whether to include statutory care insurance benefits */
  includeStatutoryBenefits: boolean

  /** Private care insurance monthly benefit (additional to statutory) */
  privateCareInsuranceMonthlyBenefit: number

  /** Duration of care in years (0 = until end of life) */
  careDurationYears: number

  /** Planning mode for couples */
  planningMode: 'individual' | 'couple'

  /** For couples: configuration for second person */
  coupleConfig?: {
    /** Whether second person also needs care */
    person2NeedsCare: boolean
    /** Start year for second person */
    person2StartYear?: number
    /** Care level for second person */
    person2CareLevel?: CareLevel
    /** Custom monthly costs for second person */
    person2CustomMonthlyCosts?: number
    /** Duration for second person */
    person2CareDurationYears?: number
  }

  /** Whether care costs are tax deductible */
  taxDeductible: boolean

  /** Maximum annual tax deduction for care costs */
  maxAnnualTaxDeduction: number
}

/**
 * Result of care cost calculation for a specific year
 */
export interface CareCostYearResult {
  /** Year of calculation */
  year: number

  /** Whether care is needed this year */
  careNeeded: boolean

  /** Total monthly care costs before benefits */
  monthlyCostsGross: number

  /** Monthly statutory care benefits received */
  monthlyStatutoryBenefits: number

  /** Monthly private care insurance benefits */
  monthlyPrivateBenefits: number

  /** Total monthly care costs after benefits (net out-of-pocket) */
  monthlyCostsNet: number

  /** Annual care costs after benefits */
  annualCostsNet: number

  /** Tax deduction amount for the year */
  taxDeductionAmount: number

  /** Care level for this year */
  careLevel: CareLevel

  /** Inflation adjustment factor applied */
  inflationAdjustmentFactor: number

  /** For couples: results for both persons */
  coupleResults?: {
    person1: CareCostPersonResult
    person2: CareCostPersonResult
    combined: {
      monthlyCostsNet: number
      annualCostsNet: number
      taxDeductionAmount: number
    }
  }
}

/**
 * Individual person result for couple care cost calculation
 */
export interface CareCostPersonResult {
  /** Person identifier */
  personId: 1 | 2
  /** Whether this person needs care */
  needsCare: boolean
  /** Monthly net care costs */
  monthlyCostsNet: number
  /** Annual net care costs */
  annualCostsNet: number
  /** Care level */
  careLevel?: CareLevel
}

/**
 * Default care cost configuration
 */
export function createDefaultCareCostConfiguration(): CareCostConfiguration {
  return {
    enabled: false,
    startYear: new Date().getFullYear() + 15, // Assume care starts in 15 years
    careLevel: 2, // Moderate care needs
    careInflationRate: 3, // Higher than general inflation
    includeStatutoryBenefits: true,
    privateCareInsuranceMonthlyBenefit: 0,
    careDurationYears: 0, // Until end of life
    planningMode: 'individual',
    taxDeductible: true,
    maxAnnualTaxDeduction: 20000, // Current German limit for extraordinary burdens
  }
}

/**
 * Create empty care cost result for a year
 */
function createEmptyCareCostResult(year: number, careLevel: CareLevel): CareCostYearResult {
  return {
    year,
    careNeeded: false,
    monthlyCostsGross: 0,
    monthlyStatutoryBenefits: 0,
    monthlyPrivateBenefits: 0,
    monthlyCostsNet: 0,
    annualCostsNet: 0,
    taxDeductionAmount: 0,
    careLevel,
    inflationAdjustmentFactor: 1,
  }
}

/**
 * Check if care has ended based on duration
 */
function hasCareEnded(config: CareCostConfiguration, year: number): boolean {
  if (config.careDurationYears <= 0) {
    return false
  }
  const careEndYear = config.startYear + config.careDurationYears
  return year >= careEndYear
}

/**
 * Calculate inflation adjustment factor
 */
function calculateInflationFactor(config: CareCostConfiguration, year: number): number {
  const yearsFromStart = Math.max(0, year - config.startYear)
  return Math.pow(1 + config.careInflationRate / 100, yearsFromStart)
}

/**
 * Calculate monthly gross costs with inflation
 */
function calculateMonthlyGrossCosts(config: CareCostConfiguration, inflationFactor: number): number {
  const careLevelInfo = DEFAULT_CARE_LEVELS[config.careLevel]
  const baseMonthlyCost = config.customMonthlyCosts ?? careLevelInfo.typicalMonthlyCost
  return baseMonthlyCost * inflationFactor
}

/**
 * Calculate statutory benefits
 */
function calculateStatutoryBenefits(config: CareCostConfiguration): number {
  if (!config.includeStatutoryBenefits) {
    return 0
  }
  const careLevelInfo = DEFAULT_CARE_LEVELS[config.careLevel]
  return careLevelInfo.careAllowance
}

/**
 * Calculate tax deduction
 */
function calculateTaxDeduction(config: CareCostConfiguration, annualCostsNet: number): number {
  if (!config.taxDeductible || annualCostsNet <= 0) {
    return 0
  }
  return Math.min(annualCostsNet, config.maxAnnualTaxDeduction)
}

/**
 * Calculate care costs for a specific year
 */
export function calculateCareCostsForYear(
  config: CareCostConfiguration,
  year: number,
  _birthYear?: number,
  _spouseBirthYear?: number,
): CareCostYearResult {
  // Check if care is needed this year
  const careNeeded = config.enabled && year >= config.startYear

  if (!careNeeded || hasCareEnded(config, year)) {
    return createEmptyCareCostResult(year, config.careLevel)
  }

  // Calculate inflation adjustment
  const inflationAdjustmentFactor = calculateInflationFactor(config, year)

  // Calculate gross monthly costs
  const monthlyCostsGross = calculateMonthlyGrossCosts(config, inflationAdjustmentFactor)

  // Calculate benefits
  const monthlyStatutoryBenefits = calculateStatutoryBenefits(config)
  const monthlyPrivateBenefits = config.privateCareInsuranceMonthlyBenefit * inflationAdjustmentFactor

  // Calculate net costs
  const monthlyCostsNet = Math.max(0, monthlyCostsGross - monthlyStatutoryBenefits - monthlyPrivateBenefits)
  const annualCostsNet = monthlyCostsNet * 12

  // Calculate tax deduction
  const taxDeductionAmount = calculateTaxDeduction(config, annualCostsNet)

  const result: CareCostYearResult = {
    year,
    careNeeded: true,
    monthlyCostsGross,
    monthlyStatutoryBenefits,
    monthlyPrivateBenefits,
    monthlyCostsNet,
    annualCostsNet,
    taxDeductionAmount,
    careLevel: config.careLevel,
    inflationAdjustmentFactor,
  }

  // Handle couple configuration
  if (config.planningMode === 'couple' && config.coupleConfig) {
    const person1Result = calculatePersonCareCosts(config, year, 1, inflationAdjustmentFactor)
    const person2Result = calculatePersonCareCosts(config, year, 2, inflationAdjustmentFactor)

    result.coupleResults = {
      person1: person1Result,
      person2: person2Result,
      combined: {
        monthlyCostsNet: person1Result.monthlyCostsNet + person2Result.monthlyCostsNet,
        annualCostsNet: person1Result.annualCostsNet + person2Result.annualCostsNet,
        taxDeductionAmount: Math.min(
          person1Result.annualCostsNet + person2Result.annualCostsNet,
          config.maxAnnualTaxDeduction,
        ),
      },
    }

    // Update main result with combined values
    result.monthlyCostsNet = result.coupleResults.combined.monthlyCostsNet
    result.annualCostsNet = result.coupleResults.combined.annualCostsNet
    result.taxDeductionAmount = result.coupleResults.combined.taxDeductionAmount
  }

  return result
}

/**
 * Calculate net monthly care costs after benefits
 */
function calculateNetMonthlyCosts(
  config: CareCostConfiguration,
  baseMonthlyCost: number,
  careLevel: CareLevel,
  inflationAdjustmentFactor: number,
): number {
  const monthlyCostsGross = baseMonthlyCost * inflationAdjustmentFactor

  let monthlyStatutoryBenefits = 0
  if (config.includeStatutoryBenefits) {
    const careLevelInfo = DEFAULT_CARE_LEVELS[careLevel]
    monthlyStatutoryBenefits = careLevelInfo.careAllowance
  }

  const monthlyPrivateBenefits = config.privateCareInsuranceMonthlyBenefit * inflationAdjustmentFactor
  return Math.max(0, monthlyCostsGross - monthlyStatutoryBenefits - monthlyPrivateBenefits)
}

/**
 * Calculate care costs for person 1 (main configuration)
 */
function calculatePerson1CareCosts(
  config: CareCostConfiguration,
  year: number,
  inflationAdjustmentFactor: number,
): CareCostPersonResult {
  const careNeeded = year >= config.startYear
  const hasDuration = config.careDurationYears > 0
  const careEnded = hasDuration && year >= config.startYear + config.careDurationYears

  if (!careNeeded || careEnded) {
    return {
      personId: 1,
      needsCare: false,
      monthlyCostsNet: 0,
      annualCostsNet: 0,
    }
  }

  const careLevelInfo = DEFAULT_CARE_LEVELS[config.careLevel]
  const baseMonthlyCost = config.customMonthlyCosts ?? careLevelInfo.typicalMonthlyCost
  const monthlyCostsNet = calculateNetMonthlyCosts(config, baseMonthlyCost, config.careLevel, inflationAdjustmentFactor)

  return {
    personId: 1,
    needsCare: true,
    monthlyCostsNet,
    annualCostsNet: monthlyCostsNet * 12,
    careLevel: config.careLevel,
  }
}

/**
 * Create empty care cost result for person
 */
function createEmptyPersonCareResult(personId: 1 | 2): CareCostPersonResult {
  return {
    personId,
    needsCare: false,
    monthlyCostsNet: 0,
    annualCostsNet: 0,
  }
}

/**
 * Check if person 2 needs care in the given year
 */
function isPerson2CareNeeded(coupleConfig: NonNullable<CareCostConfiguration['coupleConfig']>, year: number): boolean {
  if (!coupleConfig.person2NeedsCare || !coupleConfig.person2StartYear) {
    return false
  }

  const careNeeded = year >= coupleConfig.person2StartYear
  const careEndYear = coupleConfig.person2StartYear + (coupleConfig.person2CareDurationYears || 0)
  const hasDuration = coupleConfig.person2CareDurationYears && coupleConfig.person2CareDurationYears > 0
  const careEnded = hasDuration && year >= careEndYear

  return careNeeded && !careEnded
}

/**
 * Calculate care costs for person 2 (couple configuration)
 */
function calculatePerson2CareCosts(
  config: CareCostConfiguration,
  year: number,
  inflationAdjustmentFactor: number,
): CareCostPersonResult {
  const coupleConfig = config.coupleConfig

  if (!coupleConfig || !isPerson2CareNeeded(coupleConfig, year)) {
    return createEmptyPersonCareResult(2)
  }

  const careLevel = coupleConfig.person2CareLevel ?? config.careLevel
  const careLevelInfo = DEFAULT_CARE_LEVELS[careLevel]
  const baseMonthlyCost = coupleConfig.person2CustomMonthlyCosts ?? careLevelInfo.typicalMonthlyCost
  const monthlyCostsNet = calculateNetMonthlyCosts(config, baseMonthlyCost, careLevel, inflationAdjustmentFactor)

  return {
    personId: 2,
    needsCare: true,
    monthlyCostsNet,
    annualCostsNet: monthlyCostsNet * 12,
    careLevel,
  }
}

/**
 * Calculate care costs for an individual person in a couple
 */
function calculatePersonCareCosts(
  config: CareCostConfiguration,
  year: number,
  personId: 1 | 2,
  inflationAdjustmentFactor: number,
): CareCostPersonResult {
  if (personId === 1) {
    return calculatePerson1CareCosts(config, year, inflationAdjustmentFactor)
  } else {
    return calculatePerson2CareCosts(config, year, inflationAdjustmentFactor)
  }
}

/**
 * Calculate total care costs over a period
 */
export function calculateTotalCareCosts(
  config: CareCostConfiguration,
  startYear: number,
  endYear: number,
  birthYear?: number,
  spouseBirthYear?: number,
): {
  totalCosts: number
  totalTaxDeductions: number
  yearlyResults: CareCostYearResult[]
} {
  const yearlyResults: CareCostYearResult[] = []
  let totalCosts = 0
  let totalTaxDeductions = 0

  for (let year = startYear; year <= endYear; year++) {
    const yearResult = calculateCareCostsForYear(config, year, birthYear, spouseBirthYear)
    yearlyResults.push(yearResult)
    totalCosts += yearResult.annualCostsNet
    totalTaxDeductions += yearResult.taxDeductionAmount
  }

  return {
    totalCosts,
    totalTaxDeductions,
    yearlyResults,
  }
}

/**
 * Get display name for care level
 */
export function getCareLevelDisplayName(level: CareLevel): string {
  return DEFAULT_CARE_LEVELS[level].name
}

/**
 * Get description for care level
 */
export function getCareLevelDescription(level: CareLevel): string {
  return DEFAULT_CARE_LEVELS[level].description
}

/**
 * Validate basic care cost configuration fields
 */
/**
 * Validate year-related fields
 */
function validateCareCostYearFields(config: CareCostConfiguration): string[] {
  const errors: string[] = []
  if (config.startYear < new Date().getFullYear()) {
    errors.push('Startjahr für Pflegebedürftigkeit kann nicht in der Vergangenheit liegen.')
  }
  return errors
}

/**
 * Validate numeric range fields
 */
function validateCareCostNumericFields(config: CareCostConfiguration): string[] {
  const errors: string[] = []

  if (config.careInflationRate < 0 || config.careInflationRate > 20) {
    errors.push('Inflationsrate für Pflegekosten muss zwischen 0% und 20% liegen.')
  }

  if (config.privateCareInsuranceMonthlyBenefit < 0) {
    errors.push('Private Pflegeversicherungsleistung kann nicht negativ sein.')
  }

  if (config.careDurationYears < 0) {
    errors.push('Pflegedauer kann nicht negativ sein.')
  }

  if (config.customMonthlyCosts && config.customMonthlyCosts < 0) {
    errors.push('Monatliche Pflegekosten können nicht negativ sein.')
  }

  if (config.maxAnnualTaxDeduction < 0) {
    errors.push('Maximaler Steuerabzug kann nicht negativ sein.')
  }

  return errors
}

function validateBasicCareCostFields(config: CareCostConfiguration): string[] {
  return [...validateCareCostYearFields(config), ...validateCareCostNumericFields(config)]
}

/**
 * Validate person 2 start year
 */
function validatePerson2StartYear(person2StartYear: number | undefined): string[] {
  const errors: string[] = []
  if (!person2StartYear) {
    errors.push('Startjahr für Person 2 muss angegeben werden.')
  } else if (person2StartYear < new Date().getFullYear()) {
    errors.push('Startjahr für Person 2 kann nicht in der Vergangenheit liegen.')
  }
  return errors
}

/**
 * Validate person 2 care duration
 */
function validatePerson2CareDuration(person2CareDurationYears: number | undefined): string[] {
  if (person2CareDurationYears && person2CareDurationYears < 0) {
    return ['Pflegedauer für Person 2 kann nicht negativ sein.']
  }
  return []
}

/**
 * Validate person 2 monthly costs
 */
function validatePerson2MonthlyCosts(person2CustomMonthlyCosts: number | undefined): string[] {
  if (person2CustomMonthlyCosts && person2CustomMonthlyCosts < 0) {
    return ['Monatliche Pflegekosten für Person 2 können nicht negativ sein.']
  }
  return []
}

/**
 * Validate couple-specific care cost configuration
 */
function validateCoupleCareConfiguration(config: CareCostConfiguration): string[] {
  if (!(config.planningMode === 'couple' && config.coupleConfig?.person2NeedsCare)) {
    return []
  }

  return [
    ...validatePerson2StartYear(config.coupleConfig.person2StartYear),
    ...validatePerson2CareDuration(config.coupleConfig.person2CareDurationYears),
    ...validatePerson2MonthlyCosts(config.coupleConfig.person2CustomMonthlyCosts),
  ]
}

/**
 * Validate care cost configuration
 */
export function validateCareCostConfiguration(config: CareCostConfiguration): string[] {
  if (!config.enabled) {
    return []
  }

  return [...validateBasicCareCostFields(config), ...validateCoupleCareConfiguration(config)]
}
