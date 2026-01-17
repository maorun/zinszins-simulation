/**
 * Chart Data Preparation Utilities
 * Converts simulation data to formats required by different chart components
 */

import type { SimulationResult } from '../utils/simulate'

/**
 * Data format for Area Chart (Capital Composition)
 */
export interface AreaChartDataPoint {
  year: number
  contributions: number
  gains: number
  taxes: number
  endkapital: number
  contributionsReal?: number
  gainsReal?: number
  taxesReal?: number
  endkapitalReal?: number
}

/**
 * Data format for Bar Chart (Year-over-Year)
 */
export interface BarChartDataPoint {
  year: number
  contributions: number
  gains: number
  taxes: number
  contributionsReal?: number
  gainsReal?: number
  taxesReal?: number
}

/**
 * Calculate cumulative contributions up to a given year
 */
function calculateCumulativeContributions(
  simulationData: SimulationResult,
  targetYear: number
): number {
  const years = Object.keys(simulationData)
    .map(Number)
    .filter(y => y <= targetYear)
    .sort((a, b) => a - b)

  let cumulative = 0

  for (const year of years) {
    const yearData = simulationData[year]
    const previousYear = year - 1
    const previousData = simulationData[previousYear]

    if (previousData) {
      // New deposits = difference in starting capital minus previous gains
      const newDeposits = yearData.startkapital - (previousData.endkapital || 0)
      cumulative += Math.max(0, newDeposits)
    } else {
      // First year - starting capital is the first deposit
      cumulative = yearData.startkapital
    }
  }

  return cumulative
}

/**
 * Calculate annual contribution for a specific year
 */
function calculateAnnualContribution(
  simulationData: SimulationResult,
  year: number
): number {
  const yearData = simulationData[year]
  const previousYear = year - 1
  const previousData = simulationData[previousYear]

  if (previousData) {
    // New deposits = difference in starting capital minus previous gains
    const newDeposits = yearData.startkapital - (previousData.endkapital || 0)
    return Math.max(0, newDeposits)
  } else {
    // First year - starting capital is the first deposit
    return yearData.startkapital
  }
}

/**
 * Calculate cumulative gains up to a given year
 */
function calculateCumulativeGains(
  simulationData: SimulationResult,
  targetYear: number
): number {
  const years = Object.keys(simulationData)
    .map(Number)
    .filter(y => y <= targetYear)
    .sort((a, b) => a - b)

  return years.reduce((sum, year) => {
    return sum + (simulationData[year].zinsen || 0)
  }, 0)
}

/**
 * Calculate cumulative taxes up to a given year
 */
function calculateCumulativeTaxes(
  simulationData: SimulationResult,
  targetYear: number
): number {
  const years = Object.keys(simulationData)
    .map(Number)
    .filter(y => y <= targetYear)
    .sort((a, b) => a - b)

  return years.reduce((sum, year) => {
    return sum + (simulationData[year].bezahlteSteuer || 0)
  }, 0)
}

/**
 * Prepare data for Area Chart (Capital Composition)
 * Shows cumulative contributions, gains, and taxes over time
 */
export function prepareAreaChartData(simulationData: SimulationResult): AreaChartDataPoint[] {
  const years = Object.keys(simulationData)
    .map(Number)
    .sort((a, b) => a - b)

  return years.map(year => {
    const yearData = simulationData[year]
    
    return {
      year,
      contributions: calculateCumulativeContributions(simulationData, year),
      gains: calculateCumulativeGains(simulationData, year),
      taxes: calculateCumulativeTaxes(simulationData, year),
      endkapital: yearData.endkapital,
      // Real values (inflation-adjusted) if available
      contributionsReal: yearData.startkapitalReal !== undefined 
        ? calculateCumulativeContributions(simulationData, year) 
        : undefined, // Simplified - would need real tracking
      gainsReal: yearData.zinsenReal,
      taxesReal: undefined, // Would need tracking in simulation
      endkapitalReal: yearData.endkapitalReal,
    }
  })
}

/**
 * Prepare data for Bar Chart (Year-over-Year)
 * Shows annual contributions, gains, and taxes for each year
 */
export function prepareBarChartData(simulationData: SimulationResult): BarChartDataPoint[] {
  const years = Object.keys(simulationData)
    .map(Number)
    .sort((a, b) => a - b)

  return years.map(year => {
    const yearData = simulationData[year]
    
    return {
      year,
      contributions: calculateAnnualContribution(simulationData, year),
      gains: yearData.zinsen || 0,
      taxes: yearData.bezahlteSteuer || 0,
      // Real values (inflation-adjusted) if available
      contributionsReal: calculateAnnualContribution(simulationData, year), // Simplified
      gainsReal: yearData.zinsenReal,
      taxesReal: undefined, // Would need tracking in simulation
    }
  })
}
