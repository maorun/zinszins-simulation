import type { RandomReturnConfig } from '../utils/random-returns'
import { useSimulation } from '../contexts/useSimulation'
import MonteCarloAnalysisDisplay from './MonteCarloAnalysisDisplay'

const SavingsPhaseMonteCarloAnalysis = () => {
  const { simulationData, averageReturn, standardDeviation, randomSeed } = useSimulation()

  if (!simulationData) return null

  const config: RandomReturnConfig = {
    averageReturn: averageReturn / 100,
    standardDeviation: standardDeviation / 100,
    seed: randomSeed,
  }

  return (
    <MonteCarloAnalysisDisplay
      config={config}
      title="Monte Carlo Analyse"
      phaseTitle="Ansparphase"
    />
  )
}

export default SavingsPhaseMonteCarloAnalysis
