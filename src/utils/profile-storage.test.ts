import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { SavedConfiguration } from './config-storage'
import {
  initializeProfileStorage,
  getAllProfiles,
  getActiveProfile,
  setActiveProfile,
  createProfile,
  updateProfile,
  deleteProfile,
  duplicateProfile,
  clearAllProfiles,
  hasProfiles,
  getProfileCount,
  loadProfileStorage,
  saveProfileStorage,
  type ProfileStorage,
} from './profile-storage'

// Mock localStorage
const localStorageMock = {
  store: {} as Record<string, string>,
  getItem: vi.fn((key: string) => localStorageMock.store[key] || null),
  setItem: vi.fn((key: string, value: string) => {
    localStorageMock.store[key] = value
  }),
  removeItem: vi.fn((key: string) => {
    delete localStorageMock.store[key]
  }),
  clear: vi.fn(() => {
    localStorageMock.store = {}
  }),
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Test configuration
const testConfig: SavedConfiguration = {
  rendite: 5,
  steuerlast: 26.375,
  teilfreistellungsquote: 30,
  freibetragPerYear: { 2024: 1000, 2025: 1000 },
  returnMode: 'fixed',
  averageReturn: 5,
  standardDeviation: 15,
  variableReturns: {},
  startEnd: [2024, 2040],
  sparplan: [],
  simulationAnnual: 'monthly',
}

describe('profile-storage', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  describe('Profile Storage Initialization', () => {
    it('should initialize empty storage when no existing data', () => {
      const storage = initializeProfileStorage()

      expect(storage.version).toBe(1)
      expect(storage.activeProfileId).toBeNull()
      expect(Object.keys(storage.profiles)).toHaveLength(0)
      expect(storage.updatedAt).toBeDefined()
    })

    it('should migrate legacy configuration to default profile', () => {
      const storage = initializeProfileStorage(testConfig)

      expect(storage.activeProfileId).toBe('default')
      expect(Object.keys(storage.profiles)).toHaveLength(1)
      expect(storage.profiles.default).toBeDefined()
      expect(storage.profiles.default.name).toBe('Standard Profil')
      expect(storage.profiles.default.configuration).toEqual(testConfig)
    })

    it('should return existing storage if already initialized', () => {
      const firstStorage = initializeProfileStorage(testConfig)
      const secondStorage = initializeProfileStorage()

      expect(secondStorage).toEqual(firstStorage)
    })
  })

  describe('Profile CRUD Operations', () => {
    beforeEach(() => {
      initializeProfileStorage(testConfig)
    })

    it('should create a new profile', () => {
      const newProfile = createProfile('Test Profile', testConfig, 'Test description')

      expect(newProfile.name).toBe('Test Profile')
      expect(newProfile.description).toBe('Test description')
      expect(newProfile.configuration).toEqual(testConfig)
      expect(newProfile.id).toMatch(/^profile_/)
      expect(newProfile.createdAt).toBeDefined()
      expect(newProfile.updatedAt).toBeDefined()
    })

    it('should get all profiles sorted correctly', () => {
      createProfile('Profile A', testConfig)
      createProfile('Profile B', testConfig)

      const profiles = getAllProfiles()
      expect(profiles).toHaveLength(3) // default + 2 new
      expect(profiles[0].id).toBe('default') // Default profile should be first
      expect(profiles[0].name).toBe('Standard Profil')
    })

    it('should update an existing profile', () => {
      const newProfile = createProfile('Test Profile', testConfig)
      const updatedConfig = { ...testConfig, rendite: 7 }

      const success = updateProfile(newProfile.id, {
        name: 'Updated Profile',
        description: 'Updated description',
        configuration: updatedConfig,
      })

      expect(success).toBe(true)

      const profiles = getAllProfiles()
      const updated = profiles.find(p => p.id === newProfile.id)
      expect(updated?.name).toBe('Updated Profile')
      expect(updated?.description).toBe('Updated description')
      expect(updated?.configuration.rendite).toBe(7)
    })

    it('should not update non-existent profile', () => {
      const success = updateProfile('non-existent', { name: 'New Name' })
      expect(success).toBe(false)
    })

    it('should delete a profile', () => {
      const newProfile = createProfile('Test Profile', testConfig)
      const initialCount = getProfileCount()

      const success = deleteProfile(newProfile.id)
      expect(success).toBe(true)
      expect(getProfileCount()).toBe(initialCount - 1)

      const profiles = getAllProfiles()
      expect(profiles.find(p => p.id === newProfile.id)).toBeUndefined()
    })

    it('should not delete the last remaining profile', () => {
      // Only default profile exists
      expect(getProfileCount()).toBe(1)

      const success = deleteProfile('default')
      expect(success).toBe(false)
      expect(getProfileCount()).toBe(1)
    })

    it('should switch active profile when deleting current active', () => {
      const newProfile = createProfile('Test Profile', testConfig)
      setActiveProfile(newProfile.id)

      expect(getActiveProfile()?.id).toBe(newProfile.id)

      deleteProfile(newProfile.id)

      // Should switch back to default profile
      expect(getActiveProfile()?.id).toBe('default')
    })
  })

  describe('Active Profile Management', () => {
    beforeEach(() => {
      initializeProfileStorage(testConfig)
    })

    it('should set and get active profile', () => {
      const newProfile = createProfile('Test Profile', testConfig)

      const success = setActiveProfile(newProfile.id)
      expect(success).toBe(true)

      const active = getActiveProfile()
      expect(active?.id).toBe(newProfile.id)
      expect(active?.name).toBe('Test Profile')
    })

    it('should not set non-existent profile as active', () => {
      const success = setActiveProfile('non-existent')
      expect(success).toBe(false)
    })

    it('should return null when no active profile set', () => {
      clearAllProfiles()
      expect(getActiveProfile()).toBeNull()
    })
  })

  describe('Profile Duplication', () => {
    beforeEach(() => {
      initializeProfileStorage(testConfig)
    })

    it('should duplicate an existing profile', () => {
      const originalProfile = createProfile('Original Profile', testConfig, 'Original description')

      const duplicated = duplicateProfile(originalProfile.id, 'Duplicated Profile')

      expect(duplicated).not.toBeNull()
      expect(duplicated!.name).toBe('Duplicated Profile')
      expect(duplicated!.description).toBe('Kopie von "Original Profile"')
      expect(duplicated!.configuration).toEqual(testConfig)
      expect(duplicated!.id).not.toBe(originalProfile.id)
    })

    it('should not duplicate non-existent profile', () => {
      const duplicated = duplicateProfile('non-existent', 'New Name')
      expect(duplicated).toBeNull()
    })
  })

  describe('Storage Management', () => {
    it('should clear all profiles', () => {
      initializeProfileStorage(testConfig)
      createProfile('Test Profile', testConfig)

      expect(hasProfiles()).toBe(true)
      expect(getProfileCount()).toBeGreaterThan(0)

      clearAllProfiles()

      expect(hasProfiles()).toBe(false)
      expect(getProfileCount()).toBe(0)
    })

    it('should handle localStorage errors gracefully', () => {
      // Mock localStorage.setItem to throw an error
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw new Error('Storage full')
      })

      // Should not throw error
      const storage: ProfileStorage = {
        version: 1,
        activeProfileId: null,
        profiles: {},
        updatedAt: new Date().toISOString(),
      }

      expect(() => saveProfileStorage(storage)).not.toThrow()
    })

    it('should handle invalid JSON gracefully', () => {
      localStorageMock.store['zinszins-profiles'] = 'invalid json'

      const storage = loadProfileStorage()
      expect(storage).toBeNull()
    })

    it('should handle version mismatch gracefully', () => {
      const invalidStorage = {
        version: 999,
        activeProfileId: 'test',
        profiles: {},
        updatedAt: new Date().toISOString(),
      }

      localStorageMock.store['zinszins-profiles'] = JSON.stringify(invalidStorage)

      const storage = loadProfileStorage()
      expect(storage).toBeNull()
    })
  })

  describe('Profile Utilities', () => {
    it('should report correct profile count', () => {
      expect(getProfileCount()).toBe(0)

      initializeProfileStorage(testConfig)
      expect(getProfileCount()).toBe(1)

      createProfile('Test Profile', testConfig)
      expect(getProfileCount()).toBe(2)
    })

    it('should report profiles existence correctly', () => {
      expect(hasProfiles()).toBe(false)

      initializeProfileStorage(testConfig)
      expect(hasProfiles()).toBe(true)

      clearAllProfiles()
      expect(hasProfiles()).toBe(false)
    })
  })

  describe('Profile Sorting', () => {
    beforeEach(() => {
      initializeProfileStorage(testConfig)
    })

    it('should sort profiles with default first, then by creation date', () => {
      // Create profiles with delays to ensure different timestamps
      const profile1 = createProfile('Profile 1', testConfig)

      // Wait a bit to ensure different timestamps
      vi.useFakeTimers()
      vi.advanceTimersByTime(1000)

      const profile2 = createProfile('Profile 2', testConfig)

      vi.useRealTimers()

      const profiles = getAllProfiles()
      expect(profiles).toHaveLength(3)
      expect(profiles[0].id).toBe('default')
      expect(profiles[1].id).toBe(profile1.id)
      expect(profiles[2].id).toBe(profile2.id)
    })
  })
})
