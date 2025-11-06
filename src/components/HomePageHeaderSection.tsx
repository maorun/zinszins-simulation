import { lazy, Suspense } from 'react'
import { Button } from './ui/button'
import Header from './Header'
import SimulationParameters from './SimulationParameters'
import type { FinancialScenario } from '../data/scenarios'
import { Card, CardContent } from './ui/card'

// Lazy load large configuration components
const GlobalPlanningConfiguration = lazy(() => import('./GlobalPlanningConfiguration').then(m => ({ default: m.GlobalPlanningConfiguration })))
const FinancialGoalsConfiguration = lazy(() => import('./FinancialGoalsConfiguration'))
const ProfileManagement = lazy(() => import('./ProfileManagement'))
const ScenarioSelector = lazy(() => import('./ScenarioSelector'))

/**
 * Loading fallback component
 */
function LoadingCard() {
  return (
    <Card className="mb-3 sm:mb-4">
      <CardContent className="py-4 text-center text-gray-500 text-sm">
        Lädt Konfiguration...
      </CardContent>
    </Card>
  )
}

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
      <Suspense fallback={<LoadingCard />}>
        <GlobalPlanningConfiguration startOfIndependence={startOfIndependence} />
      </Suspense>

      {/* Financial Goals Configuration */}
      <Suspense fallback={<LoadingCard />}>
        <FinancialGoalsConfiguration />
      </Suspense>

      <Suspense fallback={<LoadingCard />}>
        <ProfileManagement />
      </Suspense>

      <Suspense fallback={<LoadingCard />}>
        <ScenarioSelector onApplyScenario={handleApplyScenario} />
      </Suspense>
    </>
  )
}
