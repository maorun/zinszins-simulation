import { useMemo } from 'react'
import type {
  WithdrawalFormValue,
  ComparisonStrategy,
  SegmentedComparisonStrategy,
  WithdrawalReturnMode,
} from '../utils/config-storage'
import type { OtherIncomeConfiguration } from '../../helpers/other-income'
import type { WithdrawalSegment } from '../utils/segmented-withdrawal'
import type { MultiAssetPortfolioConfig } from '../../helpers/multi-asset-portfolio'
import type { HealthCareInsuranceChangeHandlers } from '../components/HealthCareInsuranceConfiguration'
import type { CoupleStatutoryPensionConfig } from '../../helpers/statutory-pension'

interface UseWithdrawalVariablesPropsParams {
  currentConfig: {
    otherIncomeConfig?: OtherIncomeConfiguration
    withdrawalSegments?: WithdrawalSegment[]
    comparisonStrategies?: ComparisonStrategy[]
    segmentedComparisonStrategies?: SegmentedComparisonStrategy[]
  }
  updateConfig: (updates: Record<string, unknown>) => void
  updateFormValue: (updates: Partial<WithdrawalFormValue>) => void
  updateComparisonStrategy: (id: string, updates: Partial<ComparisonStrategy>) => void
  addSegmentedComparisonStrategy: (strategy: SegmentedComparisonStrategy) => void
  updateSegmentedComparisonStrategy: (id: string, updates: Partial<SegmentedComparisonStrategy>) => void
  removeSegmentedComparisonStrategy: (id: string) => void
  formValue: WithdrawalFormValue
  withdrawalReturnMode: WithdrawalReturnMode
  withdrawalAverageReturn: number
  withdrawalStandardDeviation: number
  withdrawalRandomSeed: number | undefined
  withdrawalVariableReturns: Record<number, number>
  withdrawalMultiAssetConfig: MultiAssetPortfolioConfig | null | undefined
  setWithdrawalMultiAssetConfig: (config: MultiAssetPortfolioConfig) => void
  useSegmentedWithdrawal: boolean
  useComparisonMode: boolean
  useSegmentedComparisonMode: boolean
  dispatchEnd: (val: [number, number]) => void
  startOfIndependence: number
  globalEndOfLife: number | null
  planningMode: 'individual' | 'couple'
  birthYear: number | undefined
  spouseBirthYear?: number
  withdrawalData: {
    withdrawalArray: Array<{ entnahme: number }>
  } | null
  healthCareInsuranceHandlers: HealthCareInsuranceChangeHandlers
  coupleStatutoryPensionConfig: CoupleStatutoryPensionConfig | null
  setCoupleStatutoryPensionConfig: (config: CoupleStatutoryPensionConfig | null) => void
}

/**
 * Prepares withdrawal-related props
 */
function prepareWithdrawalProps(params: {
  useSegmentedWithdrawal: boolean
  useComparisonMode: boolean
  useSegmentedComparisonMode: boolean
  withdrawalReturnMode: WithdrawalReturnMode
  withdrawalAverageReturn: number
  withdrawalStandardDeviation: number
  withdrawalRandomSeed: number | undefined
  withdrawalVariableReturns: Record<number, number>
  withdrawalMultiAssetConfig: MultiAssetPortfolioConfig | null | undefined
  setWithdrawalMultiAssetConfig: (config: MultiAssetPortfolioConfig) => void
}) {
  return {
    useSegmentedWithdrawal: params.useSegmentedWithdrawal,
    useComparisonMode: params.useComparisonMode,
    useSegmentedComparisonMode: params.useSegmentedComparisonMode,
    withdrawalReturnMode: params.withdrawalReturnMode,
    withdrawalAverageReturn: params.withdrawalAverageReturn,
    withdrawalStandardDeviation: params.withdrawalStandardDeviation,
    withdrawalRandomSeed: params.withdrawalRandomSeed,
    withdrawalVariableReturns: params.withdrawalVariableReturns,
    withdrawalMultiAssetConfig: params.withdrawalMultiAssetConfig || undefined,
    onWithdrawalMultiAssetConfigChange: (config: MultiAssetPortfolioConfig | undefined) => {
      if (config) params.setWithdrawalMultiAssetConfig(config)
    },
  }
}

/**
 * Prepares comparison strategy handlers
 */
function prepareComparisonHandlers(params: {
  comparisonStrategies: ComparisonStrategy[]
  updateConfig: (updates: Record<string, unknown>) => void
  updateComparisonStrategy: (id: string, updates: Partial<ComparisonStrategy>) => void
}) {
  const handleAdd = () => {
    const newId = `strategy${params.comparisonStrategies.length + 1}`
    params.updateConfig({
      comparisonStrategies: [
        ...params.comparisonStrategies,
        {
          id: newId,
          name: `Strategy ${params.comparisonStrategies.length + 1}`,
          strategie: '4prozent' as const,
          rendite: 5,
        },
      ],
    })
  }

  const handleRemove = (id: string) => {
    params.updateConfig({
      comparisonStrategies: params.comparisonStrategies.filter(s => s.id !== id),
    })
  }

  return {
    comparisonStrategies: params.comparisonStrategies,
    onComparisonStrategyUpdate: params.updateComparisonStrategy,
    onComparisonStrategyAdd: handleAdd,
    onComparisonStrategyRemove: handleRemove,
  }
}

/**
 * Prepares configuration props
 */
function prepareConfigProps(params: {
  currentConfig: {
    otherIncomeConfig?: OtherIncomeConfiguration
    withdrawalSegments?: WithdrawalSegment[]
    segmentedComparisonStrategies?: SegmentedComparisonStrategy[]
  }
  updateConfig: (updates: Record<string, unknown>) => void
  formValue: WithdrawalFormValue
  updateFormValue: (updates: Partial<WithdrawalFormValue>) => void
  addSegmentedComparisonStrategy: (strategy: SegmentedComparisonStrategy) => void
  updateSegmentedComparisonStrategy: (id: string, updates: Partial<SegmentedComparisonStrategy>) => void
  removeSegmentedComparisonStrategy: (id: string) => void
}) {
  return {
    otherIncomeConfig: params.currentConfig.otherIncomeConfig,
    onOtherIncomeConfigChange: (otherIncomeConfig: OtherIncomeConfiguration) =>
      params.updateConfig({ otherIncomeConfig }),
    withdrawalSegments: params.currentConfig.withdrawalSegments || [],
    onWithdrawalSegmentsChange: (segments: WithdrawalSegment[]) =>
      params.updateConfig({ withdrawalSegments: segments }),
    formValue: params.formValue,
    onFormValueUpdate: params.updateFormValue,
    segmentedComparisonStrategies: params.currentConfig.segmentedComparisonStrategies || [],
    onSegmentedComparisonStrategyAdd: params.addSegmentedComparisonStrategy,
    onSegmentedComparisonStrategyUpdate: params.updateSegmentedComparisonStrategy,
    onSegmentedComparisonStrategyRemove: params.removeSegmentedComparisonStrategy,
    onConfigUpdate: params.updateConfig,
  }
}

/**
 * Prepares global props
 */
function prepareGlobalProps(params: {
  dispatchEnd: (val: [number, number]) => void
  startOfIndependence: number
  globalEndOfLife: number | null
  planningMode: 'individual' | 'couple'
  birthYear: number | undefined
  spouseBirthYear?: number
  healthCareInsuranceHandlers: HealthCareInsuranceChangeHandlers
  currentWithdrawalAmount: number | undefined
  coupleStatutoryPensionConfig: CoupleStatutoryPensionConfig | null
  setCoupleStatutoryPensionConfig: (config: CoupleStatutoryPensionConfig | null) => void
}) {
  return {
    dispatchEnd: params.dispatchEnd,
    startOfIndependence: params.startOfIndependence,
    globalEndOfLife: params.globalEndOfLife || 2080,
    planningMode: params.planningMode,
    birthYear: params.birthYear,
    spouseBirthYear: params.spouseBirthYear,
    currentWithdrawalAmount: params.currentWithdrawalAmount,
    onHealthCareInsuranceChange: params.healthCareInsuranceHandlers,
    coupleStatutoryPensionConfig: params.coupleStatutoryPensionConfig,
    onCoupleStatutoryPensionConfigChange: params.setCoupleStatutoryPensionConfig,
  }
}

/**
 * Custom hook to prepare props for WithdrawalVariablesCard
 * Extracts prop preparation logic from EntnahmeSimulationsAusgabe
 */
export function useWithdrawalVariablesProps(params: UseWithdrawalVariablesPropsParams) {
  const currentWithdrawalAmount = useMemo(() => {
    if (params.withdrawalData && params.withdrawalData.withdrawalArray.length > 0) {
      return params.withdrawalData.withdrawalArray[params.withdrawalData.withdrawalArray.length - 1].entnahme
    }
    return undefined
  }, [params.withdrawalData])

  const comparisonStrategies = params.currentConfig.comparisonStrategies || []

  return {
    ...prepareConfigProps({
      currentConfig: params.currentConfig,
      updateConfig: params.updateConfig,
      formValue: params.formValue,
      updateFormValue: params.updateFormValue,
      addSegmentedComparisonStrategy: params.addSegmentedComparisonStrategy,
      updateSegmentedComparisonStrategy: params.updateSegmentedComparisonStrategy,
      removeSegmentedComparisonStrategy: params.removeSegmentedComparisonStrategy,
    }),
    ...prepareComparisonHandlers({
      comparisonStrategies,
      updateConfig: params.updateConfig,
      updateComparisonStrategy: params.updateComparisonStrategy,
    }),
    ...prepareWithdrawalProps({
      useSegmentedWithdrawal: params.useSegmentedWithdrawal,
      useComparisonMode: params.useComparisonMode,
      useSegmentedComparisonMode: params.useSegmentedComparisonMode,
      withdrawalReturnMode: params.withdrawalReturnMode,
      withdrawalAverageReturn: params.withdrawalAverageReturn,
      withdrawalStandardDeviation: params.withdrawalStandardDeviation,
      withdrawalRandomSeed: params.withdrawalRandomSeed,
      withdrawalVariableReturns: params.withdrawalVariableReturns,
      withdrawalMultiAssetConfig: params.withdrawalMultiAssetConfig,
      setWithdrawalMultiAssetConfig: params.setWithdrawalMultiAssetConfig,
    }),
    ...prepareGlobalProps({
      dispatchEnd: params.dispatchEnd,
      startOfIndependence: params.startOfIndependence,
      globalEndOfLife: params.globalEndOfLife,
      planningMode: params.planningMode,
      birthYear: params.birthYear,
      spouseBirthYear: params.spouseBirthYear,
      healthCareInsuranceHandlers: params.healthCareInsuranceHandlers,
      currentWithdrawalAmount,
      coupleStatutoryPensionConfig: params.coupleStatutoryPensionConfig,
      setCoupleStatutoryPensionConfig: params.setCoupleStatutoryPensionConfig,
    }),
  }
}
