import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { ReactNode } from 'react'
import { NestingContext, useNestingLevel, useNestingClasses } from './nesting-utils'

describe('nesting-utils', () => {
  describe('useNestingLevel', () => {
    it('should return 0 when not nested', () => {
      const { result } = renderHook(() => useNestingLevel())
      expect(result.current).toBe(0)
    })

    it('should return provided nesting level from context', () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <NestingContext.Provider value={2}>{children}</NestingContext.Provider>
      )
      const { result } = renderHook(() => useNestingLevel(), { wrapper })
      expect(result.current).toBe(2)
    })

    it('should return 3 for deeply nested context', () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <NestingContext.Provider value={3}>{children}</NestingContext.Provider>
      )
      const { result } = renderHook(() => useNestingLevel(), { wrapper })
      expect(result.current).toBe(3)
    })

    it('should return 1 for first level nesting', () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <NestingContext.Provider value={1}>{children}</NestingContext.Provider>
      )
      const { result } = renderHook(() => useNestingLevel(), { wrapper })
      expect(result.current).toBe(1)
    })
  })

  describe('useNestingClasses', () => {
    describe('Level 0 (top level)', () => {
      it('should return correct spacing classes for level 0', () => {
        const { result } = renderHook(() => useNestingClasses())
        
        expect(result.current.nestingLevel).toBe(0)
        expect(result.current.spacing.mx).toBe('mx-0')
        expect(result.current.spacing.p).toBe('p-4 sm:p-6')
        expect(result.current.spacing.gap).toBe('space-y-4')
      })

      it('should return correct visual classes for level 0', () => {
        const { result } = renderHook(() => useNestingClasses())
        
        expect(result.current.visual.border).toBe('border')
        expect(result.current.visual.bg).toBe('bg-card')
        expect(result.current.visual.shadow).toBe('shadow-sm')
        expect(result.current.visual.rounded).toBe('rounded-xl')
      })
    })

    describe('Level 1 (first nesting)', () => {
      it('should return correct spacing classes for level 1', () => {
        const wrapper = ({ children }: { children: ReactNode }) => (
          <NestingContext.Provider value={1}>{children}</NestingContext.Provider>
        )
        const { result } = renderHook(() => useNestingClasses(), { wrapper })
        
        expect(result.current.nestingLevel).toBe(1)
        expect(result.current.spacing.mx).toBe('mx-0')
        expect(result.current.spacing.p).toBe('p-4 sm:p-6')
        expect(result.current.spacing.gap).toBe('space-y-4')
      })

      it('should return correct visual classes for level 1', () => {
        const wrapper = ({ children }: { children: ReactNode }) => (
          <NestingContext.Provider value={1}>{children}</NestingContext.Provider>
        )
        const { result } = renderHook(() => useNestingClasses(), { wrapper })
        
        expect(result.current.visual.border).toBe('border')
        expect(result.current.visual.bg).toBe('bg-card')
        expect(result.current.visual.shadow).toBe('shadow-sm sm:shadow-md')
        expect(result.current.visual.rounded).toBe('rounded-xl')
      })
    })

    describe('Level 2 (second nesting)', () => {
      it('should return correct spacing classes for level 2', () => {
        const wrapper = ({ children }: { children: ReactNode }) => (
          <NestingContext.Provider value={2}>{children}</NestingContext.Provider>
        )
        const { result } = renderHook(() => useNestingClasses(), { wrapper })
        
        expect(result.current.nestingLevel).toBe(2)
        expect(result.current.spacing.mx).toBe('mx-1 sm:mx-0')
        expect(result.current.spacing.p).toBe('p-3 sm:p-5')
        expect(result.current.spacing.gap).toBe('space-y-3')
      })

      it('should return correct visual classes for level 2', () => {
        const wrapper = ({ children }: { children: ReactNode }) => (
          <NestingContext.Provider value={2}>{children}</NestingContext.Provider>
        )
        const { result } = renderHook(() => useNestingClasses(), { wrapper })
        
        expect(result.current.visual.border).toBe('border border-gray-200')
        expect(result.current.visual.bg).toBe('bg-card')
        expect(result.current.visual.shadow).toBe('shadow-none')
        expect(result.current.visual.rounded).toBe('rounded-lg')
      })
    })

    describe('Level 3 (deep nesting)', () => {
      it('should return correct spacing classes for level 3', () => {
        const wrapper = ({ children }: { children: ReactNode }) => (
          <NestingContext.Provider value={3}>{children}</NestingContext.Provider>
        )
        const { result } = renderHook(() => useNestingClasses(), { wrapper })
        
        expect(result.current.nestingLevel).toBe(3)
        expect(result.current.spacing.mx).toBe('mx-2 sm:mx-0')
        expect(result.current.spacing.p).toBe('p-2 sm:p-4')
        expect(result.current.spacing.gap).toBe('space-y-2')
      })

      it('should return correct visual classes for level 3', () => {
        const wrapper = ({ children }: { children: ReactNode }) => (
          <NestingContext.Provider value={3}>{children}</NestingContext.Provider>
        )
        const { result } = renderHook(() => useNestingClasses(), { wrapper })
        
        expect(result.current.visual.border).toBe('border-l-2 border-gray-100')
        expect(result.current.visual.bg).toBe('bg-gray-50/50')
        expect(result.current.visual.shadow).toBe('shadow-none')
        expect(result.current.visual.rounded).toBe('rounded-md')
      })
    })

    describe('Level 4+ (very deep nesting - fallback behavior)', () => {
      it('should use last defined level classes for level 4', () => {
        const wrapper = ({ children }: { children: ReactNode }) => (
          <NestingContext.Provider value={4}>{children}</NestingContext.Provider>
        )
        const { result } = renderHook(() => useNestingClasses(), { wrapper })
        
        // Should use level 3 classes (last defined)
        expect(result.current.spacing.mx).toBe('mx-2 sm:mx-0')
        expect(result.current.spacing.p).toBe('p-2 sm:p-4')
        expect(result.current.spacing.gap).toBe('space-y-2')
      })

      it('should use last defined visual classes for level 5', () => {
        const wrapper = ({ children }: { children: ReactNode }) => (
          <NestingContext.Provider value={5}>{children}</NestingContext.Provider>
        )
        const { result } = renderHook(() => useNestingClasses(), { wrapper })
        
        // Should use level 3 visual classes (last defined)
        expect(result.current.visual.border).toBe('border-l-2 border-gray-100')
        expect(result.current.visual.bg).toBe('bg-gray-50/50')
        expect(result.current.visual.shadow).toBe('shadow-none')
        expect(result.current.visual.rounded).toBe('rounded-md')
      })
    })

    describe('Level override', () => {
      it('should use provided level override instead of context', () => {
        const wrapper = ({ children }: { children: ReactNode }) => (
          <NestingContext.Provider value={1}>{children}</NestingContext.Provider>
        )
        const { result } = renderHook(() => useNestingClasses(2), { wrapper })
        
        // Should use override level 2, not context level 1
        expect(result.current.nestingLevel).toBe(2)
        expect(result.current.spacing.p).toBe('p-3 sm:p-5')
      })

      it('should use level 0 when explicitly overridden', () => {
        const wrapper = ({ children }: { children: ReactNode }) => (
          <NestingContext.Provider value={3}>{children}</NestingContext.Provider>
        )
        const { result } = renderHook(() => useNestingClasses(0), { wrapper })
        
        expect(result.current.nestingLevel).toBe(0)
        expect(result.current.spacing.p).toBe('p-4 sm:p-6')
      })
    })

    describe('Edge cases', () => {
      it('should return all required properties', () => {
        const { result } = renderHook(() => useNestingClasses())
        
        // Verify structure
        expect(result.current).toHaveProperty('nestingLevel')
        expect(result.current).toHaveProperty('spacing')
        expect(result.current).toHaveProperty('visual')
        
        // Verify spacing properties
        expect(result.current.spacing).toHaveProperty('mx')
        expect(result.current.spacing).toHaveProperty('p')
        expect(result.current.spacing).toHaveProperty('gap')
        
        // Verify visual properties
        expect(result.current.visual).toHaveProperty('border')
        expect(result.current.visual).toHaveProperty('bg')
        expect(result.current.visual).toHaveProperty('shadow')
        expect(result.current.visual).toHaveProperty('rounded')
      })

      it('should return strings for all class values', () => {
        const { result } = renderHook(() => useNestingClasses())
        
        expect(typeof result.current.spacing.mx).toBe('string')
        expect(typeof result.current.spacing.p).toBe('string')
        expect(typeof result.current.spacing.gap).toBe('string')
        expect(typeof result.current.visual.border).toBe('string')
        expect(typeof result.current.visual.bg).toBe('string')
        expect(typeof result.current.visual.shadow).toBe('string')
        expect(typeof result.current.visual.rounded).toBe('string')
      })
    })

    describe('Background special handling for level <= 2', () => {
      it('should use bg-card for level 0, 1, and 2', () => {
        const { result: result0 } = renderHook(() => useNestingClasses(0))
        const { result: result1 } = renderHook(() => useNestingClasses(1))
        const { result: result2 } = renderHook(() => useNestingClasses(2))
        
        expect(result0.current.visual.bg).toBe('bg-card')
        expect(result1.current.visual.bg).toBe('bg-card')
        expect(result2.current.visual.bg).toBe('bg-card')
      })

      it('should use bg-gray-50/50 for level 3+', () => {
        const { result: result3 } = renderHook(() => useNestingClasses(3))
        const { result: result4 } = renderHook(() => useNestingClasses(4))
        
        expect(result3.current.visual.bg).toBe('bg-gray-50/50')
        expect(result4.current.visual.bg).toBe('bg-gray-50/50')
      })
    })

    describe('Integration scenarios', () => {
      it('should work with multiple nested contexts', () => {
        const OuterWrapper = ({ children }: { children: ReactNode }) => (
          <NestingContext.Provider value={1}>
            <NestingContext.Provider value={2}>{children}</NestingContext.Provider>
          </NestingContext.Provider>
        )
        
        const { result } = renderHook(() => useNestingClasses(), { wrapper: OuterWrapper })
        
        // Should use innermost context (level 2)
        expect(result.current.nestingLevel).toBe(2)
        expect(result.current.spacing.p).toBe('p-3 sm:p-5')
      })

      it('should handle progressive spacing reduction across levels', () => {
        const results = [0, 1, 2, 3].map((level) => {
          const { result } = renderHook(() => useNestingClasses(level))
          return result.current.spacing.p
        })
        
        // Verify progressive reduction pattern
        expect(results[0]).toBe('p-4 sm:p-6') // Level 0
        expect(results[1]).toBe('p-4 sm:p-6') // Level 1
        expect(results[2]).toBe('p-3 sm:p-5') // Level 2
        expect(results[3]).toBe('p-2 sm:p-4') // Level 3
      })

      it('should handle shadow reduction across levels', () => {
        const results = [0, 1, 2, 3].map((level) => {
          const { result } = renderHook(() => useNestingClasses(level))
          return result.current.visual.shadow
        })
        
        // Verify shadow reduction pattern
        expect(results[0]).toBe('shadow-sm')
        expect(results[1]).toBe('shadow-sm sm:shadow-md')
        expect(results[2]).toBe('shadow-none')
        expect(results[3]).toBe('shadow-none')
      })
    })
  })
})
