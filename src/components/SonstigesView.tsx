import { lazy, useMemo } from 'react'
import type { SensitivityAnalysisConfig } from '../utils/sensitivity-analysis'
import type { ReturnConfiguration } from '../utils/random-returns'
import type { FinancialScenario } from '../data/scenarios'
import { TutorialManager } from './TutorialManager'
import { HomePageSpecialEvents } from './HomePageSpecialEvents'
import { BehavioralFinanceInsights } from './BehavioralFinanceInsights'
import { MarketPsychologyIndicators } from './MarketPsychologyIndicators'
import { ThreeDVisualizationCard } from './ThreeDVisualizationCard'
import { ConfigurationSection } from './sonstiges-sections/ConfigurationSection'
import { GrundeinstellungenSection } from './sonstiges-sections/GrundeinstellungenSection'
import { SteuerKonfigurationSection } from './sonstiges-sections/SteuerKonfigurationSection'
import { PlanningConfigurations } from './sonstiges-sections/PlanningConfigurations'
import { RealEstateConfigurations } from './sonstiges-sections/RealEstateConfigurations'
import { AnalysenWerkzeugeSection } from './sonstiges-sections/AnalysenWerkzeugeSection'
import { useSimulation } from '../contexts/useSimulation'
import { convertSparplanElementsToSimulationResult } from '../utils/chart-data-converter'

// Lazy load scenario selector
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
 * Organized into logical categories:
 * - Interactive Tutorials
 * - Special Events (Sonderereignisse)
 * - What-If Scenarios
 * - Basic Settings (Simulation, Time Range, Benchmark)
 * - Tax Configuration (all tax-related tools)
 * - Financial Planning & Life Situations
 * - Behavioral Finance Insights
 * - Market Psychology Indicators
 * - 3D Visualization (Zeit-Rendite-Kapital)
 * - Real Estate Analyses
 * - Analysis & Tools (Export, Sensitivity Analysis, Profiles)
 */
export function SonstigesView({
  sensitivityConfig,
  returnConfig,
  hasSimulationData,
  handleApplyScenario,
  startOfIndependence,
}: SonstigesViewProps) {
  const { planningMode, sparplanElemente } = useSimulation()

  // Convert sparplan elements to simulation result for 3D visualization
  const simulationResult = useMemo(
    () => convertSparplanElementsToSimulationResult(sparplanElemente),
    [sparplanElemente]
  )

  return (
    <div className="space-y-4">
      {/* 📚 Interaktive Tutorials */}
      <TutorialManager />

      {/* 🎯 Sonderereignisse verwalten */}
      <HomePageSpecialEvents />

      {/* 💡 Was-wäre-wenn Szenario */}
      <ConfigurationSection
        Component={ScenarioSelector}
        componentProps={{ onApplyScenario: handleApplyScenario }}
      />

      {/* 📊 Grundeinstellungen (category) */}
      <GrundeinstellungenSection />

      {/* 💰 Steuer-Konfiguration (category) */}
      <SteuerKonfigurationSection planningMode={planningMode} />

      {/* 💼 Finanzplanung & Lebenssituationen (category) */}
      <PlanningConfigurations startOfIndependence={startOfIndependence} />

      {/* 🧠 Behavioral Finance - Häufige Anlegerfehler */}
      <BehavioralFinanceInsights />

      {/* 📈 Marktpsychologie-Indikatoren */}
      <MarketPsychologyIndicators />

      {/* 📦 3D-Visualisierung: Zeit-Rendite-Kapital */}
      <ThreeDVisualizationCard simulationResult={simulationResult} />

      {/* 🏠 Immobilien-Analysen (category) */}
      <RealEstateConfigurations />

      {/* 📊 Analysen & Werkzeuge (category) */}
      <AnalysenWerkzeugeSection
        sensitivityConfig={sensitivityConfig}
        returnConfig={returnConfig}
        hasSimulationData={hasSimulationData}
      />
    </div>
  )
}
