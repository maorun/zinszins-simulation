/**
 * Hook to get current nesting level for responsive design
 * @returns Current nesting level (0 = top level, 1+ = nested)
 */
import { useContext, createContext } from 'react'

/**
 * Context for tracking nesting level in card hierarchies
 * Enables progressive design adjustments for deep nesting on mobile
 */
export const NestingContext = createContext<number>(0)

export function useNestingLevel(): number {
  return useContext(NestingContext)
}

/**
 * Hook to get nesting-aware classes for consistent spacing
 * @param level Optional override of current context level
 * @returns Object with common responsive spacing classes
 */
export function useNestingClasses(level?: number) {
  const contextLevel = useNestingLevel()
  const nestingLevel = level !== undefined ? level : contextLevel

  return {
    nestingLevel,
    // Spacing utilities for different nesting levels
    spacing: {
      // Horizontal margins - reduce on mobile at deeper levels
      mx: nestingLevel <= 1 ? 'mx-0' : nestingLevel <= 2 ? 'mx-1 sm:mx-0' : 'mx-2 sm:mx-0',
      // Padding - progressive reduction
      p: nestingLevel <= 1 ? 'p-4 sm:p-6' : nestingLevel <= 2 ? 'p-3 sm:p-5' : 'p-2 sm:p-4',
      // Gap between elements
      gap: nestingLevel <= 1 ? 'space-y-4' : nestingLevel <= 2 ? 'space-y-3' : 'space-y-2',
    },
    // Visual styling based on nesting
    visual: {
      // Border styling
      border: nestingLevel <= 1 ? 'border' : nestingLevel <= 2 ? 'border border-gray-200' : 'border-l-2 border-gray-100',
      // Background styling
      bg: nestingLevel <= 2 ? 'bg-card' : nestingLevel <= 3 ? 'bg-gray-50/50' : 'bg-transparent',
      // Shadow styling - reduce with nesting
      shadow: nestingLevel === 0 ? 'shadow-sm' : nestingLevel === 1 ? 'shadow-sm sm:shadow-md' : 'shadow-none',
      // Rounded corners - reduce with nesting
      rounded: nestingLevel <= 1 ? 'rounded-xl' : nestingLevel <= 2 ? 'rounded-lg' : 'rounded-md',
    },
  }
}
