/**
 * Custom hook for scenario event handlers
 */

import { useState } from 'react'
import type { ExtendedSavedConfiguration } from '../contexts/helpers/config-types'
import type { useScenarioManagement } from './useScenarioManagement'

export function useScenarioHandlers(
  saveScenario: ReturnType<typeof useScenarioManagement>['saveScenario'],
  deleteScenario: ReturnType<typeof useScenarioManagement>['deleteScenario'],
  currentConfiguration: ExtendedSavedConfiguration,
  scenarioName: string,
  scenarioDescription: string,
  setScenarioName: (v: string) => void,
  setScenarioDescription: (v: string) => void,
  setSaveSuccess: (v: boolean) => void
) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [scenarioToDelete, setScenarioToDelete] = useState<string | null>(null)

  const handleSave = () => {
    if (!scenarioName.trim()) return
    const saved = saveScenario(scenarioName, currentConfiguration, scenarioDescription)
    if (saved) {
      setScenarioName('')
      setScenarioDescription('')
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    }
  }

  const handleDeleteClick = (id: string) => {
    setScenarioToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (scenarioToDelete) {
      deleteScenario(scenarioToDelete)
      setScenarioToDelete(null)
    }
    setDeleteDialogOpen(false)
  }

  return {
    handleSave,
    handleDeleteClick,
    handleDeleteConfirm,
    deleteDialogOpen,
    setDeleteDialogOpen,
  }
}
