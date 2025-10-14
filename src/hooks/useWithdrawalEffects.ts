import { useEffect } from 'react'
import type { WithdrawalResult } from '../../helpers/withdrawal'
import type { WithdrawalSegment } from '../utils/config-storage'

/**
 * Custom hook to handle side effects in withdrawal configuration
 */
export function useWithdrawalEffects({
  onWithdrawalResultsChange,
  withdrawalData,
  useSegmentedWithdrawal,
  withdrawalSegments,
  startOfIndependence,
  updateConfig,
}: {
  onWithdrawalResultsChange?: (results: WithdrawalResult | null) => void
  withdrawalData: any
  useSegmentedWithdrawal: boolean
  withdrawalSegments: WithdrawalSegment[]
  startOfIndependence: number
  updateConfig: (updates: any) => void
}) {
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
