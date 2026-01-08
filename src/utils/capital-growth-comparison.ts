/**
 * Helper functions for Capital Growth Scenario Comparison
 * (Kapitalwertentwicklungs-Szenario-Vergleich)
 *
 * Provides calculation and analysis functions for comparing multiple financial scenarios
 */

import { simulate, type SimulationResultElement } from '../utils/simulate'
import type { ReturnConfiguration } from '../utils/random-returns.tsx'
import type {
  ComparisonScenario,
  ScenarioSimulationResult,
  ComparisonStatistics,
  CapitalGrowthComparison,
} from '../types/capital-growth-comparison'

/**
 * Extended simulation result element with year number
 */
export type YearlyDataElement = SimulationResultElement & {
  jahr: number
}

/**
 * Aggregates simulation data from multiple elements into a single simulation result per year
 * @param elements - Array of sparplan elements with simulation data
 * @returns Aggregated simulation data by year
 */
function aggregateSimulationData(
  elements: ReturnType<typeof simulate>
): { [year: number]: SimulationResultElement } {
  const aggregated: { [year: number]: SimulationResultElement } = {}

  elements.forEach((element) => {
    Object.entries(element.simulation).forEach(([yearStr, data]) => {
      const year = parseInt(yearStr, 10)
      if (!aggregated[year]) {
        aggregated[year] = { ...data }
      } else {
        accumulateYearData(aggregated[year]!, data)
      }
    })
  })

  return aggregated
}

/**
 * Accumulates simulation data from one year into another (helper for aggregation)
 * @param existing - The existing accumulated data
 * @param data - New data to add
 */
// eslint-disable-next-line complexity -- Data aggregation requires checking multiple optional fields
function accumulateYearData(existing: SimulationResultElement, data: SimulationResultElement): void {
  existing.startkapital += data.startkapital
  existing.zinsen += data.zinsen
  existing.endkapital += data.endkapital
  existing.bezahlteSteuer += data.bezahlteSteuer
  existing.genutzterFreibetrag += data.genutzterFreibetrag
  existing.vorabpauschale += data.vorabpauschale
  existing.vorabpauschaleAccumulated += data.vorabpauschaleAccumulated

  // Add costs if available
  if (data.terCosts) existing.terCosts = (existing.terCosts || 0) + data.terCosts
  if (data.transactionCosts)
    existing.transactionCosts = (existing.transactionCosts || 0) + data.transactionCosts
  if (data.totalCosts) existing.totalCosts = (existing.totalCosts || 0) + data.totalCosts

  // Add real values if available
  if (data.startkapitalReal)
    existing.startkapitalReal = (existing.startkapitalReal || 0) + data.startkapitalReal
  if (data.zinsenReal) existing.zinsenReal = (existing.zinsenReal || 0) + data.zinsenReal
  if (data.endkapitalReal)
    existing.endkapitalReal = (existing.endkapitalReal || 0) + data.endkapitalReal
}

/**
 * Simulates a single scenario and extracts key metrics
 * @param scenario - The scenario to simulate
 * @returns Simulation result with metrics
 */
// eslint-disable-next-line max-lines-per-function -- Simulation logic requires configuration setup and metric extraction
export function simulateScenario(scenario: ComparisonScenario): ScenarioSimulationResult {
  const { configuration } = scenario

  // Convert sparplan to elements
  const elementsInput = configuration.sparplan.map((plan) => ({
    start: plan.start,
    type: 'sparplan' as const,
    einzahlung: plan.einzahlung,
    simulation: {},
    ter: plan.ter,
    transactionCostPercent: plan.transactionCostPercent,
    transactionCostAbsolute: plan.transactionCostAbsolute,
    eventType: plan.eventType,
    specialEventData: plan.specialEventData,
    dynamicSavingsConfig: plan.dynamicSavingsConfig,
  }))

  // Build return configuration
  const returnConfig: ReturnConfiguration = {
    mode: configuration.returnMode,
    fixedRate: configuration.rendite,
    randomConfig: {
      averageReturn: configuration.averageReturn,
      standardDeviation: configuration.standardDeviation,
      seed: configuration.randomSeed,
    },
    variableConfig: {
      yearlyReturns: configuration.variableReturns,
    },
    historicalConfig: configuration.historicalIndex
      ? {
          indexId: configuration.historicalIndex,
        }
      : undefined,
    multiAssetConfig: configuration.multiAssetConfig,
  }

  // Run the simulation using the existing simulate function
  const elements = simulate({
    startYear: configuration.startEnd[0],
    endYear: configuration.startEnd[1],
    elements: elementsInput,
    returnConfig,
    steuerlast: configuration.steuerlast,
    simulationAnnual: configuration.simulationAnnual,
    teilfreistellungsquote: configuration.teilfreistellungsquote,
    freibetragPerYear: configuration.freibetragPerYear,
    steuerReduzierenEndkapital: configuration.steuerReduzierenEndkapitalSparphase,
    basiszinsConfiguration: configuration.basiszinsConfiguration,
    inflationAktivSparphase: configuration.inflationAktivSparphase,
    inflationsrateSparphase: configuration.inflationsrateSparphase,
    inflationAnwendungSparphase: configuration.inflationAnwendungSparphase,
    guenstigerPruefungAktiv: configuration.guenstigerPruefungAktiv,
    personalTaxRate: configuration.personalTaxRate,
  })

  // Aggregate all simulation results from all elements
  const aggregatedSimulation = aggregateSimulationData(elements)

  // Convert aggregated simulation result to yearly data array with year numbers
  const yearlyData: YearlyDataElement[] = Object.entries(aggregatedSimulation)
    .sort(([yearA], [yearB]) => Number(yearA) - Number(yearB))
    .map(([year, data]) => ({
      jahr: Number(year),
      ...data,
    }))

  // Calculate metrics from the simulation result
  const lastYear = yearlyData[yearlyData.length - 1]
  const firstYear = yearlyData[0]

  if (!lastYear || !firstYear) {
    throw new Error('Simulation produced no data')
  }

  // Calculate total contributions from the elements
  const totalContributions = elements.reduce((sum, element) => sum + element.einzahlung, 0)

  // Calculate total returns
  const totalReturns = yearlyData.reduce((sum, year) => sum + year.zinsen, 0)

  // Calculate total taxes
  const totalTaxes = yearlyData.reduce((sum, year) => sum + year.bezahlteSteuer, 0)

  // Calculate annualized return
  const duration = lastYear.jahr - firstYear.jahr
  const annualizedReturn =
    duration > 0 && totalContributions > 0
      ? (Math.pow(lastYear.endkapital / totalContributions, 1 / duration) - 1) * 100
      : 0

  return {
    scenarioId: scenario.id,
    yearlyData,
    metrics: {
      endCapital: lastYear.endkapital,
      endCapitalReal: lastYear.endkapitalReal ?? lastYear.endkapital,
      totalContributions,
      totalReturns,
      totalTaxes,
      annualizedReturn,
      duration,
    },
  }
}

/**
 * Simulates all scenarios in a comparison
 * @param comparison - The comparison containing scenarios to simulate
 * @returns Updated comparison with simulation results
 */
export function simulateComparison(comparison: CapitalGrowthComparison): CapitalGrowthComparison {
  const results = comparison.scenarios.map((scenario) => simulateScenario(scenario))

  const statistics = calculateStatistics(results)

  return {
    ...comparison,
    results,
    statistics,
    updatedAt: new Date().toISOString(),
  }
}

/**
 * Calculates statistical analysis across all scenario results
 * @param results - Array of scenario simulation results
 * @returns Statistical metrics
 */
export function calculateStatistics(results: ScenarioSimulationResult[]): ComparisonStatistics {
  if (results.length === 0) {
    throw new Error('Cannot calculate statistics for empty results')
  }

  // Sort results by end capital
  const sortedResults = [...results].sort((a, b) => a.metrics.endCapital - b.metrics.endCapital)

  // Find best and worst scenarios
  const worstScenario = sortedResults[0]!
  const bestScenario = sortedResults[sortedResults.length - 1]!

  // Calculate average
  const averageEndCapital = results.reduce((sum, r) => sum + r.metrics.endCapital, 0) / results.length

  // Calculate standard deviation
  const squaredDiffs = results.map((r) => Math.pow(r.metrics.endCapital - averageEndCapital, 2))
  const variance = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / results.length
  const standardDeviation = Math.sqrt(variance)

  // Calculate percentiles
  const percentiles = calculatePercentiles(sortedResults.map((r) => r.metrics.endCapital))

  // Calculate range
  const range = bestScenario.metrics.endCapital - worstScenario.metrics.endCapital

  return {
    bestScenario: {
      scenarioId: bestScenario.scenarioId,
      endCapital: bestScenario.metrics.endCapital,
    },
    worstScenario: {
      scenarioId: worstScenario.scenarioId,
      endCapital: worstScenario.metrics.endCapital,
    },
    percentiles,
    averageEndCapital,
    standardDeviation,
    range,
  }
}

/**
 * Calculates percentiles (25th, 50th, 75th) from sorted values
 * @param sortedValues - Array of values sorted in ascending order
 * @returns Object with p25, p50 (median), and p75 percentiles
 */
function calculatePercentiles(sortedValues: number[]): {
  p25: number
  p50: number
  p75: number
} {
  const n = sortedValues.length

  if (n === 0) {
    throw new Error('Cannot calculate percentiles for empty array')
  }

  // For a single value, all percentiles are the same
  if (n === 1) {
    return { p25: sortedValues[0]!, p50: sortedValues[0]!, p75: sortedValues[0]! }
  }

  // Calculate indices for percentiles (linear interpolation method)
  const getPercentile = (percentile: number): number => {
    const index = (percentile / 100) * (n - 1)
    const lower = Math.floor(index)
    const upper = Math.ceil(index)
    const weight = index - lower

    if (upper >= n) {
      return sortedValues[n - 1]!
    }

    return sortedValues[lower]! * (1 - weight) + sortedValues[upper]! * weight
  }

  return {
    p25: getPercentile(25),
    p50: getPercentile(50),
    p75: getPercentile(75),
  }
}

/**
 * Creates a new comparison scenario with default values
 * @param name - Name for the scenario
 * @param color - Color for visualization
 * @param baseConfiguration - Base configuration to clone
 * @returns New comparison scenario
 */
export function createScenario(
  name: string,
  color: string,
  baseConfiguration: ComparisonScenario['configuration']
): ComparisonScenario {
  return {
    id: `scenario-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    color,
    configuration: { ...baseConfiguration },
  }
}

/**
 * Creates a new empty comparison
 * @param name - Name for the comparison
 * @returns New comparison object
 */
export function createComparison(name: string): CapitalGrowthComparison {
  return {
    id: `comparison-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    scenarios: [],
  }
}
