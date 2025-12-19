import { calculateWithdrawal, type WithdrawalResult } from '../../helpers/withdrawal'
import { getEnhancedSummary } from './summary-utils'
import type { SimulationData } from '../contexts/helpers/config-types'
import type { WithdrawalConfiguration } from './config-storage'

/**
 * Generate enhanced overview summary for sticky navigation display
 *
 * Creates a comprehensive summary of both savings and withdrawal phases,
 * including key metrics like total contributions, final capital, withdrawal duration,
 * and segmented withdrawal information if applicable.
 *
 * @param simulationData - Simulation data containing savings plan elements
 * @param startEnd - Tuple of [savings end year, global end year]
 * @param withdrawalResults - Pre-calculated withdrawal results, or null to calculate default 4% rule
 * @param rendite - Expected return rate in percentage (e.g., 7 for 7%)
 * @param steuerlast - Tax rate in percentage (e.g., 26.375 for German Kapitalertragsteuer)
 * @param teilfreistellungsquote - Partial exemption rate for equity funds (e.g., 30 for 30%)
 * @param withdrawalConfig - Optional withdrawal configuration for segmented withdrawals
 * @param endOfLife - Optional end of life year to override global end year
 * @returns Enhanced summary object with savings and withdrawal metrics, or null if no simulation data
 *
 * @example
 * ```typescript
 * const summary = getEnhancedOverviewSummary(
 *   simulationData,
 *   [2040, 2065],  // Savings ends 2040, planning until 2065
 *   null,          // Calculate default 4% withdrawal
 *   7,             // 7% return
 *   26.375,        // German capital gains tax
 *   30,            // 30% equity fund exemption
 *   withdrawalConfig,
 *   2065           // Plan until age 90
 * )
 * ```
 */
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
  } else {
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
