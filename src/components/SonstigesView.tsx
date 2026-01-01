import { lazy } from 'react'
import type { SensitivityAnalysisConfig } from '../utils/sensitivity-analysis'
import type { ReturnConfiguration } from '../utils/random-returns'
import type { FinancialScenario } from '../data/scenarios'
import { TutorialManager } from './TutorialManager'
import { HomePageSpecialEvents } from './HomePageSpecialEvents'
import { BehavioralFinanceInsights } from './BehavioralFinanceInsights'
import SimulationParameters from './SimulationParameters'
import { ConfigurationSection } from './sonstiges-sections/ConfigurationSection'
import { PlanningConfigurations } from './sonstiges-sections/PlanningConfigurations'
import { RealEstateConfigurations } from './sonstiges-sections/RealEstateConfigurations'

// Lazy load remaining configuration components
const ScenarioSelector = lazy(() => import('./ScenarioSelector'))
const DataExport = lazy(() => import('./DataExport'))
const SensitivityAnalysisDisplay = lazy(() => import('./SensitivityAnalysisDisplay'))
const ProfileManagement = lazy(() => import('./ProfileManagement'))

interface SonstigesViewProps {
  sensitivityConfig: SensitivityAnalysisConfig
  returnConfig: ReturnConfiguration
  hasSimulationData: boolean
  handleApplyScenario: (scenario: FinancialScenario) => void
  startOfIndependence: number
}

/**
 * Sonstiges View - Extended features and advanced configuration
 * Includes all configuration tools, tutorials, special events, planning tools, Monte Carlo, tax modules, exports, and behavioral finance
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
      <TutorialManager />
      <HomePageSpecialEvents />
      <SimulationParameters />

      <PlanningConfigurations startOfIndependence={startOfIndependence} />

      <ConfigurationSection
        Component={ScenarioSelector}
        componentProps={{ onApplyScenario: handleApplyScenario }}
      />

      <BehavioralFinanceInsights />
      <ConfigurationSection Component={DataExport} />

      <ConfigurationSection
        Component={SensitivityAnalysisDisplay}
        componentProps={{ config: sensitivityConfig, returnConfig }}
        condition={hasSimulationData}
      />

      <RealEstateConfigurations />
      <ConfigurationSection Component={ProfileManagement} />
    </div>
  )
}
