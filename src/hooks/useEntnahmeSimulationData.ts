import type { WithdrawalResult } from '../../helpers/withdrawal'
import type { SparplanElement } from '../utils/sparplan-utils'
import { useWithdrawalCalculations } from './useWithdrawalCalculations'
import { useEntnahmeConfigHooks } from './useEntnahmeConfigHooks'
import { useEntnahmeModalsAndProps } from './useEntnahmeModalsAndProps'

export function useEntnahmeSimulationData(
  elemente: SparplanElement[],
  startEnd: [number, number],
  dispatchEnd: (val: [number, number]) => void,
  onWithdrawalResultsChange: ((results: WithdrawalResult | null) => void) | undefined,
  steuerlast: number,
  teilfreistellungsquote: number,
) {
  const [startOfIndependence] = startEnd
  const configs = useEntnahmeConfigHooks()
  const { withdrawalData, comparisonResults, segmentedComparisonResults = [] } = useWithdrawalCalculations(
    elemente,
    startOfIndependence,
    configs.currentConfig,
    steuerlast,
    teilfreistellungsquote,
  )

  const modalsAndProps = useEntnahmeModalsAndProps({
    configValues: configs.configValues,
    simulationContext: configs.simulationContext,
    currentConfig: configs.currentConfig,
    updateConfig: configs.updateConfig,
    updateFormValue: configs.updateFormValue,
    updateComparisonStrategy: configs.updateComparisonStrategy,
    addSegmentedComparisonStrategy: configs.addSegmentedComparisonStrategy,
    updateSegmentedComparisonStrategy: configs.updateSegmentedComparisonStrategy,
    removeSegmentedComparisonStrategy: configs.removeSegmentedComparisonStrategy,
    withdrawalData,
    startOfIndependence,
    steuerlast,
    teilfreistellungsquote,
    dispatchEnd,
    onWithdrawalResultsChange,
  })

  return {
    ...modalsAndProps,
    withdrawalData,
    formValue: configs.configValues.formValue,
    useComparisonMode: configs.configValues.useComparisonMode,
    comparisonResults,
    useSegmentedComparisonMode: configs.configValues.useSegmentedComparisonMode,
    segmentedComparisonResults,
  }
}
