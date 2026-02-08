import type { SimulationResult, SimulationResultElement } from './simulate'

/**
 * Data point for 3D visualization
 * Represents a single point in time-return-risk space
 */
export interface ThreeDDataPoint {
  year: number // X-axis: Time
  returnRate: number // Y-axis: Return rate (%)
  capital: number // Z-axis: Capital value (€)
  volatility?: number // Optional: Used for coloring/sizing points
}

/**
 * Configuration for 3D visualization
 */
export interface ThreeDVisualizationConfig {
  showVolatility?: boolean // Whether to show volatility dimension
  colorByReturn?: boolean // Color points based on return rate
  normalizeCapital?: boolean // Normalize capital values for better visualization
}

/**
 * Prepares simulation data for 3D visualization
 * Converts yearly simulation results into 3D data points
 *
 * @param simulationResult - The simulation results by year
 * @param config - Optional configuration for visualization
 * @returns Array of 3D data points
 */
export function prepareThreeDData(
  simulationResult: SimulationResult,
  config: ThreeDVisualizationConfig = {}
): ThreeDDataPoint[] {
  const dataPoints: ThreeDDataPoint[] = []
  const years = Object.keys(simulationResult)
    .map(Number)
    .sort((a, b) => a - b)

  if (years.length === 0) {
    return []
  }

  years.forEach((year) => {
    const element: SimulationResultElement = simulationResult[year]

    // Calculate return rate for this year
    const returnRate = element.startkapital > 0 ? (element.zinsen / element.startkapital) * 100 : 0

    const dataPoint: ThreeDDataPoint = {
      year,
      returnRate,
      capital: element.endkapital,
    }

    dataPoints.push(dataPoint)
  })

  // Normalize capital values if requested
  if (config.normalizeCapital && dataPoints.length > 0) {
    const maxCapital = Math.max(...dataPoints.map((p) => p.capital))
    dataPoints.forEach((point) => {
      point.capital = (point.capital / maxCapital) * 100
    })
  }

  return dataPoints
}

/**
 * Calculates volatility from an array of return rates
 * Uses standard deviation as measure of volatility
 *
 * @param returns - Array of return rates
 * @returns Standard deviation (volatility)
 */
export function calculateVolatility(returns: number[]): number {
  if (returns.length < 2) {
    return 0
  }

  const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length
  const squaredDiffs = returns.map((r) => Math.pow(r - mean, 2))
  const variance = squaredDiffs.reduce((sum, d) => sum + d, 0) / returns.length
  return Math.sqrt(variance)
}

/**
 * Prepares Monte Carlo simulation data for 3D visualization
 * Shows probability distribution across time-return-capital space
 *
 * @param monteCarloResults - Array of simulation results from Monte Carlo runs
 * @param config - Optional configuration for visualization
 * @returns Array of 3D data points with volatility information
 */
export function prepareMonteCarloThreeDData(
  monteCarloResults: SimulationResult[],
  config: ThreeDVisualizationConfig = {}
): ThreeDDataPoint[] {
  if (monteCarloResults.length === 0) {
    return []
  }

  const dataPoints: ThreeDDataPoint[] = []

  // Get all years from first simulation
  const years = Object.keys(monteCarloResults[0])
    .map(Number)
    .sort((a, b) => a - b)

  years.forEach((year) => {
    const yearCapitals: number[] = []
    const yearReturns: number[] = []

    // Collect data from all Monte Carlo runs for this year
    monteCarloResults.forEach((result) => {
      const element = result[year]
      if (element) {
        yearCapitals.push(element.endkapital)
        const returnRate = element.startkapital > 0 ? (element.zinsen / element.startkapital) * 100 : 0
        yearReturns.push(returnRate)
      }
    })

    // Calculate statistics for this year
    const medianCapital = calculateMedian(yearCapitals)
    const medianReturn = calculateMedian(yearReturns)
    const volatility = calculateVolatility(yearReturns)

    dataPoints.push({
      year,
      returnRate: medianReturn,
      capital: medianCapital,
      volatility,
    })
  })

  // Normalize capital values if requested
  if (config.normalizeCapital && dataPoints.length > 0) {
    const maxCapital = Math.max(...dataPoints.map((p) => p.capital))
    dataPoints.forEach((point) => {
      point.capital = (point.capital / maxCapital) * 100
    })
  }

  return dataPoints
}

/**
 * Calculates the median value from an array of numbers
 *
 * @param values - Array of numbers
 * @returns Median value
 */
function calculateMedian(values: number[]): number {
  if (values.length === 0) {
    return 0
  }

  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)

  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2
  }

  return sorted[mid]
}

/**
 * Generates grid points for a 3D surface visualization
 * Useful for showing risk-return relationships across time
 *
 * @param minYear - Minimum year
 * @param maxYear - Maximum year
 * @param minReturn - Minimum return rate (%)
 * @param maxReturn - Maximum return rate (%)
 * @param resolution - Number of points along each axis
 * @returns 2D array of data points [year][return]
 */
export function generateSurfaceGrid(
  minYear: number,
  maxYear: number,
  minReturn: number,
  maxReturn: number,
  resolution = 20
): ThreeDDataPoint[][] {
  const grid: ThreeDDataPoint[][] = []
  
  // Handle edge case for resolution = 1
  if (resolution === 1) {
    return [
      [
        {
          year: minYear,
          returnRate: minReturn,
          capital: 10000, // Starting capital
        },
      ],
    ]
  }

  const yearStep = (maxYear - minYear) / (resolution - 1)
  const returnStep = (maxReturn - minReturn) / (resolution - 1)

  for (let i = 0; i < resolution; i++) {
    const row: ThreeDDataPoint[] = []
    const year = Math.round(minYear + i * yearStep)

    for (let j = 0; j < resolution; j++) {
      const returnRate = minReturn + j * returnStep

      // Calculate capital based on compound interest
      const yearsElapsed = year - minYear
      const capital = 10000 * Math.pow(1 + returnRate / 100, yearsElapsed)

      row.push({
        year,
        returnRate,
        capital,
      })
    }

    grid.push(row)
  }

  return grid
}
