/**
 * Hook to handle loading saved scenarios from localStorage
 */

import { useCallback } from 'react'
import type { ExtendedSavedConfiguration } from '../contexts/helpers/config-types'
import { useSimulation } from '../contexts/useSimulation'
import { loadAllConfigurations } from '../contexts/hooks/config/loadConfigurationHelpers'
import { createDefaultConfiguration } from '../contexts/helpers/default-config'

/**
 * Hook to load saved scenario configurations
 * Applies configuration directly to simulation context
 */
export function useLoadSavedScenario() {
  const simulation = useSimulation()

  const handleLoadScenario = useCallback(
    (configuration: ExtendedSavedConfiguration) => {
      const defaultConfig = createDefaultConfiguration()
      
      // Use existing configuration loading infrastructure
      // The simulation context contains all setters required by loadAllConfigurations
      loadAllConfigurations(configuration, defaultConfig, simulation)
      
      // Trigger recalculation
      setTimeout(() => simulation.performSimulation(), 100)
    },
    [simulation]
  )

  return { handleLoadScenario }
}
