import { useSimulation } from '../contexts/useSimulation'
import { useRiskCalculations } from './useRiskCalculations'
import { useRiskEventHandlers } from './useRiskEventHandlers'
import { getRiskConfig, getPhaseTitle } from '../components/risk-assessment-helpers'
import type { RandomReturnConfig } from '../utils/random-returns'

interface UseRiskAssessmentDataParams {
  phase: 'savings' | 'withdrawal'
  config?: RandomReturnConfig
}

/**
 * Custom hook to consolidate all risk assessment data and handlers
 */
export function useRiskAssessmentData({ phase, config }: UseRiskAssessmentDataParams) {
  const {
    simulationData,
    averageReturn,
    standardDeviation,
    randomSeed,
    returnMode,
    startEnd,
    blackSwanReturns,
    setBlackSwanReturns,
    blackSwanEventName,
    setBlackSwanEventName,
    setInflationScenarioRates,
    setInflationScenarioReturnModifiers,
    setInflationScenarioName,
    performSimulation,
  } = useSimulation()

  const { handleBlackSwanChange, handleInflationScenarioChange } = useRiskEventHandlers({
    setBlackSwanReturns,
    setBlackSwanEventName,
    setInflationScenarioRates,
    setInflationScenarioReturnModifiers,
    setInflationScenarioName,
    performSimulation,
  })

  const riskConfig = getRiskConfig(phase, config, averageReturn, standardDeviation, randomSeed ?? 12345)
  const { portfolioData, riskMetrics, hasRiskData } = useRiskCalculations(simulationData)

  const phaseTitle = getPhaseTitle(phase)
  const simulationStartYear = startEnd?.[0] ?? 2025

  return {
    simulationData,
    returnMode,
    riskConfig,
    portfolioData,
    riskMetrics,
    hasRiskData,
    phaseTitle,
    simulationStartYear,
    blackSwanReturns,
    blackSwanEventName,
    handleBlackSwanChange,
    handleInflationScenarioChange,
  }
}
