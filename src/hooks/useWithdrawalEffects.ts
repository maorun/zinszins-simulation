import { useEffect, useRef } from 'react'
import type { WithdrawalResult } from '../../helpers/withdrawal'
import type { WithdrawalSegment } from '../utils/segmented-withdrawal'

interface WithdrawalData {
  startingCapital: number
  withdrawalArray: Array<{
    year: number
    [key: string]: unknown
  }>
  withdrawalResult: WithdrawalResult
  duration: number | 'unbegrenzt' | null
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
  // Track a serialized version of the last notified withdrawal result to prevent infinite loops
  const lastNotifiedResultHashRef = useRef<string | null>(null)
  // Store the callback in a ref to avoid it being a dependency
  const callbackRef = useRef(onWithdrawalResultsChange)
  
  // Update callback ref when it changes
  useEffect(() => {
    callbackRef.current = onWithdrawalResultsChange
  }, [onWithdrawalResultsChange])

  // Notify parent component when withdrawal results change
  useEffect(() => {
    const callback = callbackRef.current
    if (callback) {
      // Serialize the current result to compare with the last one
      const currentHash = withdrawalData ? JSON.stringify(withdrawalData.withdrawalResult) : null

      // Only notify if the serialized result is actually different
      if (currentHash !== lastNotifiedResultHashRef.current) {
        lastNotifiedResultHashRef.current = currentHash
        callback(withdrawalData ? withdrawalData.withdrawalResult : null)
      }
    }
  }, [withdrawalData]) // Remove onWithdrawalResultsChange from dependencies

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
