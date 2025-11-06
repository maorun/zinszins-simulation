import { useCallback } from 'react'
import { validateBasiszinsRate, type BasiszinsConfiguration, type BasiszinsData } from '../../services/bundesbank-api'

/**
 * Custom hook for manual entry operations
 */
export function useBasiszinsManualEntry(
  basiszinsConfiguration: BasiszinsConfiguration,
  setBasiszinsConfiguration: (config: BasiszinsConfiguration) => void,
  performSimulation: () => void,
  newYear: string,
  newRate: string,
  setNewYear: (year: string) => void,
  setNewRate: (rate: string) => void,
  setError: (error: string | null) => void,
) {
  const handleAddManualEntry = useCallback(() => {
    const year = parseInt(newYear)
    const rate = parseFloat(newRate) / 100 // Convert percentage to decimal

    if (isNaN(year) || year < 2018 || year > 2050) {
      setError('Bitte geben Sie ein gültiges Jahr zwischen 2018 und 2050 ein.')
      return
    }

    if (isNaN(rate) || !validateBasiszinsRate(rate)) {
      setError('Bitte geben Sie einen gültigen Zinssatz zwischen -2% und 10% ein.')
      return
    }

    const newEntry: BasiszinsData = {
      year,
      rate,
      source: 'manual',
      lastUpdated: new Date().toISOString(),
    }

    setBasiszinsConfiguration({
      ...basiszinsConfiguration,
      [year]: newEntry,
    })

    setNewYear('')
    setNewRate('')
    setError(null)
    performSimulation()
  }, [
    newYear,
    newRate,
    basiszinsConfiguration,
    setBasiszinsConfiguration,
    performSimulation,
    setNewYear,
    setNewRate,
    setError,
  ])

  return { handleAddManualEntry }
}
