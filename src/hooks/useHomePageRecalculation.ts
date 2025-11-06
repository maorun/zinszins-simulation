import { useEffect, useCallback } from 'react'
import { convertSparplanToElements, type Sparplan, type SparplanElement } from '../utils/sparplan-utils'
import type { SimulationAnnualType } from '../utils/simulate'

/**
 * Custom hook to manage HomePage recalculation logic
 * Extracted to reduce component complexity
 */
export function useHomePageRecalculation(
  sparplan: Sparplan[],
  startEnd: [number, number],
  simulationAnnual: SimulationAnnualType,
  setSparplanElemente: (elements: SparplanElement[]) => void,
  performSimulation: () => void,
) {
  // Auto-perform simulation on mount and when performSimulation changes
  useEffect(() => {
    performSimulation()
  }, [performSimulation])

  // Handler for manual recalculation button
  const handleRecalculate = useCallback(() => {
    setSparplanElemente(convertSparplanToElements(sparplan, startEnd, simulationAnnual))
    performSimulation()
  }, [sparplan, startEnd, simulationAnnual, setSparplanElemente, performSimulation])

  // Handler for SpecialEvents dispatch
  const handleSpecialEventsDispatch = useCallback(
    (updatedSparplan: Sparplan[]) => {
      setSparplanElemente(convertSparplanToElements(updatedSparplan, startEnd, simulationAnnual))
    },
    [startEnd, simulationAnnual, setSparplanElemente],
  )

  return {
    handleRecalculate,
    handleSpecialEventsDispatch,
  }
}
