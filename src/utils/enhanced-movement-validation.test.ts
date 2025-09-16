import { describe, it, expect } from 'vitest'
import {
  moveSegmentDown,
  createDefaultWithdrawalSegment,
  validateWithdrawalSegments,
  autoCorrectSegmentTimeRanges,
} from './segmented-withdrawal'

describe('Enhanced Movement Validation - User Issue Fix', () => {
  it('should prevent identical ranges and provide comprehensive error detection', () => {
    // Test the exact user scenario that was problematic
    const segments = [
      createDefaultWithdrawalSegment('main', 'Hauptphase', 2041, 2050),
      createDefaultWithdrawalSegment('phase2', 'Phase 2', 2051, 2080),
    ]

    // Test the complete flow including validation and auto-correction
    const errors = validateWithdrawalSegments(segments, 2040, 2080)
    const correctedSegments = errors.length > 0
      ? autoCorrectSegmentTimeRanges(segments, 2040)
      : segments

    const result = moveSegmentDown(correctedSegments, 'main')

    // Validate no identical ranges were created
    const mainResult = result.find(s => s.id === 'main')!
    const phase2Result = result.find(s => s.id === 'phase2')!

    expect(mainResult.startYear).not.toBe(phase2Result.startYear)
    expect(mainResult.endYear).not.toBe(phase2Result.endYear)

    // Validate correct behavior
    expect(phase2Result.startYear).toBe(2040) // Phase 2 starts at withdrawal start
    expect(mainResult.endYear).toBe(2079) // Main phase ends correctly
  })

  it('should provide detailed error detection for edge cases', () => {
    // Mock console methods to capture error detection
    const originalError = console.error
    const originalWarn = console.warn
    const errors: string[] = []
    const warnings: string[] = []

    console.error = (...args) => errors.push(args.join(' '))
    console.warn = (...args) => warnings.push(args.join(' '))

    try {
      // Test edge cases that should trigger warnings
      moveSegmentDown([], 'main') // Empty array
      moveSegmentDown([createDefaultWithdrawalSegment('main', 'Main', 2041, 2050)], 'main') // Single segment
      moveSegmentDown([
        createDefaultWithdrawalSegment('main', 'Main', 2041, 2050),
        createDefaultWithdrawalSegment('phase2', 'Phase 2', 2051, 2060),
      ], 'nonexistent') // Invalid ID

      expect(warnings.length).toBeGreaterThan(0)
      expect(errors.length).toBe(0) // No errors should be logged for normal cases
    }
    finally {
      console.error = originalError
      console.warn = originalWarn
    }
  })
})
