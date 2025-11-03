import type { WithdrawalFormValue, ComparisonStrategy, SegmentedComparisonStrategy, WithdrawalReturnMode } from '../utils/config-storage'
import type { WithdrawalSegment } from '../utils/segmented-withdrawal'
import type { MultiAssetPortfolioConfig } from '../../helpers/multi-asset-portfolio'
import { WithdrawalSegmentForm } from './WithdrawalSegmentForm'
import { ComparisonStrategyConfiguration } from './ComparisonStrategyConfiguration'
import { SegmentedComparisonConfiguration } from './SegmentedComparisonConfiguration'
import { SingleStrategyConfigSection } from './SingleStrategyConfigSection'

interface WithdrawalModeContentProps {
  // Mode flags
  useSegmentedWithdrawal: boolean
  useComparisonMode: boolean
  useSegmentedComparisonMode: boolean

  // Segmented withdrawal
  withdrawalSegments: WithdrawalSegment[]
  onWithdrawalSegmentsChange: (segments: WithdrawalSegment[]) => void

  // Comparison mode
  formValue: WithdrawalFormValue
  comparisonStrategies: ComparisonStrategy[]
  onFormValueUpdate: (updates: Partial<WithdrawalFormValue>) => void
  onComparisonStrategyUpdate: (id: string, updates: Partial<ComparisonStrategy>) => void
  onComparisonStrategyAdd: () => void
  onComparisonStrategyRemove: (id: string) => void

  // Segmented comparison mode
  segmentedComparisonStrategies: SegmentedComparisonStrategy[]
  onSegmentedComparisonStrategyAdd: (strategy: SegmentedComparisonStrategy) => void
  onSegmentedComparisonStrategyUpdate: (id: string, updates: Partial<SegmentedComparisonStrategy>) => void
  onSegmentedComparisonStrategyRemove: (id: string) => void

  // Single strategy mode
  withdrawalReturnMode: WithdrawalReturnMode
  withdrawalAverageReturn: number
  withdrawalStandardDeviation: number
  withdrawalRandomSeed: number | undefined
  withdrawalVariableReturns: Record<number, number>
  withdrawalMultiAssetConfig: MultiAssetPortfolioConfig | undefined
  onWithdrawalMultiAssetConfigChange: (config: MultiAssetPortfolioConfig | undefined) => void
  onConfigUpdate: (updates: Record<string, unknown>) => void
  dispatchEnd: (val: [number, number]) => void

  // Years
  startOfIndependence: number
  globalEndOfLife: number
}

function renderSegmentedWithdrawal(
  segments: WithdrawalSegment[],
  onSegmentsChange: (segments: WithdrawalSegment[]) => void,
  startYear: number,
  endYear: number,
) {
  return (
    <WithdrawalSegmentForm
      segments={segments}
      onSegmentsChange={onSegmentsChange}
      withdrawalStartYear={startYear}
      withdrawalEndYear={endYear}
    />
  )
}

function renderComparisonMode(props: Pick<WithdrawalModeContentProps,
  'formValue' | 'comparisonStrategies' | 'onFormValueUpdate'
  | 'onComparisonStrategyUpdate' | 'onComparisonStrategyAdd' | 'onComparisonStrategyRemove'>) {
  return (
    <ComparisonStrategyConfiguration
      formValue={props.formValue}
      comparisonStrategies={props.comparisonStrategies}
      onUpdateFormValue={props.onFormValueUpdate}
      onUpdateComparisonStrategy={props.onComparisonStrategyUpdate}
      onAddComparisonStrategy={props.onComparisonStrategyAdd}
      onRemoveComparisonStrategy={props.onComparisonStrategyRemove}
    />
  )
}

function renderSegmentedComparison(props: Pick<WithdrawalModeContentProps,
  'segmentedComparisonStrategies' | 'onSegmentedComparisonStrategyAdd'
  | 'onSegmentedComparisonStrategyUpdate' | 'onSegmentedComparisonStrategyRemove'
  | 'startOfIndependence' | 'globalEndOfLife'>) {
  return (
    <SegmentedComparisonConfiguration
      segmentedComparisonStrategies={props.segmentedComparisonStrategies}
      withdrawalStartYear={props.startOfIndependence + 1}
      withdrawalEndYear={props.globalEndOfLife}
      onAddStrategy={props.onSegmentedComparisonStrategyAdd}
      onUpdateStrategy={props.onSegmentedComparisonStrategyUpdate}
      onRemoveStrategy={props.onSegmentedComparisonStrategyRemove}
    />
  )
}

function renderSingleStrategy(props: Pick<WithdrawalModeContentProps,
  'formValue' | 'startOfIndependence' | 'globalEndOfLife' | 'withdrawalReturnMode'
  | 'withdrawalAverageReturn' | 'withdrawalStandardDeviation' | 'withdrawalRandomSeed'
  | 'withdrawalVariableReturns' | 'withdrawalMultiAssetConfig' | 'onConfigUpdate'
  | 'onFormValueUpdate' | 'onWithdrawalMultiAssetConfigChange' | 'dispatchEnd'>) {
  return (
    <SingleStrategyConfigSection
      formValue={props.formValue}
      startOfIndependence={props.startOfIndependence}
      globalEndOfLife={props.globalEndOfLife}
      withdrawalReturnMode={props.withdrawalReturnMode}
      withdrawalAverageReturn={props.withdrawalAverageReturn}
      withdrawalStandardDeviation={props.withdrawalStandardDeviation}
      withdrawalRandomSeed={props.withdrawalRandomSeed}
      withdrawalVariableReturns={props.withdrawalVariableReturns}
      withdrawalMultiAssetConfig={props.withdrawalMultiAssetConfig!}
      onConfigUpdate={props.onConfigUpdate}
      onFormValueUpdate={props.onFormValueUpdate}
      onStrategyChange={() => {}}
      onWithdrawalMultiAssetConfigChange={props.onWithdrawalMultiAssetConfigChange}
      dispatchEnd={props.dispatchEnd}
    />
  )
}

/**
 * Renders the appropriate withdrawal mode content based on the active mode
 */
export function WithdrawalModeContent(props: WithdrawalModeContentProps) {
  const { useSegmentedWithdrawal, useComparisonMode, useSegmentedComparisonMode } = props

  if (useSegmentedWithdrawal) {
    return renderSegmentedWithdrawal(
      props.withdrawalSegments,
      props.onWithdrawalSegmentsChange,
      props.startOfIndependence + 1,
      props.globalEndOfLife,
    )
  }

  if (useComparisonMode) {
    return renderComparisonMode(props)
  }

  if (useSegmentedComparisonMode) {
    return renderSegmentedComparison(props)
  }

  return renderSingleStrategy(props)
}
