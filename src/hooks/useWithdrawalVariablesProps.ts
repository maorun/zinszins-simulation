import { useMemo } from 'react'
import type { WithdrawalFormValue, ComparisonStrategy, SegmentedComparisonStrategy, WithdrawalReturnMode } from '../utils/config-storage'
import type { OtherIncomeConfiguration } from '../../helpers/other-income'
import type { WithdrawalSegment } from '../utils/segmented-withdrawal'
import type { MultiAssetPortfolioConfig } from '../../helpers/multi-asset-portfolio'
import type { HealthCareInsuranceChangeHandlers } from '../components/HealthCareInsuranceConfiguration'

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
}

/**
 * Custom hook to prepare props for WithdrawalVariablesCard
 * Extracts prop preparation logic from EntnahmeSimulationsAusgabe
 */
export function useWithdrawalVariablesProps({
  currentConfig,
  updateConfig,
  updateFormValue,
  updateComparisonStrategy,
  addSegmentedComparisonStrategy,
  updateSegmentedComparisonStrategy,
  removeSegmentedComparisonStrategy,
  formValue,
  withdrawalReturnMode,
  withdrawalAverageReturn,
  withdrawalStandardDeviation,
  withdrawalRandomSeed,
  withdrawalVariableReturns,
  withdrawalMultiAssetConfig,
  setWithdrawalMultiAssetConfig,
  useSegmentedWithdrawal,
  useComparisonMode,
  useSegmentedComparisonMode,
  dispatchEnd,
  startOfIndependence,
  globalEndOfLife,
  planningMode,
  birthYear,
  spouseBirthYear,
  withdrawalData,
  healthCareInsuranceHandlers,
}: UseWithdrawalVariablesPropsParams) {
  const currentWithdrawalAmount = useMemo(() => {
    if (withdrawalData && withdrawalData.withdrawalArray.length > 0) {
      return withdrawalData.withdrawalArray[withdrawalData.withdrawalArray.length - 1].entnahme
    }
    return undefined
  }, [withdrawalData])

  const comparisonStrategies = currentConfig.comparisonStrategies || []

  const handleComparisonStrategyAdd = () => {
    const newId = `strategy${comparisonStrategies.length + 1}`
    updateConfig({
      comparisonStrategies: [
        ...comparisonStrategies,
        {
          id: newId,
          name: `Strategy ${comparisonStrategies.length + 1}`,
          strategie: '4prozent' as const,
          rendite: 5,
        },
      ],
    })
  }

  const handleComparisonStrategyRemove = (id: string) => {
    updateConfig({
      comparisonStrategies: comparisonStrategies.filter(s => s.id !== id),
    })
  }

  return {
    otherIncomeConfig: currentConfig.otherIncomeConfig,
    onOtherIncomeConfigChange: (otherIncomeConfig: OtherIncomeConfiguration) => updateConfig({ otherIncomeConfig }),
    useSegmentedWithdrawal,
    useComparisonMode,
    useSegmentedComparisonMode,
    withdrawalSegments: currentConfig.withdrawalSegments || [],
    onWithdrawalSegmentsChange: (segments: WithdrawalSegment[]) => updateConfig({ withdrawalSegments: segments }),
    formValue,
    comparisonStrategies,
    onFormValueUpdate: updateFormValue,
    onComparisonStrategyUpdate: updateComparisonStrategy,
    onComparisonStrategyAdd: handleComparisonStrategyAdd,
    onComparisonStrategyRemove: handleComparisonStrategyRemove,
    segmentedComparisonStrategies: currentConfig.segmentedComparisonStrategies || [],
    onSegmentedComparisonStrategyAdd: addSegmentedComparisonStrategy,
    onSegmentedComparisonStrategyUpdate: updateSegmentedComparisonStrategy,
    onSegmentedComparisonStrategyRemove: removeSegmentedComparisonStrategy,
    withdrawalReturnMode,
    withdrawalAverageReturn,
    withdrawalStandardDeviation,
    withdrawalRandomSeed,
    withdrawalVariableReturns,
    withdrawalMultiAssetConfig: withdrawalMultiAssetConfig || undefined,
    onWithdrawalMultiAssetConfigChange: (config: MultiAssetPortfolioConfig | undefined) => {
      if (config) setWithdrawalMultiAssetConfig(config)
    },
    onConfigUpdate: updateConfig,
    dispatchEnd,
    startOfIndependence,
    globalEndOfLife: globalEndOfLife || 2080, // Provide default value if null
    planningMode,
    birthYear,
    spouseBirthYear,
    currentWithdrawalAmount,
    onHealthCareInsuranceChange: healthCareInsuranceHandlers,
  }
}
