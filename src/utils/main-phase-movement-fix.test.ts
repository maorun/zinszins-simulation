import { describe, it, expect } from 'vitest'
import {
  moveSegmentDown,
  createDefaultWithdrawalSegment,
  validateWithdrawalSegments,
} from './segmented-withdrawal'

describe('Main Phase Movement Fix - User Issue Resolution', () => {
  it('should allow main phase to be moved down in typical user scenario', () => {
    // Recreate the scenario described by the user
    // Main phase starts at withdrawal start year, followed by other phases
    const segments = [
      createDefaultWithdrawalSegment('main', 'Hauptphase', 2041, 2080), // 40 years
      createDefaultWithdrawalSegment('phase2', 'Phase 2', 2081, 2085), // 5 years
      createDefaultWithdrawalSegment('phase3', 'Phase 3', 2086, 2090), // 5 years
    ]

    console.log('Original configuration:')
    segments.forEach((segment, index) => {
      console.log(`${index}: ${segment.name} (${segment.startYear}-${segment.endYear})`)
    })

    // Verify initial state has no validation errors
    const initialErrors = validateWithdrawalSegments(segments, 2041, 2090)
    console.log('Initial validation errors:', initialErrors)
    expect(initialErrors).toHaveLength(0)

    // Verify main phase is chronologically first
    const sortedSegments = [...segments].sort((a, b) => a.startYear - b.startYear)
    expect(sortedSegments[0].id).toBe('main')

    // Move main phase down - this should work
    const resultAfterMove = moveSegmentDown(segments, 'main')

    console.log('\nAfter moving main phase down:')
    const sortedResult = [...resultAfterMove].sort((a, b) => a.startYear - b.startYear)
    sortedResult.forEach((segment, index) => {
      console.log(`${index}: ${segment.name} (${segment.startYear}-${segment.endYear})`)
    })

    // Verify the movement was successful
    const mainAfter = resultAfterMove.find(s => s.id === 'main')!
    const phase2After = resultAfterMove.find(s => s.id === 'phase2')!

    // Phase 2 should now be chronologically first (starts at 2041)
    expect(phase2After.startYear).toBe(2041)
    expect(phase2After.endYear).toBe(2045) // Original 5-year duration preserved

    // Main phase should now start after Phase 2 (starts at 2046)
    expect(mainAfter.startYear).toBe(2046)
    expect(mainAfter.endYear).toBe(2085) // Original 40-year duration preserved

    // Verify no validation errors after movement
    const postMoveErrors = validateWithdrawalSegments(resultAfterMove, 2041, 2090)
    console.log('Post-movement validation errors:', postMoveErrors)
    expect(postMoveErrors).toHaveLength(0)

    // Verify chronological order changed correctly
    const newSortedSegments = [...resultAfterMove].sort((a, b) => a.startYear - b.startYear)
    expect(newSortedSegments[0].id).toBe('phase2') // Phase 2 now first
    expect(newSortedSegments[1].id).toBe('main') // Main phase now second
    expect(newSortedSegments[2].id).toBe('phase3') // Phase 3 unchanged
  })

  it('should handle movement with validation errors by auto-correcting first', () => {
    // Create segments with validation issues (gaps, overlaps)
    const brokenSegments = [
      createDefaultWithdrawalSegment('main', 'Hauptphase', 2041, 2070),
      createDefaultWithdrawalSegment('phase2', 'Phase 2', 2075, 2080), // Gap: 2071-2074
      createDefaultWithdrawalSegment('phase3', 'Phase 3', 2078, 2085), // Overlap: 2078-2080
    ]

    // Verify initial state has validation errors
    const initialErrors = validateWithdrawalSegments(brokenSegments, 2041, 2085)
    console.log('Broken segments errors:', initialErrors)
    expect(initialErrors.length).toBeGreaterThan(0)

    // Movement should still work by swapping time ranges
    const result = moveSegmentDown(brokenSegments, 'main')

    // Verify main phase moved down (chronological order changed)
    const sortedOriginal = [...brokenSegments].sort((a, b) => a.startYear - b.startYear)
    const sortedResult = [...result].sort((a, b) => a.startYear - b.startYear)

    expect(sortedOriginal[0].id).toBe('main') // Originally main was first
    expect(sortedResult[0].id).not.toBe('main') // After movement, main is no longer first

    // Verify the movement preserved durations
    const originalMain = brokenSegments.find(s => s.id === 'main')!
    const resultMain = result.find(s => s.id === 'main')!
    const originalDuration = originalMain.endYear - originalMain.startYear + 1
    const resultDuration = resultMain.endYear - resultMain.startYear + 1

    expect(resultDuration).toBe(originalDuration) // Duration should be preserved
  })

  it('should preserve all segment data during movement', () => {
    // Create segments with rich configuration data
    const mainSegment = {
      ...createDefaultWithdrawalSegment('main', 'Hauptphase', 2041, 2080),
      strategy: '3prozent' as const,
      customPercentage: 0.035,
      enableGrundfreibetrag: true,
      incomeTaxRate: 0.25,
    }

    const phase2Segment = {
      ...createDefaultWithdrawalSegment('phase2', 'Phase 2', 2081, 2090),
      strategy: 'monatlich_fest' as const,
      monthlyConfig: {
        monthlyAmount: 2500,
        enableGuardrails: true,
        guardrailsThreshold: 0.15,
      },
    }

    const segments = [mainSegment, phase2Segment]

    // Move main phase down
    const result = moveSegmentDown(segments, 'main')

    // Find moved segments
    const movedMain = result.find(s => s.id === 'main')!
    const movedPhase2 = result.find(s => s.id === 'phase2')!

    // Verify all configuration data is preserved
    expect(movedMain.strategy).toBe('3prozent')
    expect(movedMain.customPercentage).toBe(0.035)
    expect(movedMain.enableGrundfreibetrag).toBe(true)
    expect(movedMain.incomeTaxRate).toBe(0.25)

    expect(movedPhase2.strategy).toBe('monatlich_fest')
    expect(movedPhase2.monthlyConfig?.monthlyAmount).toBe(2500)
    expect(movedPhase2.monthlyConfig?.enableGuardrails).toBe(true)
    expect(movedPhase2.monthlyConfig?.guardrailsThreshold).toBe(0.15)

    // Verify only time ranges changed
    expect(movedMain.startYear).not.toBe(mainSegment.startYear)
    expect(movedPhase2.startYear).not.toBe(phase2Segment.startYear)
  })
})
