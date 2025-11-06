import { useInflationScenarioLogic } from './inflation-scenario/useInflationScenarioLogic'
import { getScenarioColors } from './inflation-scenario/utils'
import { InflationScenarioCard } from './inflation-scenario/InflationScenarioCard'

interface InflationScenarioConfigurationProps {
  onScenarioChange?: (
    inflationRates: Record<number, number> | null,
    returnModifiers: Record<number, number> | null,
    scenarioName?: string,
  ) => void
  simulationStartYear: number
}

/**
 * Inflation Scenario Configuration Component
 * Allows users to simulate different inflation scenarios (hyperinflation, deflation, stagflation)
 */
const InflationScenarioConfiguration = ({
  onScenarioChange,
  simulationStartYear,
}: InflationScenarioConfigurationProps) => {
  const logic = useInflationScenarioLogic({ simulationStartYear, onScenarioChange })
  const scenarioColors = getScenarioColors(logic.selectedScenario)

  return <InflationScenarioCard {...logic} scenarioColors={scenarioColors} simulationStartYear={simulationStartYear} />
}

export default InflationScenarioConfiguration
