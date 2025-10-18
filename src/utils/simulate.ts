import type { SparplanElement } from '../utils/sparplan-utils'
import { getBasiszinsForYear, calculateVorabpauschaleDetailed, performGuenstigerPruefung } from '../../helpers/steuer.tsx'
import { type ReturnConfiguration, generateRandomReturns } from './random-returns'
import type { BasiszinsConfiguration } from '../services/bundesbank-api'
import { getHistoricalReturns } from './historical-data'
import { calculateRealValue } from './inflation-adjustment'
import { generateMultiAssetReturns } from '../../helpers/multi-asset-calculations'

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
  costs: { terCosts: number, transactionCosts: number, totalCosts: number }
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
function getInflationRateForYear(
  year: number,
  options: SimulateOptions,
): number {
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
function applyVariableReturns(
  years: number[],
  yearlyReturns: Record<number, number>,
): Record<number, number> {
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
    random: years => returnConfig.randomConfig
      ? generateRandomReturns(years, returnConfig.randomConfig)
      : {},
    variable: years => returnConfig.variableConfig
      ? applyVariableReturns(years, returnConfig.variableConfig.yearlyReturns)
      : {},
    historical: (years) => {
      if (!returnConfig.historicalConfig) return applyFixedRate(years, 0.05)
      const historicalReturns = getHistoricalReturns(
        returnConfig.historicalConfig.indexId,
        years[0],
        years[years.length - 1],
      )
      return historicalReturns || applyFixedRate(years, 0.05)
    },
    multiasset: years => returnConfig.multiAssetConfig
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
  return (averageCapital * (element.ter / 100)) * (anteilImJahr / 12)
}

/**
 * Calculate transaction costs for first year
 */
function calculateTransactionCosts(
  element: SparplanElement,
  isFirstYear: boolean,
): number {
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
): { terCosts: number, transactionCosts: number, totalCosts: number } {
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
function getAdjustedEinzahlung(
  element: SparplanElement,
  year: number,
  options: SimulateOptions,
): number {
  const yearInflationRate = getInflationRateForYear(year, options)
  const shouldApplyInflation = (options.inflationAktivSparphase || options.variableInflationRates)
    && yearInflationRate > 0
    && (!options.inflationAnwendungSparphase || options.inflationAnwendungSparphase === 'sparplan')

  if (!shouldApplyInflation) {
    return element.einzahlung
  }

  return getInflationAdjustedContribution(
    element.einzahlung,
    options.startYear,
    year,
    yearInflationRate,
  )
}

function calculateEndkapital(
  startkapital: number,
  wachstumsrate: number,
  element: SparplanElement,
  year: number,
  simulationAnnual: SimulationAnnualType,
): { endkapitalVorSteuer: number, anteilImJahr: number } {
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

  const startkapital
    = element.simulation?.[year - 1]?.endkapital
      || adjustedEinzahlung + (element.type === 'einmalzahlung' ? element.gewinn : 0)

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

function calculateYearlySimulation(
  year: number,
  elements: SparplanElement[],
  wachstumsrate: number,
  options: SimulateOptions,
) {
  const {
    simulationAnnual,
    steuerlast,
    teilfreistellungsquote = 0.3,
    freibetragPerYear,
    steuerReduzierenEndkapital = true,
    basiszinsConfiguration,
  } = options
  const yearlyCalculations: YearlyCalculation[] = []
  let totalPotentialTaxThisYear = 0

  // If steuerlast is 0, we can skip all tax calculations
  if (steuerlast > 0) {
    const basiszins = getBasiszinsForYear(year, basiszinsConfiguration)

    // Pass 1: Calculate growth and potential tax for each element
    for (const element of elements) {
      if (new Date(element.start).getFullYear() > year) continue

      const {
        startkapital,
        endkapitalAfterCosts,
        jahresgewinn,
        anteilImJahr,
        costs,
      } = calculateGrowthAndCostsForElement(element, year, wachstumsrate, simulationAnnual, options)

      // Calculate detailed Vorabpauschale breakdown for transparency
      const vorabpauschaleDetails = calculateVorabpauschaleDetailed(
        startkapital,
        endkapitalAfterCosts, // Use capital after costs for tax calculation
        basiszins,
        anteilImJahr,
        steuerlast,
        teilfreistellungsquote,
      )

      const vorabpauschaleBetrag = vorabpauschaleDetails.vorabpauschaleAmount

      // Apply Günstigerprüfung if enabled
      let potentialTax = vorabpauschaleDetails.steuerVorFreibetrag
      let guenstigerPruefungResult = null

      if (options.guenstigerPruefungAktiv && options.personalTaxRate !== undefined) {
        guenstigerPruefungResult = performGuenstigerPruefung(
          vorabpauschaleBetrag,
          steuerlast,
          options.personalTaxRate / 100, // Convert percentage to decimal
          teilfreistellungsquote,
          0, // No Grundfreibetrag at element level - handled at aggregated level
          0,
        )

        // Use the more favorable tax amount
        if (guenstigerPruefungResult.isFavorable === 'personal') {
          potentialTax = guenstigerPruefungResult.personalTaxAmount
        }
        else {
          potentialTax = guenstigerPruefungResult.abgeltungssteuerAmount
        }
      }

      // Store Günstigerprüfung result in details for display
      const enhancedVorabpauschaleDetails = {
        ...vorabpauschaleDetails,
        guenstigerPruefungResult: guenstigerPruefungResult ? {
          abgeltungssteuerAmount: guenstigerPruefungResult.abgeltungssteuerAmount,
          personalTaxAmount: guenstigerPruefungResult.personalTaxAmount,
          usedTaxRate: guenstigerPruefungResult.usedTaxRate,
          isFavorable: guenstigerPruefungResult.isFavorable,
          explanation: guenstigerPruefungResult.explanation,
        } : undefined,
      }

      totalPotentialTaxThisYear += potentialTax
      yearlyCalculations.push({
        element,
        startkapital,
        endkapitalVorSteuer: endkapitalAfterCosts, // Use capital after costs
        jahresgewinn,
        vorabpauschaleBetrag,
        potentialTax,
        vorabpauschaleDetails: enhancedVorabpauschaleDetails,
        costs, // Store cost information
      })
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
  else {
    // No taxes to be calculated, just calculate growth and costs
    for (const element of elements) {
      if (new Date(element.start).getFullYear() > year) continue

      const {
        startkapital,
        endkapitalAfterCosts,
        costs,
      } = calculateGrowthAndCostsForElement(element, year, wachstumsrate, simulationAnnual, options)

      const vorabpauschaleAccumulated = (element.simulation[year - 1]?.vorabpauschaleAccumulated || 0)

      let endkapital = endkapitalAfterCosts

      // Apply inflation reduction to total capital in "gesamtmenge" mode
      const yearInflationRate = getInflationRateForYear(year, options)
      if ((options.inflationAktivSparphase || options.variableInflationRates)
        && yearInflationRate > 0
        && options.inflationAnwendungSparphase === 'gesamtmenge') {
        endkapital = endkapital * (1 - yearInflationRate)
      }

      // Calculate actual interest/gain after all adjustments (including inflation)
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

      // Add inflation-adjusted values if inflation is active
      const currentYearInflation = getInflationRateForYear(year, options)
      if ((options.inflationAktivSparphase || options.variableInflationRates) && currentYearInflation > 0) {
        simulationResult = addInflationAdjustedValues(
          simulationResult,
          year,
          options.startYear,
          currentYearInflation * 100, // Convert back to percentage for the helper
        )
      }

      element.simulation[year] = simulationResult
    }
  }
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
 * Apply inflation reduction to capital in "gesamtmenge" mode
 */
function applyInflationReduction(
  endkapital: number,
  year: number,
  options?: SimulateOptions,
): number {
  if (!options) return endkapital

  const yearInflationRate = getInflationRateForYear(year, options)
  const shouldApplyInflation = (options.inflationAktivSparphase || options.variableInflationRates)
    && yearInflationRate > 0
    && options.inflationAnwendungSparphase === 'gesamtmenge'

  if (shouldApplyInflation) {
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
): SimulationResultElement {
  const actualZinsen = endkapital - calc.startkapital
  const vorabpauschaleAccumulated
    = (calc.element.simulation[year - 1]?.vorabpauschaleAccumulated || 0)
      + calc.vorabpauschaleBetrag

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

  const freibetragInYear = getFreibetragForYear(year)
  const totalTaxPaid = Math.max(0, totalPotentialTaxThisYear - freibetragInYear)
  const genutzterFreibetragTotal = Math.min(totalPotentialTaxThisYear, freibetragInYear)

  for (const calc of yearlyCalculations) {
    const taxForElement = calculateProportionalTax(
      calc.potentialTax,
      totalPotentialTaxThisYear,
      totalTaxPaid,
    )
    const genutzterFreibetragForElement = calculateProportionalFreibetrag(
      calc.potentialTax,
      totalPotentialTaxThisYear,
      genutzterFreibetragTotal,
    )

    let endkapital = steuerReduzierenEndkapital
      ? calc.endkapitalVorSteuer - taxForElement
      : calc.endkapitalVorSteuer

    // Apply inflation reduction to total capital in "gesamtmenge" mode
    endkapital = applyInflationReduction(endkapital, year, _options)

    const simulationResult = createSimulationResult(
      calc,
      endkapital,
      taxForElement,
      genutzterFreibetragForElement,
      year,
      _options,
    )

    calc.element.simulation[year] = simulationResult
  }
}
