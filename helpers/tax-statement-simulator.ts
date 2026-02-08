/**
 * Tax Statement Simulator (Steuerbescheinigung-Simulator)
 *
 * This module generates a simulated annual tax statement for capital gains,
 * similar to what German banks provide to investors at the end of each year.
 * The statement helps users understand their tax documents and prepare for tax filing.
 */

import type { SimulationResult } from '../src/utils/simulate'

/**
 * Annual tax statement data structure matching German tax certificates
 * (Steuerbescheinigung für Kapitalerträge)
 */
export interface TaxStatementData {
  /** Tax year */
  year: number

  /** Total capital gains before any exemptions (Gesamte Kapitalerträge) */
  totalCapitalGains: number

  /** Advance lump-sum taxation amount (Vorabpauschale) */
  vorabpauschale: number

  /** Tax-free allowance used this year (Genutzter Freibetrag) */
  usedAllowance: number

  /** Tax-free allowance remaining (Verbleibender Freibetrag) */
  remainingAllowance: number

  /** Taxable amount after allowance (Steuerpflichtiger Betrag) */
  taxableAmount: number

  /** Capital gains tax paid (Gezahlte Kapitalertragsteuer) */
  capitalGainsTax: number

  /** Solidarity surcharge paid (Solidaritätszuschlag) */
  solidaritySurcharge: number

  /** Church tax paid if applicable (Kirchensteuer) */
  churchTax?: number

  /** Total tax paid (Gesamte Steuerlast) */
  totalTaxPaid: number

  /** Loss carryforward from previous years (Verlustvortrag Vorjahr) */
  lossCarryforwardPreviousYear?: number

  /** Loss carryforward to next year (Verlustvortrag Folgejahr) */
  lossCarryforwardNextYear?: number

  /** Realized losses this year (Realisierte Verluste) */
  realizedLosses?: number

  /** Starting capital at beginning of year (Anfangskapital) */
  startingCapital: number

  /** Ending capital at end of year (Endkapital) */
  endingCapital: number
}

/**
 * Configuration for tax statement generation
 */
export interface TaxStatementConfig {
  /** Capital gains tax rate (default: 26.375% = 25% + 5.5% Soli) */
  capitalGainsTaxRate: number

  /** Annual tax-free allowance (Sparerpauschbetrag) */
  annualAllowance: number

  /** Partial tax exemption rate (Teilfreistellungsquote, e.g., 0.3 for equity funds) */
  partialExemptionRate?: number

  /** Church tax rate if applicable (Kirchensteuersatz, e.g., 0.08 or 0.09) */
  churchTaxRate?: number

  /** Whether church tax is active */
  churchTaxActive?: boolean
}

/**
 * Calculate capital gains tax components
 * @param taxableAmount - Amount to be taxed
 * @param churchTaxRate - Church tax rate if applicable
 * @param churchTaxActive - Whether church tax should be calculated
 * @returns Object with capital gains tax, solidarity surcharge, and church tax
 */
function calculateTaxComponents(
  taxableAmount: number,
  churchTaxRate?: number,
  churchTaxActive?: boolean,
): {
  capitalGainsTax: number
  solidaritySurcharge: number
  churchTax: number
  totalTax: number
} {
  if (taxableAmount <= 0) {
    return {
      capitalGainsTax: 0,
      solidaritySurcharge: 0,
      churchTax: 0,
      totalTax: 0,
    }
  }

  // Base capital gains tax (25%)
  const baseCapitalGainsTax = taxableAmount * 0.25

  // Solidarity surcharge (5.5% of base tax)
  const solidaritySurcharge = baseCapitalGainsTax * 0.055

  // Church tax if active (8% or 9% of base tax)
  const churchTax = churchTaxActive && churchTaxRate ? baseCapitalGainsTax * churchTaxRate : 0

  // Total capital gains tax includes solidarity surcharge but church tax is separate
  const capitalGainsTax = baseCapitalGainsTax + solidaritySurcharge

  // Total tax includes everything
  const totalTax = capitalGainsTax + churchTax

  return {
    capitalGainsTax,
    solidaritySurcharge,
    churchTax,
    totalTax,
  }
}

/**
 * Calculate taxable amounts after exemptions and allowances
 */
function calculateTaxableAmounts(
  capitalGains: number,
  partialExemptionRate: number,
  usedAllowance: number,
  annualAllowance: number,
): {
  taxableCapitalGains: number
  taxableAmount: number
  remainingAllowance: number
} {
  // Apply partial exemption if configured
  const taxableCapitalGains = capitalGains * (1 - partialExemptionRate)

  // Calculate remaining allowance
  const remainingAllowance = Math.max(0, annualAllowance - usedAllowance)

  // Amount subject to taxation after allowance
  const taxableAmount = Math.max(0, taxableCapitalGains - usedAllowance)

  return {
    taxableCapitalGains,
    taxableAmount,
    remainingAllowance,
  }
}

/**
 * Extract loss information from simulation year data
 */
function extractLossInformation(
  lossAccountState?: { stockLosses: number; otherLosses: number; year: number },
  lossOffsetDetails?: {
    stockLossesUsed: number
    otherLossesUsed: number
  },
): {
  lossCarryforwardPreviousYear?: number
  lossCarryforwardNextYear?: number
  realizedLosses?: number
} {
  if (!lossAccountState) {
    return {}
  }

  const totalLosses = lossAccountState.stockLosses + lossAccountState.otherLosses

  return {
    lossCarryforwardPreviousYear: totalLosses,
    lossCarryforwardNextYear: totalLosses,
    realizedLosses: lossOffsetDetails ? lossOffsetDetails.stockLossesUsed + lossOffsetDetails.otherLossesUsed : undefined,
  }
}

/**
 * Generate an annual tax statement from simulation results
 *
 * @param simulationResult - Complete simulation results
 * @param year - Year to generate statement for
 * @param config - Tax configuration
 * @returns Annual tax statement data or null if year not in simulation
 */
export function generateTaxStatement(
  simulationResult: SimulationResult,
  year: number,
  config: TaxStatementConfig,
): TaxStatementData | null {
  const yearData = simulationResult[year]
  if (!yearData) {
    return null
  }

  // Calculate total capital gains for the year
  const totalCapitalGains = yearData.zinsen

  // Calculate taxable amounts
  const { taxableAmount, remainingAllowance } = calculateTaxableAmounts(
    totalCapitalGains,
    config.partialExemptionRate || 0,
    yearData.genutzterFreibetrag || 0,
    config.annualAllowance,
  )

  // Calculate tax components
  const { capitalGainsTax, solidaritySurcharge, churchTax, totalTax } = calculateTaxComponents(
    taxableAmount,
    config.churchTaxRate,
    config.churchTaxActive,
  )

  // Extract loss information
  const lossInfo = extractLossInformation(yearData.lossAccountState, yearData.lossOffsetDetails)

  return {
    year,
    totalCapitalGains,
    vorabpauschale: yearData.vorabpauschale || 0,
    usedAllowance: yearData.genutzterFreibetrag || 0,
    remainingAllowance,
    taxableAmount,
    capitalGainsTax,
    solidaritySurcharge,
    churchTax: config.churchTaxActive ? churchTax : undefined,
    totalTaxPaid: yearData.bezahlteSteuer || totalTax,
    ...lossInfo,
    startingCapital: yearData.startkapital,
    endingCapital: yearData.endkapital,
  }
}

/**
 * Generate tax statements for multiple years
 *
 * @param simulationResult - Complete simulation results
 * @param years - Array of years to generate statements for
 * @param config - Tax configuration
 * @returns Array of tax statements for the requested years
 */
export function generateMultiYearTaxStatements(
  simulationResult: SimulationResult,
  years: number[],
  config: TaxStatementConfig,
): TaxStatementData[] {
  return years.map((year) => generateTaxStatement(simulationResult, year, config)).filter((s): s is TaxStatementData => s !== null)
}

/**
 * Export tax statement data in a format suitable for tax filing (Anlage KAP)
 *
 * @param statement - Tax statement data
 * @returns Formatted data for tax filing
 */
export interface TaxFilingExportData {
  /** Year for tax filing */
  year: number

  /** Line 7: Capital gains (Kapitalerträge) */
  line7_capitalGains: number

  /** Line 8: Tax-free allowance used (Sparerpauschbetrag) */
  line8_allowanceUsed: number

  /** Line 9: Capital gains tax paid (Kapitalertragsteuer) */
  line9_taxPaid: number

  /** Line 10: Solidarity surcharge paid (Solidaritätszuschlag) */
  line10_solidaritySurcharge: number

  /** Line 11: Church tax paid if applicable (Kirchensteuer) */
  line11_churchTax?: number

  /** Vorabpauschale for information purposes */
  vorabpauschaleInfo: number
}

/**
 * Convert tax statement to tax filing export format
 */
export function exportForTaxFiling(statement: TaxStatementData): TaxFilingExportData {
  return {
    year: statement.year,
    line7_capitalGains: statement.totalCapitalGains,
    line8_allowanceUsed: statement.usedAllowance,
    line9_taxPaid: statement.capitalGainsTax,
    line10_solidaritySurcharge: statement.solidaritySurcharge,
    line11_churchTax: statement.churchTax,
    vorabpauschaleInfo: statement.vorabpauschale,
  }
}
