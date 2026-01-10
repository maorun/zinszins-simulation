import { describe, it, expect } from 'vitest'
import { cn } from './utils'

describe('utils', () => {
  describe('cn', () => {
    it('should merge class names correctly', () => {
      const result = cn('px-2', 'py-1')
      expect(result).toBe('px-2 py-1')
    })

    it('should handle conditional classes', () => {
      const isActive = false
      const isHighlighted = true
      const result = cn('px-2', isActive && 'py-1', isHighlighted && 'bg-blue-500')
      expect(result).toBe('px-2 bg-blue-500')
    })

    it('should handle undefined and null', () => {
      const result = cn('px-2', undefined, null, 'py-1')
      expect(result).toBe('px-2 py-1')
    })

    it('should handle empty strings', () => {
      const result = cn('px-2', '', 'py-1')
      expect(result).toBe('px-2 py-1')
    })

    it('should merge Tailwind classes correctly (override)', () => {
      // twMerge should handle conflicting Tailwind classes
      const result = cn('px-2', 'px-4')
      expect(result).toBe('px-4')
    })

    it('should handle arrays of classes', () => {
      const result = cn(['px-2', 'py-1'], 'bg-blue-500')
      expect(result).toBe('px-2 py-1 bg-blue-500')
    })

    it('should handle objects with boolean values', () => {
      const result = cn({
        'px-2': true,
        'py-1': false,
        'bg-blue-500': true,
      })
      expect(result).toBe('px-2 bg-blue-500')
    })

    it('should handle complex nested structures', () => {
      const result = cn('px-2', ['py-1', { 'bg-blue-500': true, 'text-white': false }])
      expect(result).toBe('px-2 py-1 bg-blue-500')
    })

    it('should handle no arguments', () => {
      const result = cn()
      expect(result).toBe('')
    })

    it('should handle only false/null/undefined', () => {
      const result = cn(false, null, undefined)
      expect(result).toBe('')
    })

    it('should merge complex Tailwind utilities', () => {
      const result = cn('p-4 text-red-500', 'p-2 text-blue-600')
      // twMerge should keep the last value for conflicting utilities
      expect(result).toBe('p-2 text-blue-600')
    })

    it('should preserve non-conflicting classes when merging', () => {
      const result = cn('px-4 rounded-lg', 'py-2 shadow-md')
      expect(result).toBe('px-4 rounded-lg py-2 shadow-md')
    })

    it('should handle className from props pattern', () => {
      const baseClasses = 'px-4 py-2 rounded'
      const customClasses = 'bg-blue-500 text-white'
      const result = cn(baseClasses, customClasses)
      expect(result).toBe('px-4 py-2 rounded bg-blue-500 text-white')
    })

    it('should handle responsive Tailwind classes', () => {
      const result = cn('p-2 sm:p-4 md:p-6', 'lg:p-8')
      expect(result).toBe('p-2 sm:p-4 md:p-6 lg:p-8')
    })

    it('should merge conflicting responsive classes', () => {
      const result = cn('p-2 sm:p-4', 'sm:p-6')
      // Should keep the last sm:p value
      expect(result).toBe('p-2 sm:p-6')
    })

    it('should handle arbitrary values in Tailwind', () => {
      const result = cn('w-[100px]', 'h-[50px]')
      expect(result).toBe('w-[100px] h-[50px]')
    })
  })
})
