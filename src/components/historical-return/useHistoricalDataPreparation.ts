import { useSimulation } from '../../contexts/useSimulation'
import { HISTORICAL_INDICES, getHistoricalReturns, isYearRangeAvailable } from '../../utils/historical-data'

/**
 * Custom hook for preparing historical data for display
 */
export const useHistoricalDataPreparation = (selectedIndexId: string) => {
  const { startEnd } = useSimulation()

  const currentIndex = HISTORICAL_INDICES.find((index) => index.id === selectedIndexId)
  const simulationStartYear = new Date().getFullYear()
  const simulationEndYear = startEnd[0]

  // Check if the simulation period is within available historical data
  const isAvailable = currentIndex
    ? isYearRangeAvailable(currentIndex.id, simulationStartYear, simulationEndYear)
    : false

  // Get historical returns for display
  const historicalReturns = currentIndex
    ? getHistoricalReturns(
        currentIndex.id,
        Math.max(currentIndex.startYear, simulationStartYear - 5), // Show 5 years before simulation start
        Math.min(currentIndex.endYear, simulationEndYear + 5), // Show 5 years after simulation end
      )
    : null

  return {
    currentIndex,
    simulationStartYear,
    simulationEndYear,
    isAvailable,
    historicalReturns,
  }
}
