import DataExport from './DataExport'
import SimulationModeSelector from './SimulationModeSelector'
import SensitivityAnalysisDisplay from './SensitivityAnalysisDisplay'
import { useAnalysisConfig } from '../hooks/useAnalysisConfig'

/**
 * Analysis and export section of the HomePage
 * Includes simulation mode selector, data export, and sensitivity analysis
 */
export function HomePageAnalysisSection() {
  const { simulationData, sparplanElemente, returnConfig, sensitivityConfig } = useAnalysisConfig()

  return (
    <>
      <SimulationModeSelector />

      <DataExport />

      {/* Sensitivity Analysis */}
      {simulationData && sparplanElemente && sparplanElemente.length > 0 && (
        <SensitivityAnalysisDisplay config={sensitivityConfig} returnConfig={returnConfig} />
      )}
    </>
  )
}
