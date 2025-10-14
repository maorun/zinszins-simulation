import { loadConfiguration, type SavedConfiguration } from '../../utils/config-storage'
import {
  initializeProfileStorage,
  getActiveProfile,
} from '../../utils/profile-storage'

/**
 * Load initial configuration from profile storage or legacy configuration
 */
export function loadInitialConfiguration(defaultConfig: SavedConfiguration): SavedConfiguration {
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
}
