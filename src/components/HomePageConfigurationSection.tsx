import { lazy, Suspense } from 'react'
import SimulationParameters from './SimulationParameters'
import type { FinancialScenario } from '../data/scenarios'
import { Card, CardContent } from './ui/card'

// Lazy load large configuration components
const GlobalPlanningConfiguration = lazy(() =>
  import('./GlobalPlanningConfiguration').then(m => ({ default: m.GlobalPlanningConfiguration })),
)
const FinancialGoalsConfiguration = lazy(() => import('./FinancialGoalsConfiguration'))
const EmergencyFundConfiguration = lazy(() => import('./EmergencyFundConfiguration'))
const AlimonyConfiguration = lazy(() => import('./AlimonyConfiguration'))
const EigenheimVsMieteComparison = lazy(() =>
  import('./EigenheimVsMieteComparison').then(m => ({ default: m.EigenheimVsMieteComparison })),
)
const ProfileManagement = lazy(() => import('./ProfileManagement'))
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

interface HomePageConfigurationSectionProps {
  handleApplyScenario: (scenario: FinancialScenario) => void
  startOfIndependence: number
}

/**
 * Configuration section of the HomePage
 * Includes simulation parameters and configuration sections
 */
export function HomePageConfigurationSection({
  handleApplyScenario,
  startOfIndependence,
}: HomePageConfigurationSectionProps) {
  return (
    <>
      <SimulationParameters />

      {/* Global Planning Configuration - Available for all calculations including Vorabpauschale */}
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

      {/* Alimony / Child Support Configuration */}
      <Suspense fallback={<LoadingCard />}>
        <AlimonyConfiguration />
      </Suspense>

      {/* Eigenheim vs. Miete Comparison */}
      <Suspense fallback={<LoadingCard />}>
        <EigenheimVsMieteComparison />
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
