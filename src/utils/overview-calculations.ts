import type { EnhancedSummary } from './summary-utils'

/**
 * Calculate the proper withdrawal end year based on various configuration options
 *
 * Priority:
 * 1. If segmented withdrawal is active and has segments, use the latest segment end year
 * 2. Otherwise use endOfLife if provided
 * 3. Fall back to global end year (startEnd[1])
 */
export function calculateWithdrawalEndYear(
  enhancedSummary: EnhancedSummary | null,
  endOfLife: number | undefined,
  globalEndYear: number,
): number {
  // Use global end of life or fall back to globalEndYear
  let withdrawalEndYear = endOfLife || globalEndYear

  // If we have segmented withdrawal, use the actual end year from segments
  if (
    enhancedSummary?.isSegmentedWithdrawal &&
    enhancedSummary.withdrawalSegments &&
    enhancedSummary.withdrawalSegments.length > 0
  ) {
    // Find the latest end year from all segments
    const segmentEndYears = enhancedSummary.withdrawalSegments
      .map(segment => segment.endYear)
      .filter(year => typeof year === 'number' && !isNaN(year))

    if (segmentEndYears.length > 0) {
      withdrawalEndYear = Math.max(...segmentEndYears)
    }
  }

  return withdrawalEndYear
}
