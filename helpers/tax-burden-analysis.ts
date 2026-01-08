import type { SimulationResult } from '../src/utils/simulate'

/**
 * Represents the tax burden for a single year
 */
export interface YearlyTaxBurden {
  year: number
  capitalGainsTax: number // Kapitalertragsteuer (paid tax)
  vorabpauschale: number // Vorabpauschale amount
  usedAllowance: number // Genutzter Freibetrag
  totalTaxBurden: number // Total tax burden (paid tax + vorabpauschale effect)
  effectiveTaxRate: number // Effective tax rate as percentage of gains
  gains: number // Total gains for the year (Zinsen)
  capital: number // End capital for the year
}

/**
 * Represents aggregated tax burden statistics over the entire simulation period
 */
export interface TaxBurdenAnalysis {
  yearlyData: YearlyTaxBurden[]
  totalTaxPaid: number
  totalVorabpauschale: number
  totalAllowanceUsed: number
  averageEffectiveTaxRate: number
  peakTaxYear: number | null // Year with highest tax burden
  peakTaxAmount: number
  totalGains: number
  totalCapital: number
}

/**
 * Analyzes tax burden from simulation results over time.
 * 
 * This function extracts and aggregates tax-related information from simulation results,
 * providing insights into:
 * - Annual tax payments (Kapitalertragsteuer)
 * - Vorabpauschale amounts per year
 * - Usage of tax allowances (Freibetrag)
 * - Effective tax rates
 * - Identification of peak tax years
 * 
 * @param simulationResult - The simulation results containing tax information for each year
 * @returns TaxBurdenAnalysis - Comprehensive tax burden analysis
 * 
 * @example
 * ```typescript
 * const analysis = analyzeTaxBurden(simulationResult)
 * console.log(`Peak tax year: ${analysis.peakTaxYear}`)
 * console.log(`Total tax paid: ${analysis.totalTaxPaid.toFixed(2)} €`)
 * ```
 */
export function analyzeTaxBurden(simulationResult: SimulationResult | undefined): TaxBurdenAnalysis {
  // Handle empty or undefined simulation results
  if (!simulationResult || Object.keys(simulationResult).length === 0) {
    return createEmptyAnalysis()
  }

  // Extract yearly tax burden data and accumulate totals
  const { yearlyData, totals, peakInfo } = processSimulationYears(simulationResult)

  // Calculate average effective tax rate
  const averageEffectiveTaxRate = totals.totalGains > 0 ? (totals.totalTaxPaid / totals.totalGains) * 100 : 0

  // Get total capital from last year
  const lastYearData = yearlyData[yearlyData.length - 1]
  const totalCapital = lastYearData?.capital || 0

  // Sort yearly data by year for consistent ordering
  yearlyData.sort((a, b) => a.year - b.year)

  return {
    yearlyData,
    totalTaxPaid: totals.totalTaxPaid,
    totalVorabpauschale: totals.totalVorabpauschale,
    totalAllowanceUsed: totals.totalAllowanceUsed,
    averageEffectiveTaxRate,
    peakTaxYear: peakInfo.peakTaxYear,
    peakTaxAmount: peakInfo.peakTaxAmount,
    totalGains: totals.totalGains,
    totalCapital,
  }
}

/**
 * Creates an empty tax burden analysis result
 */
function createEmptyAnalysis(): TaxBurdenAnalysis {
  return {
    yearlyData: [],
    totalTaxPaid: 0,
    totalVorabpauschale: 0,
    totalAllowanceUsed: 0,
    averageEffectiveTaxRate: 0,
    peakTaxYear: null,
    peakTaxAmount: 0,
    totalGains: 0,
    totalCapital: 0,
  }
}

/**
 * Processes simulation years and extracts tax burden data
 */
function processSimulationYears(simulationResult: SimulationResult) {
  const yearlyData: YearlyTaxBurden[] = []
  const totals = {
    totalTaxPaid: 0,
    totalVorabpauschale: 0,
    totalAllowanceUsed: 0,
    totalGains: 0,
  }
  const peakInfo = {
    peakTaxYear: null as number | null,
    peakTaxAmount: 0,
  }

  for (const [yearStr, yearData] of Object.entries(simulationResult)) {
    const yearBurden = extractYearlyTaxBurden(Number(yearStr), yearData)
    yearlyData.push(yearBurden)

    // Accumulate totals
    totals.totalTaxPaid += yearBurden.capitalGainsTax
    totals.totalVorabpauschale += yearBurden.vorabpauschale
    totals.totalAllowanceUsed += yearBurden.usedAllowance
    totals.totalGains += yearBurden.gains

    // Track peak tax year
    if (yearBurden.totalTaxBurden > peakInfo.peakTaxAmount) {
      peakInfo.peakTaxAmount = yearBurden.totalTaxBurden
      peakInfo.peakTaxYear = yearBurden.year
    }
  }

  return { yearlyData, totals, peakInfo }
}

/**
 * Extracts tax burden data for a single year
 */
function extractYearlyTaxBurden(year: number, yearData: SimulationResult[number]): YearlyTaxBurden {
  const capitalGainsTax = yearData.bezahlteSteuer || 0
  const vorabpauschale = yearData.vorabpauschale || 0
  const usedAllowance = yearData.genutzterFreibetrag || 0
  const gains = yearData.zinsen || 0
  const capital = yearData.endkapital || 0

  // Total tax burden includes both paid tax and vorabpauschale (which affects future taxation)
  const totalTaxBurden = capitalGainsTax

  // Calculate effective tax rate (tax as percentage of gains)
  // Avoid division by zero
  const effectiveTaxRate = gains > 0 ? (capitalGainsTax / gains) * 100 : 0

  return {
    year,
    capitalGainsTax,
    vorabpauschale,
    usedAllowance,
    totalTaxBurden,
    effectiveTaxRate,
    gains,
    capital,
  }
}

/**
 * Identifies years with above-average tax burden for optimization opportunities.
 * 
 * @param analysis - The tax burden analysis result
 * @param thresholdMultiplier - Multiplier for average to determine "high" tax burden (default: 1.2 = 20% above average)
 * @returns Array of years with high tax burden
 * 
 * @example
 * ```typescript
 * const highTaxYears = identifyHighTaxYears(analysis)
 * console.log(`Consider optimization in years: ${highTaxYears.join(', ')}`)
 * ```
 */
export function identifyHighTaxYears(analysis: TaxBurdenAnalysis, thresholdMultiplier = 1.2): number[] {
  if (analysis.yearlyData.length === 0) {
    return []
  }

  // Calculate average tax burden
  const averageTaxBurden =
    analysis.yearlyData.reduce((sum, year) => sum + year.totalTaxBurden, 0) / analysis.yearlyData.length

  // Find years above threshold
  return analysis.yearlyData
    .filter(year => year.totalTaxBurden > averageTaxBurden * thresholdMultiplier)
    .map(year => year.year)
    .sort((a, b) => a - b)
}

/**
 * Calculates cumulative tax burden over time.
 * Useful for visualizing how tax burden accumulates throughout the investment period.
 * 
 * @param analysis - The tax burden analysis result
 * @returns Array of { year, cumulativeTax } objects
 */
export function calculateCumulativeTaxBurden(
  analysis: TaxBurdenAnalysis,
): Array<{ year: number; cumulativeTax: number }> {
  let cumulative = 0
  return analysis.yearlyData.map(yearData => {
    cumulative += yearData.capitalGainsTax
    return {
      year: yearData.year,
      cumulativeTax: cumulative,
    }
  })
}

/**
 * Compares tax burden across multiple scenarios.
 * Useful for comparing different investment strategies or tax optimization approaches.
 * 
 * @param scenarios - Map of scenario name to simulation results
 * @returns Map of scenario name to tax burden analysis
 * 
 * @example
 * ```typescript
 * const comparison = compareTaxBurdenScenarios({
 *   'Conservative': conservativeSimulation,
 *   'Aggressive': aggressiveSimulation,
 * })
 * ```
 */
export function compareTaxBurdenScenarios(scenarios: {
  [scenarioName: string]: SimulationResult | undefined
}): { [scenarioName: string]: TaxBurdenAnalysis } {
  const results: { [scenarioName: string]: TaxBurdenAnalysis } = {}

  for (const [name, simulation] of Object.entries(scenarios)) {
    results[name] = analyzeTaxBurden(simulation)
  }

  return results
}
