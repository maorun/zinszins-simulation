import { describe, it, expect } from 'vitest'
import {
  createDefaultWithdrawalSegment,
} from './segmented-withdrawal'

// Simulate the canMoveDown logic from WithdrawalSegmentForm.tsx
function canMoveDown(segments: any[], segmentId: string): boolean {
  const sortedSegments = [...segments].sort((a, b) => a.startYear - b.startYear)
  const segmentIndex = sortedSegments.findIndex(s => s.id === segmentId)
  return segmentIndex >= 0 && segmentIndex < sortedSegments.length - 1
}

describe('canMoveDown Logic Test', () => {
  it('should allow main phase to move down when it is chronologically first with another phase', () => {
    // Create scenario similar to what user described
    const segments = [
      createDefaultWithdrawalSegment('main', 'Hauptphase', 2041, 2085), // Main phase: 45 years
      createDefaultWithdrawalSegment('phase2', 'Phase 2', 2086, 2090), // Phase 2: 5 years
    ]

    console.log('Segments:')
    segments.forEach((segment, index) => {
      console.log(`${index}: ${segment.name} (${segment.id}) - ${segment.startYear} to ${segment.endYear}`)
    })

    // Check chronological order
    const sortedSegments = [...segments].sort((a, b) => a.startYear - b.startYear)
    console.log('\nChronological order:')
    sortedSegments.forEach((segment, index) => {
      console.log(`${index}: ${segment.name} (${segment.id}) - ${segment.startYear} to ${segment.endYear}`)
    })

    // Test canMoveDown for main phase
    const mainCanMoveDown = canMoveDown(segments, 'main')
    const phase2CanMoveDown = canMoveDown(segments, 'phase2')

    console.log('\nCanMoveDown results:')
    console.log('Main phase can move down:', mainCanMoveDown)
    console.log('Phase 2 can move down:', phase2CanMoveDown)

    // Main phase is chronologically first (index 0), should be able to move down
    expect(mainCanMoveDown).toBe(true)

    // Phase 2 is chronologically last (index 1), should NOT be able to move down
    expect(phase2CanMoveDown).toBe(false)
  })
})
