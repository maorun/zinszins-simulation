/**
 * Types and utilities for German statutory pension (Gesetzliche Rente) integration
 */

/**
 * Configuration for German statutory pension
 * Based on typical data available from tax returns (Steuerbescheid)
 */
export interface StatutoryPensionConfig {
  /** Whether statutory pension is enabled in the calculation */
  enabled: boolean

  /** Starting year for pension payments */
  startYear: number

  /** Monthly pension amount in EUR (before taxes) */
  monthlyAmount: number

  /** Annual increase rate for pension adjustments (default: 1% based on historical data) */
  annualIncreaseRate: number

  /** Percentage of pension subject to income tax (Steuerpflichtiger Anteil) */
  taxablePercentage: number

  /** Tax return specific data */
  taxReturnData?: {
    /** Year of the tax return */
    taxYear: number
    /** Annual pension received according to tax return */
    annualPensionReceived: number
    /** Taxable portion according to tax return */
    taxablePortion: number
  }

  /** Optional: Expected retirement age for automatic start year calculation */
  retirementAge?: number
  /** Optional: Birth year for calculating start year from retirement age */
  birthYear?: number
}

/**
 * Individual statutory pension configuration for one person
 * Extends the base config with person identification
 */
export interface IndividualStatutoryPensionConfig extends StatutoryPensionConfig {
  /** Person identifier (1 or 2) */
  personId: 1 | 2
  /** Person name for display (e.g., "Person 1", "Person 2") */
  personName?: string
}

/**
 * Couple's statutory pension configuration supporting individual pensions
 * for each partner with different amounts and start dates
 */
export interface CoupleStatutoryPensionConfig {
  /** Whether statutory pension is enabled for the couple */
  enabled: boolean

  /** Planning mode - determines configuration structure */
  planningMode: 'individual' | 'couple'

  /** Configuration for single person (individual mode) */
  individual?: StatutoryPensionConfig

  /** Configuration for couple (couple mode) - individual configs per person */
  couple?: {
    person1: IndividualStatutoryPensionConfig
    person2: IndividualStatutoryPensionConfig
  }
}

/**
 * Result of statutory pension calculation for a specific year
 */
export interface StatutoryPensionYearResult {
  /** Total annual pension received (before taxes) */
  grossAnnualAmount: number
  /** Monthly pension amount (before taxes) */
  grossMonthlyAmount: number
  /** Taxable portion of annual pension */
  taxableAmount: number
  /** Income tax on pension (if any) */
  incomeTax: number
  /** Net annual pension after taxes */
  netAnnualAmount: number
  /** Adjustment factor applied this year */
  adjustmentFactor: number
}

/**
 * Complete statutory pension calculation result across years
 */
export interface StatutoryPensionResult {
  [year: number]: StatutoryPensionYearResult
}

/**
 * Individual pension result for one person
 */
export interface IndividualStatutoryPensionYearResult extends StatutoryPensionYearResult {
  /** Person identifier */
  personId: 1 | 2
  /** Person name for display */
  personName?: string
}

/**
 * Combined statutory pension result for couples
 * Contains individual results plus combined totals
 */
export interface CoupleStatutoryPensionYearResult {
  /** Individual results for each person */
  person1?: IndividualStatutoryPensionYearResult
  person2?: IndividualStatutoryPensionYearResult

  /** Combined totals for the couple */
  combined: {
    /** Total gross annual amount from both pensions */
    grossAnnualAmount: number
    /** Total gross monthly amount from both pensions */
    grossMonthlyAmount: number
    /** Total taxable amount from both pensions */
    taxableAmount: number
    /** Total income tax on both pensions */
    incomeTax: number
    /** Total net annual amount from both pensions */
    netAnnualAmount: number
  }
}

/**
 * Complete couple statutory pension calculation result across years
 */
export interface CoupleStatutoryPensionResult {
  [year: number]: CoupleStatutoryPensionYearResult
}

/**
 * Calculate statutory pension for a given year
 */
export function calculateStatutoryPensionForYear(
  config: StatutoryPensionConfig,
  year: number,
  incomeTaxRate = 0.0, // Income tax rate for pension taxation
  grundfreibetragAmount = 0, // Basic tax allowance
): StatutoryPensionYearResult {
  if (!config.enabled || year < config.startYear) {
    return {
      grossAnnualAmount: 0,
      grossMonthlyAmount: 0,
      taxableAmount: 0,
      incomeTax: 0,
      netAnnualAmount: 0,
      adjustmentFactor: 1,
    }
  }

  // Calculate adjustment factor for pension increases
  const yearsFromStart = year - config.startYear
  const adjustmentFactor = Math.pow(1 + config.annualIncreaseRate / 100, yearsFromStart)

  // Calculate gross amounts
  const grossMonthlyAmount = config.monthlyAmount * adjustmentFactor
  const grossAnnualAmount = grossMonthlyAmount * 12

  // Calculate taxable amount
  const taxableAmount = grossAnnualAmount * (config.taxablePercentage / 100)

  // Calculate income tax (only on amount above Grundfreibetrag)
  const taxableAmountAboveAllowance = Math.max(0, taxableAmount - grundfreibetragAmount)
  const incomeTax = taxableAmountAboveAllowance * (incomeTaxRate / 100)

  // Calculate net amount
  const netAnnualAmount = grossAnnualAmount - incomeTax

  return {
    grossAnnualAmount,
    grossMonthlyAmount,
    taxableAmount,
    incomeTax,
    netAnnualAmount,
    adjustmentFactor,
  }
}

/**
 * Calculate statutory pension across multiple years
 */
export function calculateStatutoryPension(
  config: StatutoryPensionConfig,
  startYear: number,
  endYear: number,
  incomeTaxRate = 0.0,
  grundfreibetragPerYear?: { [year: number]: number },
): StatutoryPensionResult {
  const result: StatutoryPensionResult = {}

  for (let year = startYear; year <= endYear; year++) {
    const grundfreibetrag = grundfreibetragPerYear?.[year] || 0
    result[year] = calculateStatutoryPensionForYear(config, year, incomeTaxRate, grundfreibetrag)
  }

  return result
}

/**
 * Create default statutory pension configuration
 */
export function createDefaultStatutoryPensionConfig(): StatutoryPensionConfig {
  return {
    enabled: true,
    startYear: 2041, // Default retirement year
    monthlyAmount: 1500, // Default monthly pension amount in EUR
    annualIncreaseRate: 1.0, // 1% annual increase
    taxablePercentage: 80, // 80% taxable (typical for current retirees)
    retirementAge: 67, // Standard retirement age in Germany
  }
}

/**
 * Calculate start year from birth year and retirement age
 */
export function calculatePensionStartYear(birthYear: number, retirementAge = 67): number {
  return birthYear + retirementAge
}

/**
 * Calculate retirement start year for couples - uses the earlier retirement year
 * This ensures that retirement costs are covered when the first partner retires
 */
export function calculateCoupleRetirementStartYear(
  person1BirthYear: number,
  person2BirthYear: number,
  person1RetirementAge = 67,
  person2RetirementAge = 67,
): number {
  const person1RetirementYear = calculatePensionStartYear(person1BirthYear, person1RetirementAge)
  const person2RetirementYear = calculatePensionStartYear(person2BirthYear, person2RetirementAge)

  // Return the earlier retirement year (when first partner retires)
  return Math.min(person1RetirementYear, person2RetirementYear)
}

/**
 * Calculate retirement start year based on planning mode and available data
 */
export function calculateRetirementStartYear(
  planningMode: 'individual' | 'couple',
  birthYear?: number,
  spouseBirthYear?: number,
  retirementAge = 67,
  spouseRetirementAge = 67,
): number | null {
  if (planningMode === 'individual') {
    return birthYear ? calculatePensionStartYear(birthYear, retirementAge) : null
  } else {
    return birthYear && spouseBirthYear
      ? calculateCoupleRetirementStartYear(birthYear, spouseBirthYear, retirementAge, spouseRetirementAge)
      : null
  }
}

/**
 * Estimate monthly pension from tax return data
 */
export function estimateMonthlyPensionFromTaxReturn(
  taxReturnData: NonNullable<StatutoryPensionConfig['taxReturnData']>,
): number {
  return taxReturnData.annualPensionReceived / 12
}

/**
 * Estimate taxable percentage from tax return data
 */
export function estimateTaxablePercentageFromTaxReturn(
  taxReturnData: NonNullable<StatutoryPensionConfig['taxReturnData']>,
): number {
  if (taxReturnData.annualPensionReceived === 0) {
    return 80 // Default fallback
  }
  return (taxReturnData.taxablePortion / taxReturnData.annualPensionReceived) * 100
}

/**
 * Create default couple statutory pension configuration
 */
export function createDefaultCoupleStatutoryPensionConfig(): CoupleStatutoryPensionConfig {
  return {
    enabled: false,
    planningMode: 'couple',
    couple: {
      person1: {
        ...createDefaultStatutoryPensionConfig(),
        personId: 1,
        personName: 'Person 1',
      },
      person2: {
        ...createDefaultStatutoryPensionConfig(),
        personId: 2,
        personName: 'Person 2',
      },
    },
  }
}

/**
 * Create empty pension results for all years
 */
function createEmptyPensionResults(startYear: number, endYear: number): CoupleStatutoryPensionResult {
  const result: CoupleStatutoryPensionResult = {}

  for (let year = startYear; year <= endYear; year++) {
    result[year] = {
      combined: {
        grossAnnualAmount: 0,
        grossMonthlyAmount: 0,
        taxableAmount: 0,
        incomeTax: 0,
        netAnnualAmount: 0,
      },
    }
  }

  return result
}

/**
 * Calculate individual pension results
 */
function calculateIndividualPensionResults(
  individualConfig: StatutoryPensionConfig,
  startYear: number,
  endYear: number,
  incomeTaxRate: number,
  grundfreibetragPerYear?: { [year: number]: number },
): CoupleStatutoryPensionResult {
  const result: CoupleStatutoryPensionResult = {}
  const individualResult = calculateStatutoryPension(
    individualConfig,
    startYear,
    endYear,
    incomeTaxRate,
    grundfreibetragPerYear,
  )

  for (let year = startYear; year <= endYear; year++) {
    const yearResult = individualResult[year]
    result[year] = {
      combined: {
        grossAnnualAmount: yearResult.grossAnnualAmount,
        grossMonthlyAmount: yearResult.grossMonthlyAmount,
        taxableAmount: yearResult.taxableAmount,
        incomeTax: yearResult.incomeTax,
        netAnnualAmount: yearResult.netAnnualAmount,
      },
    }
  }

  return result
}

/**
 * Create person result if they have pension income
 */
function createPersonResult(
  personYear: StatutoryPensionYearResult,
  personId: 1 | 2,
  personName: string,
): IndividualStatutoryPensionYearResult | undefined {
  if (personYear.grossAnnualAmount <= 0) {
    return undefined
  }

  return {
    ...personYear,
    personId,
    personName,
  }
}

/**
 * Calculate couple pension results
 */
function calculateCouplePensionResults(
  coupleConfig: { person1: StatutoryPensionConfig; person2: StatutoryPensionConfig },
  startYear: number,
  endYear: number,
  incomeTaxRate: number,
  grundfreibetragPerYear?: { [year: number]: number },
): CoupleStatutoryPensionResult {
  const result: CoupleStatutoryPensionResult = {}

  const person1Result = calculateStatutoryPension(
    coupleConfig.person1,
    startYear,
    endYear,
    incomeTaxRate,
    grundfreibetragPerYear,
  )

  const person2Result = calculateStatutoryPension(
    coupleConfig.person2,
    startYear,
    endYear,
    incomeTaxRate,
    grundfreibetragPerYear,
  )

  for (let year = startYear; year <= endYear; year++) {
    const person1Year = person1Result[year]
    const person2Year = person2Result[year]

    result[year] = {
      person1: createPersonResult(person1Year, 1, 'Person 1'),
      person2: createPersonResult(person2Year, 2, 'Person 2'),
      combined: {
        grossAnnualAmount: person1Year.grossAnnualAmount + person2Year.grossAnnualAmount,
        grossMonthlyAmount: person1Year.grossMonthlyAmount + person2Year.grossMonthlyAmount,
        taxableAmount: person1Year.taxableAmount + person2Year.taxableAmount,
        incomeTax: person1Year.incomeTax + person2Year.incomeTax,
        netAnnualAmount: person1Year.netAnnualAmount + person2Year.netAnnualAmount,
      },
    }
  }

  return result
}

/**
 * Calculate statutory pension for couples with individual configurations
 */
export function calculateCoupleStatutoryPension(
  config: CoupleStatutoryPensionConfig,
  startYear: number,
  endYear: number,
  incomeTaxRate = 0.0,
  grundfreibetragPerYear?: { [year: number]: number },
): CoupleStatutoryPensionResult {
  if (!config.enabled) {
    return createEmptyPensionResults(startYear, endYear)
  }

  if (config.planningMode === 'individual' && config.individual) {
    return calculateIndividualPensionResults(
      config.individual,
      startYear,
      endYear,
      incomeTaxRate,
      grundfreibetragPerYear,
    )
  }

  if (config.planningMode === 'couple' && config.couple) {
    return calculateCouplePensionResults(config.couple, startYear, endYear, incomeTaxRate, grundfreibetragPerYear)
  }

  return {}
}

/**
 * Convert legacy StatutoryPensionConfig to CoupleStatutoryPensionConfig
 * for backward compatibility
 */
export function convertLegacyToCoupleConfig(
  legacyConfig: StatutoryPensionConfig | null,
  planningMode: 'individual' | 'couple',
): CoupleStatutoryPensionConfig {
  if (!legacyConfig) {
    const defaultConfig = createDefaultCoupleStatutoryPensionConfig()
    defaultConfig.planningMode = planningMode
    return defaultConfig
  }

  if (planningMode === 'individual') {
    return {
      enabled: legacyConfig.enabled,
      planningMode: 'individual',
      individual: legacyConfig,
    }
  } else {
    // For couple mode, apply the legacy config to both persons as a starting point
    return {
      enabled: legacyConfig.enabled,
      planningMode: 'couple',
      couple: {
        person1: {
          ...legacyConfig,
          personId: 1,
          personName: 'Person 1',
        },
        person2: {
          ...legacyConfig,
          personId: 2,
          personName: 'Person 2',
        },
      },
    }
  }
}
