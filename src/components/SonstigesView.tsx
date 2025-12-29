import { lazy } from 'react'
import type { SensitivityAnalysisConfig } from '../utils/sensitivity-analysis'
import type { ReturnConfiguration } from '../utils/random-returns'
import type { FinancialScenario } from '../data/scenarios'
import { TutorialManager } from './TutorialManager'
import { HomePageSpecialEvents } from './HomePageSpecialEvents'
import { BehavioralFinanceInsights } from './BehavioralFinanceInsights'
import { ConfigurationSection } from './sonstiges-sections/ConfigurationSection'
import { GrundeinstellungenCategory } from './configuration-categories/GrundeinstellungenCategory'
import { SteuerKonfigurationCategory } from './configuration-categories/SteuerKonfigurationCategory'
import { FinancialPlanningCategory } from './sonstiges-sections/FinancialPlanningCategory'
import { RealEstateCategory } from './sonstiges-sections/RealEstateCategory'
import { AnalysisToolsCategory } from './sonstiges-sections/AnalysisToolsCategory'
import { useSimulation } from '../contexts/useSimulation'

// Lazy load remaining configuration components
const ScenarioSelector = lazy(() => import('./ScenarioSelector'))

interface SonstigesViewProps {
  sensitivityConfig: SensitivityAnalysisConfig
  returnConfig: ReturnConfiguration
  hasSimulationData: boolean
  handleApplyScenario: (scenario: FinancialScenario) => void
  startOfIndependence: number
}

/**
 * Sonstiges View - Extended features and advanced configuration
 * Organized into logical categories for better navigation:
 * - Tutorials & Learning
 * - Events & Scenarios
 * - Basic Settings
 * - Tax Configuration
 * - Financial Planning & Life Situations
 * - Behavioral Finance
 * - Real Estate Analysis
 * - Analysis & Tools
 */
export function SonstigesView({
  sensitivityConfig,
  returnConfig,
  hasSimulationData,
  handleApplyScenario,
  startOfIndependence,
}: SonstigesViewProps) {
  const { planningMode } = useSimulation()

  return (
    <div className="space-y-4">
      {/* Tutorials & Learning */}
      <TutorialManager />

      {/* Events & Scenarios */}
      <HomePageSpecialEvents />
      <ConfigurationSection
        Component={ScenarioSelector}
        componentProps={{ onApplyScenario: handleApplyScenario }}
      />

      {/* Basic Settings */}
      <GrundeinstellungenCategory />

      {/* Tax Configuration */}
      <SteuerKonfigurationCategory planningMode={planningMode} />

      {/* Financial Planning & Life Situations */}
      <FinancialPlanningCategory startOfIndependence={startOfIndependence} />

      {/* Behavioral Finance */}
      <BehavioralFinanceInsights />

      {/* Real Estate Analysis */}
      <RealEstateCategory />

      {/* Analysis & Tools */}
      <AnalysisToolsCategory
        sensitivityConfig={sensitivityConfig}
        returnConfig={returnConfig}
        hasSimulationData={hasSimulationData}
      />
    </div>
  )
}
