import { describe, it, expect } from 'vitest'
import { unique, isEmpty } from './array-utils'

describe('array-utils', () => {
  describe('unique', () => {
    it('should return an empty array for null input', () => {
      const result = unique(null)
      expect(result).toEqual([])
    })

    it('should return an empty array for undefined input', () => {
      const result = unique(undefined)
      expect(result).toEqual([])
    })

    it('should return an empty array for empty array input', () => {
      const result = unique([])
      expect(result).toEqual([])
    })

    it('should return unique numbers from an array', () => {
      const input = [1, 2, 3, 2, 1, 4, 3, 5]
      const result = unique(input)
      expect(result).toEqual([1, 2, 3, 4, 5])
    })

    it('should return unique strings from an array', () => {
      const input = ['apple', 'banana', 'apple', 'cherry', 'banana']
      const result = unique(input)
      expect(result).toEqual(['apple', 'banana', 'cherry'])
    })

    it('should handle array with single element', () => {
      const result = unique([42])
      expect(result).toEqual([42])
    })

    it('should handle array with all duplicate elements', () => {
      const result = unique([5, 5, 5, 5])
      expect(result).toEqual([5])
    })

    it('should handle array with no duplicates', () => {
      const input = [1, 2, 3, 4, 5]
      const result = unique(input)
      expect(result).toEqual([1, 2, 3, 4, 5])
    })

    it('should filter out undefined values', () => {
      const input = [1, undefined, 2, undefined, 3]
      const result = unique(input)
      expect(result).toEqual([1, 2, 3])
    })

    it('should preserve order of first occurrence', () => {
      const input = [3, 1, 2, 3, 1, 4]
      const result = unique(input)
      expect(result).toEqual([3, 1, 2, 4])
    })

    it('should handle mixed string and number types separately', () => {
      const numbers = [1, 2, 1, 3, 2]
      const strings = ['a', 'b', 'a', 'c', 'b']
      
      expect(unique(numbers)).toEqual([1, 2, 3])
      expect(unique(strings)).toEqual(['a', 'b', 'c'])
    })

    it('should handle zero as a valid unique value', () => {
      const input = [0, 1, 0, 2, 0, 3]
      const result = unique(input)
      expect(result).toEqual([0, 1, 2, 3])
    })

    it('should handle empty string as a valid unique value', () => {
      const input = ['', 'a', '', 'b', '']
      const result = unique(input)
      expect(result).toEqual(['', 'a', 'b'])
    })
  })

  describe('isEmpty', () => {
    it('should return true for null', () => {
      expect(isEmpty(null)).toBe(true)
    })

    it('should return true for undefined', () => {
      expect(isEmpty(undefined)).toBe(true)
    })

    it('should return true for empty object', () => {
      expect(isEmpty({})).toBe(true)
    })

    it('should return false for object with properties', () => {
      expect(isEmpty({ key: 'value' })).toBe(false)
    })

    it('should return false for object with numeric property', () => {
      expect(isEmpty({ 0: 'value' })).toBe(false)
    })

    it('should return false for object with multiple properties', () => {
      expect(isEmpty({ a: 1, b: 2, c: 3 })).toBe(false)
    })

    it('should return false for object with false value', () => {
      expect(isEmpty({ flag: false })).toBe(false)
    })

    it('should return false for object with zero value', () => {
      expect(isEmpty({ count: 0 })).toBe(false)
    })

    it('should return false for object with empty string value', () => {
      expect(isEmpty({ text: '' })).toBe(false)
    })
  })
})
