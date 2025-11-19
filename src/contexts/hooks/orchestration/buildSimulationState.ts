import { useMemo } from 'react'
import type { useSimulationState } from '../useSimulationState'
import type { SimulationExecutionState } from '../useSimulationExecution'
import {
  extractReturnConfig,
  extractTaxConfig,
  extractInflationConfig,
  extractSimulationBasics,
} from './buildSimulationState.helpers'

/**
 * Builds memoized simulation state object from simulation state
 * Extracts only the state values needed for simulation execution
 * Uses useMemo to prevent unnecessary re-creation
 */
export function useBuildSimulationState(state: ReturnType<typeof useSimulationState>): SimulationExecutionState {
  return useMemo(
    () => {
      const returnConfig = extractReturnConfig(state)
      const taxConfig = extractTaxConfig(state)
      const inflationConfig = extractInflationConfig(state)
      const simulationBasics = extractSimulationBasics(state)

      return {
        ...returnConfig,
        ...taxConfig,
        ...inflationConfig,
        ...simulationBasics,
      }
    },
    [
      state,
      state.rendite, state.returnMode, state.averageReturn, state.standardDeviation,
      state.randomSeed, state.variableReturns, state.historicalIndex, state.blackSwanReturns,
      state.inflationScenarioRates, state.inflationScenarioReturnModifiers, state.multiAssetConfig,
      state.simulationAnnual, state.sparplanElemente, state.startEnd, state.steuerlast,
      state.teilfreistellungsquote, state.freibetragPerYear, state.basiszinsConfiguration,
      state.steuerReduzierenEndkapitalSparphase, state.inflationAktivSparphase,
      state.inflationsrateSparphase, state.inflationAnwendungSparphase,
      state.guenstigerPruefungAktiv, state.personalTaxRate,
    ],
  )
}
