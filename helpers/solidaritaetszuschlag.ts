/**
 * Solidaritätszuschlag (Solidarity Surcharge) Calculation Helper
 *
 * Implements the German Solidaritätszuschlag calculation according to the
 * Solidaritätszuschlaggesetz (SolZG) with the 2021 reform that introduced
 * Freigrenze (exemption threshold) and Gleitzone (transition zone).
 *
 * @see https://www.gesetze-im-internet.de/solzg_1995/
 */

/**
 * Solidaritätszuschlag constants based on German law (as of 2021)
 */
export const SOLI_CONSTANTS = {
  /** Soli rate: 5.5% of income tax */
  SOLI_RATE: 0.055,

  /** Freigrenze (exemption threshold) for singles - no Soli below this income tax amount */
  FREIGRENZE_INDIVIDUAL: 16956, // €16,956 income tax

  /** Freigrenze for married couples/partners - no Soli below this income tax amount */
  FREIGRENZE_COUPLE: 33912, // €33,912 income tax (2 × €16,956)

  /** Upper limit of Gleitzone (transition zone) for singles */
  GLEITZONE_UPPER_INDIVIDUAL: 31527, // €31,527 income tax

  /** Upper limit of Gleitzone for married couples/partners */
  GLEITZONE_UPPER_COUPLE: 63054, // €63,054 income tax (2 × €31,527)
} as const

/**
 * Planning mode for Soli calculation
 * Determines which Freigrenze and Gleitzone thresholds to use
 */
export type SoliPlanningMode = 'individual' | 'couple'

/**
 * Result of Solidaritätszuschlag calculation
 */
export interface SoliCalculationResult {
  /** Calculated Solidaritätszuschlag amount in euros */
  soli: number

  /** Income tax amount on which Soli is calculated */
  incomeTax: number

  /** Effective Soli rate (soli / incomeTax) */
  effectiveSoliRate: number

  /** Zone in which the calculation falls */
  zone: 'below_freigrenze' | 'gleitzone' | 'full_soli'

  /** Whether the taxpayer is in the exemption zone (no Soli) */
  isExempt: boolean

  /** Freigrenze threshold used for this calculation */
  freigrenze: number

  /** Upper limit of Gleitzone used for this calculation */
  gleitzoneUpper: number

  /** Detailed calculation breakdown for educational purposes */
  calculation: {
    /** Amount of Soli saved due to Freigrenze or Gleitzone */
    soliSaved: number

    /** Soli that would be paid without 2021 reform */
    soliWithoutReform: number

    /** Description of how Soli was calculated */
    explanation: string
  }
}

/**
 * Calculate Soli for income below Freigrenze (exemption zone)
 */
function calculateExemptionZoneSoli(
  incomeTax: number,
  freigrenze: number,
  gleitzoneUpper: number,
): SoliCalculationResult {
  const soliWithoutReform = incomeTax * SOLI_CONSTANTS.SOLI_RATE

  return {
    soli: 0,
    incomeTax,
    effectiveSoliRate: 0,
    zone: 'below_freigrenze',
    isExempt: true,
    freigrenze,
    gleitzoneUpper,
    calculation: {
      soliSaved: soliWithoutReform,
      soliWithoutReform,
      explanation: `Einkommensteuer (${incomeTax.toFixed(2)} €) liegt unter der Freigrenze (${freigrenze.toFixed(2)} €). Kein Solidaritätszuschlag.`,
    },
  }
}

/**
 * Calculate Soli in Gleitzone (transition zone)
 */
function calculateGleitzoneSoli(
  incomeTax: number,
  freigrenze: number,
  gleitzoneUpper: number,
): SoliCalculationResult {
  const excessOverFreigrenze = incomeTax - freigrenze
  const gleitzoneFactor = 0.119 // Approximately 2 × SOLI_RATE

  const soli = excessOverFreigrenze * gleitzoneFactor
  const effectiveSoliRate = soli / incomeTax
  const soliWithoutReform = incomeTax * SOLI_CONSTANTS.SOLI_RATE

  return {
    soli,
    incomeTax,
    effectiveSoliRate,
    zone: 'gleitzone',
    isExempt: false,
    freigrenze,
    gleitzoneUpper,
    calculation: {
      soliSaved: soliWithoutReform - soli,
      soliWithoutReform,
      explanation: `Einkommensteuer (${incomeTax.toFixed(2)} €) liegt in der Gleitzone (${freigrenze.toFixed(2)} € - ${gleitzoneUpper.toFixed(2)} €). Reduzierter Soli: (${excessOverFreigrenze.toFixed(2)} €) × 11,9% = ${soli.toFixed(2)} €. Ersparnis gegenüber vollem Soli: ${(soliWithoutReform - soli).toFixed(2)} €.`,
    },
  }
}

/**
 * Calculate full Soli (above Gleitzone)
 */
function calculateFullSoli(incomeTax: number, freigrenze: number, gleitzoneUpper: number): SoliCalculationResult {
  const soli = incomeTax * SOLI_CONSTANTS.SOLI_RATE
  const effectiveSoliRate = SOLI_CONSTANTS.SOLI_RATE

  return {
    soli,
    incomeTax,
    effectiveSoliRate,
    zone: 'full_soli',
    isExempt: false,
    freigrenze,
    gleitzoneUpper,
    calculation: {
      soliSaved: 0,
      soliWithoutReform: soli,
      explanation: `Einkommensteuer (${incomeTax.toFixed(2)} €) liegt über der Gleitzone (${gleitzoneUpper.toFixed(2)} €). Voller Solidaritätszuschlag: ${incomeTax.toFixed(2)} € × 5,5% = ${soli.toFixed(2)} €.`,
    },
  }
}

/**
 * Calculate Solidaritätszuschlag (Solidarity Surcharge) according to German law
 *
 * Implements the 2021 reform with Freigrenze and Gleitzone:
 * - Below Freigrenze: No Soli
 * - In Gleitzone: Reduced Soli with gradual phase-in
 * - Above Gleitzone: Full 5.5% Soli on entire income tax
 *
 * @param incomeTax - Income tax (Einkommensteuer) in euros
 * @param planningMode - 'individual' or 'couple' to determine thresholds
 * @returns Detailed Soli calculation result
 *
 * @example
 * // Individual with €10,000 income tax (below Freigrenze)
 * const result1 = calculateSolidaritaetszuschlag(10000, 'individual')
 * // result1.soli = 0, result1.isExempt = true
 *
 * @example
 * // Individual with €25,000 income tax (in Gleitzone)
 * const result2 = calculateSolidaritaetszuschlag(25000, 'individual')
 * // result2.soli = reduced amount, result2.zone = 'gleitzone'
 *
 * @example
 * // Individual with €50,000 income tax (above Gleitzone)
 * const result3 = calculateSolidaritaetszuschlag(50000, 'individual')
 * // result3.soli = 2750 (5.5% of 50000), result3.zone = 'full_soli'
 */
export function calculateSolidaritaetszuschlag(
  incomeTax: number,
  planningMode: SoliPlanningMode = 'individual',
): SoliCalculationResult {
  // Determine thresholds based on planning mode
  const freigrenze =
    planningMode === 'couple' ? SOLI_CONSTANTS.FREIGRENZE_COUPLE : SOLI_CONSTANTS.FREIGRENZE_INDIVIDUAL

  const gleitzoneUpper =
    planningMode === 'couple' ? SOLI_CONSTANTS.GLEITZONE_UPPER_COUPLE : SOLI_CONSTANTS.GLEITZONE_UPPER_INDIVIDUAL

  // Case 1: Below Freigrenze - No Soli (exemption)
  if (incomeTax <= freigrenze) {
    return calculateExemptionZoneSoli(incomeTax, freigrenze, gleitzoneUpper)
  }

  // Case 2: In Gleitzone - Reduced Soli with gradual phase-in
  if (incomeTax > freigrenze && incomeTax <= gleitzoneUpper) {
    return calculateGleitzoneSoli(incomeTax, freigrenze, gleitzoneUpper)
  }

  // Case 3: Above Gleitzone - Full 5.5% Soli on entire income tax
  return calculateFullSoli(incomeTax, freigrenze, gleitzoneUpper)
}

/**
 * Calculate cumulative Soli over multiple years
 *
 * Useful for tracking total Soli payments over the lifetime of a simulation
 *
 * @param yearlyIncomeTax - Array of income tax amounts for each year
 * @param planningMode - 'individual' or 'couple'
 * @returns Array of SoliCalculationResult for each year
 *
 * @example
 * const incomeTaxes = [15000, 20000, 25000, 30000]
 * const results = calculateYearlySoli(incomeTaxes, 'individual')
 * // Returns array with Soli calculation for each year
 */
export function calculateYearlySoli(
  yearlyIncomeTax: number[],
  planningMode: SoliPlanningMode = 'individual',
): SoliCalculationResult[] {
  return yearlyIncomeTax.map((incomeTax) => calculateSolidaritaetszuschlag(incomeTax, planningMode))
}

/**
 * Calculate total Soli saved due to 2021 reform over multiple years
 *
 * Compares Soli under current rules vs. pre-2021 rules (flat 5.5%)
 *
 * @param yearlyIncomeTax - Array of income tax amounts for each year
 * @param planningMode - 'individual' or 'couple'
 * @returns Object with total Soli, total saved, and year-by-year breakdown
 *
 * @example
 * const incomeTaxes = [15000, 20000, 25000, 30000]
 * const savings = calculateSoliSavings(incomeTaxes, 'individual')
 * // Returns total Soli saved across all years
 */
export function calculateSoliSavings(
  yearlyIncomeTax: number[],
  planningMode: SoliPlanningMode = 'individual',
): {
  totalSoli: number
  totalSoliWithoutReform: number
  totalSaved: number
  yearlyBreakdown: SoliCalculationResult[]
  averageEffectiveSoliRate: number
} {
  const yearlyBreakdown = calculateYearlySoli(yearlyIncomeTax, planningMode)

  const totalSoli = yearlyBreakdown.reduce((sum, result) => sum + result.soli, 0)
  const totalSoliWithoutReform = yearlyBreakdown.reduce(
    (sum, result) => sum + result.calculation.soliWithoutReform,
    0,
  )
  const totalSaved = totalSoliWithoutReform - totalSoli

  const totalIncomeTax = yearlyIncomeTax.reduce((sum, tax) => sum + tax, 0)
  const averageEffectiveSoliRate = totalIncomeTax > 0 ? totalSoli / totalIncomeTax : 0

  return {
    totalSoli,
    totalSoliWithoutReform,
    totalSaved,
    yearlyBreakdown,
    averageEffectiveSoliRate,
  }
}

/**
 * Get Freigrenze threshold for a specific planning mode
 *
 * @param planningMode - 'individual' or 'couple'
 * @returns Freigrenze in euros
 */
export function getSoliFreigrenze(planningMode: SoliPlanningMode = 'individual'): number {
  return planningMode === 'couple' ? SOLI_CONSTANTS.FREIGRENZE_COUPLE : SOLI_CONSTANTS.FREIGRENZE_INDIVIDUAL
}

/**
 * Get Gleitzone upper limit for a specific planning mode
 *
 * @param planningMode - 'individual' or 'couple'
 * @returns Gleitzone upper limit in euros
 */
export function getSoliGleitzoneUpper(planningMode: SoliPlanningMode = 'individual'): number {
  return planningMode === 'couple'
    ? SOLI_CONSTANTS.GLEITZONE_UPPER_COUPLE
    : SOLI_CONSTANTS.GLEITZONE_UPPER_INDIVIDUAL
}

/**
 * Determine if a taxpayer is affected by Soli reform (2021)
 * Returns true if the taxpayer benefits from Freigrenze or Gleitzone
 *
 * @param incomeTax - Income tax amount
 * @param planningMode - 'individual' or 'couple'
 * @returns true if taxpayer benefits from 2021 reform
 */
export function isAffectedBySoliReform(incomeTax: number, planningMode: SoliPlanningMode = 'individual'): boolean {
  const gleitzoneUpper = getSoliGleitzoneUpper(planningMode)
  return incomeTax <= gleitzoneUpper
}

/**
 * Calculate required income tax to reach Freigrenze
 * Useful for showing users how close they are to Soli exemption
 *
 * @param planningMode - 'individual' or 'couple'
 * @returns Income tax amount at Freigrenze
 */
export function getIncomeTaxForSoliExemption(planningMode: SoliPlanningMode = 'individual'): number {
  return getSoliFreigrenze(planningMode)
}

/**
 * Calculate the percentage of taxpayers affected by Soli
 * According to German Ministry of Finance, approximately 90% of taxpayers
 * are exempt or in reduced zone after 2021 reform
 *
 * @returns Percentage of taxpayers affected (paying full Soli)
 */
export function getPercentageAffectedByFullSoli(): number {
  return 10 // Approximately 10% pay full Soli after 2021 reform
}
