import { ScenarioSelector } from './ScenarioSelector'
import { YearSlider } from './YearSlider'
import { ScenarioDetailsCard } from './ScenarioDetailsCard'
import type { InflationScenario, InflationScenarioId } from '../../../helpers/inflation-scenarios'
import { formatPercent } from './utils'

interface EnabledScenarioSectionProps {
  availableScenarios: InflationScenario[]
  selectedScenarioId: InflationScenarioId | 'none'
  selectedScenario: InflationScenario | null
  scenarioYear: number
  cumulativeInflation: number | null
  averageInflation: number | null
  purchasingPowerImpact: number | null
  scenarioColors: { bg: string, text: string }
  scenarioYearSliderId: string
  simulationStartYear: number
  handleScenarioChange: (scenarioId: InflationScenarioId) => void
  handleYearChange: (year: number) => void
}

/**
 * Section shown when inflation scenarios are enabled
 */
export const EnabledScenarioSection = ({
  availableScenarios,
  selectedScenarioId,
  selectedScenario,
  scenarioYear,
  cumulativeInflation,
  averageInflation,
  purchasingPowerImpact,
  scenarioColors,
  scenarioYearSliderId,
  simulationStartYear,
  handleScenarioChange,
  handleYearChange,
}: EnabledScenarioSectionProps) => {
  return (
    <>
      <ScenarioSelector
        availableScenarios={availableScenarios}
        selectedScenarioId={selectedScenarioId}
        onScenarioChange={handleScenarioChange}
      />

      {selectedScenario && (
        <YearSlider
          scenarioYear={scenarioYear}
          onYearChange={handleYearChange}
          scenarioYearSliderId={scenarioYearSliderId}
          simulationStartYear={simulationStartYear}
        />
      )}

      {selectedScenario && (
        <ScenarioDetailsCard
          scenario={selectedScenario}
          cumulativeInflation={cumulativeInflation}
          averageInflation={averageInflation}
          purchasingPowerImpact={purchasingPowerImpact}
          formatPercent={formatPercent}
          colors={scenarioColors}
        />
      )}
    </>
  )
}
