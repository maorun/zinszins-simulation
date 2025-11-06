import type { useSimulationState } from '../useSimulationState'
import type { SimulationEffectsSetters } from '../useSimulationEffects'

/**
 * Builds effects setters object from simulation state
 * Extracts only the setter functions needed for side effects
 */
export function buildEffectsSetters(state: ReturnType<typeof useSimulationState>): SimulationEffectsSetters {
  return {
    setStartEnd: state.setStartEnd,
    setFreibetragPerYear: state.setFreibetragPerYear,
    setCoupleStatutoryPensionConfig: state.setCoupleStatutoryPensionConfig,
    setCareCostConfiguration: state.setCareCostConfiguration,
    setEndOfLife: state.setEndOfLife,
  }
}
