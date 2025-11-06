import { useSimulation } from '../contexts/useSimulation'
import { useReturnConfiguration } from './useReturnConfiguration'
import type { SensitivityAnalysisConfig } from '../utils/sensitivity-analysis'

/**
 * Custom hook that provides analysis configuration for HomePageAnalysisSection
 * Extracts simulation state and builds return config and sensitivity analysis config
 */
export function useAnalysisConfig() {
  const simulationState = useSimulation()

  const returnConfig = useReturnConfiguration({
    returnMode: simulationState.returnMode,
    rendite: simulationState.rendite,
    averageReturn: simulationState.averageReturn,
    standardDeviation: simulationState.standardDeviation,
    randomSeed: simulationState.randomSeed,
    variableReturns: simulationState.variableReturns,
    historicalIndex: simulationState.historicalIndex,
    multiAssetConfig: simulationState.multiAssetConfig,
  })

  const sensitivityConfig: SensitivityAnalysisConfig = {
    startYear: simulationState.startEnd[0],
    endYear: simulationState.startEnd[1],
    elements: simulationState.sparplanElemente,
    steuerlast: simulationState.steuerlast / 100,
    teilfreistellungsquote: simulationState.teilfreistellungsquote / 100,
    simulationAnnual: simulationState.simulationAnnual,
    freibetragPerYear: simulationState.freibetragPerYear,
    steuerReduzierenEndkapital: simulationState.steuerReduzierenEndkapitalSparphase,
    inflationAktivSparphase: simulationState.inflationAktivSparphase,
    inflationsrateSparphase: simulationState.inflationsrateSparphase,
    inflationAnwendungSparphase: simulationState.inflationAnwendungSparphase,
  }

  return {
    simulationData: simulationState.simulationData,
    sparplanElemente: simulationState.sparplanElemente,
    returnConfig,
    sensitivityConfig,
  }
}
