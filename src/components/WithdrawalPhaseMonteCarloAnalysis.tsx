import type { RandomReturnConfig } from '../utils/random-returns'
import { useSimulation } from '../contexts/useSimulation'
import MonteCarloAnalysisDisplay from './MonteCarloAnalysisDisplay'

const WithdrawalPhaseMonteCarloAnalysis = () => {
  const { simulationData, randomSeed } = useSimulation()

  if (!simulationData) return null

  const config: RandomReturnConfig = {
    averageReturn: 0.05, // Default 5% for withdrawal phase (more conservative)
    standardDeviation: 0.12, // Default 12% volatility (more conservative)
    seed: randomSeed,
  }

  return (
    <MonteCarloAnalysisDisplay
      config={config}
      title="Monte Carlo Analyse"
      phaseTitle="Entnahmephase"
    />
  )
}

export default WithdrawalPhaseMonteCarloAnalysis
