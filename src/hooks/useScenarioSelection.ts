import { useState } from 'react'
import { toast } from 'sonner'
import type { FinancialScenario } from '../data/scenarios'

/**
 * Custom hook to manage scenario selection and application logic
 */
export function useScenarioSelection(onApplyScenario: (scenario: FinancialScenario) => void) {
  const [selectedScenario, setSelectedScenario] = useState<FinancialScenario | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const handleScenarioClick = (scenario: FinancialScenario) => {
    setSelectedScenario(scenario)
    setIsDetailsOpen(true)
  }

  const handleApplyScenario = () => {
    if (!selectedScenario) return

    try {
      onApplyScenario(selectedScenario)
      setIsDetailsOpen(false)
      toast.success(`Szenario "${selectedScenario.name}" wurde angewendet`)
    } catch (error) {
      console.error('Failed to apply scenario:', error)
      toast.error('Fehler beim Anwenden des Szenarios')
    }
  }

  const handleClearSearch = () => {
    setSearchQuery('')
  }

  return {
    selectedScenario,
    isDetailsOpen,
    setIsDetailsOpen,
    searchQuery,
    setSearchQuery,
    handleScenarioClick,
    handleApplyScenario,
    handleClearSearch,
  }
}
