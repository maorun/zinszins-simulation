import type { Sparplan } from './sparplan-utils'

/**
 * Phase date ranges for financial planning
 */
export interface PhaseDateRanges {
  savingsStartYear: number
  savingsEndYear: number
  withdrawalStartYear: number
  withdrawalEndYear: number
}

/**
 * Calculate phase date ranges for special events and planning
 * Extracted from HomePageContent to reduce complexity
 *
 * @param sparplan - Array of savings plans
 * @param startEnd - Tuple of [retirement year, end year]
 * @param endOfLife - End of life year
 * @returns Phase date ranges
 */
export function calculatePhaseDateRanges(
  sparplan: Sparplan[],
  startEnd: [number, number],
  endOfLife: number,
): PhaseDateRanges {
  const savingsStartYear =
    sparplan.length > 0 ? Math.min(...sparplan.map(p => new Date(p.start).getFullYear())) : new Date().getFullYear()
  const savingsEndYear = startEnd[0]
  const withdrawalStartYear = startEnd[0] + 1
  const withdrawalEndYear = endOfLife

  return {
    savingsStartYear,
    savingsEndYear,
    withdrawalStartYear,
    withdrawalEndYear,
  }
}
