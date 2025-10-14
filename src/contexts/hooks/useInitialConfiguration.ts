import { useMemo } from 'react'
import { loadConfiguration } from '../../utils/config-storage'
import {
  initializeProfileStorage,
  getActiveProfile,
} from '../../utils/profile-storage'
import type { DefaultConfigType } from '../helpers/default-config'

/**
 * Custom hook to load initial configuration from storage or profiles
 * Handles legacy config migration and profile initialization
 */
export function useInitialConfiguration(defaultConfig: DefaultConfigType) {
  return useMemo(() => {
    // Try legacy configuration first
    const legacyConfig = loadConfiguration()

    // Initialize profile storage with legacy config if it exists
    initializeProfileStorage(legacyConfig || undefined)

    // Get active profile config if available
    const activeProfile = getActiveProfile()
    if (activeProfile) {
      return activeProfile.configuration
    }

    // Fallback to legacy config or defaults
    return legacyConfig || defaultConfig
  }, [defaultConfig])
}
