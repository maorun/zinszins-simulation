import type { SimulationData } from '../contexts/helpers/config-types'

/**
 * Calculate the year range string for the savings phase
 *
 * Determines the start year from the earliest savings plan element
 * and combines it with the provided end year to create a range string.
 *
 * @param simulationData - Simulation data containing savings plan elements
 * @param savingsEndYear - End year of the savings phase
 * @returns Formatted year range string (e.g., "2023 - 2040"), or empty string if no data
 *
 * @example
 * ```typescript
 * const simulationData = {
 *   sparplanElements: [
 *     { start: '2023-01-01', ... },
 *     { start: '2025-06-15', ... }
 *   ]
 * }
 * getYearsRange(simulationData, 2040) // Returns: "2023 - 2040"
 * ```
 */
export function getYearsRange(simulationData: SimulationData | null, savingsEndYear: number): string {
  if (!simulationData) return ''

  // Extract start years from all savings plans and find the earliest one
  const startDates = simulationData.sparplanElements.map(el => new Date(el.start).getFullYear())
  const savingsStartYear = Math.min(...startDates)

  return `${savingsStartYear} - ${savingsEndYear}`
}
