/**
 * Custom hook for scenario management
 * Provides functionality to save, load, and manage financial planning scenarios
 */

import { useState, useCallback } from 'react'
import type { SavedScenario } from '../types/scenario-comparison'
import {
  loadSavedScenarios,
  saveScenario as saveScenarioToStorage,
  updateScenario as updateScenarioInStorage,
  deleteScenario as deleteScenarioFromStorage,
  getScenarioById,
} from '../utils/scenario-storage'
import type { ExtendedSavedConfiguration } from '../contexts/helpers/config-types'

function useSaveScenario(refreshScenarios: () => void, setIsLoading: (v: boolean) => void, setError: (v: string | null) => void) {
  return useCallback(
    (name: string, configuration: ExtendedSavedConfiguration, description?: string) => {
      try {
        setIsLoading(true)
        setError(null)
        const saved = saveScenarioToStorage(name, configuration, description)
        refreshScenarios()
        return saved
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save scenario')
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [refreshScenarios, setIsLoading, setError]
  )
}

function useUpdateScenario(refreshScenarios: () => void, setIsLoading: (v: boolean) => void, setError: (v: string | null) => void) {
  return useCallback(
    (id: string, updates: Partial<Pick<SavedScenario, 'name' | 'description' | 'configuration'>>) => {
      try {
        setIsLoading(true)
        setError(null)
        const updated = updateScenarioInStorage(id, updates)
        if (updated) refreshScenarios()
        return updated
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update scenario')
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [refreshScenarios, setIsLoading, setError]
  )
}

function useDeleteScenario(refreshScenarios: () => void, setIsLoading: (v: boolean) => void, setError: (v: string | null) => void) {
  return useCallback(
    (id: string) => {
      try {
        setIsLoading(true)
        setError(null)
        const success = deleteScenarioFromStorage(id)
        if (success) refreshScenarios()
        return success
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete scenario')
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [refreshScenarios, setIsLoading, setError]
  )
}

export function useScenarioManagement() {
  const [scenarios, setScenarios] = useState<SavedScenario[]>(() => loadSavedScenarios())
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refreshScenarios = useCallback(() => {
    setScenarios(loadSavedScenarios())
  }, [])

  const saveScenario = useSaveScenario(refreshScenarios, setIsLoading, setError)
  const updateScenario = useUpdateScenario(refreshScenarios, setIsLoading, setError)
  const deleteScenario = useDeleteScenario(refreshScenarios, setIsLoading, setError)

  const getScenario = useCallback((id: string) => {
    return getScenarioById(id)
  }, [])

  return {
    scenarios,
    isLoading,
    error,
    saveScenario,
    updateScenario,
    deleteScenario,
    getScenario,
    refreshScenarios,
  }
}
