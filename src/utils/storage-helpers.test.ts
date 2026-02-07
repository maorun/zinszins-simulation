import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  loadFromStorage,
  saveToStorage,
  loadVersionedStorage,
  isLocalStorageAvailable,
  removeFromStorage,
  clearStorage,
  type VersionedStorage,
} from './storage-helpers'

describe('storage-helpers', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('loadFromStorage', () => {
    it('should return null when key does not exist', () => {
      const result = loadFromStorage<string>('non-existent-key')
      expect(result).toBeNull()
    })

    it('should return parsed data when key exists', () => {
      const data = { name: 'Test', value: 42 }
      localStorage.setItem('test-key', JSON.stringify(data))

      const result = loadFromStorage<typeof data>('test-key')
      expect(result).toEqual(data)
    })

    it('should return null and log error when JSON parsing fails', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      localStorage.setItem('test-key', 'invalid json')

      const result = loadFromStorage<string>('test-key')
      expect(result).toBeNull()
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to load test-key from localStorage:'),
        expect.any(Error)
      )

      consoleSpy.mockRestore()
    })

    it('should handle complex nested objects', () => {
      const data = {
        users: [
          { id: 1, name: 'Alice' },
          { id: 2, name: 'Bob' },
        ],
        settings: {
          theme: 'dark',
          notifications: true,
        },
      }
      localStorage.setItem('complex-key', JSON.stringify(data))

      const result = loadFromStorage<typeof data>('complex-key')
      expect(result).toEqual(data)
    })
  })

  describe('saveToStorage', () => {
    it('should save data to localStorage', () => {
      const data = { name: 'Test', value: 42 }
      saveToStorage('test-key', data)

      const stored = localStorage.getItem('test-key')
      expect(stored).toBe(JSON.stringify(data))
    })

    it('should serialize complex objects correctly', () => {
      const data = {
        array: [1, 2, 3],
        nested: { a: 1, b: { c: 2 } },
        date: new Date('2024-01-01').toISOString(),
      }
      saveToStorage('complex-key', data)

      const stored = localStorage.getItem('complex-key')
      expect(JSON.parse(stored!)).toEqual(data)
    })
  })

  describe('loadVersionedStorage', () => {
    interface TestStorage extends VersionedStorage {
      version: number
      data: string
    }

    const defaultValue: TestStorage = {
      version: 2,
      data: 'default',
    }

    it('should return default value when key does not exist', () => {
      const result = loadVersionedStorage({
        key: 'test-key',
        expectedVersion: 2,
        defaultValue,
      })

      expect(result).toEqual(defaultValue)
    })

    it('should return stored data when version matches', () => {
      const storedData: TestStorage = {
        version: 2,
        data: 'stored value',
      }
      localStorage.setItem('test-key', JSON.stringify(storedData))

      const result = loadVersionedStorage({
        key: 'test-key',
        expectedVersion: 2,
        defaultValue,
      })

      expect(result).toEqual(storedData)
    })

    it('should return default value and log warning when version does not match', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const storedData = {
        version: 1,
        data: 'old version',
      }
      localStorage.setItem('test-key', JSON.stringify(storedData))

      const result = loadVersionedStorage({
        key: 'test-key',
        expectedVersion: 2,
        defaultValue,
      })

      expect(result).toEqual(defaultValue)
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Storage version mismatch for test-key: expected 2, got 1')
      )

      consoleSpy.mockRestore()
    })

    it('should support custom version field name', () => {
      interface CustomStorage extends VersionedStorage {
        schemaVersion: number
        data: string
      }

      const customDefault: CustomStorage = {
        schemaVersion: 3,
        version: 3,
        data: 'default',
      }

      const storedData: CustomStorage = {
        schemaVersion: 3,
        version: 3,
        data: 'stored value',
      }
      localStorage.setItem('custom-key', JSON.stringify(storedData))

      const result = loadVersionedStorage({
        key: 'custom-key',
        expectedVersion: 3,
        defaultValue: customDefault,
        versionField: 'schemaVersion',
      })

      expect(result).toEqual(storedData)
    })

    it('should return default value when stored data is invalid JSON', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      localStorage.setItem('test-key', 'invalid json')

      const result = loadVersionedStorage({
        key: 'test-key',
        expectedVersion: 2,
        defaultValue,
      })

      expect(result).toEqual(defaultValue)
      expect(consoleSpy).toHaveBeenCalled()

      consoleSpy.mockRestore()
    })
  })

  describe('isLocalStorageAvailable', () => {
    it('should return true when localStorage is available', () => {
      expect(isLocalStorageAvailable()).toBe(true)
    })
  })

  describe('removeFromStorage', () => {
    it('should remove item from localStorage', () => {
      localStorage.setItem('test-key', 'test value')
      expect(localStorage.getItem('test-key')).toBe('test value')

      removeFromStorage('test-key')
      expect(localStorage.getItem('test-key')).toBeNull()
    })

    it('should not throw when removing non-existent key', () => {
      expect(() => removeFromStorage('non-existent')).not.toThrow()
    })
  })

  describe('clearStorage', () => {
    it('should clear all items from localStorage', () => {
      localStorage.setItem('key1', 'value1')
      localStorage.setItem('key2', 'value2')
      localStorage.setItem('key3', 'value3')

      expect(localStorage.length).toBe(3)

      clearStorage()
      expect(localStorage.length).toBe(0)
    })
  })

  describe('Integration tests', () => {
    it('should handle save and load cycle correctly', () => {
      const data = { name: 'Integration Test', count: 123 }
      
      saveToStorage('integration-key', data)
      const loaded = loadFromStorage<typeof data>('integration-key')
      
      expect(loaded).toEqual(data)
    })

    it('should handle versioned storage save and load cycle', () => {
      interface MyData extends VersionedStorage {
        version: number
        name: string
        value: number
      }

      const data: MyData = {
        version: 5,
        name: 'Test Data',
        value: 42,
      }

      const defaultData: MyData = {
        version: 5,
        name: 'Default',
        value: 0,
      }

      saveToStorage('versioned-key', data)
      
      const loaded = loadVersionedStorage({
        key: 'versioned-key',
        expectedVersion: 5,
        defaultValue: defaultData,
      })

      expect(loaded).toEqual(data)
    })

    it('should handle removing and then loading (returns null)', () => {
      saveToStorage('temp-key', { data: 'temporary' })
      expect(loadFromStorage('temp-key')).not.toBeNull()

      removeFromStorage('temp-key')
      expect(loadFromStorage('temp-key')).toBeNull()
    })
  })
})
