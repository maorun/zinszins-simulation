import { useMemo } from 'react'
import { useSimulation } from '../contexts/useSimulation'
import { useScenarioApplication } from './useScenarioApplication'
import { useReturnConfiguration } from './useReturnConfiguration'
import { useHomePageRecalculation } from './useHomePageRecalculation'
import { calculatePhaseDateRanges } from '../utils/phase-date-ranges'

/**
 * Custom hook that sets up scenario application handler
 */
function useScenarioHandler(simulationState: ReturnType<typeof useSimulation>) {
  return useScenarioApplication({
    setStartEnd: simulationState.setStartEnd,
    setReturnMode: simulationState.setReturnMode,
    setRendite: simulationState.setRendite,
    setAverageReturn: simulationState.setAverageReturn,
    setStandardDeviation: simulationState.setStandardDeviation,
    setSteuerlast: simulationState.setSteuerlast,
    setTeilfreistellungsquote: simulationState.setTeilfreistellungsquote,
    setFreibetragPerYear: simulationState.setFreibetragPerYear,
    setInflationAktivSparphase: simulationState.setInflationAktivSparphase,
    setInflationsrateSparphase: simulationState.setInflationsrateSparphase,
    setSparplan: simulationState.setSparplan,
    performSimulation: simulationState.performSimulation,
  })
}

/**
 * Custom hook that sets up return configuration
 * Memoized to prevent recalculation when dependencies haven't changed
 */
function useReturnConfig(simulationState: ReturnType<typeof useSimulation>) {
  return useReturnConfiguration({
    returnMode: simulationState.returnMode,
    rendite: simulationState.rendite,
    averageReturn: simulationState.averageReturn,
    standardDeviation: simulationState.standardDeviation,
    randomSeed: simulationState.randomSeed,
    variableReturns: simulationState.variableReturns,
    historicalIndex: simulationState.historicalIndex,
    multiAssetConfig: simulationState.multiAssetConfig,
  })
}

/**
 * Custom hook that aggregates all HomePage-specific logic and handlers
 */
export function useHomePageLogic() {
  const simulationState = useSimulation()

  const { handleApplyScenario } = useScenarioHandler(simulationState)
  const returnConfig = useReturnConfig(simulationState)

  const { handleRecalculate, handleSpecialEventsDispatch } = useHomePageRecalculation(
    simulationState.sparplan,
    simulationState.startEnd,
    simulationState.simulationAnnual,
    simulationState.setSparplanElemente,
    simulationState.performSimulation,
  )

  // Memoize phase date ranges calculation
  const phaseDateRanges = useMemo(() => calculatePhaseDateRanges(
    simulationState.sparplan,
    simulationState.startEnd,
    simulationState.endOfLife,
  ), [simulationState.sparplan, simulationState.startEnd, simulationState.endOfLife])

  return {
    ...simulationState,
    handleApplyScenario,
    returnConfig,
    handleRecalculate,
    handleSpecialEventsDispatch,
    phaseDateRanges,
  }
}
