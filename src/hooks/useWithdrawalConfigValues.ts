import { useMemo } from 'react'
import type { WithdrawalConfiguration } from '../utils/config-storage'

/**
 * Hook to extract and memoize withdrawal configuration values
 * Reduces repetitive destructuring in components
 */
export function useWithdrawalConfigValues(currentConfig: WithdrawalConfiguration) {
  return useMemo(
    () => ({
      formValue: currentConfig.formValue,
      withdrawalReturnMode: currentConfig.withdrawalReturnMode,
      withdrawalVariableReturns: currentConfig.withdrawalVariableReturns,
      withdrawalAverageReturn: currentConfig.withdrawalAverageReturn,
      withdrawalStandardDeviation: currentConfig.withdrawalStandardDeviation,
      withdrawalRandomSeed: currentConfig.withdrawalRandomSeed,
      useSegmentedWithdrawal: currentConfig.useSegmentedWithdrawal,
      withdrawalSegments: currentConfig.withdrawalSegments,
      useComparisonMode: currentConfig.useComparisonMode,
      comparisonStrategies: currentConfig.comparisonStrategies,
      useSegmentedComparisonMode: currentConfig.useSegmentedComparisonMode,
      segmentedComparisonStrategies: currentConfig.segmentedComparisonStrategies,
    }),
    [currentConfig],
  )
}
