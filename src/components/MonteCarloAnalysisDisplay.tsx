import React from 'react'
import type { RandomReturnConfig } from '../utils/random-returns'
import { createScenarios, calculateBlackSwanScenario } from './monte-carlo-helpers'
import SimulationParametersInfo from './SimulationParametersInfo'
import ScenarioCard from './ScenarioCard'
import DisclaimerSection from './DisclaimerSection'

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
  const blackSwanScenario = React.useMemo(
    () => calculateBlackSwanScenario(blackSwanReturns, blackSwanEventName),
    [blackSwanReturns, blackSwanEventName],
  )

  const scenarios = createScenarios(config)
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
      <SimulationParametersInfo
        config={config}
        blackSwanEventName={blackSwanEventName}
        hasBlackSwanScenario={blackSwanScenario !== null}
      />
      <div className="block flex flex-col gap-3">
        {allScenarios.map((scenario, index) => (
          <ScenarioCard key={index} scenario={scenario} />
        ))}
      </div>
      <DisclaimerSection />
    </div>
  )
}

export default MonteCarloAnalysisDisplay
