import { useSimulation } from '../contexts/useSimulation'
import { useWithdrawalConfig } from './useWithdrawalConfig'
import { useWithdrawalConfigValues } from './useWithdrawalConfigValues'

export function useEntnahmeConfigHooks() {
  const {
    currentConfig,
    updateConfig,
    updateFormValue,
    updateComparisonStrategy,
    updateSegmentedComparisonStrategy,
    addSegmentedComparisonStrategy,
    removeSegmentedComparisonStrategy,
  } = useWithdrawalConfig()

  const configValues = useWithdrawalConfigValues(currentConfig)

  const simulationContext = useSimulation()

  return {
    currentConfig,
    updateConfig,
    updateFormValue,
    updateComparisonStrategy,
    updateSegmentedComparisonStrategy,
    addSegmentedComparisonStrategy,
    removeSegmentedComparisonStrategy,
    configValues,
    simulationContext,
  }
}
