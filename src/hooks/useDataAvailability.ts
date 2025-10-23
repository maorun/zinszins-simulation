import { useSimulation } from '../contexts/useSimulation'

interface DataAvailability {
  hasSavingsData: boolean
  hasWithdrawalData: boolean
  hasWithdrawalConfig: boolean
  hasWithdrawalConfigFromStorage: boolean
  hasWithdrawalCapability: boolean
  hasAnyData: boolean
}

/**
 * Hook to check what data is available for export
 */
export function useDataAvailability(): DataAvailability {
  const { simulationData, withdrawalResults, withdrawalConfig } = useSimulation()

  const hasSavingsData = !!(
    simulationData?.sparplanElements
    && simulationData.sparplanElements.length > 0
  )

  const hasWithdrawalData = !!(
    withdrawalResults
    && Object.keys(withdrawalResults).length > 0
  )

  const hasWithdrawalConfig = !!(
    withdrawalConfig
    && withdrawalConfig.formValue
  )

  const hasWithdrawalConfigFromStorage = !!(
    withdrawalConfig
    && (
      withdrawalConfig.formValue
      || withdrawalConfig.useSegmentedWithdrawal
      || withdrawalConfig.withdrawalSegments?.length > 0
    )
  )

  const hasWithdrawalCapability = (
    hasWithdrawalData
    || hasWithdrawalConfig
    || hasWithdrawalConfigFromStorage
    || (hasSavingsData && !!withdrawalConfig)
  )

  const hasAnyData = (
    hasSavingsData
    || hasWithdrawalData
    || hasWithdrawalConfig
    || hasWithdrawalConfigFromStorage
  )

  return {
    hasSavingsData,
    hasWithdrawalData,
    hasWithdrawalConfig,
    hasWithdrawalConfigFromStorage,
    hasWithdrawalCapability,
    hasAnyData,
  }
}
