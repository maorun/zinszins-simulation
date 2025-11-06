import type { SimulationData } from '../contexts/helpers/config-types'

/**
 * Calculate the year range string for the savings phase
 * @param simulationData - Simulation data containing savings plan elements
 * @param savingsEndYear - End year of the savings phase
 * @returns Formatted year range string (e.g., "2023 - 2040")
 */
export function getYearsRange(simulationData: SimulationData | null, savingsEndYear: number): string {
  if (!simulationData) return ''

  const startDates = simulationData.sparplanElements.map(el => new Date(el.start).getFullYear())
  const savingsStartYear = Math.min(...startDates)

  return `${savingsStartYear} - ${savingsEndYear}`
}
