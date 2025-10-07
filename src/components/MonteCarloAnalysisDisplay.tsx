import React from 'react'
import type { RandomReturnConfig } from '../utils/random-returns'

interface MonteCarloResult {
  scenario: string
  description: string
  probability: string
}

interface MonteCarloAnalysisDisplayProps {
  config: RandomReturnConfig
  title: string
  phaseTitle: string
  blackSwanReturns?: Record<number, number> | null
  blackSwanEventName?: string
}

const MonteCarloAnalysisDisplay = ({
  config,
  title,
  phaseTitle,
  blackSwanReturns,
  blackSwanEventName,
}: MonteCarloAnalysisDisplayProps) => {
  // Helper functions
  const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`

  // Calculate Black Swan scenario if event is selected
  const blackSwanScenario = React.useMemo(() => {
    if (!blackSwanReturns || Object.keys(blackSwanReturns).length === 0) {
      return null
    }

    const returns = Object.values(blackSwanReturns)
    // Calculate cumulative return: (1 + r1) * (1 + r2) * ... - 1
    const cumulativeReturn = returns.reduce((acc, r) => acc * (1 + r), 1) - 1
    const years = Object.keys(blackSwanReturns).sort()
    const yearRange = years.length > 1 ? `${years[0]}-${years[years.length - 1]}` : years[0]

    return {
      scenario: `🦢 Black Swan: ${blackSwanEventName || 'Krisenszenario'}`,
      description: `Kumulativer Verlust über ${returns.length} Jahr${returns.length > 1 ? 'e' : ''} (${yearRange}): ${formatPercent(cumulativeReturn)}`,
      probability: 'Historisches Extremszenario zur Stresstestung',
      isBlackSwan: true,
    }
  }, [blackSwanReturns, blackSwanEventName])

  const createScenarios = (config: RandomReturnConfig): MonteCarloResult[] => [
    {
      scenario: 'Worst Case (5% Perzentil)',
      description: `Bei sehr ungünstiger Marktentwicklung. Erwartete Rendite: ${formatPercent(config.averageReturn - 1.645 * (config.standardDeviation || 0.15))}`,
      probability: '5% Wahrscheinlichkeit, dass das Ergebnis schlechter ausfällt',
    },
    {
      scenario: 'Pessimistisches Szenario (25% Perzentil)',
      description: `Bei unterdurchschnittlicher Marktentwicklung. Erwartete Rendite: ${formatPercent(config.averageReturn - 0.674 * (config.standardDeviation || 0.15))}`,
      probability: '25% Wahrscheinlichkeit, dass das Ergebnis schlechter ausfällt',
    },
    {
      scenario: 'Median-Szenario (50% Perzentil)',
      description: `Bei durchschnittlicher Marktentwicklung. Erwartete Rendite: ${formatPercent(config.averageReturn)}`,
      probability: '50% Wahrscheinlichkeit für bessere/schlechtere Ergebnisse',
    },
    {
      scenario: 'Optimistisches Szenario (75% Perzentil)',
      description: `Bei überdurchschnittlicher Marktentwicklung. Erwartete Rendite: ${formatPercent(config.averageReturn + 0.674 * (config.standardDeviation || 0.15))}`,
      probability: '25% Wahrscheinlichkeit für bessere Ergebnisse',
    },
    {
      scenario: 'Best Case (95% Perzentil)',
      description: `Bei sehr günstiger Marktentwicklung. Erwartete Rendite: ${formatPercent(config.averageReturn + 1.645 * (config.standardDeviation || 0.15))}`,
      probability: '5% Wahrscheinlichkeit für bessere Ergebnisse',
    },
  ]

  const scenarios = createScenarios(config)
  // Add Black Swan scenario at the top if available
  const allScenarios = blackSwanScenario ? [blackSwanScenario, ...scenarios] : scenarios

  return (
    <div className="mb-8">
      <h4 className="text-blue-700 mb-4 text-lg font-semibold">
        📊
        {' '}
        {title}
        {' '}
        -
        {' '}
        {phaseTitle}
      </h4>
      <div className="mb-5">
        <p className="mb-2">
          <strong>Simulationsparameter:</strong>
          {' '}
          Durchschnittliche Rendite
          {' '}
          {formatPercent(config.averageReturn)}
          , Volatilität
          {' '}
          {formatPercent(config.standardDeviation || 0.15)}
        </p>
        <p className="mb-2">
          <strong>Annahme:</strong>
          {' '}
          Die jährlichen Renditen folgen einer Normalverteilung. Reale Märkte können von dieser Annahme abweichen.
        </p>
        {config.seed && (
          <p className="mb-2">
            <strong>Zufallsseed:</strong>
            {' '}
            {config.seed}
            {' '}
            (deterministische Ergebnisse)
          </p>
        )}
        {blackSwanScenario && (
          <p className="mb-2">
            <strong>Black Swan Ereignis:</strong>
            {' '}
            {blackSwanEventName}
            {' '}
            wurde in die Analyse integriert
          </p>
        )}
      </div>

      <div className="block flex flex-col gap-3">
        {allScenarios.map((scenario, index) => {
          const isSuccess = scenario.scenario.includes('Best Case')
          const isDanger = scenario.scenario.includes('Worst Case') || (scenario as any).isBlackSwan
          const isInfo = scenario.scenario.includes('Median')

          let cardClasses = 'border border-gray-200 rounded-lg p-4 bg-white shadow-sm'
          if (isSuccess) cardClasses += ' border-l-4 border-l-green-500 bg-gradient-to-r from-green-50 to-green-100'
          else if (isDanger) cardClasses += ' border-l-4 border-l-red-500 bg-gradient-to-r from-red-50 to-red-100'
          else if (isInfo) cardClasses += ' border-l-4 border-l-cyan-500 bg-gradient-to-r from-cyan-50 to-cyan-100'

          return (
            <div key={index} className={cardClasses}>
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-base text-gray-800">{scenario.scenario}</span>
                <span className="font-semibold text-sm text-blue-700 bg-blue-100 px-2 py-1 rounded-xl">
                  {scenario.probability}
                </span>
              </div>
              <div className="text-sm text-gray-600 leading-relaxed">
                {scenario.description}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-4 p-3 bg-gray-50 border border-gray-300 rounded">
        <h6 className="font-semibold mb-2">💡 Hinweis zu Monte Carlo Simulationen:</h6>
        <p className="m-0 text-sm text-gray-700">
          Diese Szenarien basieren auf statistischen Modellen und historischen Annahmen.
          Tatsächliche Marktrenditen können stark abweichen. Die Simulation dient nur zur
          groben Orientierung und ersetzt keine professionelle Finanzberatung.
        </p>
      </div>
    </div>
  )
}

export default MonteCarloAnalysisDisplay
