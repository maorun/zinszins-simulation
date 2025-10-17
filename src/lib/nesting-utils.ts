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
 * Spacing configuration by nesting level
 */
const SPACING_BY_LEVEL = {
  mx: ['mx-0', 'mx-0', 'mx-1 sm:mx-0', 'mx-2 sm:mx-0'],
  p: ['p-4 sm:p-6', 'p-4 sm:p-6', 'p-3 sm:p-5', 'p-2 sm:p-4'],
  gap: ['space-y-4', 'space-y-4', 'space-y-3', 'space-y-2'],
}

/**
 * Visual styling configuration by nesting level
 */
const VISUAL_BY_LEVEL = {
  border: ['border', 'border', 'border border-gray-200', 'border-l-2 border-gray-100'],
  bg: ['bg-card', 'bg-card', 'bg-card', 'bg-gray-50/50'],
  shadow: ['shadow-sm', 'shadow-sm sm:shadow-md', 'shadow-none', 'shadow-none'],
  rounded: ['rounded-xl', 'rounded-xl', 'rounded-lg', 'rounded-md'],
}

/**
 * Get class for a given level, with fallback to last defined level
 */
function getClassForLevel(classes: string[], level: number): string {
  const index = Math.min(level, classes.length - 1)
  return classes[index]
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
      mx: getClassForLevel(SPACING_BY_LEVEL.mx, nestingLevel),
      // Padding - progressive reduction
      p: getClassForLevel(SPACING_BY_LEVEL.p, nestingLevel),
      // Gap between elements
      gap: getClassForLevel(SPACING_BY_LEVEL.gap, nestingLevel),
    },
    // Visual styling based on nesting
    visual: {
      // Border styling
      border: getClassForLevel(VISUAL_BY_LEVEL.border, nestingLevel),
      // Background styling
      bg: nestingLevel <= 2 ? VISUAL_BY_LEVEL.bg[0] : getClassForLevel(VISUAL_BY_LEVEL.bg, nestingLevel),
      // Shadow styling - reduce with nesting
      shadow: getClassForLevel(VISUAL_BY_LEVEL.shadow, nestingLevel),
      // Rounded corners - reduce with nesting
      rounded: getClassForLevel(VISUAL_BY_LEVEL.rounded, nestingLevel),
    },
  }
}
