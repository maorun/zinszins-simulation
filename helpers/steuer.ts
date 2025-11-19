import type { BasiszinsConfiguration } from '../src/services/bundesbank-api'

// German tax constants (as of 2024)
export const GERMAN_TAX_CONSTANTS = {
  // Grundfreibetrag (Basic Tax Allowance) - per person
  GRUNDFREIBETRAG_2024: 11604, // €11,604 per person in 2024

  // Calculated values for different planning modes
  get GRUNDFREIBETRAG_INDIVIDUAL() {
    return this.GRUNDFREIBETRAG_2024
  },
  get GRUNDFREIBETRAG_COUPLE() {
    return this.GRUNDFREIBETRAG_2024 * 2
  }, // €23,208 for couples
} as const

/**
 * Get the appropriate Grundfreibetrag amount based on planning mode
 * @param planningMode - 'individual' or 'couple'
 * @returns The Grundfreibetrag amount in euros
 */
export function getGrundfreibetragForPlanningMode(planningMode: 'individual' | 'couple'): number {
  return planningMode === 'couple'
    ? GERMAN_TAX_CONSTANTS.GRUNDFREIBETRAG_COUPLE
    : GERMAN_TAX_CONSTANTS.GRUNDFREIBETRAG_INDIVIDUAL
}

/**
 * Check if a given amount is a standard Grundfreibetrag value
 * Used to determine whether to auto-update user values when planning mode changes
 * @param amount - The amount to check
 * @returns true if the amount matches a standard Grundfreibetrag value
 */
export function isStandardGrundfreibetragValue(amount: number): boolean {
  return (
    amount === GERMAN_TAX_CONSTANTS.GRUNDFREIBETRAG_INDIVIDUAL || amount === GERMAN_TAX_CONSTANTS.GRUNDFREIBETRAG_COUPLE
  )
}

// Historical and projected German Basiszins (base interest rate) values for Vorabpauschale calculation
// These are official rates set by the German Federal Ministry of Finance
// NOTE: This is now a fallback - the main configuration should come from BasiszinsConfiguration
const basiszinsen: {
  [year: number]: number
} = {
  2018: 0.0087, // 0.87%
  2019: 0.0087, // 0.87%
  2020: 0.007, // 0.70%
  2021: 0.007, // 0.70%
  2022: 0.018, // 1.80%
  2023: 0.0255, // 2.55%
  2024: 0.0255, // 2.55% (estimated - to be updated when official)
  2025: 0.0255, // 2.55% (projected - to be updated when official)
}

/**
 * Get the basiszins (base interest rate) for a specific year
 * Falls back to the latest available year if the requested year is not found
 *
 * @param year - The year to get the basiszins for
 * @param basiszinsConfig - Optional configurable basiszins configuration
 * (from Deutsche Bundesbank)
 */
export function getBasiszinsForYear(year: number, basiszinsConfig?: BasiszinsConfiguration): number {
  // First, try to use the configurable basiszins if provided
  if (basiszinsConfig && basiszinsConfig[year]) {
    return basiszinsConfig[year].rate
  }

  // Fallback to hardcoded historical data
  if (basiszinsen[year] !== undefined) {
    return basiszinsen[year]
  }

  // If using configurable basiszins, find the most recent rate
  if (basiszinsConfig) {
    const availableYears = Object.keys(basiszinsConfig)
      .map(Number)
      .sort((a, b) => b - a)
    if (availableYears.length > 0) {
      const latestYear = availableYears[0]
      return basiszinsConfig[latestYear].rate
    }
  }

  // Final fallback to the latest available year from hardcoded data
  const availableYears = Object.keys(basiszinsen)
    .map(Number)
    .sort((a, b) => b - a)
  const latestYear = availableYears[0]

  return basiszinsen[latestYear] || 0.0255 // Ultimate fallback to 2023 rate
}

/**
 * Calculates the Vorabpauschale amount for a given period.
 * The Vorabpauschale is the basis for taxation on unrealized gains in German investment funds.
 * It is capped by the actual gains of the fund.
 *
 * @param startwert - The value of the investment at the beginning of the period.
 * @param endwert - The value of the investment at the end of the period.
 * @param basiszins - The base interest rate for the year.
 * @param anteilImJahr - The fraction of the year the investment was held (e.g., 12 for a full year).
 * @returns The calculated Vorabpauschale amount (pre-tax).
 */
export function calculateVorabpauschale(
  startwert: number,
  endwert: number,
  basiszins: number,
  anteilImJahr = 12,
): number {
  const jahresgewinn = endwert - startwert
  const vorabpauschale_prozentsatz = 0.7

  // The Basisertrag is 70% of the gain the investment would have made at the base interest rate.
  let basisertrag = startwert * basiszins * vorabpauschale_prozentsatz
  basisertrag = (anteilImJahr / 12) * basisertrag

  // The Vorabpauschale is the lesser of the Basisertrag and the actual gain. It cannot be negative.
  const vorabpauschale = Math.max(0, Math.min(basisertrag, jahresgewinn))

  return vorabpauschale
}

/**
 * Calculates detailed Vorabpauschale breakdown for transparency.
 * Provides step-by-step calculation details for user understanding.
 *
 * @param startwert - The value of the investment at the beginning of the period.
 * @param endwert - The value of the investment at the end of the period.
 * @param basiszins - The base interest rate for the year.
 * @param anteilImJahr - The fraction of the year the investment was held (e.g., 12 for a full year).
 * @param steuerlast - The capital gains tax rate (e.g., 0.26375).
 * @param teilFreistellungsquote - The partial exemption quote for the fund type (e.g., 0.3 for equity funds).
 * @returns Detailed breakdown of the Vorabpauschale calculation.
 */
export function calculateVorabpauschaleDetailed(
  startwert: number,
  endwert: number,
  basiszins: number,
  anteilImJahr = 12,
  steuerlast: number,
  teilFreistellungsquote: number,
): {
  basiszins: number
  basisertrag: number
  vorabpauschaleAmount: number
  steuerVorFreibetrag: number
  jahresgewinn: number
  anteilImJahr: number
} {
  const jahresgewinn = endwert - startwert
  const vorabpauschale_prozentsatz = 0.7

  // Step 1: Calculate Basisertrag - 70% of theoretical gain at base interest rate
  let basisertrag = startwert * basiszins * vorabpauschale_prozentsatz
  basisertrag = (anteilImJahr / 12) * basisertrag

  // Step 2: Vorabpauschale is minimum of Basisertrag and actual gain, cannot be negative
  const vorabpauschaleAmount = Math.max(0, Math.min(basisertrag, jahresgewinn))

  // Step 3: Calculate tax on Vorabpauschale before allowance deduction
  const steuerVorFreibetrag = calculateSteuerOnVorabpauschale(vorabpauschaleAmount, steuerlast, teilFreistellungsquote)

  return {
    basiszins,
    basisertrag,
    vorabpauschaleAmount,
    steuerVorFreibetrag,
    jahresgewinn,
    anteilImJahr,
  }
}

/**
 * Calculates the tax due on a given Vorabpauschale amount.
 *
 * @param vorabpauschale - The Vorabpauschale amount.
 * @param steuerlast - The capital gains tax rate (e.g., 0.26375).
 * @param teilFreistellungsquote - The partial exemption quote for the fund type (e.g., 0.3 for equity funds).
 * @returns The calculated tax amount.
 */
export function calculateSteuerOnVorabpauschale(
  vorabpauschale: number,
  steuerlast: number,
  teilFreistellungsquote: number,
): number {
  if (vorabpauschale <= 0) {
    return 0
  }
  return vorabpauschale * steuerlast * (1 - teilFreistellungsquote)
}

/**
 * Calculate personal income tax including Kirchensteuer if active
 * Can use either a flat tax rate or progressive tax brackets
 */
function calculatePersonalIncomeTax(
  vorabpauschale: number,
  personalTaxRate: number | undefined,
  teilfreistellungsquote: number,
  availableGrundfreibetrag: number,
  kirchensteuerAktiv: boolean,
  kirchensteuersatz: number,
  useProgressiveTax: boolean,
): { personalTaxAmount: number; usedGrundfreibetrag: number; effectiveRate?: number } {
  if (useProgressiveTax) {
    // Use progressive tax calculation
    const progressiveResult = calculateProgressiveTaxOnVorabpauschale(
      vorabpauschale,
      teilfreistellungsquote,
      availableGrundfreibetrag,
      0, // alreadyUsedGrundfreibetrag is 0 because availableGrundfreibetrag already accounts for it
      kirchensteuerAktiv,
      kirchensteuersatz,
    )

    return {
      personalTaxAmount: progressiveResult.totalTax,
      usedGrundfreibetrag: progressiveResult.usedGrundfreibetrag,
      effectiveRate: progressiveResult.effectiveRate,
    }
  } else {
    // Use simple flat rate calculation (backward compatible)
    // personalTaxRate must be defined when not using progressive tax
    if (personalTaxRate === undefined) {
      throw new Error('personalTaxRate is required when useProgressiveTax is false')
    }
    const taxableIncome = Math.max(0, vorabpauschale * (1 - teilfreistellungsquote) - availableGrundfreibetrag)
    const basePersonalTax = taxableIncome * personalTaxRate
    const kirchensteuer = kirchensteuerAktiv ? basePersonalTax * (kirchensteuersatz / 100) : 0
    const personalTaxAmount = basePersonalTax + kirchensteuer
    const usedGrundfreibetrag = Math.min(availableGrundfreibetrag, vorabpauschale * (1 - teilfreistellungsquote))

    return { personalTaxAmount, usedGrundfreibetrag }
  }
}

/**
 * Build tax system text description
 */
function buildTaxSystemText(
  useProgressiveTax: boolean,
  personalTaxRate: number | undefined,
  kirchensteuerAktiv: boolean,
  kirchensteuersatz: number,
): string {
  if (useProgressiveTax) {
    return 'Progressiver Tarif'
  }
  
  const kirchensteuerText = kirchensteuerAktiv ? ` (inkl. ${kirchensteuersatz}% Kirchensteuer)` : ''
  
  if (personalTaxRate !== undefined) {
    return `Persönlicher Steuersatz (${(personalTaxRate * 100).toFixed(2)}%${kirchensteuerText})`
  }
  
  return 'Persönlicher Steuersatz'
}

/**
 * Add effective rate info to explanation if applicable
 */
function addEffectiveRateInfo(
  explanation: string,
  useProgressiveTax: boolean,
  effectiveRate: number | undefined,
): string {
  if (useProgressiveTax && effectiveRate !== undefined) {
    return `${explanation} - Effektiver Steuersatz: ${(effectiveRate * 100).toFixed(2)}%`
  }
  return explanation
}

/**
 * Determine which tax option is more favorable and create explanation
 */
function determineFavorableTaxOption(
  personalTaxAmount: number,
  abgeltungssteuerAmount: number,
  vorabpauschale: number,
  teilfreistellungsquote: number,
  abgeltungssteuer: number,
  personalTaxRate: number | undefined,
  kirchensteuerAktiv: boolean,
  kirchensteuersatz: number,
  useProgressiveTax: boolean,
  effectiveRate?: number,
): {
  isFavorable: 'abgeltungssteuer' | 'personal' | 'equal'
  usedTaxRate: number
  explanation: string
} {
  const taxSystemText = buildTaxSystemText(
    useProgressiveTax,
    personalTaxRate,
    kirchensteuerAktiv,
    kirchensteuersatz,
  )

  if (personalTaxAmount < abgeltungssteuerAmount) {
    // Avoid division by zero
    const usedTaxRate = personalTaxAmount / Math.max(vorabpauschale * (1 - teilfreistellungsquote), 0.01)
    const baseExplanation = `${taxSystemText} ist günstiger als Abgeltungssteuer (${(abgeltungssteuer * 100).toFixed(2)}%)`
    const explanation = addEffectiveRateInfo(baseExplanation, useProgressiveTax, effectiveRate)
    
    return { isFavorable: 'personal', usedTaxRate, explanation }
  }

  if (personalTaxAmount > abgeltungssteuerAmount) {
    const baseExplanation = `Abgeltungssteuer (${(abgeltungssteuer * 100).toFixed(2)}%) ist günstiger als ${taxSystemText}`
    const explanation = addEffectiveRateInfo(baseExplanation, useProgressiveTax, effectiveRate)
    
    return { isFavorable: 'abgeltungssteuer', usedTaxRate: abgeltungssteuer, explanation }
  }

  const explanation = `Abgeltungssteuer und ${taxSystemText} führen zum gleichen Ergebnis (${(abgeltungssteuer * 100).toFixed(2)}%)`
  return { isFavorable: 'equal', usedTaxRate: abgeltungssteuer, explanation }
}

/**
 * Create empty result when Vorabpauschale is zero or negative
 */
function createEmptyGuenstigerPruefungResult(
  abgeltungssteuer: number,
  grundfreibetrag: number,
  alreadyUsedGrundfreibetrag: number,
): GuenstigerPruefungResult {
  return {
    abgeltungssteuerAmount: 0,
    personalTaxAmount: 0,
    usedTaxRate: abgeltungssteuer,
    isFavorable: 'equal',
    availableGrundfreibetrag: Math.max(0, grundfreibetrag - alreadyUsedGrundfreibetrag),
    usedGrundfreibetrag: 0,
    explanation: 'Keine Vorabpauschale - keine Steuer fällig',
  }
}

/**
 * Validate inputs for Günstigerprüfung
 * Throws error if validation fails
 */
function validateGuenstigerPruefungInputs(
  vorabpauschale: number,
  useProgressiveTax: boolean,
  personalTaxRate: number | undefined,
): void {
  if (vorabpauschale > 0 && !useProgressiveTax && personalTaxRate === undefined) {
    throw new Error('personalTaxRate is required when useProgressiveTax is false')
  }
}

/**
 * Result type for Günstigerprüfung (tax optimization check)
 */
export interface GuenstigerPruefungResult {
  abgeltungssteuerAmount: number
  personalTaxAmount: number
  usedTaxRate: number
  isFavorable: 'abgeltungssteuer' | 'personal' | 'equal'
  availableGrundfreibetrag: number
  usedGrundfreibetrag: number
  explanation: string
}

/**
 * German progressive income tax brackets for 2024
 * Based on the German income tax formula (Einkommensteuergesetz - EStG)
 */
export interface TaxBracket {
  /** Lower bound of taxable income (inclusive) */
  from: number
  /** Upper bound of taxable income (exclusive, undefined for the last bracket) */
  to?: number
  /** Base tax amount for incomes at the lower bound */
  baseTax: number
  /** Marginal tax rate for this bracket (as decimal, e.g., 0.14 for 14%) */
  marginalRate: number
  /** Coefficient for quadratic formula (only for zones 2 and 3) */
  y?: number
  /** Linear coefficient for quadratic formula (only for zones 2 and 3) */
  linearCoefficient?: number
}

/**
 * Default German tax brackets for 2024
 * Zone 1: 0 - 11,604€ (Grundfreibetrag) - 0% tax
 * Zone 2: 11,605€ - 17,005€ - Progressive from 14% to ~24%
 * Zone 3: 17,006€ - 66,760€ - Progressive from ~24% to 42%
 * Zone 4: 66,761€ - 277,825€ - 42% flat (Spitzensteuersatz)
 * Zone 5: 277,826€+ - 45% (Reichensteuer)
 */
export const GERMAN_TAX_BRACKETS_2024: TaxBracket[] = [
  {
    from: 0,
    to: 11604,
    baseTax: 0,
    marginalRate: 0,
  },
  {
    from: 11605,
    to: 17005,
    baseTax: 0,
    marginalRate: 0.14,
    y: 922.98,
    linearCoefficient: 1400,
  },
  {
    from: 17006,
    to: 66760,
    baseTax: 0,
    marginalRate: 0.2397,
    y: 181.19,
    linearCoefficient: 2397,
  },
  {
    from: 66761,
    to: 277825,
    baseTax: 0,
    marginalRate: 0.42,
  },
  {
    from: 277826,
    to: undefined,
    baseTax: 0,
    marginalRate: 0.45,
  },
]

/**
 * Result of progressive tax calculation
 */
export interface ProgressiveTaxResult {
  /** Total tax amount calculated */
  totalTax: number
  /** Effective tax rate (totalTax / taxableIncome) */
  effectiveRate: number
  /** Marginal tax rate at the highest income level */
  marginalRate: number
  /** Amount of Grundfreibetrag used */
  usedGrundfreibetrag: number
  /** Breakdown by tax bracket */
  bracketBreakdown: Array<{
    bracket: TaxBracket
    taxableAmount: number
    taxAmount: number
  }>
}

/**
 * Calculate tax using German Zone 2 formula (11,605€ - 17,005€)
 * Tax = (y * z + 1400) * z where z = (taxable income - 11,604) / 10,000
 */
function calculateZone2Tax(taxableIncome: number, y: number, linearCoefficient: number): number {
  const grundfreibetrag = GERMAN_TAX_BRACKETS_2024[0].to ?? 11604
  const z = (taxableIncome - grundfreibetrag) / 10000
  return (y * z + linearCoefficient) * z
}

/**
 * Calculate tax using German Zone 3 formula (17,006€ - 66,760€)
 * Tax = (y * z + 2397) * z + base where z = (taxable income - 17,005) / 10,000
 */
function calculateZone3Tax(taxableIncome: number, y: number, linearCoefficient: number): number {
  const zone2Upper = GERMAN_TAX_BRACKETS_2024[1].to ?? 17005
  const zone2Y = GERMAN_TAX_BRACKETS_2024[1].y ?? 922.98
  const zone2Linear = GERMAN_TAX_BRACKETS_2024[1].linearCoefficient ?? 1400
  const z = (taxableIncome - zone2Upper) / 10000
  const zoneBase = calculateZone2Tax(zone2Upper, zone2Y, zone2Linear)
  return (y * z + linearCoefficient) * z + zoneBase
}

/**
 * Calculate tax for income in Zone 1 (Grundfreibetrag - no tax)
 */
function calculateTaxZone1(
  incomeAfterOffset: number,
  taxBrackets: TaxBracket[],
): { totalTax: number; marginalRate: number; bracketBreakdown: ProgressiveTaxResult['bracketBreakdown'] } {
  return {
    totalTax: 0,
    marginalRate: 0,
    bracketBreakdown: [{
      bracket: taxBrackets[0],
      taxableAmount: incomeAfterOffset,
      taxAmount: 0,
    }],
  }
}

/**
 * Calculate tax for income in Zone 2 (Progressive 14% to ~24%)
 */
function calculateTaxZone2Result(
  incomeAfterOffset: number,
  taxBrackets: TaxBracket[],
): { totalTax: number; marginalRate: number; bracketBreakdown: ProgressiveTaxResult['bracketBreakdown'] } {
  const totalTax = calculateZone2Tax(incomeAfterOffset, 922.98, 1400)
  return {
    totalTax,
    marginalRate: 0.14,
    bracketBreakdown: [{
      bracket: taxBrackets[1],
      taxableAmount: incomeAfterOffset - 11604,
      taxAmount: totalTax,
    }],
  }
}

/**
 * Calculate tax for income in Zone 3 (Progressive ~24% to 42%)
 */
function calculateTaxZone3Result(
  incomeAfterOffset: number,
  taxBrackets: TaxBracket[],
): { totalTax: number; marginalRate: number; bracketBreakdown: ProgressiveTaxResult['bracketBreakdown'] } {
  const totalTax = calculateZone3Tax(incomeAfterOffset, 181.19, 2397)
  return {
    totalTax,
    marginalRate: 0.2397,
    bracketBreakdown: [{
      bracket: taxBrackets[2],
      taxableAmount: incomeAfterOffset - 17005,
      taxAmount: totalTax,
    }],
  }
}

/**
 * Calculate tax for income in Zone 4 (Flat 42%)
 */
function calculateTaxZone4Result(
  incomeAfterOffset: number,
  taxBrackets: TaxBracket[],
): { totalTax: number; marginalRate: number; bracketBreakdown: ProgressiveTaxResult['bracketBreakdown'] } {
  const baseTax = calculateZone3Tax(66760, 181.19, 2397)
  const incomeAbove66760 = incomeAfterOffset - 66760
  const totalTax = baseTax + incomeAbove66760 * 0.42
  
  return {
    totalTax,
    marginalRate: 0.42,
    bracketBreakdown: [{
      bracket: taxBrackets[3],
      taxableAmount: incomeAbove66760,
      taxAmount: totalTax,
    }],
  }
}

/**
 * Calculate tax for income in Zone 5 (Flat 45% - Reichensteuer)
 */
function calculateTaxZone5Result(
  incomeAfterOffset: number,
  taxBrackets: TaxBracket[],
): { totalTax: number; marginalRate: number; bracketBreakdown: ProgressiveTaxResult['bracketBreakdown'] } {
  const baseTaxZone3 = calculateZone3Tax(66760, 181.19, 2397)
  const zone4Income = 277825 - 66760
  const baseTaxZone4 = baseTaxZone3 + zone4Income * 0.42
  const incomeAbove277825 = incomeAfterOffset - 277825
  const totalTax = baseTaxZone4 + incomeAbove277825 * 0.45
  
  return {
    totalTax,
    marginalRate: 0.45,
    bracketBreakdown: [{
      bracket: taxBrackets[4],
      taxableAmount: incomeAbove277825,
      taxAmount: totalTax,
    }],
  }
}

/**
 * Determine which tax zone applies and calculate tax accordingly
 */
function calculateTaxByZone(
  incomeAfterOffset: number,
  taxBrackets: TaxBracket[],
): { totalTax: number; marginalRate: number; bracketBreakdown: ProgressiveTaxResult['bracketBreakdown'] } {
  if (incomeAfterOffset <= 11604) {
    return calculateTaxZone1(incomeAfterOffset, taxBrackets)
  }
  
  if (incomeAfterOffset <= 17005) {
    return calculateTaxZone2Result(incomeAfterOffset, taxBrackets)
  }
  
  if (incomeAfterOffset <= 66760) {
    return calculateTaxZone3Result(incomeAfterOffset, taxBrackets)
  }
  
  if (incomeAfterOffset <= 277825) {
    return calculateTaxZone4Result(incomeAfterOffset, taxBrackets)
  }
  
  return calculateTaxZone5Result(incomeAfterOffset, taxBrackets)
}

/**
 * Calculate German progressive income tax based on official tax brackets.
 * Uses the official German tax formula (Einkommensteuergesetz - EStG §32a)
 * for zones 2 and 3 which have progressive rates.
 *
 * Formula for zone 2 (11,605€ - 17,005€):
 * Tax = (y * z + 1400) * z
 * where z = (taxable income - 11,604) / 10,000
 *
 * Formula for zone 3 (17,006€ - 66,760€):
 * Tax = (y * z + 2397) * z + base
 * where z = (taxable income - 17,005) / 10,000
 *
 * NOTE: The `grundfreibetrag` parameter is used when capital gains are being taxed
 * with progressive tax instead of Abgeltungssteuer. In this case, the Grundfreibetrag
 * can be used to offset capital gains. For regular income tax, the Grundfreibetrag
 * is already built into the tax brackets (Zone 1: 0-11,604€ = 0% tax).
 *
 * @param taxableIncome - The taxable income (zu versteuerndes Einkommen)
 * @param grundfreibetrag - Additional tax-free allowance (for capital gains offset)
 * @param alreadyUsedGrundfreibetrag - Amount of Grundfreibetrag already used
 * @param taxBrackets - Custom tax brackets (defaults to German 2024 brackets)
 * @returns Detailed progressive tax calculation result
 *
 * @example
 * // Calculate tax for 30,000€ taxable income
 * const result = calculateProgressiveTax(30000)
 * // result.totalTax will be approximately 4,446€
 * // result.effectiveRate will be approximately 14.8%
 */
export function calculateProgressiveTax(
  taxableIncome: number,
  grundfreibetrag = 0,
  alreadyUsedGrundfreibetrag = 0,
  taxBrackets: TaxBracket[] = GERMAN_TAX_BRACKETS_2024,
): ProgressiveTaxResult {
  // Calculate available Grundfreibetrag (for capital gains offset)
  const availableGrundfreibetrag = Math.max(0, grundfreibetrag - alreadyUsedGrundfreibetrag)
  const usedGrundfreibetrag = Math.min(availableGrundfreibetrag, taxableIncome)

  // Apply additional Grundfreibetrag offset (for capital gains)
  const incomeAfterOffset = Math.max(0, taxableIncome - usedGrundfreibetrag)

  if (incomeAfterOffset === 0) {
    return {
      totalTax: 0,
      effectiveRate: 0,
      marginalRate: 0,
      usedGrundfreibetrag,
      bracketBreakdown: [],
    }
  }

  // Determine which tax zone applies and calculate accordingly
  const taxResult = calculateTaxByZone(incomeAfterOffset, taxBrackets)
  const effectiveRate = incomeAfterOffset > 0 ? taxResult.totalTax / incomeAfterOffset : 0

  return {
    totalTax: taxResult.totalTax,
    effectiveRate,
    marginalRate: taxResult.marginalRate,
    usedGrundfreibetrag,
    bracketBreakdown: taxResult.bracketBreakdown,
  }
}

/**
 * Calculate progressive income tax on Vorabpauschale (investment income)
 * This applies the progressive tax calculation to capital gains after
 * applying the Teilfreistellung (partial exemption).
 *
 * @param vorabpauschale - The Vorabpauschale amount subject to taxation
 * @param teilfreistellungsquote - The partial exemption quote (e.g., 0.3 for equity funds)
 * @param grundfreibetrag - Additional tax-free allowance (for capital gains offset), default 0
 * @param alreadyUsedGrundfreibetrag - Amount of Grundfreibetrag already used
 * @param kirchensteuerAktiv - Whether church tax (Kirchensteuer) is active
 * @param kirchensteuersatz - Church tax rate (8% or 9%)
 * @param taxBrackets - Custom tax brackets (defaults to German 2024 brackets)
 * @returns Progressive tax result with Kirchensteuer if applicable
 */
export function calculateProgressiveTaxOnVorabpauschale(
  vorabpauschale: number,
  teilfreistellungsquote: number,
  grundfreibetrag = 0,
  alreadyUsedGrundfreibetrag = 0,
  kirchensteuerAktiv = false,
  kirchensteuersatz = 9,
  taxBrackets: TaxBracket[] = GERMAN_TAX_BRACKETS_2024,
): ProgressiveTaxResult & { kirchensteuer: number } {
  // Calculate taxable income after Teilfreistellung
  const taxableCapitalGain = vorabpauschale * (1 - teilfreistellungsquote)

  // Calculate progressive tax
  const result = calculateProgressiveTax(taxableCapitalGain, grundfreibetrag, alreadyUsedGrundfreibetrag, taxBrackets)

  // Add Kirchensteuer if active
  const kirchensteuer = kirchensteuerAktiv ? result.totalTax * (kirchensteuersatz / 100) : 0
  const totalTaxWithKirchensteuer = result.totalTax + kirchensteuer

  return {
    ...result,
    totalTax: totalTaxWithKirchensteuer,
    kirchensteuer,
  }
}

/**
 * Performs Günstigerprüfung (tax optimization check) to determine whether
 * Abgeltungssteuer (capital gains tax) or personal income tax is more favorable.
 *
 * @param vorabpauschale - The Vorabpauschale amount subject to taxation
 * @param abgeltungssteuer - The standard capital gains tax rate (e.g., 0.26375 = 26.375%)
 * @param personalTaxRate - The personal income tax rate (e.g., 0.25 = 25%) - required only if useProgressiveTax is false
 * @param teilfreistellungsquote - The partial exemption quote for the fund type (e.g., 0.3 for equity funds)
 * @param grundfreibetrag - The annual tax-free allowance for personal income tax
 * @param alreadyUsedGrundfreibetrag - Amount of Grundfreibetrag already used in the year
 * @param kirchensteuerAktiv - Whether church tax is active
 * @param kirchensteuersatz - Church tax rate (8% or 9%)
 * @param useProgressiveTax - If true, uses progressive tax brackets instead of flat personalTaxRate
 * @returns Object with calculated tax amounts and recommendation
 */
export function performGuenstigerPruefung(
  vorabpauschale: number,
  abgeltungssteuer: number,
  personalTaxRate: number | undefined,
  teilfreistellungsquote: number,
  grundfreibetrag = 0,
  alreadyUsedGrundfreibetrag = 0,
  kirchensteuerAktiv = false,
  kirchensteuersatz = 9,
  useProgressiveTax = false,
): GuenstigerPruefungResult {
  if (vorabpauschale <= 0) {
    return createEmptyGuenstigerPruefungResult(abgeltungssteuer, grundfreibetrag, alreadyUsedGrundfreibetrag)
  }
  validateGuenstigerPruefungInputs(vorabpauschale, useProgressiveTax, personalTaxRate)
  const abgeltungssteuerAmount = calculateSteuerOnVorabpauschale(vorabpauschale, abgeltungssteuer, teilfreistellungsquote)
  const { personalTaxAmount, usedGrundfreibetrag, effectiveRate } = calculatePersonalIncomeTax(
    vorabpauschale,
    personalTaxRate,
    teilfreistellungsquote,
    Math.max(0, grundfreibetrag - alreadyUsedGrundfreibetrag),
    kirchensteuerAktiv,
    kirchensteuersatz,
    useProgressiveTax,
  )
  const { isFavorable, usedTaxRate, explanation } = determineFavorableTaxOption(
    personalTaxAmount,
    abgeltungssteuerAmount,
    vorabpauschale,
    teilfreistellungsquote,
    abgeltungssteuer,
    personalTaxRate,
    kirchensteuerAktiv,
    kirchensteuersatz,
    useProgressiveTax,
    effectiveRate,
  )
  return {
    abgeltungssteuerAmount,
    personalTaxAmount,
    usedTaxRate,
    isFavorable,
    availableGrundfreibetrag: Math.max(0, grundfreibetrag - alreadyUsedGrundfreibetrag),
    usedGrundfreibetrag,
    explanation,
  }
}
