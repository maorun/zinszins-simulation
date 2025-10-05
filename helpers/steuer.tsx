import type { BasiszinsConfiguration } from '../src/services/bundesbank-api'

// German tax constants (as of 2024)
export const GERMAN_TAX_CONSTANTS = {
  // Grundfreibetrag (Basic Tax Allowance) - per person
  GRUNDFREIBETRAG_2024: 11604, // €11,604 per person in 2024

  // Calculated values for different planning modes
  get GRUNDFREIBETRAG_INDIVIDUAL() { return this.GRUNDFREIBETRAG_2024 },
  get GRUNDFREIBETRAG_COUPLE() { return this.GRUNDFREIBETRAG_2024 * 2 }, // €23,208 for couples
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
  return amount === GERMAN_TAX_CONSTANTS.GRUNDFREIBETRAG_INDIVIDUAL
    || amount === GERMAN_TAX_CONSTANTS.GRUNDFREIBETRAG_COUPLE
}

// Historical and projected German Basiszins (base interest rate) values for Vorabpauschale calculation
// These are official rates set by the German Federal Ministry of Finance
// NOTE: This is now a fallback - the main configuration should come from BasiszinsConfiguration
const basiszinsen: {
  [year: number]: number
} = {
  2018: 0.0087, // 0.87%
  2019: 0.0087, // 0.87%
  2020: 0.0070, // 0.70%
  2021: 0.0070, // 0.70%
  2022: 0.0180, // 1.80%
  2023: 0.0255, // 2.55%
  2024: 0.0255, // 2.55% (estimated - to be updated when official)
  2025: 0.0255, // 2.55% (projected - to be updated when official)
}

/**
 * Get the basiszins (base interest rate) for a specific year
 * Falls back to the latest available year if the requested year is not found
 *
 * @param year - The year to get the basiszins for
 * @param basiszinsConfig - Optional configurable basiszins configuration (from Deutsche Bundesbank)
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
    const availableYears = Object.keys(basiszinsConfig).map(Number).sort((a, b) => b - a)
    if (availableYears.length > 0) {
      const latestYear = availableYears[0]
      return basiszinsConfig[latestYear].rate
    }
  }

  // Final fallback to the latest available year from hardcoded data
  const availableYears = Object.keys(basiszinsen).map(Number).sort((a, b) => b - a)
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
  anteilImJahr: number = 12,
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
  anteilImJahr: number = 12,
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
  const steuerVorFreibetrag = calculateSteuerOnVorabpauschale(
    vorabpauschaleAmount,
    steuerlast,
    teilFreistellungsquote,
  )

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
 * Performs Günstigerprüfung (tax optimization check) to determine whether
 * Abgeltungssteuer (capital gains tax) or personal income tax is more favorable.
 *
 * @param vorabpauschale - The Vorabpauschale amount subject to taxation
 * @param abgeltungssteuer - The standard capital gains tax rate (e.g., 0.26375 = 26.375%)
 * @param personalTaxRate - The personal income tax rate (e.g., 0.25 = 25%)
 * @param teilfreistellungsquote - The partial exemption quote for the fund type (e.g., 0.3 for equity funds)
 * @param grundfreibetrag - The annual tax-free allowance for personal income tax
 * @param alreadyUsedGrundfreibetrag - Amount of Grundfreibetrag already used in the year
 * @returns Object with calculated tax amounts and recommendation
 */
export function performGuenstigerPruefung(
  vorabpauschale: number,
  abgeltungssteuer: number,
  personalTaxRate: number,
  teilfreistellungsquote: number,
  grundfreibetrag: number = 0,
  alreadyUsedGrundfreibetrag: number = 0,
  kirchensteuerAktiv: boolean = false,
  kirchensteuersatz: number = 9,
): {
  abgeltungssteuerAmount: number
  personalTaxAmount: number
  usedTaxRate: number
  isFavorable: 'abgeltungssteuer' | 'personal' | 'equal'
  availableGrundfreibetrag: number
  usedGrundfreibetrag: number
  explanation: string
} {
  if (vorabpauschale <= 0) {
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

  // Calculate Abgeltungssteuer (capital gains tax)
  const abgeltungssteuerAmount = calculateSteuerOnVorabpauschale(
    vorabpauschale,
    abgeltungssteuer,
    teilfreistellungsquote,
  )

  // Calculate personal income tax
  const availableGrundfreibetrag = Math.max(0, grundfreibetrag - alreadyUsedGrundfreibetrag)
  const taxableIncome = Math.max(0, vorabpauschale * (1 - teilfreistellungsquote) - availableGrundfreibetrag)
  const basePersonalTax = taxableIncome * personalTaxRate

  // Add Kirchensteuer if active (calculated as percentage of income tax)
  const kirchensteuer = kirchensteuerAktiv ? basePersonalTax * (kirchensteuersatz / 100) : 0
  const personalTaxAmount = basePersonalTax + kirchensteuer
  const usedGrundfreibetrag = Math.min(availableGrundfreibetrag, vorabpauschale * (1 - teilfreistellungsquote))

  // Determine which is more favorable
  let isFavorable: 'abgeltungssteuer' | 'personal' | 'equal'
  let usedTaxRate: number
  let explanation: string

  const kirchensteuerText = kirchensteuerAktiv ? ` (inkl. ${kirchensteuersatz}% Kirchensteuer)` : ''

  if (personalTaxAmount < abgeltungssteuerAmount) {
    isFavorable = 'personal'
    // Avoid division by zero
    usedTaxRate = personalTaxAmount / Math.max(vorabpauschale * (1 - teilfreistellungsquote), 0.01)
    explanation = `Persönlicher Steuersatz (${(personalTaxRate * 100).toFixed(2)}%${kirchensteuerText}) ist günstiger als `
      + `Abgeltungssteuer (${(abgeltungssteuer * 100).toFixed(2)}%)`
  }
  else if (personalTaxAmount > abgeltungssteuerAmount) {
    isFavorable = 'abgeltungssteuer'
    usedTaxRate = abgeltungssteuer
    explanation = `Abgeltungssteuer (${(abgeltungssteuer * 100).toFixed(2)}%) ist günstiger als `
      + `persönlicher Steuersatz (${(personalTaxRate * 100).toFixed(2)}%${kirchensteuerText})`
  }
  else {
    isFavorable = 'equal'
    usedTaxRate = abgeltungssteuer
    explanation = `Abgeltungssteuer und persönlicher Steuersatz${kirchensteuerText} führen zum gleichen Ergebnis (${(abgeltungssteuer * 100).toFixed(2)}%)`
  }

  return {
    abgeltungssteuerAmount,
    personalTaxAmount,
    usedTaxRate,
    isFavorable,
    availableGrundfreibetrag,
    usedGrundfreibetrag,
    explanation,
  }
}
