import { describe, it, expect } from 'vitest'
import {
  moveSegmentDown,
  createDefaultWithdrawalSegment,
} from './segmented-withdrawal'

describe('Main Phase Movement Issue Debugging', () => {
  it('should be able to move main phase down when it is chronologically first', () => {
    // Create scenario similar to what user described
    const segments = [
      createDefaultWithdrawalSegment('main', 'Hauptphase', 2041, 2085), // Main phase: 45 years (2041-2085)
      createDefaultWithdrawalSegment('phase2', 'Phase 2', 2086, 2090), // Phase 2: 5 years (2086-2090)
    ]

    console.log('Original segments:')
    console.log('Hauptphase:', segments[0].startYear, '-', segments[0].endYear, '(duration:', segments[0].endYear - segments[0].startYear + 1, 'years)')
    console.log('Phase 2:', segments[1].startYear, '-', segments[1].endYear, '(duration:', segments[1].endYear - segments[1].startYear + 1, 'years)')

    // Verify chronological order before move
    const sortedBefore = [...segments].sort((a, b) => a.startYear - b.startYear)
    console.log('Chronological order before:', sortedBefore.map(s => s.name))

    // The main phase is chronologically first, phase2 is second
    expect(sortedBefore[0].id).toBe('main')
    expect(sortedBefore[1].id).toBe('phase2')

    // Try to move main phase down
    const result = moveSegmentDown(segments, 'main')

    console.log('\nAfter moveSegmentDown(segments, "main"):')
    const mainAfter = result.find(s => s.id === 'main')!
    const phase2After = result.find(s => s.id === 'phase2')!
    console.log('Hauptphase:', mainAfter.startYear, '-', mainAfter.endYear, '(duration:', mainAfter.endYear - mainAfter.startYear + 1, 'years)')
    console.log('Phase 2:', phase2After.startYear, '-', phase2After.endYear, '(duration:', phase2After.endYear - phase2After.startYear + 1, 'years)')

    // Verify chronological order after move
    const sortedAfter = [...result].sort((a, b) => a.startYear - b.startYear)
    console.log('Chronological order after:', sortedAfter.map(s => s.name))

    // Expected behavior after moving main phase down:
    // Phase 2 should now be chronologically first (start at 2041)
    // Main phase should be chronologically second (start after Phase 2 ends)

    // Phase 2 should now start at 2041 and maintain its 5-year duration
    expect(phase2After.startYear).toBe(2041)
    expect(phase2After.endYear).toBe(2045) // 2041 + 5 - 1

    // Main phase should now start after Phase 2 and maintain its 45-year duration
    expect(mainAfter.startYear).toBe(2046) // 2045 + 1
    expect(mainAfter.endYear).toBe(2090) // 2046 + 45 - 1

    // Verify the chronological order changed
    expect(sortedAfter[0].id).toBe('phase2') // Phase 2 should now be chronologically first
    expect(sortedAfter[1].id).toBe('main') // Main phase should now be chronologically second
  })
})
