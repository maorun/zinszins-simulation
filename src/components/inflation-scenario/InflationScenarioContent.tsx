import { InfoPanel } from './InfoPanel'
import { WarningPanel } from './WarningPanel'
import { EnableDisableControl } from './EnableDisableControl'
import { EnabledScenarioSection } from './EnabledScenarioSection'
import type { InflationScenario, InflationScenarioId } from '../../../helpers/inflation-scenarios'

interface InflationScenarioContentProps {
  isEnabled: boolean
  selectedScenarioId: InflationScenarioId | 'none'
  scenarioYear: number
  availableScenarios: InflationScenario[]
  selectedScenario: InflationScenario | null
  cumulativeInflation: number | null
  averageInflation: number | null
  purchasingPowerImpact: number | null
  scenarioColors: { bg: string, text: string }
  enabledRadioId: string
  disabledRadioId: string
  scenarioYearSliderId: string
  simulationStartYear: number
  handleEnabledChange: (value: string) => void
  handleScenarioChange: (scenarioId: InflationScenarioId) => void
  handleYearChange: (year: number) => void
}

/**
 * Content component for inflation scenario configuration
 */
export const InflationScenarioContent = ({
  isEnabled,
  selectedScenarioId,
  scenarioYear,
  availableScenarios,
  selectedScenario,
  cumulativeInflation,
  averageInflation,
  purchasingPowerImpact,
  scenarioColors,
  enabledRadioId,
  disabledRadioId,
  scenarioYearSliderId,
  simulationStartYear,
  handleEnabledChange,
  handleScenarioChange,
  handleYearChange,
}: InflationScenarioContentProps) => {
  return (
    <div className="space-y-4">
      <InfoPanel />

      <EnableDisableControl
        isEnabled={isEnabled}
        onEnabledChange={handleEnabledChange}
        enabledRadioId={enabledRadioId}
        disabledRadioId={disabledRadioId}
      />

      {isEnabled && (
        <EnabledScenarioSection
          availableScenarios={availableScenarios}
          selectedScenarioId={selectedScenarioId}
          selectedScenario={selectedScenario}
          scenarioYear={scenarioYear}
          cumulativeInflation={cumulativeInflation}
          averageInflation={averageInflation}
          purchasingPowerImpact={purchasingPowerImpact}
          scenarioColors={scenarioColors}
          scenarioYearSliderId={scenarioYearSliderId}
          simulationStartYear={simulationStartYear}
          handleScenarioChange={handleScenarioChange}
          handleYearChange={handleYearChange}
        />
      )}

      <WarningPanel />
    </div>
  )
}
