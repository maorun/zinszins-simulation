import { useCallback } from 'react'
import { validateBasiszinsRate, type BasiszinsConfiguration, type BasiszinsData } from '../../services/bundesbank-api'

/**
 * Custom hook for rate update and removal operations
 */
export function useBasiszinsRateOperations(
  basiszinsConfiguration: BasiszinsConfiguration,
  setBasiszinsConfiguration: (config: BasiszinsConfiguration) => void,
  performSimulation: () => void,
) {
  const handleRemoveYear = useCallback(
    (year: number) => {
      const updatedConfig = { ...basiszinsConfiguration }
      delete updatedConfig[year]
      setBasiszinsConfiguration(updatedConfig)
      performSimulation()
    },
    [basiszinsConfiguration, setBasiszinsConfiguration, performSimulation],
  )

  const handleUpdateRate = useCallback(
    (year: number, newRateValue: string) => {
      const rate = parseFloat(newRateValue) / 100 // Convert percentage to decimal

      if (isNaN(rate) || !validateBasiszinsRate(rate)) {
        return // Invalid rate, don't update
      }

      const updatedEntry: BasiszinsData = {
        ...basiszinsConfiguration[year],
        rate,
        source: 'manual', // Mark as manually edited
        lastUpdated: new Date().toISOString(),
      }

      setBasiszinsConfiguration({
        ...basiszinsConfiguration,
        [year]: updatedEntry,
      })

      performSimulation()
    },
    [basiszinsConfiguration, setBasiszinsConfiguration, performSimulation],
  )

  return { handleRemoveYear, handleUpdateRate }
}
