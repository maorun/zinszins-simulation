import { Button } from './ui/button'
import Header from './Header'
import SimulationParameters from './SimulationParameters'
import { GlobalPlanningConfiguration } from './GlobalPlanningConfiguration'
import FinancialGoalsConfiguration from './FinancialGoalsConfiguration'
import ProfileManagement from './ProfileManagement'
import ScenarioSelector from './ScenarioSelector'
import type { FinancialScenario } from '../data/scenarios'

interface HomePageHeaderSectionProps {
  handleRecalculate: () => void
  handleApplyScenario: (scenario: FinancialScenario) => void
  startOfIndependence: number
}

/**
 * Header section of the HomePage
 * Includes recalculation button, parameters, and configuration sections
 */
export function HomePageHeaderSection({
  handleRecalculate,
  handleApplyScenario,
  startOfIndependence,
}: HomePageHeaderSectionProps) {
  return (
    <>
      <Header />

      <Button
        onClick={handleRecalculate}
        className="mb-3 sm:mb-4 w-full"
        variant="default"
      >
        🔄 Neu berechnen
      </Button>

      <SimulationParameters />

      {/* Global Planning Configuration - Available for all calculations including Vorabpauschale */}
      <GlobalPlanningConfiguration startOfIndependence={startOfIndependence} />

      {/* Financial Goals Configuration */}
      <FinancialGoalsConfiguration />

      <ProfileManagement />

      <ScenarioSelector onApplyScenario={handleApplyScenario} />
    </>
  )
}
