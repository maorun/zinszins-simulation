/**
 * Types and utilities for German children's education financial planning
 * (Kinder-Finanzplanung)
 *
 * This module handles:
 * - Education costs (Ausbildungskosten): Kita, Schule, Universität, Berufsausbildung
 * - BAföG (Federal Training Assistance Act): German student financial aid
 * - Tuition fees (Studiengebühren): Private universities and international study
 */

/**
 * Education phases in the German system
 */
export type EducationPhase =
  | 'kita' // Kindergarten/Daycare (0-6 years)
  | 'grundschule' // Primary school (6-10 years)
  | 'weiterfuehrend' // Secondary school (10-19 years)
  | 'ausbildung' // Vocational training (typically 16-19 years)
  | 'studium' // University studies (typically 19-25 years)
  | 'sonstiges' // Other education

/**
 * Education path type
 */
export type EducationPathType =
  | 'regelweg' // Standard path: Kita → Grundschule → Weiterführend → Studium
  | 'ausbildung' // Vocational path: Kita → Grundschule → Weiterführend → Ausbildung
  | 'individuell' // Custom path with individual phase configuration

/**
 * BAföG eligibility status
 */
export type BafoegEligibility = 'eligible' | 'partial' | 'ineligible'

/**
 * Configuration for a single education phase
 */
export interface EducationPhaseConfig {
  /** Education phase type */
  phase: EducationPhase

  /** Monthly costs in EUR */
  monthlyCost: number

  /** Starting year for this phase */
  startYear: number

  /** Ending year for this phase (inclusive) */
  endYear: number

  /** Annual inflation rate for costs (default: 2%) */
  inflationRate: number

  /** Whether costs are tax-deductible */
  taxDeductible: boolean

  /** Maximum annual tax deduction amount in EUR */
  maxAnnualTaxDeduction: number

  /** Optional notes */
  notes?: string
}

/**
 * BAföG configuration for university students
 */
export interface BafoegConfig {
  /** Whether BAföG is enabled for this child */
  enabled: boolean

  /** Monthly BAföG amount in EUR (max 934€ for students living away from parents in 2024) */
  monthlyAmount: number

  /** Starting year for BAföG */
  startYear: number

  /** Ending year for BAföG (typically max. 4-5 years for standard programs) */
  endYear: number

  /** Whether living with parents (affects BAföG amount) */
  livingWithParents: boolean

  /** Parental income in EUR (affects eligibility and amount) */
  parentalIncome: number

  /** Number of siblings in education (affects BAföG calculation) */
  siblingsInEducation: number

  /** Whether student has own income (affects BAföG) */
  hasOwnIncome: boolean

  /** Student's own annual income in EUR */
  ownIncome: number

  /** BAföG eligibility status */
  eligibility: BafoegEligibility

  /** Percentage of BAföG that must be repaid (50% as grant, 50% as loan) */
  repaymentRate: number
}

/**
 * § 33a EStG Ausbildungsfreibetrag configuration
 */
export interface AusbildungsfreibetragConfig {
  /** Whether to apply the Ausbildungsfreibetrag */
  enabled: boolean

  /** Whether the child lives away from parents (required for § 33a Abs. 2) */
  livingAwayFromParents: boolean

  /** Starting year for Ausbildungsfreibetrag eligibility */
  startYear: number

  /** Ending year for Ausbildungsfreibetrag eligibility */
  endYear: number
}

/**
 * Configuration for children's education financial planning
 */
export interface ChildrenEducationConfig {
  /** Child's name for identification */
  childName: string

  /** Birth year of the child */
  birthYear: number

  /** Education path type */
  educationPath: EducationPathType

  /** Individual education phase configurations */
  phases: EducationPhaseConfig[]

  /** BAföG configuration (only applicable for university studies) */
  bafoegConfig?: BafoegConfig

  /** § 33a EStG Ausbildungsfreibetrag configuration */
  ausbildungsfreibetragConfig?: AusbildungsfreibetragConfig

  /** Whether to account for Kindergeld (this is already handled separately) */
  includeKindergeld: boolean

  /** Notes or special considerations */
  notes?: string
}

/**
 * Default education phase costs (monthly, in EUR) based on German averages
 */
export const DEFAULT_EDUCATION_COSTS = {
  kita: 300, // Average daycare costs (varies by city and income)
  grundschule: 50, // School supplies, activities
  weiterfuehrend: 100, // School supplies, activities, trips
  ausbildung: 150, // Materials, travel to work
  studium: 850, // Living costs, books, semester fees (not including BAföG)
  sonstiges: 200,
} as const

/**
 * Standard education phase age ranges in Germany
 */
export const EDUCATION_AGE_RANGES = {
  kita: { start: 1, end: 6 },
  grundschule: { start: 6, end: 10 },
  weiterfuehrend: { start: 10, end: 19 },
  ausbildung: { start: 16, end: 19 },
  studium: { start: 19, end: 25 },
  sonstiges: { start: 6, end: 18 },
} as const

/**
 * BAföG constants based on 2024 German law
 */
export const BAFOEG_CONSTANTS = {
  /** Maximum monthly BAföG for students living away from parents */
  maxMonthlyAmountAwayFromParents: 934,
  /** Maximum monthly BAföG for students living with parents */
  maxMonthlyAmountWithParents: 633,
  /** Parental income threshold for full BAföG eligibility (simplified) */
  parentalIncomeThresholdFull: 30000,
  /** Parental income threshold for partial BAföG eligibility */
  parentalIncomeThresholdPartial: 60000,
  /** Student's own income allowance before reduction */
  studentIncomeAllowance: 6240,
  /** Percentage of BAföG that is a grant (rest is loan) */
  grantPercentage: 50,
  /** Maximum BAföG duration in months for standard Bachelor's degree */
  maxDurationMonthsBachelor: 48,
  /** Maximum BAföG duration in months for standard Master's degree */
  maxDurationMonthsMaster: 24,
} as const

/**
 * § 33a EStG Ausbildungsfreibetrag constants (2024)
 * Tax deduction for children in vocational training or university education
 * living away from parents
 */
export const AUSBILDUNGSFREIBETRAG_CONSTANTS = {
  /** Annual tax deduction amount per child in education living away from home */
  annualDeduction: 1200,
  /** Minimum age for eligibility (typically 18, but can be younger for vocational training) */
  minAge: 18,
  /** Maximum age for eligibility (max 25 years for children in education as per § 32 Abs. 4 EStG) */
  maxAge: 25,
  /** Child must be living away from parents to qualify */
  requiresLivingAway: true,
  /** Applies to vocational training (Ausbildung) and university (Studium) */
  applicablePhases: ['ausbildung', 'studium'] as EducationPhase[],
} as const

/**
 * Create default education phase configuration
 */
export function createDefaultPhaseConfig(
  phase: EducationPhase,
  childBirthYear: number,
  currentYear: number = new Date().getFullYear(),
): EducationPhaseConfig {
  const ageRange = EDUCATION_AGE_RANGES[phase]
  const startYear = Math.max(currentYear, childBirthYear + ageRange.start)
  const endYear = childBirthYear + ageRange.end

  return {
    phase,
    monthlyCost: DEFAULT_EDUCATION_COSTS[phase],
    startYear,
    endYear,
    inflationRate: 2.0, // Default 2% inflation for education costs
    taxDeductible: phase === 'studium' || phase === 'ausbildung', // Only vocational training and university are typically tax-deductible
    maxAnnualTaxDeduction: 6000, // Sonderausgaben für Berufsausbildung nach § 10 Abs. 1 Nr. 7 EStG
    notes: '',
  }
}

/**
 * Create default BAföG configuration
 */
export function createDefaultBafoegConfig(studentBirthYear: number, currentYear: number = new Date().getFullYear()): BafoegConfig {
  const studiumStartYear = Math.max(currentYear, studentBirthYear + EDUCATION_AGE_RANGES.studium.start)
  
  return {
    enabled: false,
    monthlyAmount: BAFOEG_CONSTANTS.maxMonthlyAmountAwayFromParents,
    startYear: studiumStartYear,
    endYear: studiumStartYear + 4, // Standard Bachelor's degree duration
    livingWithParents: false,
    parentalIncome: 40000,
    siblingsInEducation: 0,
    hasOwnIncome: false,
    ownIncome: 0,
    eligibility: 'eligible',
    repaymentRate: 50, // 50% must be repaid
  }
}

/**
 * Calculate BAföG eligibility based on parental income and other factors
 */
export function calculateBafoegEligibility(config: BafoegConfig): BafoegEligibility {
  // Student's own income check
  if (config.hasOwnIncome && config.ownIncome > BAFOEG_CONSTANTS.studentIncomeAllowance) {
    return 'ineligible'
  }

  // Simplified parental income check
  if (config.parentalIncome <= BAFOEG_CONSTANTS.parentalIncomeThresholdFull) {
    return 'eligible'
  } else if (config.parentalIncome <= BAFOEG_CONSTANTS.parentalIncomeThresholdPartial) {
    return 'partial'
  } else {
    return 'ineligible'
  }
}

/**
 * Calculate actual BAföG amount based on eligibility and configuration
 */
export function calculateBafoegAmount(config: BafoegConfig): number {
  const eligibility = calculateBafoegEligibility(config)

  if (eligibility === 'ineligible') {
    return 0
  }

  const baseAmount = config.livingWithParents
    ? BAFOEG_CONSTANTS.maxMonthlyAmountWithParents
    : BAFOEG_CONSTANTS.maxMonthlyAmountAwayFromParents

  // Apply partial reduction if partial eligibility
  if (eligibility === 'partial') {
    const excessIncome = config.parentalIncome - BAFOEG_CONSTANTS.parentalIncomeThresholdFull
    const incomeRange = BAFOEG_CONSTANTS.parentalIncomeThresholdPartial - BAFOEG_CONSTANTS.parentalIncomeThresholdFull
    const reductionFactor = 1 - excessIncome / incomeRange
    return Math.max(0, baseAmount * reductionFactor)
  }

  return Math.min(baseAmount, config.monthlyAmount)
}

/**
 * Create default Ausbildungsfreibetrag configuration
 */
export function createDefaultAusbildungsfreibetragConfig(
  childBirthYear: number,
  currentYear: number = new Date().getFullYear(),
): AusbildungsfreibetragConfig {
  const startAge = AUSBILDUNGSFREIBETRAG_CONSTANTS.minAge
  const startYear = Math.max(currentYear, childBirthYear + startAge)
  const endYear = childBirthYear + AUSBILDUNGSFREIBETRAG_CONSTANTS.maxAge

  return {
    enabled: false,
    livingAwayFromParents: true, // Required for § 33a Abs. 2
    startYear,
    endYear,
  }
}

/**
 * Check if the year is within the configured Ausbildungsfreibetrag range
 */
function isWithinConfiguredRange(
  config: AusbildungsfreibetragConfig,
  year: number,
): boolean {
  return year >= config.startYear && year <= config.endYear
}

/**
 * Check if child is in an applicable education phase for Ausbildungsfreibetrag
 */
function isInApplicableEducationPhase(
  phases: EducationPhaseConfig[],
  year: number,
): boolean {
  const activePhases = phases.filter((phase) => year >= phase.startYear && year <= phase.endYear)
  return activePhases.some((phase) =>
    AUSBILDUNGSFREIBETRAG_CONSTANTS.applicablePhases.includes(phase.phase)
  )
}

/**
 * Check if child's age meets Ausbildungsfreibetrag requirements
 */
function meetsAgeRequirements(
  birthYear: number,
  year: number,
): boolean {
  const childAge = year - birthYear
  return childAge >= AUSBILDUNGSFREIBETRAG_CONSTANTS.minAge && 
         childAge <= AUSBILDUNGSFREIBETRAG_CONSTANTS.maxAge
}

/**
 * Check if a child is eligible for Ausbildungsfreibetrag in a given year
 */
export function isEligibleForAusbildungsfreibetrag(
  config: ChildrenEducationConfig,
  year: number,
): boolean {
  // Check if Ausbildungsfreibetrag is enabled and configured
  if (!config.ausbildungsfreibetragConfig || !config.ausbildungsfreibetragConfig.enabled) {
    return false
  }

  const afConfig = config.ausbildungsfreibetragConfig

  // Check all eligibility criteria
  return (
    afConfig.livingAwayFromParents &&
    isWithinConfiguredRange(afConfig, year) &&
    isInApplicableEducationPhase(config.phases, year) &&
    meetsAgeRequirements(config.birthYear, year)
  )
}

/**
 * Calculate the annual Ausbildungsfreibetrag amount for a given year
 * Returns the tax deduction amount according to § 33a Abs. 2 EStG
 */
export function calculateAusbildungsfreibetrag(
  config: ChildrenEducationConfig,
  year: number,
): number {
  if (!isEligibleForAusbildungsfreibetrag(config, year)) {
    return 0
  }

  return AUSBILDUNGSFREIBETRAG_CONSTANTS.annualDeduction
}

/**
 * Calculate education costs for a specific year
 */
export function calculateEducationCostsForYear(
  config: ChildrenEducationConfig,
  year: number,
): {
  totalMonthlyCost: number
  totalAnnualCost: number
  bafoegSupport: number
  netAnnualCost: number
  activePhases: EducationPhaseConfig[]
  taxDeduction: number
  ausbildungsfreibetrag: number
} {
  // Find active phases for this year
  const activePhases = config.phases.filter((phase) => year >= phase.startYear && year <= phase.endYear)

  // Calculate total costs with inflation
  let totalMonthlyCost = 0
  let taxDeduction = 0

  for (const phase of activePhases) {
    const yearsFromStart = year - phase.startYear
    const inflationFactor = Math.pow(1 + phase.inflationRate / 100, yearsFromStart)
    const adjustedMonthlyCost = phase.monthlyCost * inflationFactor

    totalMonthlyCost += adjustedMonthlyCost

    // Calculate tax deduction
    if (phase.taxDeductible) {
      const annualCost = adjustedMonthlyCost * 12
      taxDeduction += Math.min(annualCost, phase.maxAnnualTaxDeduction)
    }
  }

  const totalAnnualCost = totalMonthlyCost * 12

  // Calculate BAföG support
  let bafoegSupport = 0
  if (config.bafoegConfig && config.bafoegConfig.enabled) {
    const bafoeg = config.bafoegConfig
    if (year >= bafoeg.startYear && year <= bafoeg.endYear) {
      const monthlyBafoeg = calculateBafoegAmount(bafoeg)
      bafoegSupport = monthlyBafoeg * 12
    }
  }

  // Add Ausbildungsfreibetrag to tax deduction (§ 33a Abs. 2 EStG)
  const ausbildungsfreibetrag = calculateAusbildungsfreibetrag(config, year)
  taxDeduction += ausbildungsfreibetrag

  // Net cost is total cost minus BAföG support (BAföG reduces out-of-pocket expenses)
  const netAnnualCost = Math.max(0, totalAnnualCost - bafoegSupport)

  return {
    totalMonthlyCost,
    totalAnnualCost,
    bafoegSupport,
    netAnnualCost,
    activePhases,
    taxDeduction,
    ausbildungsfreibetrag,
  }
}

/**
 * Yearly breakdown type for education costs
 */
type YearlyEducationBreakdown = {
  year: number
  totalCost: number
  bafoegSupport: number
  netCost: number
  taxDeduction: number
  childrenDetails: Array<{
    childName: string
    cost: number
    bafoeg: number
    netCost: number
  }>
}

/**
 * Calculate total education costs over a period for multiple children
 */
export function calculateTotalEducationCosts(
  childrenConfigs: ChildrenEducationConfig[],
  startYear: number,
  endYear: number,
): {
  totalCosts: number
  totalBafoegSupport: number
  totalTaxDeductions: number
  yearlyBreakdown: YearlyEducationBreakdown[]
} {
  return calculateEducationCostsOverPeriod(childrenConfigs, startYear, endYear)
}

/**
 * Internal function to calculate costs over period
 */
function calculateEducationCostsOverPeriod(
  childrenConfigs: ChildrenEducationConfig[],
  startYear: number,
  endYear: number,
): {
  totalCosts: number
  totalBafoegSupport: number
  totalTaxDeductions: number
  yearlyBreakdown: YearlyEducationBreakdown[]
} {
  let totalCosts = 0
  let totalBafoegSupport = 0
  let totalTaxDeductions = 0
  const yearlyBreakdown: YearlyEducationBreakdown[] = []

  for (let year = startYear; year <= endYear; year++) {
    const yearResult = calculateYearTotals(childrenConfigs, year)
    const totals = accumulateTotals(yearResult, yearlyBreakdown)
    totalCosts += totals.costs
    totalBafoegSupport += totals.bafoeg
    totalTaxDeductions += totals.tax
  }

  return { totalCosts, totalBafoegSupport, totalTaxDeductions, yearlyBreakdown }
}

/**
 * Accumulate totals and add to breakdown if needed
 */
function accumulateTotals(
  yearResult: YearlyEducationBreakdown,
  yearlyBreakdown: YearlyEducationBreakdown[],
): {
  costs: number
  bafoeg: number
  tax: number
} {
  if (yearResult.totalCost > 0 || yearResult.bafoegSupport > 0) {
    yearlyBreakdown.push(yearResult)
  }

  return {
    costs: yearResult.totalCost,
    bafoeg: yearResult.bafoegSupport,
    tax: yearResult.taxDeduction,
  }
}

/**
 * Calculate totals for a single year
 */
function calculateYearTotals(
  childrenConfigs: ChildrenEducationConfig[],
  year: number,
): YearlyEducationBreakdown {
  let yearTotalCost = 0
  let yearBafoegSupport = 0
  let yearTaxDeduction = 0
  const childrenDetails: Array<{
    childName: string
    cost: number
    bafoeg: number
    netCost: number
  }> = []

  for (const childConfig of childrenConfigs) {
    const result = calculateEducationCostsForYear(childConfig, year)
    yearTotalCost += result.totalAnnualCost
    yearBafoegSupport += result.bafoegSupport
    yearTaxDeduction += result.taxDeduction

    if (result.totalAnnualCost > 0 || result.bafoegSupport > 0) {
      childrenDetails.push({
        childName: childConfig.childName,
        cost: result.totalAnnualCost,
        bafoeg: result.bafoegSupport,
        netCost: result.netAnnualCost,
      })
    }
  }

  return {
    year,
    totalCost: yearTotalCost,
    bafoegSupport: yearBafoegSupport,
    netCost: yearTotalCost - yearBafoegSupport,
    taxDeduction: yearTaxDeduction,
    childrenDetails,
  }
}

/**
 * Create standard education path (Regelweg)
 */
export function createStandardEducationPath(
  childName: string,
  childBirthYear: number,
  currentYear: number = new Date().getFullYear(),
): ChildrenEducationConfig {
  return {
    childName,
    birthYear: childBirthYear,
    educationPath: 'regelweg',
    phases: [
      createDefaultPhaseConfig('kita', childBirthYear, currentYear),
      createDefaultPhaseConfig('grundschule', childBirthYear, currentYear),
      createDefaultPhaseConfig('weiterfuehrend', childBirthYear, currentYear),
      createDefaultPhaseConfig('studium', childBirthYear, currentYear),
    ],
    bafoegConfig: createDefaultBafoegConfig(childBirthYear, currentYear),
    includeKindergeld: true,
    notes: '',
  }
}

/**
 * Create vocational education path (Ausbildung)
 */
export function createVocationalEducationPath(
  childName: string,
  childBirthYear: number,
  currentYear: number = new Date().getFullYear(),
): ChildrenEducationConfig {
  return {
    childName,
    birthYear: childBirthYear,
    educationPath: 'ausbildung',
    phases: [
      createDefaultPhaseConfig('kita', childBirthYear, currentYear),
      createDefaultPhaseConfig('grundschule', childBirthYear, currentYear),
      createDefaultPhaseConfig('weiterfuehrend', childBirthYear, currentYear),
      createDefaultPhaseConfig('ausbildung', childBirthYear, currentYear),
    ],
    includeKindergeld: true,
    notes: '',
  }
}

/**
 * Get display name for education phase
 */
export function getEducationPhaseDisplayName(phase: EducationPhase): string {
  const names: Record<EducationPhase, string> = {
    kita: 'Kita/Kindergarten',
    grundschule: 'Grundschule',
    weiterfuehrend: 'Weiterführende Schule',
    ausbildung: 'Berufsausbildung',
    studium: 'Studium/Universität',
    sonstiges: 'Sonstige Bildung',
  }
  return names[phase]
}

/**
 * Get description for education phase
 */
export function getEducationPhaseDescription(phase: EducationPhase): string {
  const descriptions: Record<EducationPhase, string> = {
    kita: 'Kindergarten und Vorschule (ca. 1-6 Jahre)',
    grundschule: 'Grundschule (ca. 6-10 Jahre)',
    weiterfuehrend: 'Gymnasium, Realschule oder Gesamtschule (ca. 10-19 Jahre)',
    ausbildung: 'Berufsausbildung/Lehre (ca. 16-19 Jahre)',
    studium: 'Universität oder Fachhochschule (ca. 19-25 Jahre)',
    sonstiges: 'Sonstige Bildungsmaßnahmen',
  }
  return descriptions[phase]
}

/**
 * Validate children education configuration
 */
export function validateChildrenEducationConfig(config: ChildrenEducationConfig): string[] {
  const errors: string[] = []

  validateBasicChildInfo(config, errors)
  validateEducationPhases(config, errors)
  validateBafoegConfiguration(config, errors)

  return errors
}

/**
 * Validate basic child information
 */
function validateBasicChildInfo(config: ChildrenEducationConfig, errors: string[]): void {
  if (!config.childName || config.childName.trim() === '') {
    errors.push('Name des Kindes muss angegeben werden.')
  }

  const currentYear = new Date().getFullYear()
  if (config.birthYear > currentYear) {
    errors.push('Geburtsjahr des Kindes kann nicht in der Zukunft liegen.')
  }

  if (config.birthYear < currentYear - 30) {
    errors.push('Geburtsjahr des Kindes scheint unrealistisch weit in der Vergangenheit zu liegen.')
  }
}

/**
 * Validate education phases
 */
function validateEducationPhases(config: ChildrenEducationConfig, errors: string[]): void {
  if (config.phases.length === 0) {
    errors.push('Mindestens eine Bildungsphase muss konfiguriert werden.')
  }

  for (const phase of config.phases) {
    validateSinglePhase(phase, errors)
  }
}

/**
 * Validate a single education phase
 */
function validateSinglePhase(phase: EducationPhaseConfig, errors: string[]): void {
  const phaseName = getEducationPhaseDisplayName(phase.phase)

  if (phase.monthlyCost < 0) {
    errors.push(`Monatliche Kosten für ${phaseName} können nicht negativ sein.`)
  }

  if (phase.startYear > phase.endYear) {
    errors.push(`Startjahr für ${phaseName} kann nicht nach dem Endjahr liegen.`)
  }

  if (phase.inflationRate < 0 || phase.inflationRate > 20) {
    errors.push(`Inflationsrate für ${phaseName} muss zwischen 0% und 20% liegen.`)
  }
}

/**
 * Validate BAföG configuration
 */
function validateBafoegConfiguration(config: ChildrenEducationConfig, errors: string[]): void {
  if (!config.bafoegConfig?.enabled) {
    return
  }

  const bafoeg = config.bafoegConfig

  validateBafoegAmounts(bafoeg, errors)
  validateBafoegYears(bafoeg, errors)
  validateBafoegIncome(bafoeg, errors)
}

/**
 * Validate BAföG amounts
 */
function validateBafoegAmounts(bafoeg: BafoegConfig, errors: string[]): void {
  if (bafoeg.monthlyAmount < 0) {
    errors.push('BAföG-Betrag kann nicht negativ sein.')
  }

  if (bafoeg.monthlyAmount > BAFOEG_CONSTANTS.maxMonthlyAmountAwayFromParents) {
    errors.push(`BAföG-Betrag kann nicht höher sein als ${BAFOEG_CONSTANTS.maxMonthlyAmountAwayFromParents}€ (gesetzliches Maximum).`)
  }
}

/**
 * Validate BAföG years
 */
function validateBafoegYears(bafoeg: BafoegConfig, errors: string[]): void {
  if (bafoeg.startYear > bafoeg.endYear) {
    errors.push('BAföG-Startjahr kann nicht nach dem Endjahr liegen.')
  }
}

/**
 * Validate BAföG income parameters
 */
function validateBafoegIncome(bafoeg: BafoegConfig, errors: string[]): void {
  if (bafoeg.parentalIncome < 0) {
    errors.push('Elterneinkommen kann nicht negativ sein.')
  }

  if (bafoeg.siblingsInEducation < 0) {
    errors.push('Anzahl der Geschwister in Ausbildung kann nicht negativ sein.')
  }

  if (bafoeg.ownIncome < 0) {
    errors.push('Eigenes Einkommen des Studenten kann nicht negativ sein.')
  }
}
