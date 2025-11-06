import { useMemo } from 'react'
import type { SimulationData } from '../contexts/helpers/config-types'
import type { WithdrawalResult } from '../../helpers/withdrawal'
import type { WithdrawalConfiguration } from '../utils/config-storage'
import { getEnhancedOverviewSummary } from '../utils/enhanced-summary'
import { calculateWithdrawalEndYear } from '../utils/overview-calculations'

/**
 * Calculate the start year from simulation data
 */
function calculateSavingsStartYear(simulationData: SimulationData | null): number {
  if (!simulationData) return 0
  return Math.min(...simulationData.sparplanElements.map((el) => new Date(el.start).getFullYear()))
}

/**
 * Custom hook to calculate enhanced summary and year ranges for EnhancedOverview
 * Extracted to reduce component complexity
 */
export function useOverviewYearRanges(
  simulationData: SimulationData | null,
  startEnd: [number, number],
  withdrawalResults: WithdrawalResult | null,
  rendite: number,
  steuerlast: number,
  teilfreistellungsquote: number,
  withdrawalConfig: WithdrawalConfiguration | null | undefined,
  endOfLife: number,
) {
  const enhancedSummary = useMemo(() => {
    return getEnhancedOverviewSummary(
      simulationData,
      startEnd,
      withdrawalResults,
      rendite,
      steuerlast,
      teilfreistellungsquote,
      withdrawalConfig,
      endOfLife,
    )
  }, [
    simulationData,
    startEnd,
    withdrawalResults,
    rendite,
    steuerlast,
    teilfreistellungsquote,
    withdrawalConfig,
    endOfLife,
  ])

  const savingsStartYear = useMemo(() => calculateSavingsStartYear(simulationData), [simulationData])

  const savingsEndYear = startEnd[0]

  const withdrawalEndYear = useMemo(() => {
    if (!enhancedSummary) return startEnd[1]
    return calculateWithdrawalEndYear(enhancedSummary, endOfLife, startEnd[1])
  }, [enhancedSummary, endOfLife, startEnd])

  return { enhancedSummary, savingsStartYear, savingsEndYear, withdrawalEndYear }
}
