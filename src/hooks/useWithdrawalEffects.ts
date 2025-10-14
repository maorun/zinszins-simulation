import { useEffect } from 'react'
import type { WithdrawalResult } from '../../helpers/withdrawal'
import type { WithdrawalSegment } from '../utils/segmented-withdrawal'

interface WithdrawalData {
  startingCapital: number
  withdrawalArray: Array<{
    year: number
    [key: string]: unknown
  }>
  withdrawalResult: WithdrawalResult
  duration: number | 'unbegrenzt'
}

interface UseWithdrawalEffectsParams {
  /** Callback when withdrawal results change */
  onWithdrawalResultsChange?: (results: WithdrawalResult | null) => void
  /** Current withdrawal data from calculations */
  withdrawalData: WithdrawalData | null
  /** Whether segmented withdrawal is enabled */
  useSegmentedWithdrawal: boolean
  /** Current withdrawal segments */
  withdrawalSegments: WithdrawalSegment[]
  /** Start of independence year */
  startOfIndependence: number
  /** Function to update withdrawal configuration */
  updateConfig: (updates: { withdrawalSegments: WithdrawalSegment[] }) => void
}

/**
 * Hook to manage withdrawal-related side effects
 * - Notifies parent when withdrawal results change
 * - Updates withdrawal segments when startOfIndependence changes
 */
export function useWithdrawalEffects({
  onWithdrawalResultsChange,
  withdrawalData,
  useSegmentedWithdrawal,
  withdrawalSegments,
  startOfIndependence,
  updateConfig,
}: UseWithdrawalEffectsParams) {
  // Notify parent component when withdrawal results change
  useEffect(() => {
    if (onWithdrawalResultsChange && withdrawalData) {
      onWithdrawalResultsChange(withdrawalData.withdrawalResult)
    }
  }, [withdrawalData, onWithdrawalResultsChange])

  // Update withdrawal segments when startOfIndependence changes (for segmented withdrawal)
  useEffect(() => {
    if (useSegmentedWithdrawal && withdrawalSegments.length > 0) {
      const updatedSegments = withdrawalSegments.map((segment, index) =>
        index === 0 ? { ...segment, startYear: startOfIndependence + 1 } : segment,
      )

      if (updatedSegments[0]?.startYear !== withdrawalSegments[0]?.startYear) {
        updateConfig({ withdrawalSegments: updatedSegments })
      }
    }
  }, [startOfIndependence, useSegmentedWithdrawal, withdrawalSegments, updateConfig])
}
