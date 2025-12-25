/**
 * Reverse Calculator (Rückwärtsrechner) Helper Functions
 *
 * This module implements a reverse compound interest calculator that determines the required
 * savings rate to reach a specific target capital amount, considering German tax implications.
 *
 * Unlike the standard forward calculator which computes "What will I have?", this calculator
 * answers "How much do I need to save?" to reach a specific retirement goal.
 *
 * Key features:
 * - Iterative calculation to find required savings rate
 * - Consideration of Vorabpauschale (advance lump-sum tax)
 * - Consideration of Teilfreistellung (partial tax exemption)
 * - Support for monthly and annual calculations
 * - Sensitivity analysis for different return scenarios
 */

/**
 * Configuration for reverse calculator
 */
export interface ReverseCalculatorConfig {
  /** Target capital amount to reach (in EUR) */
  targetCapital: number
  /** Number of years to reach the target */
  years: number
  /** Expected annual return rate (as decimal, e.g., 0.05 for 5%) */
  returnRate: number
  /** Calculation mode: monthly or annual contributions */
  calculationMode: 'monthly' | 'yearly'
  /** Capital gains tax rate (as decimal, e.g., 0.26375 for 26.375%) */
  taxRate: number
  /** Partial tax exemption rate (as decimal, e.g., 0.3 for 30%) */
  teilfreistellung: number
  /** Tax-free allowance per year (in EUR) */
  freibetrag: number
  /** Base interest rate for Vorabpauschale (as decimal) */
  basiszins: number
  /** Total Expense Ratio - annual fund costs (as decimal, e.g., 0.002 for 0.2%) */
  ter: number
}

/**
 * Result of reverse calculator computation
 */
export interface ReverseCalculatorResult {
  /** Required monthly savings rate (in EUR) - only for monthly mode */
  monthlyRate?: number
  /** Required annual savings rate (in EUR) - only for yearly mode */
  yearlyRate?: number
  /** Total amount that will be contributed over the period */
  totalContributions: number
  /** Expected final capital (should equal targetCapital) */
  finalCapital: number
  /** Total taxes paid over the period */
  totalTaxesPaid: number
  /** Total costs (TER) paid over the period */
  totalCostsPaid: number
  /** Net gain (final capital - contributions) */
  netGain: number
  /** Whether the calculation converged successfully */
  converged: boolean
  /** Number of iterations needed to find the solution */
  iterations: number
}

/**
 * Sensitivity analysis result for different return scenarios
 */
export interface SensitivityAnalysis {
  /** Scenario name/description */
  scenario: string
  /** Return rate for this scenario */
  returnRate: number
  /** Required savings rate for this scenario */
  savingsRate: number
  /** Total contributions needed */
  totalContributions: number
}

/**
 * Calculate required savings rate to reach a target capital amount
 *
 * Uses an iterative bisection method to find the savings rate that results in
 * the target capital amount after the specified period, accounting for German taxes.
 *
 * @param config - Reverse calculator configuration
 * @returns Result with required savings rate and details
 */
export function calculateRequiredSavingsRate(config: ReverseCalculatorConfig): ReverseCalculatorResult {
  const { targetCapital, years, calculationMode } = config

  // Validation
  if (targetCapital <= 0) {
    throw new Error('Zielkapital muss größer als 0 sein')
  }
  if (years <= 0) {
    throw new Error('Zeitraum muss größer als 0 Jahre sein')
  }

  const result = findSavingsRateByBisection(config, targetCapital)

  // If monthly mode, set monthlyRate; if yearly mode, set yearlyRate
  if (calculationMode === 'monthly') {
    result.monthlyRate = result.yearlyRate ? result.yearlyRate / 12 : 0
    delete result.yearlyRate
  }

  return result
}

/**
 * Internal function to find savings rate using bisection method
 */
function findSavingsRateByBisection(
  config: ReverseCalculatorConfig,
  targetCapital: number,
): ReverseCalculatorResult {
  let lowerBound = 0
  let upperBound = targetCapital
  let iterations = 0
  const maxIterations = 100
  // Use relative tolerance: 0.1% of target capital or 10€, whichever is larger
  const tolerance = Math.max(targetCapital * 0.001, 10)

  let bestResult: ReverseCalculatorResult | null = null

  while (iterations < maxIterations && upperBound - lowerBound > 0.01) {
    iterations++
    const midpoint = (lowerBound + upperBound) / 2
    const result = simulateWithSavingsRate(config, midpoint)

    if (Math.abs(result.finalCapital - targetCapital) < tolerance) {
      return { ...result, converged: true, iterations }
    }

    if (result.finalCapital < targetCapital) {
      lowerBound = midpoint
    } else {
      upperBound = midpoint
    }

    bestResult = { ...result, converged: false, iterations }
  }

  if (!bestResult) {
    const midpoint = (lowerBound + upperBound) / 2
    bestResult = simulateWithSavingsRate(config, midpoint)
    bestResult.converged = false
    bestResult.iterations = iterations
  }

  return bestResult
}

/**
 * Internal function to simulate investment with a given savings rate
 * This is a simplified version of the full simulation logic from simulate.ts
 */
function simulateWithSavingsRate(
  config: ReverseCalculatorConfig,
  savingsRatePerPeriod: number,
): ReverseCalculatorResult {
  const { years, calculationMode } = config

  const periodsPerYear = calculationMode === 'monthly' ? 12 : 1
  const totalPeriods = years * periodsPerYear

  const { capital, totalTaxesPaid, totalCostsPaid } = simulateYearByYear(config, savingsRatePerPeriod)

  const totalContributions = savingsRatePerPeriod * totalPeriods
  const netGain = capital - totalContributions

  return {
    yearlyRate: calculationMode === 'yearly' ? savingsRatePerPeriod : savingsRatePerPeriod * 12,
    totalContributions,
    finalCapital: capital,
    totalTaxesPaid,
    totalCostsPaid,
    netGain,
    converged: false,
    iterations: 0,
  }
}

/**
 * Simulate year-by-year investment growth with taxes
 */
function simulateYearByYear(config: ReverseCalculatorConfig, savingsRatePerPeriod: number) {
  const { years, returnRate, calculationMode, taxRate, teilfreistellung, freibetrag, basiszins, ter } = config

  const periodsPerYear = calculationMode === 'monthly' ? 12 : 1
  const periodReturnRate = calculationMode === 'monthly' ? returnRate / 12 : returnRate
  const periodTer = ter / periodsPerYear

  let capital = 0
  let totalTaxesPaid = 0
  let totalCostsPaid = 0
  let remainingFreibetrag = freibetrag

  for (let year = 1; year <= years; year++) {
    const startCapitalYear = capital

    for (let period = 0; period < periodsPerYear; period++) {
      capital += savingsRatePerPeriod
      const grossReturn = capital * periodReturnRate
      const terCost = capital * periodTer
      capital += grossReturn - terCost
      totalCostsPaid += terCost
    }

    const yearGain = capital - startCapitalYear - savingsRatePerPeriod * periodsPerYear
    const vorabpauschaleAmount = calculateYearlyVorabpauschale(startCapitalYear, basiszins, yearGain)

    const taxPaid = calculateYearlyTax(
      vorabpauschaleAmount,
      taxRate,
      teilfreistellung,
      remainingFreibetrag,
    )

    capital -= taxPaid
    totalTaxesPaid += taxPaid

    remainingFreibetrag = updateRemainingFreibetrag(
      remainingFreibetrag,
      vorabpauschaleAmount,
      year,
      years,
      freibetrag,
    )
  }

  return { capital, totalTaxesPaid, totalCostsPaid }
}

function calculateYearlyVorabpauschale(startCapital: number, basiszins: number, yearGain: number): number {
  const theoreticalGain = startCapital * basiszins
  const basisertrag = theoreticalGain * 0.7
  return Math.max(0, Math.min(basisertrag, yearGain))
}

function calculateYearlyTax(
  vorabpauschale: number,
  taxRate: number,
  teilfreistellung: number,
  remainingFreibetrag: number,
): number {
  const effectiveTaxRate = taxRate * (1 - teilfreistellung)
  const freibetragUsed = Math.min(remainingFreibetrag, vorabpauschale)
  return Math.max(0, vorabpauschale - freibetragUsed) * effectiveTaxRate
}

function updateRemainingFreibetrag(
  current: number,
  vorabpauschale: number,
  year: number,
  totalYears: number,
  annualFreibetrag: number,
): number {
  const used = Math.min(current, vorabpauschale)
  return year < totalYears ? annualFreibetrag : current - used
}

/**
 * Perform sensitivity analysis for different return rate scenarios
 *
 * @param config - Base configuration for the reverse calculator
 * @param returnScenarios - Array of return rates to analyze (as decimals)
 * @returns Array of sensitivity analysis results
 */
export function performSensitivityAnalysis(
  config: ReverseCalculatorConfig,
  returnScenarios: number[],
): SensitivityAnalysis[] {
  return returnScenarios.map(returnRate => {
    const scenarioConfig = { ...config, returnRate }
    const result = calculateRequiredSavingsRate(scenarioConfig)

    const savingsRate =
      config.calculationMode === 'monthly' ? result.monthlyRate || 0 : result.yearlyRate || 0

    let scenario: string
    if (returnRate < 0.03) scenario = 'Pessimistisch'
    else if (returnRate < 0.05) scenario = 'Konservativ'
    else if (returnRate < 0.07) scenario = 'Moderat'
    else if (returnRate < 0.09) scenario = 'Optimistisch'
    else scenario = 'Sehr optimistisch'

    return {
      scenario: `${scenario} (${(returnRate * 100).toFixed(1)}%)`,
      returnRate,
      savingsRate,
      totalContributions: result.totalContributions,
    }
  })
}

/**
 * Validate reverse calculator configuration
 * @param config - Configuration to validate
 * @returns Array of validation error messages (empty if valid)
 */
export function validateReverseCalculatorConfig(config: ReverseCalculatorConfig): string[] {
  const errors: string[] = []

  validateCapitalAndTime(config, errors)
  validateTaxParameters(config, errors)
  validateCostParameters(config, errors)

  return errors
}

function validateCapitalAndTime(config: ReverseCalculatorConfig, errors: string[]): void {
  if (config.targetCapital <= 0) {
    errors.push('Zielkapital muss größer als 0 sein')
  }

  if (config.years <= 0 || config.years > 100) {
    errors.push('Zeitraum muss zwischen 1 und 100 Jahren liegen')
  }

  if (config.returnRate < -0.5 || config.returnRate > 0.5) {
    errors.push('Rendite muss zwischen -50% und +50% liegen')
  }
}

function validateTaxParameters(config: ReverseCalculatorConfig, errors: string[]): void {
  if (config.taxRate < 0 || config.taxRate > 1) {
    errors.push('Steuersatz muss zwischen 0% und 100% liegen')
  }

  if (config.teilfreistellung < 0 || config.teilfreistellung > 1) {
    errors.push('Teilfreistellung muss zwischen 0% und 100% liegen')
  }

  if (config.freibetrag < 0) {
    errors.push('Freibetrag kann nicht negativ sein')
  }
}

function validateCostParameters(config: ReverseCalculatorConfig, errors: string[]): void {
  if (config.basiszins < 0 || config.basiszins > 0.2) {
    errors.push('Basiszins muss zwischen 0% und 20% liegen')
  }

  if (config.ter < 0 || config.ter > 0.1) {
    errors.push('TER muss zwischen 0% und 10% liegen')
  }
}

/**
 * Get default configuration for reverse calculator
 */
export function getDefaultReverseCalculatorConfig(): ReverseCalculatorConfig {
  return {
    targetCapital: 500000, // €500,000
    years: 30,
    returnRate: 0.05, // 5%
    calculationMode: 'monthly',
    taxRate: 0.26375, // German Abgeltungssteuer with Soli
    teilfreistellung: 0.3, // 30% for equity funds
    freibetrag: 2000, // €2,000 annual tax-free allowance (2024)
    basiszins: 0.0255, // 2.55% for 2024
    ter: 0.002, // 0.2% TER
  }
}
