import type { WithdrawalResult } from '../../helpers/withdrawal'
import { useWithdrawalModals } from './useWithdrawalModals'
import { useHealthCareInsuranceHandlers } from './useHealthCareInsuranceHandlers'
import { useWithdrawalVariablesProps } from './useWithdrawalVariablesProps'
import { useWithdrawalEffects } from './useWithdrawalEffects'
import type { WithdrawalData } from './useWithdrawalCalculations.types'
import type {
  WithdrawalConfiguration,
  WithdrawalFormValue,
  ComparisonStrategy,
  SegmentedComparisonStrategy,
  WithdrawalReturnMode,
} from '../utils/config-storage'
import type { SimulationContextState } from '../contexts/SimulationContext'
import type { WithdrawalSegment } from '../utils/segmented-withdrawal'

/**
 * Configuration values returned by useWithdrawalConfigValues
 */
interface ConfigValues {
  formValue: WithdrawalFormValue
  withdrawalReturnMode: WithdrawalReturnMode
  withdrawalVariableReturns: Record<number, number>
  withdrawalAverageReturn: number
  withdrawalStandardDeviation: number
  withdrawalRandomSeed: number | undefined
  useSegmentedWithdrawal: boolean
  withdrawalSegments: WithdrawalSegment[]
  useComparisonMode: boolean
  comparisonStrategies: ComparisonStrategy[]
  useSegmentedComparisonMode: boolean
  segmentedComparisonStrategies: SegmentedComparisonStrategy[]
}

interface UseEntnahmeModalsAndPropsParams {
  configValues: ConfigValues
  simulationContext: SimulationContextState
  currentConfig: WithdrawalConfiguration
  updateConfig: (updates: Partial<WithdrawalConfiguration>) => void
  updateFormValue: (updates: Partial<WithdrawalFormValue>) => void
  updateComparisonStrategy: (id: string, updates: Partial<ComparisonStrategy>) => void
  addSegmentedComparisonStrategy: (strategy: SegmentedComparisonStrategy) => void
  updateSegmentedComparisonStrategy: (id: string, updates: Partial<SegmentedComparisonStrategy>) => void
  removeSegmentedComparisonStrategy: (id: string) => void
  withdrawalData: WithdrawalData
  startOfIndependence: number
  steuerlast: number
  teilfreistellungsquote: number
  dispatchEnd: (val: [number, number]) => void
  onWithdrawalResultsChange?: (results: WithdrawalResult | null) => void
}

export function useEntnahmeModalsAndProps(params: UseEntnahmeModalsAndPropsParams) {
  // Type assertion needed: useWithdrawalCalculations.types.WithdrawalData is incompatible with
  // useWithdrawalModals.types.WithdrawalData due to withdrawalResult being WithdrawalResult | null
  // vs WithdrawalResult. The types are structurally compatible in practice
  const modals = useWithdrawalModals(
    params.configValues.formValue, params.configValues.useSegmentedWithdrawal,
    params.configValues.withdrawalSegments,
    params.withdrawalData as Parameters<typeof useWithdrawalModals>[3],
    params.startOfIndependence, params.steuerlast, params.teilfreistellungsquote,
    params.simulationContext.grundfreibetragAktiv, params.simulationContext.grundfreibetragBetrag,
  )

  const healthCareInsuranceHandlers = useHealthCareInsuranceHandlers(
    params.configValues.formValue, params.updateFormValue,
  )

  useWithdrawalEffects({
    onWithdrawalResultsChange: params.onWithdrawalResultsChange,
    // Type assertion needed: useWithdrawalCalculations.types.WithdrawalData has
    // withdrawalResult: WithdrawalResult | null, but useWithdrawalEffects expects
    // WithdrawalData with withdrawalResult: WithdrawalResult. Structurally compatible.
    withdrawalData: params.withdrawalData as Parameters<typeof useWithdrawalEffects>[0]['withdrawalData'],
    useSegmentedWithdrawal: params.configValues.useSegmentedWithdrawal,
    withdrawalSegments: params.configValues.withdrawalSegments,
    startOfIndependence: params.startOfIndependence,
    updateConfig: params.updateConfig,
  })

  // Type assertion needed: useWithdrawalCalculations.types.WithdrawalData is incompatible
  // with useWithdrawalVariablesProps expected type due to withdrawalResult being
  // WithdrawalResult | null vs WithdrawalResult. Structurally compatible in practice.
  const withdrawalVariablesProps = useWithdrawalVariablesProps({
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
    withdrawalData: params.withdrawalData as Parameters<typeof useWithdrawalVariablesProps>[0]['withdrawalData'],
    healthCareInsuranceHandlers,
  })

  return { ...modals, withdrawalVariablesProps }
}
