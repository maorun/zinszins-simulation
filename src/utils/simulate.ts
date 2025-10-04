import type { SparplanElement } from '../utils/sparplan-utils'
import { getBasiszinsForYear, calculateVorabpauschaleDetailed } from '../../helpers/steuer.tsx'
import { type ReturnConfiguration, generateRandomReturns } from './random-returns'
import type { BasiszinsConfiguration } from '../services/bundesbank-api'
import { getHistoricalReturns } from './historical-data'
import { calculateRealValue } from './inflation-adjustment'

export type VorabpauschaleDetails = {
  basiszins: number // Base interest rate for the year
  basisertrag: number // 70% of theoretical gain at base interest rate
  vorabpauschaleAmount: number // Final Vorabpauschale amount (min of basisertrag and actual gain)
  steuerVorFreibetrag: number // Tax on Vorabpauschale before allowance
  jahresgewinn: number // Actual gain for the year
  anteilImJahr: number // Fraction of year the investment was held
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

function generateYearlyGrowthRates(
  startYear: number,
  endYear: number,
  returnConfig: ReturnConfiguration,
): Record<number, number> {
  const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i)
  const yearlyGrowthRates: Record<number, number> = {}

  switch (returnConfig.mode) {
    case 'fixed': {
      const fixedRate = returnConfig.fixedRate ?? 0.05
      for (const year of years) {
        yearlyGrowthRates[year] = fixedRate
      }
      break
    }
    case 'random': {
      if (returnConfig.randomConfig) {
        const randomReturns = generateRandomReturns(years, returnConfig.randomConfig)
        Object.assign(yearlyGrowthRates, randomReturns)
      }
      break
    }
    case 'variable': {
      if (returnConfig.variableConfig) {
        for (const year of years) {
          yearlyGrowthRates[year] = returnConfig.variableConfig.yearlyReturns[year] ?? 0.05
        }
      }
      break
    }
    case 'historical': {
      if (returnConfig.historicalConfig) {
        const historicalReturns = getHistoricalReturns(
          returnConfig.historicalConfig.indexId,
          startYear,
          endYear,
        )
        if (historicalReturns) {
          Object.assign(yearlyGrowthRates, historicalReturns)
        }
        else {
          // Fallback to 5% if historical data is not available
          for (const year of years) {
            yearlyGrowthRates[year] = 0.05
          }
        }
      }
      break
    }
  }

  return yearlyGrowthRates
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

function calculateCosts(
  element: SparplanElement,
  startkapital: number,
  endkapitalVorKosten: number,
  year: number,
  anteilImJahr: number,
): { terCosts: number, transactionCosts: number, totalCosts: number } {
  const isFirstYear = !element.simulation?.[year - 1]?.endkapital

  // TER costs: annual percentage of average capital during year
  let terCosts = 0
  if (element.ter && element.ter > 0) {
    // A more accurate average capital for the year
    const averageCapital = (startkapital + endkapitalVorKosten) / 2
    terCosts = (averageCapital * (element.ter / 100)) * (anteilImJahr / 12)
  }

  // Transaction costs: only applied in first year when investment is made
  let transactionCosts = 0
  if (isFirstYear) {
    const investmentAmount = element.einzahlung

    // Percentage-based transaction costs
    if (element.transactionCostPercent && element.transactionCostPercent > 0) {
      transactionCosts += investmentAmount * (element.transactionCostPercent / 100)
    }

    // Absolute transaction costs
    if (element.transactionCostAbsolute && element.transactionCostAbsolute > 0) {
      transactionCosts += element.transactionCostAbsolute
    }
  }

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
function calculateGrowthAndCostsForElement(
  element: SparplanElement,
  year: number,
  wachstumsrate: number,
  simulationAnnual: SimulationAnnualType,
  options: SimulateOptions,
) {
  // Apply inflation adjustment to contributions if enabled and in Sparplan mode (default)
  let adjustedEinzahlung = element.einzahlung
  if (options.inflationAktivSparphase
    && options.inflationsrateSparphase
    && options.inflationsrateSparphase > 0
    && (!options.inflationAnwendungSparphase || options.inflationAnwendungSparphase === 'sparplan')) {
    const inflationRate = options.inflationsrateSparphase / 100
    const baseYear = options.startYear
    adjustedEinzahlung = getInflationAdjustedContribution(
      element.einzahlung,
      baseYear,
      year,
      inflationRate,
    )
  }

  const startkapital
    = element.simulation?.[year - 1]?.endkapital
      || adjustedEinzahlung + (element.type === 'einmalzahlung' ? element.gewinn : 0)

  let endkapitalVorSteuer: number
  let anteilImJahr = 12

  if (simulationAnnual === 'monthly' && new Date(element.start).getFullYear() === year) {
    const wachstumsrateMonth = Math.pow(1 + wachstumsrate, 1 / 12) - 1
    const startMonth = new Date(element.start).getMonth()
    anteilImJahr = 12 - startMonth
    endkapitalVorSteuer = startkapital * Math.pow(1 + wachstumsrateMonth, anteilImJahr)
  }
  else {
    endkapitalVorSteuer = startkapital * (1 + wachstumsrate)
  }

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
  const yearlyCalculations: any[] = []
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
      const potentialTax = vorabpauschaleDetails.steuerVorFreibetrag

      totalPotentialTaxThisYear += potentialTax
      yearlyCalculations.push({
        element,
        startkapital,
        endkapitalVorSteuer: endkapitalAfterCosts, // Use capital after costs
        jahresgewinn,
        vorabpauschaleBetrag,
        potentialTax,
        vorabpauschaleDetails,
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
      if (options.inflationAktivSparphase
        && options.inflationsrateSparphase
        && options.inflationsrateSparphase > 0
        && options.inflationAnwendungSparphase === 'gesamtmenge') {
        const inflationRate = options.inflationsrateSparphase / 100
        endkapital = endkapital * (1 - inflationRate)
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
      if (options.inflationAktivSparphase && options.inflationsrateSparphase) {
        simulationResult = addInflationAdjustedValues(
          simulationResult,
          year,
          options.startYear,
          options.inflationsrateSparphase,
        )
      }

      element.simulation[year] = simulationResult
    }
  }
}

function applyTaxes(
  year: number,
  yearlyCalculations: any[],
  totalPotentialTaxThisYear: number,
  freibetragPerYear?: { [year: number]: number },
  steuerReduzierenEndkapital: boolean = true,
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
    const taxForElement
      = totalPotentialTaxThisYear > 0
        ? (calc.potentialTax / totalPotentialTaxThisYear) * totalTaxPaid
        : 0
    const genutzterFreibetragForElement
      = totalPotentialTaxThisYear > 0
        ? (calc.potentialTax / totalPotentialTaxThisYear) * genutzterFreibetragTotal
        : 0

    let endkapital = steuerReduzierenEndkapital
      ? calc.endkapitalVorSteuer - taxForElement
      : calc.endkapitalVorSteuer

    // Apply inflation reduction to total capital in "gesamtmenge" mode
    if (_options?.inflationAktivSparphase
      && _options?.inflationsrateSparphase
      && _options?.inflationsrateSparphase > 0
      && _options?.inflationAnwendungSparphase === 'gesamtmenge') {
      const inflationRate = _options.inflationsrateSparphase / 100
      endkapital = endkapital * (1 - inflationRate)
    }

    // Calculate actual interest/gain after all adjustments (including inflation and taxes)
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
    if (_options?.inflationAktivSparphase && _options?.inflationsrateSparphase) {
      simulationResult = addInflationAdjustedValues(
        simulationResult,
        year,
        _options.startYear,
        _options.inflationsrateSparphase,
      )
    }

    calc.element.simulation[year] = simulationResult
  }
}
