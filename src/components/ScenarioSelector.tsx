import { TooltipProvider } from './ui/tooltip'
import { useNavigationItem } from '../hooks/useNavigationItem'
import type { FinancialScenario } from '../data/scenarios'
import { ScenarioDetailsModal } from './ScenarioDetailsModal'
import { ScenarioCollapsibleCard } from './ScenarioCollapsibleCard'
import { useScenarioSelection } from '../hooks/useScenarioSelection'

interface ScenarioSelectorProps {
  onApplyScenario: (scenario: FinancialScenario) => void
}

/**
 * ScenarioSelector Component
 * Displays predefined What-If scenarios and allows users to apply them to their simulation
 */
export function ScenarioSelector({ onApplyScenario }: ScenarioSelectorProps) {
  const {
    selectedScenario,
    isDetailsOpen,
    setIsDetailsOpen,
    searchQuery,
    setSearchQuery,
    handleScenarioClick,
    handleApplyScenario,
    handleClearSearch,
  } = useScenarioSelection(onApplyScenario)

  const navigationRef = useNavigationItem({
    id: 'scenario-selector',
    title: 'Was-wäre-wenn Szenarien',
    icon: '💡',
    level: 0,
  })

  return (
    <TooltipProvider>
      <ScenarioCollapsibleCard
        navigationRef={navigationRef}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onClearSearch={handleClearSearch}
        onScenarioClick={handleScenarioClick}
      />

      <ScenarioDetailsModal
        scenario={selectedScenario}
        isOpen={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        onApply={handleApplyScenario}
      />
    </TooltipProvider>
  )
}

export default ScenarioSelector
