import type { DefaultConfigType } from '../helpers/default-config'
import { useConfigurationManagement } from './useConfigurationManagement'
import { useSimulationExecution } from './useSimulationExecution'
import { useSimulationEffects } from './useSimulationEffects'
import type { useSimulationState } from './useSimulationState'
import { buildConfigState } from './orchestration/buildConfigState'
import { buildConfigSetters } from './orchestration/buildConfigSetters'
import { useBuildSimulationState } from './orchestration/buildSimulationState'
import { buildEffectsState } from './orchestration/buildEffectsState'
import { buildEffectsSetters } from './orchestration/buildEffectsSetters'

/**
 * Custom hook to prepare state objects for configuration management, simulation execution, and effects
 * This reduces boilerplate in SimulationProvider by centralizing object construction
 */
export function useSimulationOrchestration(
  defaultConfig: DefaultConfigType,
  state: ReturnType<typeof useSimulationState>,
) {
  // Build configuration management state and setters
  const configState = buildConfigState(state)
  const configSetters = buildConfigSetters(state)
  const configManagement = useConfigurationManagement(defaultConfig, configState, configSetters)

  // Build simulation execution state - memoized to prevent unnecessary re-creation
  const simulationState = useBuildSimulationState(state)
  const { performSimulation } = useSimulationExecution(
    simulationState,
    state.setIsLoading,
    state.setSimulationData,
  )

  // Build side effects state and setters
  const effectsState = buildEffectsState(state)
  const effectsSetters = buildEffectsSetters(state)
  const effects = useSimulationEffects(effectsState, effectsSetters, configManagement.saveCurrentConfiguration)

  return {
    configManagement,
    performSimulation,
    setEndOfLifeRounded: effects.setEndOfLifeRounded,
  }
}
