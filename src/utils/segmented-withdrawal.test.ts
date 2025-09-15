import { describe, it, expect } from 'vitest'
import {
  synchronizeWithdrawalSegmentsEndYear,
  createDefaultWithdrawalSegment,
  validateWithdrawalSegments,
  moveSegmentUp,
  moveSegmentDown,
  insertSegmentBefore,
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

  describe('moveSegmentUp', () => {
    it('should move a segment up (earlier in time) by swapping time ranges', () => {
      const segments: WithdrawalSegment[] = [
        createDefaultWithdrawalSegment('segment1', 'Phase 1', 2041, 2050), // 10 years
        createDefaultWithdrawalSegment('segment2', 'Phase 2', 2051, 2065), // 15 years
        createDefaultWithdrawalSegment('segment3', 'Phase 3', 2066, 2080), // 15 years
      ]

      const result = moveSegmentUp(segments, 'segment2')

      expect(result).toHaveLength(3)
      // segment2 should now be first with segment1's original time range
      const movedSegment = result.find(s => s.id === 'segment2')
      expect(movedSegment?.startYear).toBe(2041)
      expect(movedSegment?.endYear).toBe(2055) // 2041 + 14 (segment2's original duration)

      // segment1 should move to after segment2
      const originalFirstSegment = result.find(s => s.id === 'segment1')
      expect(originalFirstSegment?.startYear).toBe(2056) // 2055 + 1
      expect(originalFirstSegment?.endYear).toBe(2065) // 2056 + 9 (segment1's original duration)

      // segment3 should remain unchanged
      const thirdSegment = result.find(s => s.id === 'segment3')
      expect(thirdSegment?.startYear).toBe(2066)
      expect(thirdSegment?.endYear).toBe(2080)
    })

    it('should not move the first segment up', () => {
      const segments: WithdrawalSegment[] = [
        createDefaultWithdrawalSegment('segment1', 'Phase 1', 2041, 2050),
        createDefaultWithdrawalSegment('segment2', 'Phase 2', 2051, 2060),
      ]

      const result = moveSegmentUp(segments, 'segment1')

      expect(result).toEqual(segments) // Should remain unchanged
    })

    it('should handle invalid segment ID', () => {
      const segments: WithdrawalSegment[] = [
        createDefaultWithdrawalSegment('segment1', 'Phase 1', 2041, 2050),
      ]

      const result = moveSegmentUp(segments, 'nonexistent')

      expect(result).toEqual(segments) // Should remain unchanged
    })
  })

  describe('moveSegmentDown', () => {
    it('should move a segment down (later in time) by swapping time ranges', () => {
      const segments: WithdrawalSegment[] = [
        createDefaultWithdrawalSegment('segment1', 'Phase 1', 2041, 2050), // 10 years
        createDefaultWithdrawalSegment('segment2', 'Phase 2', 2051, 2065), // 15 years
        createDefaultWithdrawalSegment('segment3', 'Phase 3', 2066, 2080), // 15 years
      ]

      const result = moveSegmentDown(segments, 'segment1')

      expect(result).toHaveLength(3)
      // segment2 should now be first with segment1's original time range
      const movedDownSegment = result.find(s => s.id === 'segment2')
      expect(movedDownSegment?.startYear).toBe(2041)
      expect(movedDownSegment?.endYear).toBe(2055) // 2041 + 14 (segment2's original duration)

      // segment1 should move to after segment2
      const originalFirstSegment = result.find(s => s.id === 'segment1')
      expect(originalFirstSegment?.startYear).toBe(2056) // 2055 + 1
      expect(originalFirstSegment?.endYear).toBe(2065) // 2056 + 9 (segment1's original duration)

      // segment3 should remain unchanged
      const thirdSegment = result.find(s => s.id === 'segment3')
      expect(thirdSegment?.startYear).toBe(2066)
      expect(thirdSegment?.endYear).toBe(2080)
    })

    it('should not move the last segment down', () => {
      const segments: WithdrawalSegment[] = [
        createDefaultWithdrawalSegment('segment1', 'Phase 1', 2041, 2050),
        createDefaultWithdrawalSegment('segment2', 'Phase 2', 2051, 2060),
      ]

      const result = moveSegmentDown(segments, 'segment2')

      expect(result).toEqual(segments) // Should remain unchanged
    })

    it('should handle invalid segment ID', () => {
      const segments: WithdrawalSegment[] = [
        createDefaultWithdrawalSegment('segment1', 'Phase 1', 2041, 2050),
      ]

      const result = moveSegmentDown(segments, 'nonexistent')

      expect(result).toEqual(segments) // Should remain unchanged
    })
  })

  describe('insertSegmentBefore', () => {
    it('should insert a new segment before an existing segment', () => {
      const segments: WithdrawalSegment[] = [
        createDefaultWithdrawalSegment('segment1', 'Phase 1', 2041, 2050),
        createDefaultWithdrawalSegment('segment2', 'Phase 2', 2051, 2065),
      ]

      const result = insertSegmentBefore(segments, 'segment2', 'New Phase', 7)

      expect(result).toHaveLength(3)

      // Find the new segment
      const newSegment = result.find(s => s.name === 'New Phase')
      expect(newSegment).toBeDefined()
      expect(newSegment?.startYear).toBe(2051) // Takes segment2's original start year
      expect(newSegment?.endYear).toBe(2058) // 2051 + 7 (7-year duration)

      // segment2 should be shifted
      const shiftedSegment = result.find(s => s.id === 'segment2')
      expect(shiftedSegment?.startYear).toBe(2059) // 2058 + 1
      expect(shiftedSegment?.endYear).toBe(2073) // 2059 + 14 (original duration)

      // segment1 should remain unchanged
      const firstSegment = result.find(s => s.id === 'segment1')
      expect(firstSegment?.startYear).toBe(2041)
      expect(firstSegment?.endYear).toBe(2050)
    })

    it('should insert before the first segment', () => {
      const segments: WithdrawalSegment[] = [
        createDefaultWithdrawalSegment('segment1', 'Phase 1', 2041, 2050),
      ]

      const result = insertSegmentBefore(segments, 'segment1', 'Earlier Phase', 3)

      expect(result).toHaveLength(2)

      // Find the new segment
      const newSegment = result.find(s => s.name === 'Earlier Phase')
      expect(newSegment).toBeDefined()
      expect(newSegment?.startYear).toBe(2041) // Takes segment1's original start year
      expect(newSegment?.endYear).toBe(2044) // 2041 + 3 (3-year duration)

      // segment1 should be shifted
      const shiftedSegment = result.find(s => s.id === 'segment1')
      expect(shiftedSegment?.startYear).toBe(2045) // 2044 + 1
      expect(shiftedSegment?.endYear).toBe(2054) // 2045 + 9 (original duration)
    })

    it('should handle invalid segment ID', () => {
      const segments: WithdrawalSegment[] = [
        createDefaultWithdrawalSegment('segment1', 'Phase 1', 2041, 2050),
      ]

      const result = insertSegmentBefore(segments, 'nonexistent', 'New Phase')

      expect(result).toEqual(segments) // Should remain unchanged
    })

    it('should use default duration when not specified', () => {
      const segments: WithdrawalSegment[] = [
        createDefaultWithdrawalSegment('segment1', 'Phase 1', 2041, 2050),
      ]

      const result = insertSegmentBefore(segments, 'segment1', 'New Phase')

      expect(result).toHaveLength(2)

      const newSegment = result.find(s => s.name === 'New Phase')
      expect(newSegment).toBeDefined()
      expect(newSegment!.endYear - newSegment!.startYear).toBe(5) // Default 5-year duration
    })
  })
})
