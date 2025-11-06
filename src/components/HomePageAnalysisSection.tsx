import { lazy, Suspense } from 'react'
import { useAnalysisConfig } from '../hooks/useAnalysisConfig'
import { Card, CardContent } from './ui/card'

// Lazy load large components for better initial load performance
const DataExport = lazy(() => import('./DataExport'))
const SimulationModeSelector = lazy(() => import('./SimulationModeSelector'))
const SensitivityAnalysisDisplay = lazy(() => import('./SensitivityAnalysisDisplay'))

/**
 * Loading fallback component
 */
function LoadingCard() {
  return (
    <Card className="mb-4">
      <CardContent className="py-8 text-center text-gray-500">
        Lädt...
      </CardContent>
    </Card>
  )
}

/**
 * Analysis and export section of the HomePage
 * Includes simulation mode selector, data export, and sensitivity analysis
 */
export function HomePageAnalysisSection() {
  const { simulationData, sparplanElemente, returnConfig, sensitivityConfig } = useAnalysisConfig()

  return (
    <>
      <Suspense fallback={<LoadingCard />}>
        <SimulationModeSelector />
      </Suspense>

      <Suspense fallback={<LoadingCard />}>
        <DataExport />
      </Suspense>

      {/* Sensitivity Analysis */}
      {simulationData && sparplanElemente && sparplanElemente.length > 0 && (
        <Suspense fallback={<LoadingCard />}>
          <SensitivityAnalysisDisplay config={sensitivityConfig} returnConfig={returnConfig} />
        </Suspense>
      )}
    </>
  )
}
