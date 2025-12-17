/**
 * Color scheme constants for calculation explanation steps.
 *
 * This module provides a centralized, type-safe color palette for visual consistency
 * in calculation explanations throughout the application. Each color provides both
 * a background and border color that work together to create visually distinct steps.
 *
 * Color naming convention:
 * - Base colors (e.g., BLUE, GREEN): Standard color combinations
 * - VARIANT suffix: Alternative border color with same background for visual distinction
 * - DARK suffix: Darker/more saturated border color with same background
 *
 * Usage:
 * ```typescript
 * import { STEP_COLORS } from './calculation-colors'
 *
 * const step = {
 *   title: 'Step 1',
 *   ...STEP_COLORS.ORANGE,
 * }
 * ```
 */

/**
 * Color configuration for a calculation step
 */
export interface StepColorConfig {
  /** Background color in hex format (e.g., '#fff3e0') */
  readonly backgroundColor: string
  /** Border color in hex format (e.g., '#ffcc80') */
  readonly borderColor: string
}

/**
 * Type-safe color palette for calculation explanation steps.
 * Each color combination is guaranteed to provide good contrast and visual consistency.
 */
export const STEP_COLORS = {
  // Base colors - standard combinations
  ORANGE: { backgroundColor: '#fff3e0', borderColor: '#ffcc80' },
  GREEN: { backgroundColor: '#e8f5e8', borderColor: '#81c784' },
  BLUE: { backgroundColor: '#e3f2fd', borderColor: '#64b5f6' },
  PURPLE: { backgroundColor: '#f3e5f5', borderColor: '#ba68c8' },
  LIGHT_BLUE: { backgroundColor: '#e1f5fe', borderColor: '#81d4fa' },
  YELLOW: { backgroundColor: '#fff9c4', borderColor: '#fff176' },
  RED: { backgroundColor: '#ffebee', borderColor: '#ef5350' },
  PINK: { backgroundColor: '#fce4ec', borderColor: '#e91e63' },

  // Variants - same background as base colors, different borders for visual distinction
  BLUE_VARIANT: { backgroundColor: '#e3f2fd', borderColor: '#90caf9' },
  PURPLE_VARIANT: { backgroundColor: '#f3e5f5', borderColor: '#ce93d8' },
  LIGHT_BLUE_VARIANT: { backgroundColor: '#e1f5fe', borderColor: '#2196f3' },
  ORANGE_VARIANT: { backgroundColor: '#fff3e0', borderColor: '#ff9800' },
  GREEN_DARK: { backgroundColor: '#e8f5e8', borderColor: '#4caf50' },
  RED_VARIANT: { backgroundColor: '#ffebee', borderColor: '#f44336' },
  PINK_VARIANT: { backgroundColor: '#fce4ec', borderColor: '#e91e63' },
} as const satisfies Record<string, StepColorConfig>

/**
 * Type representing valid step color names
 */
export type StepColorName = keyof typeof STEP_COLORS
