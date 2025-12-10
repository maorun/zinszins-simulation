import { useMemo } from 'react'
import type { WithdrawalSegment } from '../utils/segmented-withdrawal'
import { handleWithdrawalModeChange } from './withdrawal-mode-helpers'

interface UseWithdrawalModeChangeParams {
  withdrawalSegments: WithdrawalSegment[]
  startOfIndependence: number
  globalEndOfLife: number
  onConfigUpdate: (updates: Record<string, unknown>) => void
}

/**
 * Custom hook to create a memoized mode change handler for withdrawal configuration
 * Prevents unnecessary re-renders by memoizing the callback
 */
export function useWithdrawalModeChange({
  withdrawalSegments,
  startOfIndependence,
  globalEndOfLife,
  onConfigUpdate,
}: UseWithdrawalModeChangeParams) {
  return useMemo(
    () => (mode: string) =>
      handleWithdrawalModeChange({
        mode,
        withdrawalSegments,
        startOfIndependence,
        globalEndOfLife,
        updateConfig: onConfigUpdate,
      }),
    [withdrawalSegments, startOfIndependence, globalEndOfLife, onConfigUpdate],
  )
}
