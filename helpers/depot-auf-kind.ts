/**
 * Depot-auf-Kind-Strategie (Child's Depot Tax Optimization)
 * 
 * Tax-optimized capital investment strategy for children's education financing.
 * Leverages the child's personal tax allowances to minimize overall family tax burden.
 * 
 * German Tax Benefits:
 * - Child's Sparerpauschbetrag: €1,000 per year (capital gains tax exemption)
 * - Child's Grundfreibetrag: €11,604 per year (2024) for all income
 * - Lower marginal tax rates when child has minimal other income
 * - Avoids parent's high marginal tax rate on investment returns
 * 
 * Legal Framework:
 * - § 32 EStG: Kindergeld bis 25 Jahre bei Ausbildung/Studium
 * - § 32a EStG: Einkommensteuertarif (progressive income tax)
 * - § 20 EStG: Einkünfte aus Kapitalvermögen (capital income)
 */

import { GERMAN_TAX_CONSTANTS, getBasiszinsForYear } from './steuer'
import type { BasiszinsConfiguration } from '../src/services/bundesbank-api'

/**
 * Child's tax allowances for 2024 (German tax law)
 */
export const CHILD_TAX_ALLOWANCES = {
  /** Sparerpauschbetrag (capital gains tax exemption) for children */
  SPARERPAUSCHBETRAG: 1000,
  /** Grundfreibetrag (basic tax allowance) for children - same as adults */
  GRUNDFREIBETRAG: GERMAN_TAX_CONSTANTS.GRUNDFREIBETRAG_2024,
  /** Sonderausgaben-Pauschbetrag (special expenses flat rate) */
  SONDERAUSGABEN_PAUSCHBETRAG: 36,
} as const

/**
 * Typical asset allocation for children's education savings
 * Affects Teilfreistellung (partial exemption) rate
 */
export type ChildDepotAssetType = 'equity_fund' | 'mixed_fund' | 'bond_fund' | 'savings_account'

/**
 * Teilfreistellung (partial exemption) rates for different fund types
 * According to InvStG (Investment Tax Act)
 */
export const TEILFREISTELLUNG_RATES = {
  equity_fund: 0.3, // 30% exempt for equity funds (≥51% stocks)
  mixed_fund: 0.15, // 15% exempt for mixed funds (≥25% stocks)
  bond_fund: 0.0, // 0% exempt for bond funds
  savings_account: 0.0, // 0% exempt for savings accounts
} as const

/**
 * Configuration for child's depot strategy
 */
export interface DepotAufKindConfig {
  /** Child's name for identification */
  childName: string
  /** Child's birth year */
  birthYear: number
  /** Initial depot value in EUR */
  initialDepotValue: number
  /** Expected annual return rate (as decimal, e.g., 0.05 for 5%) */
  expectedAnnualReturn: number
  /** Type of investment (affects Teilfreistellung) */
  assetType: ChildDepotAssetType
  /** Whether child has other income from work/apprenticeship */
  hasOtherIncome: boolean
  /** Child's other annual income in EUR (if any) */
  otherAnnualIncome: number
  /** Parent's marginal tax rate (as decimal, e.g., 0.42 for 42%) */
  parentMarginalTaxRate: number
  /** Years to simulate (typically until child is 25) */
  simulationYears: number
  /** Starting year for simulation */
  startYear: number
  /** Basiszins configuration for Vorabpauschale calculation */
  basiszinsConfig?: BasiszinsConfiguration
}

/**
 * Yearly breakdown of depot taxation
 */
export interface DepotAufKindYearlyResult {
  /** Year */
  year: number
  /** Child's age in this year */
  childAge: number
  /** Depot value at start of year */
  startValue: number
  /** Investment return for the year */
  investmentReturn: number
  /** Vorabpauschale (advance lump-sum) for the year */
  vorabpauschale: number
  /** Teilfreistellung amount (partial exemption) */
  teilfreistellungAmount: number
  /** Taxable capital gains after Teilfreistellung */
  taxableCapitalGains: number
  /** Capital gains tax before Sparerpauschbetrag */
  capitalGainsTaxBeforeExemption: number
  /** Sparerpauschbetrag applied */
  sparerpauschbetragApplied: number
  /** Capital gains tax after Sparerpauschbetrag */
  capitalGainsTaxAfterExemption: number
  /** Child's other income (work, apprenticeship) */
  otherIncome: number
  /** Total taxable income (capital + other) */
  totalTaxableIncome: number
  /** Income tax on other income (progressive rates) */
  incomeTaxOnOtherIncome: number
  /** Solidarity surcharge (Solidaritätszuschlag) */
  solidaritySurcharge: number
  /** Total tax burden for the year */
  totalTax: number
  /** Depot value at end of year (after tax) */
  endValue: number
  /** Tax saved vs. parent's depot */
  taxSavedVsParent: number
}

/**
 * Complete result of depot-auf-kind simulation
 */
export interface DepotAufKindResult {
  /** Configuration used */
  config: DepotAufKindConfig
  /** Yearly breakdown */
  yearlyResults: DepotAufKindYearlyResult[]
  /** Summary statistics */
  summary: {
    /** Total investment returns over all years */
    totalReturns: number
    /** Total tax paid by child */
    totalTaxPaidByChild: number
    /** Total tax that would be paid by parent */
    totalTaxIfParentDepot: number
    /** Total tax savings from using child's depot */
    totalTaxSavings: number
    /** Final depot value (child's depot) */
    finalDepotValue: number
    /** Final depot value if parent held it */
    finalDepotValueIfParent: number
    /** Effective tax rate (child's depot) */
    effectiveTaxRateChild: number
    /** Effective tax rate (parent's depot) */
    effectiveTaxRateParent: number
    /** Average annual tax savings */
    averageAnnualTaxSavings: number
  }
}

/**
 * Calculate Vorabpauschale for a given year
 * Simplified calculation for child's depot (uses Basiszins × 0.7)
 * 
 * @param startValue - Depot value at start of year
 * @param endValue - Depot value at end of year
 * @param basiszins - Base interest rate for the year
 * @returns Vorabpauschale amount
 */
function calculateVorabpauschale(startValue: number, endValue: number, basiszins: number): number {
  // Basisertrag = Startwert × Basiszins × 0.7 (Vorabpauschale percentage)
  const basisertrag = startValue * basiszins * GERMAN_TAX_CONSTANTS.VORABPAUSCHALE_PERCENTAGE

  // Vorabpauschale is limited by actual gains
  const actualGain = endValue - startValue
  const vorabpauschale = Math.min(basisertrag, actualGain)

  return Math.max(0, vorabpauschale)
}

/**
 * Calculate capital gains tax (Kapitalertragsteuer + Solidaritätszuschlag)
 * Standard rate: 25% + 5.5% Soli = 26.375%
 * 
 * @param taxableGains - Taxable capital gains
 * @returns Total capital gains tax
 */
function calculateCapitalGainsTax(taxableGains: number): number {
  if (taxableGains <= 0) return 0

  const CAPITAL_GAINS_TAX_RATE = 0.25 // 25% Abgeltungsteuer
  const SOLIDARITY_SURCHARGE_RATE = 0.055 // 5.5% on income tax

  const baseTax = taxableGains * CAPITAL_GAINS_TAX_RATE
  const soli = baseTax * SOLIDARITY_SURCHARGE_RATE

  return baseTax + soli
}

/**
 * Calculate income tax using simplified progressive brackets
 * Based on German Einkommensteuertarif 2024
 * 
 * @param taxableIncome - Taxable income amount
 * @returns Income tax amount
 */
function calculateIncomeTax(taxableIncome: number): number {
  if (taxableIncome <= CHILD_TAX_ALLOWANCES.GRUNDFREIBETRAG) return 0

  // Simplified progressive tax calculation
  // Real calculation uses formulas in EStG, this is a reasonable approximation
  const taxableAboveGrundfreibetrag = taxableIncome - CHILD_TAX_ALLOWANCES.GRUNDFREIBETRAG

  let tax = 0

  if (taxableAboveGrundfreibetrag <= 5401) {
    // Entry zone: 14% to ~24% (linear progression)
    tax = taxableAboveGrundfreibetrag * 0.14
  } else if (taxableAboveGrundfreibetrag <= 55156) {
    // Progressive zone: ~24% to 42%
    tax = 5401 * 0.14 + (taxableAboveGrundfreibetrag - 5401) * 0.24
  } else if (taxableAboveGrundfreibetrag <= 266221) {
    // Top rate zone: 42%
    tax = 5401 * 0.14 + 49755 * 0.24 + (taxableAboveGrundfreibetrag - 55156) * 0.42
  } else {
    // Reichensteuer: 45%
    tax = 5401 * 0.14 + 49755 * 0.24 + 211065 * 0.42 + (taxableAboveGrundfreibetrag - 266221) * 0.45
  }

  // Add Solidaritätszuschlag (simplified - normally has exemption threshold)
  const soli = tax * 0.055

  return tax + soli
}

/**
 * Calculate yearly result for child's depot
 */
function calculateYearlyDepotResult(
  config: DepotAufKindConfig,
  year: number,
  currentDepotValue: number,
): DepotAufKindYearlyResult {
  const childAge = year - config.birthYear

  // Calculate investment return
  const investmentReturn = currentDepotValue * config.expectedAnnualReturn
  const endValueBeforeTax = currentDepotValue + investmentReturn

  // Calculate Vorabpauschale
  const basiszins = getBasiszinsForYear(year, config.basiszinsConfig)
  const vorabpauschale = calculateVorabpauschale(currentDepotValue, endValueBeforeTax, basiszins)

  // Apply Teilfreistellung
  const teilfreistellungsquote = TEILFREISTELLUNG_RATES[config.assetType]
  const teilfreistellungAmount = vorabpauschale * teilfreistellungsquote
  const taxableCapitalGains = vorabpauschale - teilfreistellungAmount

  // Calculate capital gains tax before exemption
  const capitalGainsTaxBeforeExemption = calculateCapitalGainsTax(taxableCapitalGains)

  // Apply Sparerpauschbetrag
  const sparerpauschbetragApplied = Math.min(taxableCapitalGains, CHILD_TAX_ALLOWANCES.SPARERPAUSCHBETRAG)
  const taxableAfterSparerpauschbetrag = Math.max(0, taxableCapitalGains - sparerpauschbetragApplied)

  // Calculate final capital gains tax
  const capitalGainsTaxAfterExemption = calculateCapitalGainsTax(taxableAfterSparerpauschbetrag)

  // Calculate income tax on other income (if any)
  const otherIncome = config.hasOtherIncome ? config.otherAnnualIncome : 0
  const incomeTaxOnOtherIncome = calculateIncomeTax(otherIncome)

  // Total taxable income and tax
  const totalTaxableIncome = taxableAfterSparerpauschbetrag + otherIncome
  const totalTax = capitalGainsTaxAfterExemption + incomeTaxOnOtherIncome

  // Calculate what parent would pay
  const parentTaxOnCapitalGains = taxableCapitalGains * config.parentMarginalTaxRate * 1.055 // Include Soli
  const taxSavedVsParent = parentTaxOnCapitalGains - capitalGainsTaxAfterExemption

  // Update depot value after tax
  const endValue = endValueBeforeTax - totalTax

  return {
    year,
    childAge,
    startValue: currentDepotValue,
    investmentReturn,
    vorabpauschale,
    teilfreistellungAmount,
    taxableCapitalGains,
    capitalGainsTaxBeforeExemption,
    sparerpauschbetragApplied,
    capitalGainsTaxAfterExemption,
    otherIncome,
    totalTaxableIncome,
    incomeTaxOnOtherIncome,
    solidaritySurcharge: totalTax - capitalGainsTaxAfterExemption - incomeTaxOnOtherIncome,
    totalTax,
    endValue,
    taxSavedVsParent,
  }
}

/**
 * Simulate parent's depot for comparison
 */
function simulateParentDepot(config: DepotAufKindConfig): number {
  let parentDepotValue = config.initialDepotValue

  for (let i = 0; i < config.simulationYears; i++) {
    const year = config.startYear + i
    const investmentReturn = parentDepotValue * config.expectedAnnualReturn
    const endValueBeforeTax = parentDepotValue + investmentReturn

    const basiszins = getBasiszinsForYear(year, config.basiszinsConfig)
    const vorabpauschale = calculateVorabpauschale(parentDepotValue, endValueBeforeTax, basiszins)

    const teilfreistellungsquote = TEILFREISTELLUNG_RATES[config.assetType]
    const taxableCapitalGains = vorabpauschale * (1 - teilfreistellungsquote)

    // Parent pays their marginal rate (no Sparerpauschbetrag benefit assumed)
    const tax = taxableCapitalGains * config.parentMarginalTaxRate * 1.055

    parentDepotValue = endValueBeforeTax - tax
  }

  return parentDepotValue
}

/**
 * Simulate depot-auf-kind strategy over multiple years
 * 
 * @param config - Configuration for the simulation
 * @returns Complete simulation results
 */
export function simulateDepotAufKind(config: DepotAufKindConfig): DepotAufKindResult {
  const yearlyResults: DepotAufKindYearlyResult[] = []
  let currentDepotValue = config.initialDepotValue

  // Calculate yearly results
  for (let i = 0; i < config.simulationYears; i++) {
    const year = config.startYear + i
    const yearlyResult = calculateYearlyDepotResult(config, year, currentDepotValue)
    yearlyResults.push(yearlyResult)
    currentDepotValue = yearlyResult.endValue
  }

  // Calculate summary statistics
  const totalReturns = yearlyResults.reduce((sum, r) => sum + r.investmentReturn, 0)
  const totalTaxPaidByChild = yearlyResults.reduce((sum, r) => sum + r.totalTax, 0)
  const totalTaxSavings = yearlyResults.reduce((sum, r) => sum + r.taxSavedVsParent, 0)
  const totalTaxIfParentDepot = totalTaxPaidByChild + totalTaxSavings

  const parentDepotValue = simulateParentDepot(config)

  const summary = {
    totalReturns,
    totalTaxPaidByChild,
    totalTaxIfParentDepot,
    totalTaxSavings,
    finalDepotValue: currentDepotValue,
    finalDepotValueIfParent: parentDepotValue,
    effectiveTaxRateChild: totalReturns > 0 ? totalTaxPaidByChild / totalReturns : 0,
    effectiveTaxRateParent: totalReturns > 0 ? totalTaxIfParentDepot / totalReturns : 0,
    averageAnnualTaxSavings: totalTaxSavings / config.simulationYears,
  }

  return {
    config,
    yearlyResults,
    summary,
  }
}

/**
 * Calculate optimal timing for asset transfer to child's depot
 * Considers child's age, expected study duration, and tax implications
 * 
 * @param birthYear - Child's birth year
 * @param studyStartYear - Expected year to start university (typically age 19)
 * @param _studyDuration - Duration of studies in years (typically 3-5 years) - reserved for future use
 * @returns Recommended transfer year
 */
export function calculateOptimalTransferTiming(
  birthYear: number,
  studyStartYear: number,
  _studyDuration: number,
): {
  recommendedTransferYear: number
  reasoning: string
} {
  const studyStartAge = studyStartYear - birthYear

  // Optimal strategy: Transfer early enough to accumulate tax-free gains
  // but not so early that the child loses Kindergeld eligibility
  // Kindergeld continues until age 25 if in education

  // Recommendation: Transfer at age 18 (or 1-2 years before study start)
  const recommendedAge = Math.max(18, studyStartAge - 2)
  const recommendedTransferYear = birthYear + recommendedAge

  const reasoning = `Transfer im Alter von ${recommendedAge} Jahren (${recommendedTransferYear}) empfohlen. ` +
    `Dies ermöglicht ${studyStartAge - recommendedAge} Jahre steuerfreies Wachstum vor Studienbeginn, ` +
    `während das Kind noch im Haushalt der Eltern lebt und Kindergeld bezogen wird.`

  return {
    recommendedTransferYear,
    reasoning,
  }
}

/**
 * Add validation error if condition is met
 */
function addValidationError(errors: string[], condition: boolean, message: string): void {
  if (condition) {
    errors.push(message)
  }
}

/**
 * Validate depot-auf-kind configuration
 * 
 * @param config - Configuration to validate
 * @returns Validation result with error messages
 */
export function validateDepotAufKindConfig(config: DepotAufKindConfig): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  addValidationError(errors, config.childName.trim().length === 0, 'Name des Kindes darf nicht leer sein')

  addValidationError(
    errors,
    config.birthYear < 1900 || config.birthYear > new Date().getFullYear(),
    'Geburtsjahr muss zwischen 1900 und heute liegen',
  )

  addValidationError(errors, config.initialDepotValue < 0, 'Depot-Wert darf nicht negativ sein')

  addValidationError(
    errors,
    config.expectedAnnualReturn < -1 || config.expectedAnnualReturn > 1,
    'Erwartete Rendite muss zwischen -100% und +100% liegen',
  )

  addValidationError(
    errors,
    config.parentMarginalTaxRate < 0 || config.parentMarginalTaxRate > 0.45,
    'Grenzsteuersatz der Eltern muss zwischen 0% und 45% liegen',
  )

  addValidationError(
    errors,
    config.simulationYears < 1 || config.simulationYears > 50,
    'Simulationsdauer muss zwischen 1 und 50 Jahren liegen',
  )

  addValidationError(
    errors,
    config.startYear < 1900 || config.startYear > 2100,
    'Startjahr muss zwischen 1900 und 2100 liegen',
  )

  addValidationError(
    errors,
    config.hasOtherIncome && config.otherAnnualIncome < 0,
    'Jahreseinkommen des Kindes darf nicht negativ sein',
  )

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Create default depot-auf-kind configuration
 * 
 * @param childName - Child's name
 * @param birthYear - Child's birth year
 * @returns Default configuration
 */
export function createDefaultDepotAufKindConfig(childName: string, birthYear: number): DepotAufKindConfig {
  const currentYear = new Date().getFullYear()
  const childAge = currentYear - birthYear
  const studyStartAge = 19
  const yearsUntilStudy = Math.max(1, studyStartAge - childAge)

  return {
    childName,
    birthYear,
    initialDepotValue: 50000, // €50,000 default
    expectedAnnualReturn: 0.05, // 5% default return
    assetType: 'equity_fund', // Most tax-efficient for long-term
    hasOtherIncome: false,
    otherAnnualIncome: 0,
    parentMarginalTaxRate: 0.42, // Typical high earner rate
    simulationYears: yearsUntilStudy + 5, // Until end of typical bachelor's degree
    startYear: currentYear,
  }
}
