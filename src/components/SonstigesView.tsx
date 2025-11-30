import { lazy, Suspense } from 'react'
import { Card, CardContent } from './ui/card'
import type { SensitivityAnalysisConfig } from '../utils/sensitivity-analysis'
import type { ReturnConfiguration } from '../types/return-configuration'
import type { FinancialScenario } from '../data/scenarios'
import { TutorialManager } from './TutorialManager'
import { HomePageSpecialEvents } from './HomePageSpecialEvents'
import { BehavioralFinanceInsights } from './BehavioralFinanceInsights'

// Lazy load large configuration components
const GlobalPlanningConfiguration = lazy(() =>
  import('./GlobalPlanningConfiguration').then(m => ({ default: m.GlobalPlanningConfiguration })),
)
const FinancialGoalsConfiguration = lazy(() => import('./FinancialGoalsConfiguration'))
const EmergencyFundConfiguration = lazy(() => import('./EmergencyFundConfiguration'))
const ScenarioSelector = lazy(() => import('./ScenarioSelector'))
const AlimonyConfiguration = lazy(() => import('./AlimonyConfiguration'))
const GiftTaxPlanningConfiguration = lazy(() => import('./GiftTaxPlanningConfiguration'))
const EigenheimVsMieteComparison = lazy(() =>
  import('./EigenheimVsMieteComparison').then(m => ({ default: m.EigenheimVsMieteComparison })),
)
const ProfileManagement = lazy(() => import('./ProfileManagement'))
const DataExport = lazy(() => import('./DataExport'))
const SensitivityAnalysisDisplay = lazy(() => import('./SensitivityAnalysisDisplay'))

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

interface SonstigesViewProps {
  sensitivityConfig: SensitivityAnalysisConfig
  returnConfig: ReturnConfiguration
  hasSimulationData: boolean
  handleApplyScenario: (scenario: FinancialScenario) => void
  startOfIndependence: number
}

/**
 * Sonstiges View - Extended features and advanced configuration
 * Includes tutorials, special events, planning tools, Monte Carlo, tax modules, exports, and behavioral finance
 */
export function SonstigesView({
  sensitivityConfig,
  returnConfig,
  hasSimulationData,
  handleApplyScenario,
  startOfIndependence,
}: SonstigesViewProps) {
  return (
    <div className="space-y-4">
      {/* Interactive Tutorials */}
      <TutorialManager />

      {/* Special Events - Black Swan, Risk Events */}
      <HomePageSpecialEvents />

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

      {/* Scenario Selector - Was-wäre-wenn */}
      <Suspense fallback={<LoadingCard />}>
        <ScenarioSelector onApplyScenario={handleApplyScenario} />
      </Suspense>

      {/* Behavioral Finance Insights - Educational Section */}
      <BehavioralFinanceInsights />

      {/* Data Export */}
      <Suspense fallback={<LoadingCard />}>
        <DataExport />
      </Suspense>

      {/* Sensitivity Analysis */}
      {hasSimulationData && (
        <Suspense fallback={<LoadingCard />}>
          <SensitivityAnalysisDisplay config={sensitivityConfig} returnConfig={returnConfig} />
        </Suspense>
      )}

      {/* Alimony / Child Support Configuration */}
      <Suspense fallback={<LoadingCard />}>
        <AlimonyConfiguration />
      </Suspense>

      {/* Gift Tax Planning Configuration */}
      <Suspense fallback={<LoadingCard />}>
        <GiftTaxPlanningConfiguration />
      </Suspense>

      {/* Eigenheim vs. Miete Comparison */}
      <Suspense fallback={<LoadingCard />}>
        <EigenheimVsMieteComparison />
      </Suspense>

      {/* Profile Management */}
      <Suspense fallback={<LoadingCard />}>
        <ProfileManagement />
      </Suspense>
    </div>
  )
}
