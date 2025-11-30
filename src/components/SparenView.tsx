import { lazy, Suspense } from 'react'
import SimulationParameters from './SimulationParameters'
import SavingsPlan from './SavingsPlan'
import { Card, CardContent } from './ui/card'
import type { FinancialScenario } from '../data/scenarios'

// Lazy load large configuration components
const GlobalPlanningConfiguration = lazy(() =>
  import('./GlobalPlanningConfiguration').then(m => ({ default: m.GlobalPlanningConfiguration })),
)
const FinancialGoalsConfiguration = lazy(() => import('./FinancialGoalsConfiguration'))
const EmergencyFundConfiguration = lazy(() => import('./EmergencyFundConfiguration'))
const ScenarioSelector = lazy(() => import('./ScenarioSelector'))

/**
 * Loading fallback component
 */
function LoadingCard() {
  return (
    <Card className="mb-3 sm:mb-4">
      <CardContent className="py-4 text-center text-gray-500 text-sm">Lädt Konfiguration...</CardContent>
    </Card>
  )
}

interface SparenViewProps {
  handleApplyScenario: (scenario: FinancialScenario) => void
  startOfIndependence: number
}

/**
 * Sparen View - All savings-related functionality
 * Includes simulation parameters, savings plans, and savings configuration
 */
export function SparenView({ handleApplyScenario, startOfIndependence }: SparenViewProps) {
  return (
    <div className="space-y-4">
      {/* Simulation Parameters */}
      <SimulationParameters />

      {/* Savings Plan with Returns and Risk Assessment */}
      <SavingsPlan />

      {/* Global Planning Configuration */}
      <Suspense fallback={<LoadingCard />}>
        <GlobalPlanningConfiguration startOfIndependence={startOfIndependence} />
      </Suspense>

      {/* Financial Goals Configuration */}
      <Suspense fallback={<LoadingCard />}>
        <FinancialGoalsConfiguration />
      </Suspense>

      {/* Emergency Fund / Liquidity Reserve Configuration */}
      <Suspense fallback={<LoadingCard />}>
        <EmergencyFundConfiguration />
      </Suspense>

      {/* Scenario Selector */}
      <Suspense fallback={<LoadingCard />}>
        <ScenarioSelector onApplyScenario={handleApplyScenario} />
      </Suspense>
    </div>
  )
}
