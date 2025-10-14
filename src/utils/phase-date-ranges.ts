import type { Sparplan } from '../utils/sparplan-utils'

/**
 * Calculate phase date ranges for special events
 */
export function calculatePhaseDateRanges(
  sparplan: Sparplan[],
  startEnd: [number, number],
  endOfLife: number,
) {
  const savingsStartYear = sparplan.length > 0
    ? Math.min(...sparplan.map(p => new Date(p.start).getFullYear()))
    : new Date().getFullYear()
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
