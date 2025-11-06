import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import {
  generateUniqueId,
  generateFormId,
  generateInstanceId,
  isIdUsed,
  registerExistingId,
  clearRegisteredIds,
  getRegisteredIds,
  useUniqueId,
  useFormId,
  useInstanceId,
  normalizeForId,
} from './unique-id'

describe('unique-id utilities', () => {
  beforeEach(() => {
    clearRegisteredIds()
  })

  describe('generateUniqueId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateUniqueId()
      const id2 = generateUniqueId()
      expect(id1).not.toBe(id2)
    })

    it('should use prefix when provided', () => {
      const id = generateUniqueId('test-prefix')
      expect(id).toMatch(/^test-prefix-\d+$/)
    })

    it('should use suffix when provided', () => {
      const id = generateUniqueId('prefix', 'suffix')
      expect(id).toMatch(/^prefix-\d+-suffix$/)
    })

    it('should handle conflicts by appending counter', () => {
      // Register an ID that would conflict
      registerExistingId('test-1')

      const id = generateUniqueId('test')
      expect(id).toMatch(/^test-\d+-\d+$/) // Should have additional counter
    })

    it('should generate sequential IDs', () => {
      const id1 = generateUniqueId('test')
      const id2 = generateUniqueId('test')

      expect(id1).toMatch(/^test-\d+$/)
      expect(id2).toMatch(/^test-\d+$/)
      expect(id1).not.toBe(id2)
    })
  })

  describe('generateFormId', () => {
    it('should generate form IDs with component and field names', () => {
      const id = generateFormId('statutory-pension', 'enabled')
      expect(id).toMatch(/^statutory-pension-enabled-\d+$/)
    })

    it('should include context when provided', () => {
      const id = generateFormId('health-care', 'amount', 'person1')
      expect(id).toMatch(/^health-care-person1-amount-\d+$/)
    })

    it('should generate unique IDs even with same parameters', () => {
      const id1 = generateFormId('component', 'field')
      const id2 = generateFormId('component', 'field')
      expect(id1).not.toBe(id2)
    })
  })

  describe('generateInstanceId', () => {
    it('should generate IDs with instance identifier', () => {
      const id = generateInstanceId('segment', 'abc123')
      expect(id).toMatch(/^segment-\d+-abc123$/)
    })

    it('should handle numeric instance IDs', () => {
      const id = generateInstanceId('item', 42)
      expect(id).toMatch(/^item-\d+-42$/)
    })

    it('should generate unique IDs for different instances', () => {
      const id1 = generateInstanceId('segment', 'instance1')
      const id2 = generateInstanceId('segment', 'instance2')
      expect(id1).not.toBe(id2)
    })
  })

  describe('isIdUsed', () => {
    it('should return false for unused IDs', () => {
      expect(isIdUsed('unused-id')).toBe(false)
    })

    it('should return true for generated IDs', () => {
      const id = generateUniqueId('test')
      expect(isIdUsed(id)).toBe(true)
    })

    it('should return true for registered IDs', () => {
      registerExistingId('existing-id')
      expect(isIdUsed('existing-id')).toBe(true)
    })
  })

  describe('registerExistingId', () => {
    it('should register new IDs successfully', () => {
      const result = registerExistingId('new-id')
      expect(result).toBe(true)
      expect(isIdUsed('new-id')).toBe(true)
    })

    it('should return false for already registered IDs', () => {
      registerExistingId('existing-id')
      const result = registerExistingId('existing-id')
      expect(result).toBe(false)
    })

    it('should prevent conflicts with generated IDs', () => {
      registerExistingId('test-1')
      const id = generateUniqueId('test')
      expect(id).not.toBe('test-1')
    })
  })

  describe('clearRegisteredIds', () => {
    it('should clear all registered IDs', () => {
      generateUniqueId('test1')
      generateUniqueId('test2')
      registerExistingId('manual-id')

      expect(getRegisteredIds()).toHaveLength(3)

      clearRegisteredIds()

      expect(getRegisteredIds()).toHaveLength(0)
    })

    it('should reset ID counter', () => {
      generateUniqueId('test') // This will be test-1
      clearRegisteredIds()
      const newId = generateUniqueId('test') // This should be test-1 again
      expect(newId).toBe('test-1')
    })
  })

  describe('getRegisteredIds', () => {
    it('should return empty array initially', () => {
      expect(getRegisteredIds()).toEqual([])
    })

    it('should return all registered IDs', () => {
      const id1 = generateUniqueId('test1')
      const id2 = generateUniqueId('test2')
      registerExistingId('manual-id')

      const registeredIds = getRegisteredIds()
      expect(registeredIds).toContain(id1)
      expect(registeredIds).toContain(id2)
      expect(registeredIds).toContain('manual-id')
      expect(registeredIds).toHaveLength(3)
    })
  })

  describe('useUniqueId (React Hook)', () => {
    it('should generate stable IDs within a component', () => {
      const { result, rerender } = renderHook(({ baseId, deps }) => useUniqueId(baseId, deps), {
        initialProps: { baseId: 'component', deps: ['dep1', 'dep2'] },
      })

      const firstId = result.current
      rerender({ baseId: 'component', deps: ['dep1', 'dep2'] })
      const secondId = result.current

      // Same component should get the same stable ID
      expect(firstId).toBe(secondId)
      expect(firstId).toMatch(/^component-_r_\w+_-dep1-dep2$/)
    })

    it('should generate different IDs for different components', () => {
      const { result: result1 } = renderHook(() => useUniqueId('component1'))
      const { result: result2 } = renderHook(() => useUniqueId('component2'))

      expect(result1.current).not.toBe(result2.current)
      expect(result1.current).toMatch(/^component1-_r_\w+_$/)
      expect(result2.current).toMatch(/^component2-_r_\w+_$/)
    })

    it('should handle different dependency types', () => {
      const { result } = renderHook(() => useUniqueId('component', ['string', 42, true]))
      expect(result.current).toMatch(/^component-_r_\w+_-string-42-true$/)
    })

    it('should work without dependencies', () => {
      const { result } = renderHook(() => useUniqueId('component'))
      expect(result.current).toMatch(/^component-_r_\w+_$/)
    })

    it('should update ID when dependencies change', () => {
      const { result, rerender } = renderHook(({ deps }) => useUniqueId('component', deps), {
        initialProps: { deps: ['dep1'] },
      })

      const firstId = result.current
      rerender({ deps: ['dep2'] })
      const secondId = result.current

      // Different dependencies should produce different IDs
      expect(firstId).not.toBe(secondId)
      expect(firstId).toMatch(/^component-_r_\w+_-dep1$/)
      expect(secondId).toMatch(/^component-_r_\w+_-dep2$/)
    })
  })

  describe('useFormId (React Hook)', () => {
    it('should generate stable IDs for form fields', () => {
      const { result, rerender } = renderHook(() => useFormId('statutory-pension', 'enabled', 'couple'))

      const firstId = result.current
      rerender()
      const secondId = result.current

      expect(firstId).toBe(secondId)
      expect(firstId).toMatch(/^statutory-pension-couple-enabled-_r_\w+_$/)
    })

    it('should work without context', () => {
      const { result } = renderHook(() => useFormId('other-income', 'monthly-amount'))
      expect(result.current).toMatch(/^other-income-monthly-amount-_r_\w+_$/)
    })

    it('should normalize context with spaces', () => {
      const { result } = renderHook(() => useFormId('pension', 'enabled', 'Anna Maria Schmidt'))
      expect(result.current).toMatch(/^pension-anna-maria-schmidt-enabled-_r_\w+_$/)
    })
  })

  describe('useInstanceId (React Hook)', () => {
    it('should generate stable IDs for instances', () => {
      const { result, rerender } = renderHook(() => useInstanceId('segment', 'abc123'))

      const firstId = result.current
      rerender()
      const secondId = result.current

      expect(firstId).toBe(secondId)
      expect(firstId).toMatch(/^segment-abc123-_r_\w+_$/)
    })

    it('should handle numeric instance IDs', () => {
      const { result } = renderHook(() => useInstanceId('item', 42))
      expect(result.current).toMatch(/^item-42-_r_\w+_$/)
    })

    it('should normalize string instance IDs', () => {
      const { result } = renderHook(() => useInstanceId('segment', 'Anna Maria Schmidt'))
      expect(result.current).toMatch(/^segment-anna-maria-schmidt-_r_\w+_$/)
    })
  })

  describe('normalizeForId', () => {
    it('should replace single spaces with hyphens', () => {
      expect(normalizeForId('Anna Schmidt')).toBe('anna-schmidt')
    })

    it('should replace multiple spaces with single hyphens', () => {
      expect(normalizeForId('Anna Maria Schmidt')).toBe('anna-maria-schmidt')
    })

    it('should handle multiple consecutive spaces', () => {
      expect(normalizeForId('Anna    Maria   Schmidt')).toBe('anna-maria-schmidt')
    })

    it('should trim leading and trailing spaces', () => {
      expect(normalizeForId('  Anna Schmidt  ')).toBe('anna-schmidt')
    })

    it('should handle tabs and newlines', () => {
      expect(normalizeForId('Anna\tMaria\nSchmidt')).toBe('anna-maria-schmidt')
    })

    it('should handle empty string', () => {
      expect(normalizeForId('')).toBe('')
    })

    it('should handle only whitespace', () => {
      expect(normalizeForId('   \t\n   ')).toBe('')
    })
  })

  describe('uniqueness guarantees', () => {
    it('should generate 1000 unique IDs without conflicts', () => {
      const ids = new Set<string>()

      for (let i = 0; i < 1000; i++) {
        const id = generateUniqueId('stress-test')
        expect(ids.has(id)).toBe(false)
        ids.add(id)
      }

      expect(ids.size).toBe(1000)
    })

    it('should handle mixed generation methods without conflicts', () => {
      const ids = new Set<string>()

      // Mix different generation methods
      for (let i = 0; i < 100; i++) {
        ids.add(generateUniqueId('mixed'))
        ids.add(generateFormId('mixed', 'field'))
        ids.add(generateInstanceId('mixed', i))
      }

      expect(ids.size).toBe(300) // All should be unique
    })
  })

  describe('memory management', () => {
    it('should manage memory usage with large number of IDs', () => {
      // Clear first to get a clean state
      clearRegisteredIds()

      // Generate a large number of IDs to test memory management
      const initialIds = []
      for (let i = 0; i < 100; i++) {
        initialIds.push(generateUniqueId('memory-test'))
      }

      // All IDs should be unique even with memory management
      const uniqueIds = new Set(initialIds)
      expect(uniqueIds.size).toBe(100)

      // Should still track some IDs (memory management may prune some)
      expect(getRegisteredIds().length).toBeGreaterThan(0)
    })
  })

  describe('edge cases', () => {
    it('should handle empty strings', () => {
      const id = generateUniqueId('', '')
      expect(id).toMatch(/^id-\d+$/) // Function uses 'id' as default when prefix is empty, suffix is empty so no trailing dash
    })

    it('should handle special characters in IDs', () => {
      const id = generateFormId('component-with-dashes', 'field_with_underscores')
      expect(id).toMatch(/^component-with-dashes-field_with_underscores-\d+$/)
    })

    it('should handle very long base IDs', () => {
      const longId = 'very-long-component-name-that-exceeds-normal-length'
      const id = generateInstanceId(longId, 'instance')
      expect(id).toContain(longId)
      expect(id).toContain('instance')
    })
  })
})
