import type { SparplanElement } from '../utils/sparplan-utils'
import { getBasiszinsForYear, calculateVorabpauschaleDetailed, performGuenstigerPruefung } from '../../helpers/steuer'
import { type ReturnConfiguration, generateRandomReturns } from './random-returns'
import type { BasiszinsConfiguration } from '../services/bundesbank-api'
import { getHistoricalReturns } from './historical-data'
import { calculateRealValue } from './inflation-adjustment'
import { generateMultiAssetReturns } from '../../helpers/multi-asset-calculations'
import {
  type LossAccountState,
  type RealizedLossesConfig,
  type LossOffsetResult,
  calculateLossOffset,
  createInitialLossAccountState,
  createDefaultRealizedLosses,
} from '../../helpers/loss-offset-accounts'

export type VorabpauschaleDetails = {
  basiszins: number // Base interest rate for the year
  basisertrag: number // 70% of theoretical gain at base interest rate
  vorabpauschaleAmount: number // Final Vorabpauschale amount (min of basisertrag and actual gain)
  steuerVorFreibetrag: number // Tax on Vorabpauschale before allowance
  jahresgewinn: number // Actual gain for the year
  anteilImJahr: number // Fraction of year the investment was held
  // Günstigerprüfung information
  guenstigerPruefungResult?: {
    abgeltungssteuerAmount: number
    personalTaxAmount: number
    usedTaxRate: number
    isFavorable: 'abgeltungssteuer' | 'personal' | 'equal'
    explanation: string
  }
}

type YearlyCalculation = {
  element: SparplanElement
  startkapital: number
  endkapitalVorSteuer: number
  jahresgewinn: number
  vorabpauschaleBetrag: number
  potentialTax: number
  vorabpauschaleDetails: VorabpauschaleDetails
  costs: { terCosts: number; transactionCosts: number; totalCosts: number }
}

export type SimulationResultElement = {
  startkapital: number
  zinsen: number
  endkapital: number
  bezahlteSteuer: number
  genutzterFreibetrag: number
  vorabpauschale: number // The Vorabpauschale amount for this year
  vorabpauschaleAccumulated: number // The accumulated Vorabpauschale over all years
  vorabpauschaleDetails?: VorabpauschaleDetails // Detailed breakdown of the calculation
  terCosts?: number // TER costs for this year
  transactionCosts?: number // Transaction costs for this year
  totalCosts?: number // Total costs for this year (TER + transaction costs)
  // Inflation-adjusted values (real purchasing power)
  startkapitalReal?: number // Real value of starting capital
  zinsenReal?: number // Real value of interest/gains
  endkapitalReal?: number // Real value of ending capital
  // Loss offset tracking (Verlustverrechnungstöpfe)
  lossOffsetDetails?: LossOffsetResult // Details of loss offset for this year
  lossAccountState?: LossAccountState // Loss account state at end of year (carried forward to next year)
}

export type SimulationResult = {
  [year: number]: SimulationResultElement
}

const freibetrag: {
  [year: number]: number
} = {
  2023: 2000,
}

export const SimulationAnnual: {
  [key in SimulationAnnualType]: SimulationAnnualType
} = {
  yearly: 'yearly',
  monthly: 'monthly',
} as const

export type SimulationAnnualType = 'yearly' | 'monthly'

export interface SimulateOptions {
  startYear: number
  endYear: number
  elements: SparplanElement[]
  returnConfig: ReturnConfiguration
  steuerlast: number
  simulationAnnual: SimulationAnnualType
  teilfreistellungsquote?: number
  freibetragPerYear?: { [year: number]: number }
  steuerReduzierenEndkapital?: boolean
  basiszinsConfiguration?: BasiszinsConfiguration
  // Inflation settings for savings phase
  inflationAktivSparphase?: boolean
  inflationsrateSparphase?: number
  inflationAnwendungSparphase?: 'sparplan' | 'gesamtmenge'
  // Variable inflation rates per year (for inflation scenarios)
  variableInflationRates?: Record<number, number>
  // Günstigerprüfung settings
  guenstigerPruefungAktiv?: boolean
  personalTaxRate?: number
  // Loss offset account settings (Verlustverrechnungstöpfe)
  lossOffsetEnabled?: boolean
  initialLossAccountState?: LossAccountState // Losses carried forward from before simulation start
  realizedLossesByYear?: Record<number, RealizedLossesConfig> // Realized losses per year
  stockGainsRatio?: number // Ratio of capital gains from stocks (0-1, default 0.7 for typical equity funds)
}

// Helper function to add inflation-adjusted values to simulation result
function addInflationAdjustedValues(
  result: SimulationResultElement,
  year: number,
  baseYear: number,
  inflationRate: number,
): SimulationResultElement {
  if (inflationRate <= 0) {
    return result
  }

  const yearsFromBase = year - baseYear
  return {
    ...result,
    startkapitalReal: calculateRealValue(result.startkapital, inflationRate / 100, yearsFromBase),
    zinsenReal: calculateRealValue(result.zinsen, inflationRate / 100, yearsFromBase),
    endkapitalReal: calculateRealValue(result.endkapital, inflationRate / 100, yearsFromBase),
  }
}

// Helper function to get inflation rate for a specific year
function getInflationRateForYear(year: number, options: SimulateOptions): number {
  // Use variable inflation rates if provided
  if (options.variableInflationRates && options.variableInflationRates[year] !== undefined) {
    return options.variableInflationRates[year]
  }

  // Fall back to fixed inflation rate
  if (options.inflationAktivSparphase && options.inflationsrateSparphase) {
    return options.inflationsrateSparphase / 100
  }

  return 0
}

/**
 * Apply fixed rate to all years
 */
function applyFixedRate(years: number[], fixedRate: number): Record<number, number> {
  const rates: Record<number, number> = {}
  for (const year of years) {
    rates[year] = fixedRate
  }
  return rates
}

/**
 * Apply variable returns to years
 */
function applyVariableReturns(years: number[], yearlyReturns: Record<number, number>): Record<number, number> {
  const rates: Record<number, number> = {}
  for (const year of years) {
    rates[year] = yearlyReturns[year] ?? 0.05
  }
  return rates
}

type ReturnGenerator = (years: number[]) => Record<number, number>

function getReturnGenerator(returnConfig: ReturnConfiguration): ReturnGenerator {
  const generators: Record<string, ReturnGenerator | undefined> = {
    fixed: years => applyFixedRate(years, returnConfig.fixedRate ?? 0.05),
    random: years => (returnConfig.randomConfig ? generateRandomReturns(years, returnConfig.randomConfig) : {}),
    variable: years =>
      returnConfig.variableConfig ? applyVariableReturns(years, returnConfig.variableConfig.yearlyReturns) : {},
    historical: years => {
      if (!returnConfig.historicalConfig) return applyFixedRate(years, 0.05)
      const historicalReturns = getHistoricalReturns(
        returnConfig.historicalConfig.indexId,
        years[0],
        years[years.length - 1],
      )
      return historicalReturns || applyFixedRate(years, 0.05)
    },
    multiasset: years =>
      returnConfig.multiAssetConfig
        ? generateMultiAssetReturns(years, returnConfig.multiAssetConfig)
        : applyFixedRate(years, 0.05),
  }

  return generators[returnConfig.mode] || (years => applyFixedRate(years, 0.05))
}

function generateYearlyGrowthRates(
  startYear: number,
  endYear: number,
  returnConfig: ReturnConfiguration,
): Record<number, number> {
  const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i)
  const generator = getReturnGenerator(returnConfig)
  return generator(years)
}

// Implementation
export function simulate(options: SimulateOptions): SparplanElement[] {
  const { elements, startYear, endYear, returnConfig } = options

  const yearlyGrowthRates = generateYearlyGrowthRates(startYear, endYear, returnConfig)

  // Clear previous simulations
  for (const element of elements) {
    element.simulation = {}
  }

  // Main simulation loop
  for (let year = startYear; year <= endYear; year++) {
    calculateYearlySimulation(year, elements, yearlyGrowthRates[year], options)
  }

  return elements
}

/**
 * Calculate TER costs for the year
 */
function calculateTERCosts(
  element: SparplanElement,
  startkapital: number,
  endkapitalVorKosten: number,
  anteilImJahr: number,
): number {
  if (!element.ter || element.ter <= 0) {
    return 0
  }
  const averageCapital = (startkapital + endkapitalVorKosten) / 2
  return averageCapital * (element.ter / 100) * (anteilImJahr / 12)
}

/**
 * Calculate transaction costs for first year
 */
function calculateTransactionCosts(element: SparplanElement, isFirstYear: boolean): number {
  if (!isFirstYear) {
    return 0
  }

  const investmentAmount = element.einzahlung
  let costs = 0

  // Percentage-based transaction costs
  if (element.transactionCostPercent && element.transactionCostPercent > 0) {
    costs += investmentAmount * (element.transactionCostPercent / 100)
  }

  // Absolute transaction costs
  if (element.transactionCostAbsolute && element.transactionCostAbsolute > 0) {
    costs += element.transactionCostAbsolute
  }

  return costs
}

function calculateCosts(
  element: SparplanElement,
  startkapital: number,
  endkapitalVorKosten: number,
  year: number,
  anteilImJahr: number,
): { terCosts: number; transactionCosts: number; totalCosts: number } {
  const isFirstYear = !element.simulation?.[year - 1]?.endkapital

  const terCosts = calculateTERCosts(element, startkapital, endkapitalVorKosten, anteilImJahr)
  const transactionCosts = calculateTransactionCosts(element, isFirstYear)
  const totalCosts = terCosts + transactionCosts

  return { terCosts, transactionCosts, totalCosts }
}

// Helper function to calculate inflation-adjusted contribution amount
function getInflationAdjustedContribution(
  originalAmount: number,
  baseYear: number,
  currentYear: number,
  inflationRate: number,
): number {
  if (inflationRate <= 0) return originalAmount
  const yearsPassed = currentYear - baseYear
  if (yearsPassed <= 0) return originalAmount
  return originalAmount * Math.pow(1 + inflationRate, yearsPassed)
}

// Helper function to calculate growth and costs for a single element in a year
function getAdjustedEinzahlung(element: SparplanElement, year: number, options: SimulateOptions): number {
  const yearInflationRate = getInflationRateForYear(year, options)
  const shouldApplyInflation =
    (options.inflationAktivSparphase || options.variableInflationRates) &&
    yearInflationRate > 0 &&
    (!options.inflationAnwendungSparphase || options.inflationAnwendungSparphase === 'sparplan')

  if (!shouldApplyInflation) {
    return element.einzahlung
  }

  return getInflationAdjustedContribution(element.einzahlung, options.startYear, year, yearInflationRate)
}

function calculateEndkapital(
  startkapital: number,
  wachstumsrate: number,
  element: SparplanElement,
  year: number,
  simulationAnnual: SimulationAnnualType,
): { endkapitalVorSteuer: number; anteilImJahr: number } {
  const isFirstYear = new Date(element.start).getFullYear() === year

  if (simulationAnnual === 'monthly' && isFirstYear) {
    const wachstumsrateMonth = Math.pow(1 + wachstumsrate, 1 / 12) - 1
    const startMonth = new Date(element.start).getMonth()
    const anteilImJahr = 12 - startMonth
    const endkapitalVorSteuer = startkapital * Math.pow(1 + wachstumsrateMonth, anteilImJahr)
    return { endkapitalVorSteuer, anteilImJahr }
  }

  return {
    endkapitalVorSteuer: startkapital * (1 + wachstumsrate),
    anteilImJahr: 12,
  }
}

function calculateGrowthAndCostsForElement(
  element: SparplanElement,
  year: number,
  wachstumsrate: number,
  simulationAnnual: SimulationAnnualType,
  options: SimulateOptions,
) {
  // Apply inflation adjustment to contributions if enabled and in Sparplan mode (default)
  const adjustedEinzahlung = getAdjustedEinzahlung(element, year, options)

  const startkapital =
    element.simulation?.[year - 1]?.endkapital ||
    adjustedEinzahlung + (element.type === 'einmalzahlung' ? element.gewinn : 0)

  const { endkapitalVorSteuer, anteilImJahr } = calculateEndkapital(
    startkapital,
    wachstumsrate,
    element,
    year,
    simulationAnnual,
  )

  const costs = calculateCosts(element, startkapital, endkapitalVorSteuer, year, anteilImJahr)
  const endkapitalAfterCosts = endkapitalVorSteuer - costs.totalCosts
  const jahresgewinn = endkapitalAfterCosts - startkapital

  return {
    startkapital,
    endkapitalAfterCosts,
    jahresgewinn,
    anteilImJahr,
    costs,
  }
}

/**
 * Strategy interface for different simulation paths
 */
interface YearlySimulationStrategy {
  calculateForYear(year: number, elements: SparplanElement[], wachstumsrate: number, options: SimulateOptions): void
}

/**
 * Process a single element for yearly tax calculation
 */
function processElementForTaxCalculation(
  element: SparplanElement,
  year: number,
  wachstumsrate: number,
  basiszins: number,
  options: SimulateOptions,
): YearlyCalculation | null {
  if (!shouldProcessElement(element, year)) return null

  const { simulationAnnual, steuerlast, teilfreistellungsquote = 0.3 } = options

  const { startkapital, endkapitalAfterCosts, jahresgewinn, anteilImJahr, costs } = calculateGrowthAndCostsForElement(
    element,
    year,
    wachstumsrate,
    simulationAnnual,
    options,
  )

  const vorabpauschaleDetails = calculateVorabpauschaleDetailed(
    startkapital,
    endkapitalAfterCosts,
    basiszins,
    anteilImJahr,
    steuerlast,
    teilfreistellungsquote,
  )

  const vorabpauschaleBetrag = vorabpauschaleDetails.vorabpauschaleAmount
  const { potentialTax, enhancedDetails } = calculateGuenstigerPruefung(
    vorabpauschaleDetails,
    vorabpauschaleBetrag,
    options,
    steuerlast,
    teilfreistellungsquote,
  )

  return {
    element,
    startkapital,
    endkapitalVorSteuer: endkapitalAfterCosts,
    jahresgewinn,
    vorabpauschaleBetrag,
    potentialTax,
    vorabpauschaleDetails: enhancedDetails,
    costs,
  }
}

/**
 * Strategy for simulations with tax calculations
 */
class TaxSimulationStrategy implements YearlySimulationStrategy {
  calculateForYear(year: number, elements: SparplanElement[], wachstumsrate: number, options: SimulateOptions): void {
    const { freibetragPerYear, steuerReduzierenEndkapital = true, basiszinsConfiguration } = options

    const basiszins = getBasiszinsForYear(year, basiszinsConfiguration)
    const yearlyCalculations: YearlyCalculation[] = []
    let totalPotentialTaxThisYear = 0

    // Pass 1: Calculate growth and potential tax for each element
    for (const element of elements) {
      const calculation = processElementForTaxCalculation(element, year, wachstumsrate, basiszins, options)

      if (calculation) {
        totalPotentialTaxThisYear += calculation.potentialTax
        yearlyCalculations.push(calculation)
      }
    }

    // Pass 2: Apply taxes
    applyTaxes(
      year,
      yearlyCalculations,
      totalPotentialTaxThisYear,
      freibetragPerYear,
      steuerReduzierenEndkapital,
      options,
    )
  }
}

/**
 * Strategy for simulations without tax calculations
 */
class NoTaxSimulationStrategy implements YearlySimulationStrategy {
  calculateForYear(year: number, elements: SparplanElement[], wachstumsrate: number, options: SimulateOptions): void {
    const { simulationAnnual } = options

    for (const element of elements) {
      if (!shouldProcessElement(element, year)) continue

      const { startkapital, endkapitalAfterCosts, costs } = calculateGrowthAndCostsForElement(
        element,
        year,
        wachstumsrate,
        simulationAnnual,
        options,
      )

      const vorabpauschaleAccumulated = element.simulation[year - 1]?.vorabpauschaleAccumulated || 0
      const yearInflationRate = getInflationRateForYear(year, options)

      let endkapital = endkapitalAfterCosts
      if (shouldApplyInflationReduction(yearInflationRate, options)) {
        endkapital = endkapital * (1 - yearInflationRate)
      }

      const actualZinsen = endkapital - startkapital

      let simulationResult: SimulationResultElement = {
        startkapital,
        endkapital,
        zinsen: actualZinsen,
        bezahlteSteuer: 0,
        genutzterFreibetrag: 0,
        vorabpauschale: 0,
        vorabpauschaleAccumulated,
        terCosts: costs.terCosts,
        transactionCosts: costs.transactionCosts,
        totalCosts: costs.totalCosts,
      }

      if (shouldAddInflationAdjustedValues(yearInflationRate, options)) {
        simulationResult = addInflationAdjustedValues(
          simulationResult,
          year,
          options.startYear,
          yearInflationRate * 100,
        )
      }

      element.simulation[year] = simulationResult
    }
  }
}

/**
 * Factory function to get the appropriate simulation strategy
 */
function getSimulationStrategy(steuerlast: number): YearlySimulationStrategy {
  return steuerlast > 0 ? new TaxSimulationStrategy() : new NoTaxSimulationStrategy()
}

function calculateYearlySimulation(
  year: number,
  elements: SparplanElement[],
  wachstumsrate: number,
  options: SimulateOptions,
) {
  const strategy = getSimulationStrategy(options.steuerlast)
  strategy.calculateForYear(year, elements, wachstumsrate, options)
}

/**
 * Check if an element should be processed for a given year
 */
function shouldProcessElement(element: SparplanElement, year: number): boolean {
  return new Date(element.start).getFullYear() <= year
}

/**
 * Calculate and enhance Günstigerprüfung details if enabled
 */
function calculateGuenstigerPruefung(
  vorabpauschaleDetails: VorabpauschaleDetails,
  vorabpauschaleBetrag: number,
  options: SimulateOptions,
  steuerlast: number,
  teilfreistellungsquote: number,
): { potentialTax: number; enhancedDetails: VorabpauschaleDetails } {
  let potentialTax = vorabpauschaleDetails.steuerVorFreibetrag
  let guenstigerPruefungResult = null

  if (options.guenstigerPruefungAktiv) {
    // When Günstigerprüfung is active, always use progressive tax
    const USE_PROGRESSIVE_TAX = true
    const KIRCHENSTEUER_AKTIV = false
    const DEFAULT_KIRCHENSTEUERSATZ = 9
    
    guenstigerPruefungResult = performGuenstigerPruefung(
      vorabpauschaleBetrag,
      steuerlast,
      undefined, // personalTaxRate not needed when using progressive tax
      teilfreistellungsquote,
      0, // grundfreibetrag
      0, // alreadyUsedGrundfreibetrag
      KIRCHENSTEUER_AKTIV,
      DEFAULT_KIRCHENSTEUERSATZ,
      USE_PROGRESSIVE_TAX,
    )

    // Use the more favorable tax amount
    if (guenstigerPruefungResult.isFavorable === 'personal') {
      potentialTax = guenstigerPruefungResult.personalTaxAmount
    } else {
      potentialTax = guenstigerPruefungResult.abgeltungssteuerAmount
    }
  }

  const enhancedDetails = {
    ...vorabpauschaleDetails,
    guenstigerPruefungResult: guenstigerPruefungResult
      ? {
          abgeltungssteuerAmount: guenstigerPruefungResult.abgeltungssteuerAmount,
          personalTaxAmount: guenstigerPruefungResult.personalTaxAmount,
          usedTaxRate: guenstigerPruefungResult.usedTaxRate,
          isFavorable: guenstigerPruefungResult.isFavorable,
          explanation: guenstigerPruefungResult.explanation,
        }
      : undefined,
  }

  return { potentialTax, enhancedDetails }
}

/**
 * Calculate proportional tax distribution for an element
 */
function calculateProportionalTax(
  elementPotentialTax: number,
  totalPotentialTax: number,
  totalTaxPaid: number,
): number {
  if (totalPotentialTax === 0) return 0
  return (elementPotentialTax / totalPotentialTax) * totalTaxPaid
}

/**
 * Calculate proportional Freibetrag usage for an element
 */
function calculateProportionalFreibetrag(
  elementPotentialTax: number,
  totalPotentialTax: number,
  totalFreibetragUsed: number,
): number {
  if (totalPotentialTax === 0) return 0
  return (elementPotentialTax / totalPotentialTax) * totalFreibetragUsed
}

/**
 * Check if inflation should be applied in "gesamtmenge" mode
 */
function shouldApplyInflationReduction(yearInflationRate: number, options?: SimulateOptions): boolean {
  if (!options) return false
  return (
    !!(options.inflationAktivSparphase || options.variableInflationRates) &&
    yearInflationRate > 0 &&
    options.inflationAnwendungSparphase === 'gesamtmenge'
  )
}

/**
 * Check if inflation-adjusted values should be added to result
 */
function shouldAddInflationAdjustedValues(yearInflationRate: number, options?: SimulateOptions): boolean {
  if (!options) return false
  return !!(options.inflationAktivSparphase || options.variableInflationRates) && yearInflationRate > 0
}

/**
 * Apply inflation reduction to capital in "gesamtmenge" mode
 */
function applyInflationReduction(endkapital: number, year: number, options?: SimulateOptions): number {
  if (!options) return endkapital

  const yearInflationRate = getInflationRateForYear(year, options)
  if (shouldApplyInflationReduction(yearInflationRate, options)) {
    return endkapital * (1 - yearInflationRate)
  }
  return endkapital
}

/**
 * Create simulation result element with all calculated values
 */
function createSimulationResult(
  calc: YearlyCalculation,
  endkapital: number,
  taxForElement: number,
  genutzterFreibetragForElement: number,
  year: number,
  options?: SimulateOptions,
  lossOffsetResult?: LossOffsetResult,
  lossAccountState?: LossAccountState,
): SimulationResultElement {
  const actualZinsen = endkapital - calc.startkapital
  const vorabpauschaleAccumulated =
    (calc.element.simulation[year - 1]?.vorabpauschaleAccumulated || 0) + calc.vorabpauschaleBetrag

  let simulationResult: SimulationResultElement = {
    startkapital: calc.startkapital,
    endkapital,
    zinsen: actualZinsen,
    bezahlteSteuer: taxForElement,
    genutzterFreibetrag: genutzterFreibetragForElement,
    vorabpauschale: calc.vorabpauschaleBetrag,
    vorabpauschaleAccumulated,
    vorabpauschaleDetails: calc.vorabpauschaleDetails,
    terCosts: calc.costs.terCosts,
    transactionCosts: calc.costs.transactionCosts,
    totalCosts: calc.costs.totalCosts,
    lossOffsetDetails: lossOffsetResult,
    lossAccountState,
  }

  // Add inflation-adjusted values if inflation is active
  if (options?.inflationAktivSparphase && options?.inflationsrateSparphase) {
    simulationResult = addInflationAdjustedValues(
      simulationResult,
      year,
      options.startYear,
      options.inflationsrateSparphase,
    )
  }

  return simulationResult
}

/**
 * Get the loss account state from the previous year
 */
function getPreviousLossState(
  year: number,
  yearlyCalculations: YearlyCalculation[],
  options: SimulateOptions,
): LossAccountState {
  const previousYear = year - 1

  if (yearlyCalculations.length > 0 && yearlyCalculations[0].element.simulation[previousYear]?.lossAccountState) {
    return yearlyCalculations[0].element.simulation[previousYear]!.lossAccountState!
  }

  if (previousYear < options.startYear && options.initialLossAccountState) {
    return options.initialLossAccountState
  }

  return createInitialLossAccountState(previousYear)
}

/**
 * Calculate total capital gains and Vorabpauschale from all elements
 */
function calculateTotalGainsAndVorabpauschale(yearlyCalculations: YearlyCalculation[]): {
  totalCapitalGains: number
  totalVorabpauschale: number
} {
  let totalCapitalGains = 0
  let totalVorabpauschale = 0

  for (const calc of yearlyCalculations) {
    totalCapitalGains += calc.jahresgewinn
    totalVorabpauschale += calc.vorabpauschaleBetrag
  }

  return { totalCapitalGains, totalVorabpauschale }
}

/**
 * Calculate loss offset for the entire portfolio for a given year
 * This function applies German loss offset rules at the portfolio level
 */
function calculatePortfolioLossOffset(
  year: number,
  yearlyCalculations: YearlyCalculation[],
  options: SimulateOptions,
): { lossOffsetResult: LossOffsetResult; adjustedTaxableIncome: number } | null {
  // Return null if loss offset is not enabled
  if (!options.lossOffsetEnabled) {
    return null
  }

  // Get previous year's loss account state
  const previousLossState = getPreviousLossState(year, yearlyCalculations, options)

  // Get realized losses for this year
  const realizedLosses = options.realizedLossesByYear?.[year] || createDefaultRealizedLosses(year)

  // Calculate total capital gains and Vorabpauschale
  const { totalCapitalGains, totalVorabpauschale } = calculateTotalGainsAndVorabpauschale(yearlyCalculations)

  // Split capital gains into stock gains and other gains
  // Use stockGainsRatio to determine what portion of gains are from stocks
  const stockGainsRatio = options.stockGainsRatio ?? 0.7 // Default: 70% stock gains (typical for equity funds)
  const stockGains = totalCapitalGains * stockGainsRatio
  const otherGains = totalCapitalGains * (1 - stockGainsRatio)

  // Calculate effective tax rate (Kapitalertragsteuer × (1 - Teilfreistellung))
  const teilfreistellungsquote = options.teilfreistellungsquote ?? 0.3
  const effectiveTaxRate = options.steuerlast * (1 - teilfreistellungsquote)

  // Calculate loss offset
  const lossOffsetResult = calculateLossOffset(
    previousLossState,
    realizedLosses,
    stockGains,
    otherGains,
    totalVorabpauschale,
    effectiveTaxRate,
    year,
  )

  return {
    lossOffsetResult,
    adjustedTaxableIncome: lossOffsetResult.taxableIncomeAfterOffset,
  }
}

/**
 * Calculate adjusted total tax after applying loss offset
 */
function calculateAdjustedTotalTax(
  totalPotentialTaxThisYear: number,
  lossOffsetData: { lossOffsetResult: LossOffsetResult; adjustedTaxableIncome: number } | null,
  options?: SimulateOptions,
): number {
  if (!lossOffsetData || !lossOffsetData.lossOffsetResult) {
    return totalPotentialTaxThisYear
  }

  // Recalculate tax based on adjusted taxable income after loss offset
  const teilfreistellungsquote = options?.teilfreistellungsquote ?? 0.3
  const effectiveTaxRate = (options?.steuerlast ?? 0.26375) * (1 - teilfreistellungsquote)
  return lossOffsetData.adjustedTaxableIncome * effectiveTaxRate
}

function applyTaxes(
  year: number,
  yearlyCalculations: YearlyCalculation[],
  totalPotentialTaxThisYear: number,
  freibetragPerYear?: { [year: number]: number },
  steuerReduzierenEndkapital = true,
  _options?: SimulateOptions,
) {
  const getFreibetragForYear = (year: number): number => {
    if (freibetragPerYear && freibetragPerYear[year] !== undefined) {
      return freibetragPerYear[year]
    }
    return freibetrag[2023] || 2000
  }

  // Calculate loss offset if enabled
  const lossOffsetData = _options ? calculatePortfolioLossOffset(year, yearlyCalculations, _options) : null

  // Adjust taxable income based on loss offset
  const adjustedTotalTax = calculateAdjustedTotalTax(totalPotentialTaxThisYear, lossOffsetData, _options)

  const freibetragInYear = getFreibetragForYear(year)
  const totalTaxPaid = Math.max(0, adjustedTotalTax - freibetragInYear)
  const genutzterFreibetragTotal = Math.min(adjustedTotalTax, freibetragInYear)

  for (const calc of yearlyCalculations) {
    // Calculate proportional tax and Freibetrag based on adjusted total
    const taxForElement = calculateProportionalTax(calc.potentialTax, totalPotentialTaxThisYear, totalTaxPaid)
    const genutzterFreibetragForElement = calculateProportionalFreibetrag(
      calc.potentialTax,
      totalPotentialTaxThisYear,
      genutzterFreibetragTotal,
    )

    let endkapital = steuerReduzierenEndkapital ? calc.endkapitalVorSteuer - taxForElement : calc.endkapitalVorSteuer

    // Apply inflation reduction to total capital in "gesamtmenge" mode
    endkapital = applyInflationReduction(endkapital, year, _options)

    const simulationResult = createSimulationResult(
      calc,
      endkapital,
      taxForElement,
      genutzterFreibetragForElement,
      year,
      _options,
      lossOffsetData?.lossOffsetResult,
      lossOffsetData?.lossOffsetResult.remainingLosses,
    )

    calc.element.simulation[year] = simulationResult
  }
}
