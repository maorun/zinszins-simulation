import type { useSimulationState } from '../useSimulationState'
import type { SimulationEffectsState } from '../useSimulationEffects'

/**
 * Builds effects state object from simulation state
 * Extracts only the state values needed for side effects
 */
export function buildEffectsState(
  state: ReturnType<typeof useSimulationState>,
): SimulationEffectsState {
  return {
    endOfLife: state.endOfLife,
    planningMode: state.planningMode,
    freibetragPerYear: state.freibetragPerYear,
    coupleStatutoryPensionConfig: state.coupleStatutoryPensionConfig,
    careCostConfiguration: state.careCostConfiguration,
  }
}
