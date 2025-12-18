import { describe, it, expect } from 'vitest'
import { STEP_COLORS, type StepColorName, type StepColorConfig } from './calculation-colors'

describe('calculation-colors', () => {
  describe('STEP_COLORS', () => {
    it('should have all base colors defined', () => {
      const baseColors: StepColorName[] = ['ORANGE', 'GREEN', 'BLUE', 'PURPLE', 'LIGHT_BLUE', 'YELLOW', 'RED', 'PINK']

      baseColors.forEach(colorName => {
        expect(STEP_COLORS[colorName]).toBeDefined()
        expect(STEP_COLORS[colorName].backgroundColor).toMatch(/^#[0-9a-f]{6}$/i)
        expect(STEP_COLORS[colorName].borderColor).toMatch(/^#[0-9a-f]{6}$/i)
      })
    })

    it('should have all variant colors defined', () => {
      const variantColors: StepColorName[] = [
        'BLUE_VARIANT',
        'PURPLE_VARIANT',
        'LIGHT_BLUE_VARIANT',
        'ORANGE_VARIANT',
        'GREEN_DARK',
        'RED_VARIANT',
        'PINK_VARIANT',
      ]

      variantColors.forEach(colorName => {
        expect(STEP_COLORS[colorName]).toBeDefined()
        expect(STEP_COLORS[colorName].backgroundColor).toMatch(/^#[0-9a-f]{6}$/i)
        expect(STEP_COLORS[colorName].borderColor).toMatch(/^#[0-9a-f]{6}$/i)
      })
    })

    it('should have consistent background colors for variants', () => {
      // BLUE and BLUE_VARIANT should share the same background
      expect(STEP_COLORS.BLUE.backgroundColor).toBe(STEP_COLORS.BLUE_VARIANT.backgroundColor)

      // PURPLE and PURPLE_VARIANT should share the same background
      expect(STEP_COLORS.PURPLE.backgroundColor).toBe(STEP_COLORS.PURPLE_VARIANT.backgroundColor)

      // LIGHT_BLUE and LIGHT_BLUE_VARIANT should share the same background
      expect(STEP_COLORS.LIGHT_BLUE.backgroundColor).toBe(STEP_COLORS.LIGHT_BLUE_VARIANT.backgroundColor)

      // ORANGE and ORANGE_VARIANT should share the same background
      expect(STEP_COLORS.ORANGE.backgroundColor).toBe(STEP_COLORS.ORANGE_VARIANT.backgroundColor)

      // RED and RED_VARIANT should share the same background
      expect(STEP_COLORS.RED.backgroundColor).toBe(STEP_COLORS.RED_VARIANT.backgroundColor)

      // PINK and PINK_VARIANT should share the same background
      expect(STEP_COLORS.PINK.backgroundColor).toBe(STEP_COLORS.PINK_VARIANT.backgroundColor)
    })

    it('should have different border colors for variants', () => {
      // Variants should have different borders than their base colors
      expect(STEP_COLORS.BLUE.borderColor).not.toBe(STEP_COLORS.BLUE_VARIANT.borderColor)
      expect(STEP_COLORS.PURPLE.borderColor).not.toBe(STEP_COLORS.PURPLE_VARIANT.borderColor)
      expect(STEP_COLORS.LIGHT_BLUE.borderColor).not.toBe(STEP_COLORS.LIGHT_BLUE_VARIANT.borderColor)
      expect(STEP_COLORS.ORANGE.borderColor).not.toBe(STEP_COLORS.ORANGE_VARIANT.borderColor)
      expect(STEP_COLORS.RED.borderColor).not.toBe(STEP_COLORS.RED_VARIANT.borderColor)
    })

    it('should be type-safe and readonly', () => {
      // TypeScript ensures this is readonly via "as const", but we verify the structure
      const testColor: StepColorConfig = STEP_COLORS.ORANGE
      expect(testColor).toHaveProperty('backgroundColor')
      expect(testColor).toHaveProperty('borderColor')
    })

    it('should have valid hex color codes', () => {
      const hexColorRegex = /^#[0-9a-f]{6}$/i

      Object.values(STEP_COLORS).forEach(color => {
        expect(color.backgroundColor).toMatch(hexColorRegex)
        expect(color.borderColor).toMatch(hexColorRegex)
      })
    })

    it('should support destructuring for use in components', () => {
      const step = {
        title: 'Test Step',
        ...STEP_COLORS.ORANGE,
      }

      expect(step).toHaveProperty('title', 'Test Step')
      expect(step).toHaveProperty('backgroundColor', '#fff3e0')
      expect(step).toHaveProperty('borderColor', '#ffcc80')
    })
  })

  describe('Type safety', () => {
    it('should infer StepColorName type correctly', () => {
      // This is a compile-time check, but we verify runtime behavior
      const colorNames: StepColorName[] = Object.keys(STEP_COLORS) as StepColorName[]
      expect(colorNames.length).toBeGreaterThan(0)

      // Verify all keys are valid color names
      colorNames.forEach(name => {
        expect(STEP_COLORS[name]).toBeDefined()
      })
    })
  })
})
