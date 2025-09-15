import { describe, it, expect } from 'vitest'
import {
  synchronizeWithdrawalSegmentsEndYear,
  createDefaultWithdrawalSegment,
  validateWithdrawalSegments,
  type WithdrawalSegment,
} from './segmented-withdrawal'

describe('segmented-withdrawal synchronization', () => {
  describe('synchronizeWithdrawalSegmentsEndYear', () => {
    it('should update the end year of the last segment', () => {
      const segments: WithdrawalSegment[] = [
        createDefaultWithdrawalSegment('segment1', 'Phase 1', 2041, 2050),
        createDefaultWithdrawalSegment('segment2', 'Phase 2', 2051, 2080),
      ]

      const result = synchronizeWithdrawalSegmentsEndYear(segments, 2085)

      expect(result).toHaveLength(2)
      expect(result[0].endYear).toBe(2050) // First segment unchanged
      expect(result[1].endYear).toBe(2085) // Last segment updated
    })

    it('should handle single segment', () => {
      const segments: WithdrawalSegment[] = [
        createDefaultWithdrawalSegment('main', 'Hauptphase', 2041, 2080),
      ]

      const result = synchronizeWithdrawalSegmentsEndYear(segments, 2090)

      expect(result).toHaveLength(1)
      expect(result[0].endYear).toBe(2090)
    })

    it('should return unchanged segments if end year is already correct', () => {
      const segments: WithdrawalSegment[] = [
        createDefaultWithdrawalSegment('segment1', 'Phase 1', 2041, 2050),
        createDefaultWithdrawalSegment('segment2', 'Phase 2', 2051, 2080),
      ]

      const result = synchronizeWithdrawalSegmentsEndYear(segments, 2080)

      expect(result).toEqual(segments) // Should be unchanged
    })

    it('should handle empty segments array', () => {
      const segments: WithdrawalSegment[] = []

      const result = synchronizeWithdrawalSegmentsEndYear(segments, 2090)

      expect(result).toEqual([])
    })

    it('should update correct segment when segments are not in order', () => {
      const segments: WithdrawalSegment[] = [
        createDefaultWithdrawalSegment('segment2', 'Phase 2', 2051, 2080), // Last chronologically
        createDefaultWithdrawalSegment('segment1', 'Phase 1', 2041, 2050), // First chronologically
      ]

      const result = synchronizeWithdrawalSegmentsEndYear(segments, 2085)

      expect(result).toHaveLength(2)
      // Find segments by ID to ensure correct update
      const segment1 = result.find(s => s.id === 'segment1')
      const segment2 = result.find(s => s.id === 'segment2')

      expect(segment1?.endYear).toBe(2050) // First segment unchanged
      expect(segment2?.endYear).toBe(2085) // Last segment updated
    })

    it('should preserve all other segment properties', () => {
      const segments: WithdrawalSegment[] = [
        {
          ...createDefaultWithdrawalSegment('segment1', 'Custom Phase', 2041, 2080),
          strategy: '3prozent',
          customPercentage: 3.5,
          enableGrundfreibetrag: true,
          incomeTaxRate: 25,
        },
      ]

      const result = synchronizeWithdrawalSegmentsEndYear(segments, 2090)

      expect(result[0]).toMatchObject({
        id: 'segment1',
        name: 'Custom Phase',
        startYear: 2041,
        endYear: 2090, // Only this should change
        strategy: '3prozent',
        customPercentage: 3.5,
        enableGrundfreibetrag: true,
        incomeTaxRate: 25,
      })
    })

    it('should work correctly with validation after synchronization', () => {
      const segments: WithdrawalSegment[] = [
        createDefaultWithdrawalSegment('segment1', 'Phase 1', 2041, 2050),
        createDefaultWithdrawalSegment('segment2', 'Phase 2', 2051, 2080),
      ]

      const synchronized = synchronizeWithdrawalSegmentsEndYear(segments, 2085)
      const validationErrors = validateWithdrawalSegments(synchronized, 2041, 2085)

      expect(validationErrors).toHaveLength(0) // Should be valid after synchronization
    })
  })
})
