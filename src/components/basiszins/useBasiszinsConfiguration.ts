import { useCallback } from 'react'
import { estimateFutureBasiszins } from '../../services/bundesbank-api'
import { useBasiszinsApi } from './useBasiszinsApi'
import { useBasiszinsManualEntry } from './useBasiszinsManualEntry'
import { useBasiszinsRateOperations } from './useBasiszinsRateOperations'
import { useBasiszinsState } from './useBasiszinsState'

/**
 * Custom hook that manages all basiszins configuration state and operations
 */
export function useBasiszinsConfiguration() {
  const state = useBasiszinsState()

  const { handleFetchFromApi } = useBasiszinsApi(
    state.basiszinsConfiguration,
    state.setBasiszinsConfiguration,
    state.performSimulation,
    state.setIsLoading,
    state.setError,
    state.setLastApiUpdate,
  )

  const { handleAddManualEntry } = useBasiszinsManualEntry(
    state.basiszinsConfiguration,
    state.setBasiszinsConfiguration,
    state.performSimulation,
    state.newYear,
    state.newRate,
    state.setNewYear,
    state.setNewRate,
    state.setError,
  )

  const { handleRemoveYear, handleUpdateRate } = useBasiszinsRateOperations(
    state.basiszinsConfiguration,
    state.setBasiszinsConfiguration,
    state.performSimulation,
  )

  const getSuggestedRate = useCallback(() => {
    const estimate = estimateFutureBasiszins(state.basiszinsConfiguration)
    return (estimate * 100).toFixed(2)
  }, [state.basiszinsConfiguration])

  return {
    basiszinsConfiguration: state.basiszinsConfiguration,
    currentYear: state.currentYear,
    isLoading: state.isLoading,
    lastApiUpdate: state.lastApiUpdate,
    error: state.error,
    newYear: state.newYear,
    newRate: state.newRate,
    handleFetchFromApi,
    handleAddManualEntry,
    handleUpdateRate,
    handleRemoveYear,
    setNewYear: state.setNewYear,
    setNewRate: state.setNewRate,
    getSuggestedRate,
  }
}
