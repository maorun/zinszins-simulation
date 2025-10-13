import { calculateWithdrawal } from '../../helpers/withdrawal'
import { getEnhancedSummary } from './summary-utils'
import type { SimulationData } from '../contexts/helpers/config-types'
import type { WithdrawalResult } from '../../helpers/withdrawal'
import type { WithdrawalConfiguration } from './config-storage'

export function getEnhancedOverviewSummary(
  simulationData: SimulationData | null,
  startEnd: [number, number],
  withdrawalResults: WithdrawalResult | null,
  rendite: number,
  steuerlast: number,
  teilfreistellungsquote: number,
  withdrawalConfig?: WithdrawalConfiguration | null,
  endOfLife?: number,
) {
  if (!simulationData) return null

  const startDates = simulationData.sparplanElements.map(el => new Date(el.start).getFullYear())
  const savingsStartYear = Math.min(...startDates)
  const savingsEndYear = startEnd[0]

  let withdrawalResult
  if (withdrawalResults) {
    withdrawalResult = withdrawalResults
  }
  else {
    // Use endOfLife if provided, otherwise fall back to startEnd[1]
    const withdrawalEndYear = endOfLife || startEnd[1]
    const { result } = calculateWithdrawal({
      elements: simulationData.sparplanElements,
      startYear: startEnd[0] + 1,
      endYear: withdrawalEndYear,
      strategy: '4prozent',
      returnConfig: { mode: 'fixed', fixedRate: rendite / 100 },
      taxRate: steuerlast / 100,
      teilfreistellungsquote: teilfreistellungsquote / 100,
    })
    withdrawalResult = result
  }

  return getEnhancedSummary(
    simulationData.sparplanElements,
    savingsStartYear,
    savingsEndYear,
    withdrawalResult,
    withdrawalConfig?.useSegmentedWithdrawal,
    withdrawalConfig?.withdrawalSegments,
  )
}
