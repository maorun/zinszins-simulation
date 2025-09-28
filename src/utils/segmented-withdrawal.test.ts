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

  describe('validateWithdrawalSegments', () => {
    const startYear = 2041
    const endYear = 2080

    describe('basic validation', () => {
      it('should return error for empty segments array', () => {
        const segments: WithdrawalSegment[] = []
        const errors = validateWithdrawalSegments(segments, startYear, endYear)

        expect(errors).toContain('Mindestens ein Segment ist erforderlich')
      })

      it('should return error for segment with end year before start year', () => {
        const segments: WithdrawalSegment[] = [
          createDefaultWithdrawalSegment('segment1', 'Invalid Phase', 2050, 2040),
        ]
        const errors = validateWithdrawalSegments(segments, startYear, endYear)

        expect(errors).toContain('Segment "Invalid Phase": Endjahr kann nicht vor Startjahr liegen')
      })

      it('should return error for overlapping segments', () => {
        const segments: WithdrawalSegment[] = [
          createDefaultWithdrawalSegment('segment1', 'Phase 1', 2041, 2050),
          createDefaultWithdrawalSegment('segment2', 'Phase 2', 2049, 2060), // Overlaps with previous
        ]
        const errors = validateWithdrawalSegments(segments, startYear, endYear)

        expect(errors).toContain('Überlappung zwischen Segment "Phase 1" und "Phase 2"')
      })

      it('should return error for duplicate segment IDs', () => {
        const segments: WithdrawalSegment[] = [
          createDefaultWithdrawalSegment('duplicate', 'Phase 1', 2041, 2050),
          createDefaultWithdrawalSegment('duplicate', 'Phase 2', 2051, 2060),
        ]
        const errors = validateWithdrawalSegments(segments, startYear, endYear)

        expect(errors).toContain('Segment-IDs müssen eindeutig sein')
      })
    })

    describe('enhanced validation for segmented phases (geteilte Phasen)', () => {
      it('should return error when first phase does not start at withdrawal start year', () => {
        const segments: WithdrawalSegment[] = [
          createDefaultWithdrawalSegment('segment1', 'Phase 1', 2042, 2060), // Starts too late
          createDefaultWithdrawalSegment('segment2', 'Phase 2', 2061, 2080),
        ]
        const errors = validateWithdrawalSegments(segments, startYear, endYear)

        expect(errors).toContain('Die erste Phase muss am Entsparzeitpunkt (2041) beginnen. Aktuelle erste Phase beginnt 2042.')
      })

      it('should return error when last phase does not end at end of life', () => {
        const segments: WithdrawalSegment[] = [
          createDefaultWithdrawalSegment('segment1', 'Phase 1', 2041, 2060),
          createDefaultWithdrawalSegment('segment2', 'Phase 2', 2061, 2075), // Ends too early
        ]
        const errors = validateWithdrawalSegments(segments, startYear, endYear)

        expect(errors).toContain('Die letzte Phase muss am Lebensende (2080) enden. Aktuelle letzte Phase endet 2075.')
      })

      it('should return error when there are gaps between phases', () => {
        const segments: WithdrawalSegment[] = [
          createDefaultWithdrawalSegment('segment1', 'Phase 1', 2041, 2050),
          createDefaultWithdrawalSegment('segment2', 'Phase 2', 2052, 2080), // Gap: 2051 is missing
        ]
        const errors = validateWithdrawalSegments(segments, startYear, endYear)

        expect(errors).toContain('Lücke zwischen Segment "Phase 1" (endet 2050) und "Phase 2" (beginnt 2052). Die Zeiträume müssen durchgängig sein.')
      })

      it('should validate properly with continuous phases', () => {
        const segments: WithdrawalSegment[] = [
          createDefaultWithdrawalSegment('segment1', 'Phase 1', 2041, 2050),
          createDefaultWithdrawalSegment('segment2', 'Phase 2', 2051, 2060),
          createDefaultWithdrawalSegment('segment3', 'Phase 3', 2061, 2080),
        ]
        const errors = validateWithdrawalSegments(segments, startYear, endYear)

        expect(errors).toHaveLength(0) // Should be valid
      })

      it('should validate properly with single phase covering entire period', () => {
        const segments: WithdrawalSegment[] = [
          createDefaultWithdrawalSegment('main', 'Hauptphase', 2041, 2080),
        ]
        const errors = validateWithdrawalSegments(segments, startYear, endYear)

        expect(errors).toHaveLength(0) // Should be valid
      })

      it('should handle multiple errors simultaneously', () => {
        const segments: WithdrawalSegment[] = [
          createDefaultWithdrawalSegment('segment1', 'Phase 1', 2042, 2050), // Wrong start
          createDefaultWithdrawalSegment('segment2', 'Phase 2', 2052, 2075), // Gap + wrong end
        ]
        const errors = validateWithdrawalSegments(segments, startYear, endYear)

        expect(errors).toContain('Die erste Phase muss am Entsparzeitpunkt (2041) beginnen. Aktuelle erste Phase beginnt 2042.')
        expect(errors).toContain('Die letzte Phase muss am Lebensende (2080) enden. Aktuelle letzte Phase endet 2075.')
        expect(errors).toContain('Lücke zwischen Segment "Phase 1" (endet 2050) und "Phase 2" (beginnt 2052). Die Zeiträume müssen durchgängig sein.')
      })

      it('should work with unordered segments', () => {
        const segments: WithdrawalSegment[] = [
          createDefaultWithdrawalSegment('segment2', 'Phase 2', 2051, 2080), // Second chronologically
          createDefaultWithdrawalSegment('segment1', 'Phase 1', 2041, 2050), // First chronologically
        ]
        const errors = validateWithdrawalSegments(segments, startYear, endYear)

        expect(errors).toHaveLength(0) // Should be valid when sorted
      })

      it('should handle fractional years properly by rounding', () => {
        const segments: WithdrawalSegment[] = [
          createDefaultWithdrawalSegment('segment1', 'Phase 1', 2041.2, 2050.4),
          createDefaultWithdrawalSegment('segment2', 'Phase 2', 2051.1, 2080.1),
        ]
        const errors = validateWithdrawalSegments(segments, 2041.1, 2080.2)

        expect(errors).toHaveLength(0) // Should be valid after rounding (2041->2050, 2051->2080)
      })
    })
  })
})
