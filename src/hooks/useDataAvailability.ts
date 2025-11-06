import { useSimulation } from '../contexts/useSimulation'
import { SimulationData } from '../contexts/helpers/config-types'
import { WithdrawalConfiguration } from '../utils/config-storage'
import { WithdrawalResult } from '../../helpers/withdrawal'

interface DataAvailability {
  hasSavingsData: boolean
  hasWithdrawalData: boolean
  hasWithdrawalConfig: boolean
  hasWithdrawalConfigFromStorage: boolean
  hasWithdrawalCapability: boolean
  hasAnyData: boolean
}

const checkSavingsData = (simulationData?: SimulationData | null): boolean => {
  return !!(simulationData?.sparplanElements && simulationData.sparplanElements.length > 0)
}

const checkWithdrawalData = (withdrawalResults?: WithdrawalResult | null): boolean => {
  return !!(withdrawalResults && Object.keys(withdrawalResults).length > 0)
}

const checkWithdrawalConfig = (withdrawalConfig?: WithdrawalConfiguration | null): boolean => {
  return !!(withdrawalConfig && withdrawalConfig.formValue)
}

const checkWithdrawalConfigFromStorage = (withdrawalConfig?: WithdrawalConfiguration | null): boolean => {
  return !!(
    withdrawalConfig &&
    (withdrawalConfig.formValue ||
      withdrawalConfig.useSegmentedWithdrawal ||
      withdrawalConfig.withdrawalSegments?.length > 0)
  )
}

/**
 * Hook to check what data is available for export
 */
export function useDataAvailability(): DataAvailability {
  const { simulationData, withdrawalResults, withdrawalConfig } = useSimulation()

  const hasSavingsData = checkSavingsData(simulationData)
  const hasWithdrawalData = checkWithdrawalData(withdrawalResults)
  const hasWithdrawalConfig = checkWithdrawalConfig(withdrawalConfig)
  const hasWithdrawalConfigFromStorage = checkWithdrawalConfigFromStorage(withdrawalConfig)

  const hasWithdrawalCapability =
    hasWithdrawalData || hasWithdrawalConfig || hasWithdrawalConfigFromStorage || (hasSavingsData && !!withdrawalConfig)

  const hasAnyData = hasSavingsData || hasWithdrawalData || hasWithdrawalConfig || hasWithdrawalConfigFromStorage

  return {
    hasSavingsData,
    hasWithdrawalData,
    hasWithdrawalConfig,
    hasWithdrawalConfigFromStorage,
    hasWithdrawalCapability,
    hasAnyData,
  }
}
