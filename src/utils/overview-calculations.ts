import type { EnhancedSummary } from './summary-utils'

/**
 * Calculate the proper withdrawal end year based on various configuration options
 *
 * Determines the correct end year for withdrawal phase calculations by checking
 * configuration sources in priority order. This ensures consistent behavior
 * across different withdrawal strategy configurations.
 *
 * **Priority Order:**
 * 1. If segmented withdrawal is active and has segments, use the latest segment end year
 * 2. Otherwise use endOfLife if provided
 * 3. Fall back to global end year (startEnd[1])
 *
 * @param enhancedSummary - Enhanced summary containing segmented withdrawal information
 * @param endOfLife - Optional end of life year (user-specified planning horizon)
 * @param globalEndYear - Global end year from main configuration (startEnd[1])
 * @returns The calculated withdrawal end year
 *
 * @example
 * ```typescript
 * // Example 1: Segmented withdrawal overrides other settings
 * const summary = {
 *   isSegmentedWithdrawal: true,
 *   withdrawalSegments: [
 *     { endYear: 2055, ... },
 *     { endYear: 2070, ... }
 *   ]
 * }
 * calculateWithdrawalEndYear(summary, 2060, 2065) // Returns: 2070 (latest segment)
 *
 * // Example 2: endOfLife used when no segments
 * calculateWithdrawalEndYear(null, 2080, 2065) // Returns: 2080
 *
 * // Example 3: Global end year as fallback
 * calculateWithdrawalEndYear(null, undefined, 2065) // Returns: 2065
 * ```
 */
export function calculateWithdrawalEndYear(
  enhancedSummary: EnhancedSummary | null,
  endOfLife: number | undefined,
  globalEndYear: number,
): number {
  // Use endOfLife if provided, otherwise fall back to globalEndYear
  let withdrawalEndYear = endOfLife || globalEndYear

  // Check for segmented withdrawal configuration (highest priority)
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
