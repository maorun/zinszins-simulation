import type { WithdrawalResult } from '../../helpers/withdrawal'
import { useWithdrawalModals } from './useWithdrawalModals'
import { useHealthCareInsuranceHandlers } from './useHealthCareInsuranceHandlers'
import { useWithdrawalVariablesProps } from './useWithdrawalVariablesProps'
import { useWithdrawalEffects } from './useWithdrawalEffects'
import type { WithdrawalData } from './useWithdrawalCalculations.types'

interface UseEntnahmeModalsAndPropsParams {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  configValues: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  simulationContext: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  currentConfig: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateConfig: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateFormValue: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateComparisonStrategy: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addSegmentedComparisonStrategy: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateSegmentedComparisonStrategy: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  removeSegmentedComparisonStrategy: any
  withdrawalData: WithdrawalData
  startOfIndependence: number
  steuerlast: number
  teilfreistellungsquote: number
  dispatchEnd: (val: [number, number]) => void
  onWithdrawalResultsChange?: (results: WithdrawalResult | null) => void
}

export function useEntnahmeModalsAndProps(params: UseEntnahmeModalsAndPropsParams) {
  const modals = useWithdrawalModals(
    params.configValues.formValue, params.configValues.useSegmentedWithdrawal,
    params.configValues.withdrawalSegments, params.withdrawalData,
    params.startOfIndependence, params.steuerlast, params.teilfreistellungsquote,
    params.simulationContext.grundfreibetragAktiv, params.simulationContext.grundfreibetragBetrag,
  )

  const healthCareInsuranceHandlers = useHealthCareInsuranceHandlers(
    params.configValues.formValue, params.updateFormValue,
  )

  useWithdrawalEffects({
    onWithdrawalResultsChange: params.onWithdrawalResultsChange,
    withdrawalData: params.withdrawalData as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    useSegmentedWithdrawal: params.configValues.useSegmentedWithdrawal,
    withdrawalSegments: params.configValues.withdrawalSegments,
    startOfIndependence: params.startOfIndependence,
    updateConfig: params.updateConfig,
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const withdrawalVariablesProps: any = useWithdrawalVariablesProps({
    currentConfig: params.currentConfig,
    updateConfig: params.updateConfig,
    updateFormValue: params.updateFormValue,
    updateComparisonStrategy: params.updateComparisonStrategy,
    addSegmentedComparisonStrategy: params.addSegmentedComparisonStrategy,
    updateSegmentedComparisonStrategy: params.updateSegmentedComparisonStrategy,
    removeSegmentedComparisonStrategy: params.removeSegmentedComparisonStrategy,
    formValue: params.configValues.formValue,
    withdrawalReturnMode: params.configValues.withdrawalReturnMode,
    withdrawalAverageReturn: params.configValues.withdrawalAverageReturn,
    withdrawalStandardDeviation: params.configValues.withdrawalStandardDeviation,
    withdrawalRandomSeed: params.configValues.withdrawalRandomSeed,
    withdrawalVariableReturns: params.configValues.withdrawalVariableReturns,
    withdrawalMultiAssetConfig: params.simulationContext.withdrawalMultiAssetConfig,
    setWithdrawalMultiAssetConfig: params.simulationContext.setWithdrawalMultiAssetConfig,
    useSegmentedWithdrawal: params.configValues.useSegmentedWithdrawal,
    useComparisonMode: params.configValues.useComparisonMode,
    useSegmentedComparisonMode: params.configValues.useSegmentedComparisonMode,
    dispatchEnd: params.dispatchEnd,
    startOfIndependence: params.startOfIndependence,
    globalEndOfLife: params.simulationContext.endOfLife,
    planningMode: params.simulationContext.planningMode,
    birthYear: params.simulationContext.birthYear,
    spouseBirthYear: params.simulationContext.spouse?.birthYear,
    withdrawalData: params.withdrawalData as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    healthCareInsuranceHandlers,
  })

  return { ...modals, withdrawalVariablesProps }
}
