import { useMemo } from 'react'
import type { useSimulationState } from '../useSimulationState'
import type { SimulationExecutionState } from '../useSimulationExecution'

/**
 * Builds memoized simulation state object from simulation state
 * Extracts only the state values needed for simulation execution
 * Uses useMemo to prevent unnecessary re-creation
 */
export function useBuildSimulationState(
  state: ReturnType<typeof useSimulationState>,
): SimulationExecutionState {
  const {
    rendite, returnMode, averageReturn, standardDeviation, randomSeed,
    variableReturns, historicalIndex, blackSwanReturns, inflationScenarioRates,
    inflationScenarioReturnModifiers, multiAssetConfig, simulationAnnual,
    sparplanElemente, startEnd, steuerlast, teilfreistellungsquote,
    freibetragPerYear, basiszinsConfiguration, steuerReduzierenEndkapitalSparphase,
    inflationAktivSparphase, inflationsrateSparphase, inflationAnwendungSparphase,
    guenstigerPruefungAktiv, personalTaxRate,
  } = state

  return useMemo(
    () => ({
      rendite,
      returnMode,
      averageReturn,
      standardDeviation,
      randomSeed,
      variableReturns,
      historicalIndex,
      blackSwanReturns,
      inflationScenarioRates,
      inflationScenarioReturnModifiers,
      multiAssetConfig,
      simulationAnnual,
      sparplanElemente,
      startEnd,
      steuerlast,
      teilfreistellungsquote,
      freibetragPerYear,
      basiszinsConfiguration,
      steuerReduzierenEndkapitalSparphase,
      inflationAktivSparphase,
      inflationsrateSparphase,
      inflationAnwendungSparphase,
      guenstigerPruefungAktiv,
      personalTaxRate,
    }),
    [
      rendite, returnMode, averageReturn, standardDeviation, randomSeed,
      variableReturns, historicalIndex, blackSwanReturns, inflationScenarioRates,
      inflationScenarioReturnModifiers, multiAssetConfig, simulationAnnual,
      sparplanElemente, startEnd, steuerlast, teilfreistellungsquote,
      freibetragPerYear, basiszinsConfiguration, steuerReduzierenEndkapitalSparphase,
      inflationAktivSparphase, inflationsrateSparphase, inflationAnwendungSparphase,
      guenstigerPruefungAktiv, personalTaxRate,
    ],
  )
}
