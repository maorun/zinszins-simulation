import type { InflationScenario } from '../../../helpers/inflation-scenarios'
import { YearlyRatesDisplay } from './YearlyRatesDisplay'
import { ReturnModifiersDisplay } from './ReturnModifiersDisplay'
import { ScenarioStatistics } from './ScenarioStatistics'

interface ScenarioDetailsCardProps {
  scenario: InflationScenario
  cumulativeInflation: number | null
  averageInflation: number | null
  purchasingPowerImpact: number | null
  formatPercent: (value: number) => string
  colors: { bg: string, text: string }
}

/**
 * Component to display detailed information about a selected inflation scenario
 */
export const ScenarioDetailsCard = ({
  scenario,
  cumulativeInflation,
  averageInflation,
  purchasingPowerImpact,
  formatPercent,
  colors,
}: ScenarioDetailsCardProps) => {
  return (
    <div className={`mt-4 p-4 ${colors.bg} border rounded-lg`}>
      <h5 className={`font-semibold ${colors.text} mb-2`}>📊 Szenario-Details</h5>
      <div className="space-y-2 text-sm">
        <p>
          <strong>Beschreibung:</strong>
          {' '}
          {scenario.description}
        </p>
        <p>
          <strong>Dauer:</strong>
          {' '}
          {scenario.duration}
          {' '}
          {scenario.duration === 1 ? 'Jahr' : 'Jahre'}
        </p>

        <YearlyRatesDisplay
          yearlyRates={scenario.yearlyInflationRates}
          formatPercent={formatPercent}
          label="Jährliche Inflationsraten:"
        />

        {scenario.yearlyReturnModifiers && (
          <ReturnModifiersDisplay
            yearlyReturnModifiers={scenario.yearlyReturnModifiers}
            formatPercent={formatPercent}
          />
        )}

        <ScenarioStatistics
          cumulativeInflation={cumulativeInflation}
          averageInflation={averageInflation}
          purchasingPowerImpact={purchasingPowerImpact}
          duration={scenario.duration}
          formatPercent={formatPercent}
        />
      </div>
    </div>
  )
}
