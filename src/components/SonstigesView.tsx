import { lazy, Suspense } from 'react'
import { Card, CardContent } from './ui/card'
import type { SensitivityAnalysisConfig } from '../utils/sensitivity-analysis'
import type { ReturnConfiguration } from '../types/return-configuration'

// Lazy load large configuration components
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
}

/**
 * Sonstiges View - Extended features and advanced configuration
 * Includes Monte Carlo, tax modules, history, exports, and special configurations
 */
export function SonstigesView({ sensitivityConfig, returnConfig, hasSimulationData }: SonstigesViewProps) {
  return (
    <div className="space-y-4">
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
