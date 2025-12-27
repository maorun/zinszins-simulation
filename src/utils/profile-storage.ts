import type { SavedConfiguration } from './config-storage'

/**
 * Interface for a user profile
 */
export interface UserProfile {
  /** Unique identifier for the profile */
  id: string
  /** User-friendly name for the profile */
  name: string
  /** Profile description (optional) */
  description?: string
  /** Configuration data for this profile */
  configuration: SavedConfiguration
  /** Timestamp when profile was created */
  createdAt: string
  /** Timestamp when profile was last updated */
  updatedAt: string
}

/**
 * Profile storage metadata
 */
export interface ProfileStorage {
  /** Storage format version */
  version: number
  /** ID of the currently active profile */
  activeProfileId: string | null
  /** Map of profile ID to profile data */
  profiles: Record<string, UserProfile>
  /** Timestamp when storage was last updated */
  updatedAt: string
}

const PROFILE_STORAGE_KEY = 'zinszins-profiles'
const PROFILE_STORAGE_VERSION = 1
const DEFAULT_PROFILE_ID = 'default'
const DEFAULT_PROFILE_NAME = 'Standard Profil'

/**
 * Generate a unique profile ID
 */
function generateProfileId(): string {
  return `profile_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
}

/**
 * Create a default profile from existing configuration
 */
function createDefaultProfile(config: SavedConfiguration): UserProfile {
  const now = new Date().toISOString()
  return {
    id: DEFAULT_PROFILE_ID,
    name: DEFAULT_PROFILE_NAME,
    description: 'Automatisch erstelltes Standardprofil',
    configuration: config,
    createdAt: now,
    updatedAt: now,
  }
}

/**
 * Load profile storage from localStorage
 */
export function loadProfileStorage(): ProfileStorage | null {
  try {
    const savedData = localStorage.getItem(PROFILE_STORAGE_KEY)
    if (!savedData) {
      return null
    }

    const parsedData = JSON.parse(savedData)

    // Check version compatibility
    if (parsedData.version !== PROFILE_STORAGE_VERSION) {
      console.warn('Profile storage version mismatch, ignoring saved profiles')
      return null
    }

    return parsedData as ProfileStorage
  } catch (error) {
    console.error('Failed to load profile storage from localStorage:', error)
    return null
  }
}

/**
 * Save profile storage to localStorage
 */
export function saveProfileStorage(storage: ProfileStorage): void {
  try {
    storage.updatedAt = new Date().toISOString()
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(storage))
  } catch (error) {
    console.error('Failed to save profile storage to localStorage:', error)
  }
}

/**
 * Initialize profile storage with migration from legacy single configuration
 */
export function initializeProfileStorage(legacyConfig?: SavedConfiguration): ProfileStorage {
  const existingStorage = loadProfileStorage()

  if (existingStorage) {
    return existingStorage
  }

  // Create new storage
  const now = new Date().toISOString()
  const storage: ProfileStorage = {
    version: PROFILE_STORAGE_VERSION,
    activeProfileId: null,
    profiles: {},
    updatedAt: now,
  }

  // If we have a legacy configuration, migrate it to default profile
  if (legacyConfig) {
    storage.profiles[DEFAULT_PROFILE_ID] = createDefaultProfile(legacyConfig)
    storage.activeProfileId = DEFAULT_PROFILE_ID
  }

  saveProfileStorage(storage)
  return storage
}

/**
 * Get all profiles
 */
export function getAllProfiles(): UserProfile[] {
  const storage = loadProfileStorage()
  if (!storage) {
    return []
  }
  return Object.values(storage.profiles).sort((a, b) => {
    // Sort default profile first, then by creation date
    if (a.id === DEFAULT_PROFILE_ID) return -1
    if (b.id === DEFAULT_PROFILE_ID) return 1
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  })
}

/**
 * Get active profile
 */
export function getActiveProfile(): UserProfile | null {
  const storage = loadProfileStorage()
  if (!storage || !storage.activeProfileId) {
    return null
  }
  return storage.profiles[storage.activeProfileId] || null
}

/**
 * Set active profile
 */
export function setActiveProfile(profileId: string): boolean {
  const storage = loadProfileStorage()
  if (!storage || !storage.profiles[profileId]) {
    return false
  }

  storage.activeProfileId = profileId
  saveProfileStorage(storage)
  return true
}

/**
 * Create a new profile
 */
export function createProfile(name: string, configuration: SavedConfiguration, description?: string): UserProfile {
  const storage = loadProfileStorage() || initializeProfileStorage()

  const profileId = generateProfileId()
  const now = new Date().toISOString()

  const newProfile: UserProfile = {
    id: profileId,
    name,
    description,
    configuration,
    createdAt: now,
    updatedAt: now,
  }

  storage.profiles[profileId] = newProfile
  saveProfileStorage(storage)

  return newProfile
}

/**
 * Update an existing profile
 */
export function updateProfile(
  profileId: string,
  updates: Partial<Pick<UserProfile, 'name' | 'description' | 'configuration'>>,
): boolean {
  const storage = loadProfileStorage()
  if (!storage || !storage.profiles[profileId]) {
    return false
  }

  const profile = storage.profiles[profileId]
  storage.profiles[profileId] = {
    ...profile,
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  saveProfileStorage(storage)
  return true
}

/**
 * Delete a profile
 */
export function deleteProfile(profileId: string): boolean {
  const storage = loadProfileStorage()
  if (!storage || !storage.profiles[profileId]) {
    return false
  }

  // Don't allow deleting the last profile
  const profileCount = Object.keys(storage.profiles).length
  if (profileCount <= 1) {
    return false
  }

  delete storage.profiles[profileId]

  // If we deleted the active profile, switch to another one
  if (storage.activeProfileId === profileId) {
    const remainingProfiles = Object.keys(storage.profiles)
    storage.activeProfileId = remainingProfiles.includes(DEFAULT_PROFILE_ID) ? DEFAULT_PROFILE_ID : remainingProfiles[0]
  }

  saveProfileStorage(storage)
  return true
}

/**
 * Duplicate a profile
 */
export function duplicateProfile(profileId: string, newName: string): UserProfile | null {
  const storage = loadProfileStorage()
  if (!storage || !storage.profiles[profileId]) {
    return null
  }

  const sourceProfile = storage.profiles[profileId]
  return createProfile(newName, sourceProfile.configuration, `Kopie von "${sourceProfile.name}"`)
}

/**
 * Clear all profiles and reset to defaults
 */
export function clearAllProfiles(): void {
  try {
    localStorage.removeItem(PROFILE_STORAGE_KEY)
  } catch (error) {
    console.error('Failed to clear profile storage from localStorage:', error)
  }
}

/**
 * Check if profiles exist
 */
export function hasProfiles(): boolean {
  const storage = loadProfileStorage()
  return storage !== null && Object.keys(storage.profiles).length > 0
}

/**
 * Get profile count
 */
export function getProfileCount(): number {
  const storage = loadProfileStorage()
  return storage ? Object.keys(storage.profiles).length : 0
}
