import BlackSwanEventConfiguration from './BlackSwanEventConfiguration'
import InflationScenarioConfiguration from './InflationScenarioConfiguration'

interface RiskEventConfigurationProps {
  simulationStartYear: number
  onBlackSwanChange: (eventReturns: Record<number, number> | null, eventName?: string) => void
  onInflationScenarioChange: (
    inflationRates: Record<number, number> | null,
    returnModifiers: Record<number, number> | null,
    scenarioName?: string,
  ) => void
}

/**
 * Component for configuring risk events (Black Swan events and Inflation Scenarios)
 */
export function RiskEventConfiguration({
  simulationStartYear,
  onBlackSwanChange,
  onInflationScenarioChange,
}: RiskEventConfigurationProps) {
  return (
    <>
      {/* Black Swan Event Configuration */}
      <BlackSwanEventConfiguration
        simulationStartYear={simulationStartYear}
        onEventChange={onBlackSwanChange}
      />

      {/* Inflation Scenario Configuration */}
      <InflationScenarioConfiguration
        simulationStartYear={simulationStartYear}
        onScenarioChange={onInflationScenarioChange}
      />
    </>
  )
}
