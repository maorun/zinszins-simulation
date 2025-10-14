import type { WithdrawalConfiguration } from '../utils/config-storage'

/**
 * Extract withdrawal configuration values for easier access
 */
export function extractWithdrawalConfigValues(currentConfig: WithdrawalConfiguration) {
  return {
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
  }
}
