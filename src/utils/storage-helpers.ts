/**
 * Storage Helper Utilities
 *
 * Centralized utilities for localStorage operations with consistent error handling.
 * Provides safe JSON serialization/deserialization and version checking support.
 */

/**
 * Interface for versioned storage data
 */
export interface VersionedStorage {
  version: number
  [key: string]: unknown
}

/**
 * Options for loading versioned data from storage
 */
export interface LoadVersionedOptions<T> {
  /** Storage key to read from */
  key: string
  /** Expected version number */
  expectedVersion: number
  /** Default value to return if data is missing or invalid */
  defaultValue: T
  /** Optional custom version field name (defaults to 'version') */
  versionField?: string
}

/**
 * Safely load and parse data from localStorage
 *
 * @template T - The expected type of the stored data
 * @param key - The localStorage key to read from
 * @returns The parsed data or null if not found, invalid, or an error occurred
 *
 * @example
 * ```typescript
 * const data = loadFromStorage<MyData>('my-key')
 * if (data) {
 *   // Use data
 * }
 * ```
 */
export function loadFromStorage<T>(key: string): T | null {
  try {
    const data = localStorage.getItem(key)
    if (!data) {
      return null
    }
    return JSON.parse(data) as T
  } catch (error) {
    console.error(`Failed to load ${key} from localStorage:`, error)
    return null
  }
}

/**
 * Safely save data to localStorage with JSON serialization
 *
 * @template T - The type of data to store
 * @param key - The localStorage key to write to
 * @param data - The data to serialize and store
 *
 * @example
 * ```typescript
 * const data = { name: 'Test', value: 42 }
 * saveToStorage('my-key', data)
 * ```
 */
export function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.error(`Failed to save ${key} to localStorage:`, error)
  }
}

/**
 * Load versioned data from localStorage with automatic version checking
 *
 * This function provides consistent version checking across all storage utilities.
 * If the stored version doesn't match the expected version, the default value is returned
 * and a warning is logged. This prevents data corruption from incompatible schema versions.
 *
 * @template T - The expected type of the stored data
 * @param options - Configuration options for loading versioned data
 * @returns The stored data if version matches, otherwise the default value
 *
 * @example
 * ```typescript
 * const preferences = loadVersionedStorage({
 *   key: 'user-preferences',
 *   expectedVersion: 2,
 *   defaultValue: DEFAULT_PREFERENCES
 * })
 * ```
 */
export function loadVersionedStorage<T extends VersionedStorage>(
  options: LoadVersionedOptions<T>
): T {
  const { key, expectedVersion, defaultValue, versionField = 'version' } = options

  try {
    const data = loadFromStorage<T>(key)
    
    if (!data) {
      return defaultValue
    }

    // Check version compatibility
    const storedVersion = data[versionField]
    if (storedVersion !== expectedVersion) {
      console.warn(
        `Storage version mismatch for ${key}: expected ${expectedVersion}, got ${storedVersion}. Using default value.`
      )
      return defaultValue
    }

    return data
  } catch (error) {
    console.error(`Failed to load versioned storage for ${key}:`, error)
    return defaultValue
  }
}

/**
 * Check if localStorage is available in the current environment
 *
 * @returns true if localStorage is available, false otherwise
 *
 * @example
 * ```typescript
 * if (isLocalStorageAvailable()) {
 *   saveToStorage('key', data)
 * }
 * ```
 */
export function isLocalStorageAvailable(): boolean {
  try {
    const testKey = '__storage_test__'
    localStorage.setItem(testKey, 'test')
    localStorage.removeItem(testKey)
    return true
  } catch {
    return false
  }
}

/**
 * Remove an item from localStorage
 *
 * @param key - The localStorage key to remove
 *
 * @example
 * ```typescript
 * removeFromStorage('my-key')
 * ```
 */
export function removeFromStorage(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error(`Failed to remove ${key} from localStorage:`, error)
  }
}

/**
 * Clear all items from localStorage
 *
 * Use with caution as this removes all stored data.
 *
 * @example
 * ```typescript
 * clearStorage()
 * ```
 */
export function clearStorage(): void {
  try {
    localStorage.clear()
  } catch (error) {
    console.error('Failed to clear localStorage:', error)
  }
}
