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

/**
 * Prepare parameters for useWithdrawalModals hook
 */
function prepareModalParams(params: UseEntnahmeModalsAndPropsParams) {
  return {
    formValue: params.configValues.formValue,
    useSegmentedWithdrawal: params.configValues.useSegmentedWithdrawal,
    withdrawalSegments: params.configValues.withdrawalSegments,
    withdrawalData: params.withdrawalData as Parameters<typeof useWithdrawalModals>[3],
    startOfIndependence: params.startOfIndependence,
    steuerlast: params.steuerlast,
    teilfreistellungsquote: params.teilfreistellungsquote,
    grundfreibetragAktiv: params.simulationContext.grundfreibetragAktiv,
    grundfreibetragBetrag: params.simulationContext.grundfreibetragBetrag,
  }
}

/**
 * Prepare parameters for useWithdrawalEffects hook
 */
function prepareEffectsParams(params: UseEntnahmeModalsAndPropsParams) {
  return {
    onWithdrawalResultsChange: params.onWithdrawalResultsChange,
    withdrawalData: params.withdrawalData as Parameters<typeof useWithdrawalEffects>[0]['withdrawalData'],
    useSegmentedWithdrawal: params.configValues.useSegmentedWithdrawal,
    withdrawalSegments: params.configValues.withdrawalSegments,
    startOfIndependence: params.startOfIndependence,
    updateConfig: params.updateConfig,
  }
}

/**
 * Prepare parameters for useWithdrawalVariablesProps hook
 */
function prepareVariablesProps(
  params: UseEntnahmeModalsAndPropsParams,
  healthCareInsuranceHandlers: ReturnType<typeof useHealthCareInsuranceHandlers>,
) {
  return {
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
    coupleStatutoryPensionConfig: params.simulationContext.coupleStatutoryPensionConfig,
    setCoupleStatutoryPensionConfig: params.simulationContext.setCoupleStatutoryPensionConfig,
  }
}

export function useEntnahmeModalsAndProps(params: UseEntnahmeModalsAndPropsParams) {
  const modalParams = prepareModalParams(params)
  const modals = useWithdrawalModals(
    modalParams.formValue,
    modalParams.useSegmentedWithdrawal,
    modalParams.withdrawalSegments,
    modalParams.withdrawalData,
    modalParams.startOfIndependence,
    modalParams.steuerlast,
    modalParams.teilfreistellungsquote,
    modalParams.grundfreibetragAktiv,
    modalParams.grundfreibetragBetrag,
  )

  const healthCareInsuranceHandlers = useHealthCareInsuranceHandlers(
    params.configValues.formValue,
    params.updateFormValue,
  )

  const effectsParams = prepareEffectsParams(params)
  useWithdrawalEffects(effectsParams)

  const variablesProps = prepareVariablesProps(params, healthCareInsuranceHandlers)
  const withdrawalVariablesProps = useWithdrawalVariablesProps(variablesProps)

  return { ...modals, withdrawalVariablesProps }
}
