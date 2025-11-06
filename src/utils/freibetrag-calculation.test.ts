import { describe, expect, test } from 'vitest'
import {
  calculateFreibetragForPlanningMode,
  createPlanningModeAwareFreibetragPerYear,
  updateFreibetragForPlanningMode,
  type PlanningMode,
} from './freibetrag-calculation'

describe('freibetrag-calculation', () => {
  describe('calculateFreibetragForPlanningMode', () => {
    test('should return 2000€ for individual planning mode', () => {
      const result = calculateFreibetragForPlanningMode('individual')
      expect(result).toBe(2000)
    })

    test('should return 4000€ for couple planning mode', () => {
      const result = calculateFreibetragForPlanningMode('couple')
      expect(result).toBe(4000)
    })

    test('should use custom individual freibetrag amount', () => {
      const customAmount = 2500
      const individualResult = calculateFreibetragForPlanningMode('individual', customAmount)
      const coupleResult = calculateFreibetragForPlanningMode('couple', customAmount)

      expect(individualResult).toBe(2500)
      expect(coupleResult).toBe(5000) // Double for couple
    })

    test('should handle invalid planning mode gracefully', () => {
      const result = calculateFreibetragForPlanningMode('invalid' as PlanningMode)
      expect(result).toBe(2000) // Falls back to individual default
    })
  })

  describe('createPlanningModeAwareFreibetragPerYear', () => {
    test('should create freibetrag mapping for individual over multiple years', () => {
      const result = createPlanningModeAwareFreibetragPerYear(2023, 2025, 'individual')

      expect(result).toEqual({
        2023: 2000,
        2024: 2000,
        2025: 2000,
      })
    })

    test('should create freibetrag mapping for couple over multiple years', () => {
      const result = createPlanningModeAwareFreibetragPerYear(2023, 2025, 'couple')

      expect(result).toEqual({
        2023: 4000,
        2024: 4000,
        2025: 4000,
      })
    })

    test('should respect custom freibetrag overrides', () => {
      const customFreibetrag = {
        2024: 2500, // Custom amount for 2024
        2025: 3000, // Custom amount for 2025
      }

      const result = createPlanningModeAwareFreibetragPerYear(2023, 2025, 'couple', customFreibetrag)

      expect(result).toEqual({
        2023: 4000, // Uses planning mode default (couple = 4000€)
        2024: 2500, // Uses custom override
        2025: 3000, // Uses custom override
      })
    })

    test('should handle single year range', () => {
      const result = createPlanningModeAwareFreibetragPerYear(2024, 2024, 'individual')

      expect(result).toEqual({
        2024: 2000,
      })
    })

    test('should use custom individual freibetrag base amount', () => {
      const result = createPlanningModeAwareFreibetragPerYear(2023, 2024, 'couple', undefined, 2500)

      expect(result).toEqual({
        2023: 5000, // 2500 * 2 for couple
        2024: 5000,
      })
    })
  })

  describe('updateFreibetragForPlanningMode', () => {
    test('should update individual planning (2000€) to couple planning (4000€)', () => {
      const existingFreibetrag = {
        2023: 2000,
        2024: 2000,
        2025: 2500, // Custom amount, should not be changed
      }

      const result = updateFreibetragForPlanningMode(existingFreibetrag, 'couple')

      expect(result).toEqual({
        2023: 4000, // Updated from 2000€ to 4000€
        2024: 4000, // Updated from 2000€ to 4000€
        2025: 2500, // Custom amount preserved
      })
    })

    test('should update couple planning (4000€) to individual planning (2000€)', () => {
      const existingFreibetrag = {
        2023: 4000,
        2024: 4000,
        2025: 3500, // Custom amount, should not be changed
      }

      const result = updateFreibetragForPlanningMode(existingFreibetrag, 'individual')

      expect(result).toEqual({
        2023: 2000, // Updated from 4000€ to 2000€
        2024: 2000, // Updated from 4000€ to 2000€
        2025: 3500, // Custom amount preserved
      })
    })

    test('should preserve custom amounts that are not standard defaults', () => {
      const existingFreibetrag = {
        2023: 1800, // Custom low amount
        2024: 2000, // Standard individual amount - should be updated
        2025: 2200, // Custom high amount
        2026: 4000, // Standard couple amount - should be updated
      }

      const result = updateFreibetragForPlanningMode(existingFreibetrag, 'couple')

      expect(result).toEqual({
        2023: 1800, // Custom amount preserved
        2024: 4000, // Updated from individual default to couple default
        2025: 2200, // Custom amount preserved
        2026: 4000, // Already couple default, stays the same
      })
    })

    test('should not modify original object', () => {
      const existingFreibetrag = {
        2023: 2000,
        2024: 2000,
      }

      const result = updateFreibetragForPlanningMode(existingFreibetrag, 'couple')

      // Original should be unchanged
      expect(existingFreibetrag).toEqual({
        2023: 2000,
        2024: 2000,
      })

      // Result should be updated
      expect(result).toEqual({
        2023: 4000,
        2024: 4000,
      })
    })

    test('should handle empty freibetrag object', () => {
      const result = updateFreibetragForPlanningMode({}, 'couple')
      expect(result).toEqual({})
    })

    test('should use custom individual base amount', () => {
      const existingFreibetrag = {
        2023: 2000, // Old individual default
        2024: 4000, // Old couple default
      }

      const result = updateFreibetragForPlanningMode(existingFreibetrag, 'individual', 2500)

      expect(result).toEqual({
        2023: 2500, // Updated to new individual amount
        2024: 2500, // Updated from old couple to new individual
      })
    })
  })
})
