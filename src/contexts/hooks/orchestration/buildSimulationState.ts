import { useMemo } from 'react'
import type { useSimulationState } from '../useSimulationState'
import type { SimulationExecutionState } from '../useSimulationExecution'

/**
 * Builds memoized simulation state object from simulation state
 * Extracts only the state values needed for simulation execution
 * Uses useMemo to prevent unnecessary re-creation
 */
export function useBuildSimulationState(state: ReturnType<typeof useSimulationState>): SimulationExecutionState {
  // Destructure all needed properties for fine-grained memoization
  const {
    rendite, returnMode, averageReturn, standardDeviation,
    randomSeed, variableReturns, historicalIndex, blackSwanReturns,
    inflationScenarioRates, inflationScenarioReturnModifiers, multiAssetConfig,
    steuerlast, teilfreistellungsquote, freibetragPerYear, basiszinsConfiguration,
    steuerReduzierenEndkapitalSparphase, guenstigerPruefungAktiv, personalTaxRate,
    inflationAktivSparphase, inflationsrateSparphase, inflationAnwendungSparphase,
    simulationAnnual, sparplanElemente, startEnd,
  } = state

  return useMemo(
    () => ({
      // Return config
      rendite, returnMode, averageReturn, standardDeviation,
      randomSeed, variableReturns, historicalIndex, blackSwanReturns,
      inflationScenarioRates, inflationScenarioReturnModifiers, multiAssetConfig,
      // Tax config
      steuerlast, teilfreistellungsquote, freibetragPerYear, basiszinsConfiguration,
      steuerReduzierenEndkapitalSparphase, guenstigerPruefungAktiv, personalTaxRate,
      // Inflation config
      inflationAktivSparphase, inflationsrateSparphase, inflationAnwendungSparphase,
      // Simulation basics
      simulationAnnual, sparplanElemente, startEnd,
    }),
    [
      rendite, returnMode, averageReturn, standardDeviation,
      randomSeed, variableReturns, historicalIndex, blackSwanReturns,
      inflationScenarioRates, inflationScenarioReturnModifiers, multiAssetConfig,
      steuerlast, teilfreistellungsquote, freibetragPerYear, basiszinsConfiguration,
      steuerReduzierenEndkapitalSparphase, guenstigerPruefungAktiv, personalTaxRate,
      inflationAktivSparphase, inflationsrateSparphase, inflationAnwendungSparphase,
      simulationAnnual, sparplanElemente, startEnd,
    ],
  )
}
