import type { WithdrawalFormValue, ComparisonStrategy, SegmentedComparisonStrategy, WithdrawalReturnMode } from '../utils/config-storage'
import type { WithdrawalSegment } from '../utils/segmented-withdrawal'
import type { MultiAssetPortfolioConfig } from '../../helpers/multi-asset-portfolio'
import type { OtherIncomeConfiguration } from '../../helpers/other-income'
import { OtherIncomeConfigurationComponent } from './OtherIncomeConfiguration'
import { WithdrawalModeSelector } from './WithdrawalModeSelector'
import { WithdrawalSegmentForm } from './WithdrawalSegmentForm'
import { ComparisonStrategyConfiguration } from './ComparisonStrategyConfiguration'
import { SegmentedComparisonConfiguration } from './SegmentedComparisonConfiguration'
import { SingleStrategyConfigSection } from './SingleStrategyConfigSection'
import { HealthCareInsuranceConfiguration, type HealthCareInsuranceChangeHandlers } from './HealthCareInsuranceConfiguration'
import { CollapsibleCard, CollapsibleCardContent, CollapsibleCardHeader } from './ui/collapsible-card'
import {
  handleWithdrawalModeChange,
} from './withdrawal-mode-helpers'
import { buildHealthCareInsuranceValues } from './health-care-insurance-values-builder'

interface WithdrawalVariablesCardProps {
  // Other income config
  otherIncomeConfig: OtherIncomeConfiguration | undefined
  onOtherIncomeConfigChange: (config: OtherIncomeConfiguration) => void

  // Withdrawal mode
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

  // Years and global settings
  startOfIndependence: number
  globalEndOfLife: number

  // Health care insurance
  planningMode: 'individual' | 'couple'
  birthYear: number | undefined
  spouseBirthYear: number | undefined
  currentWithdrawalAmount: number | undefined
  onHealthCareInsuranceChange: HealthCareInsuranceChangeHandlers
}

/**
 * Withdrawal configuration variables card
 * Displays all configurable withdrawal parameters including modes, strategies, and health insurance
 */
export function WithdrawalVariablesCard({
  otherIncomeConfig,
  onOtherIncomeConfigChange,
  useSegmentedWithdrawal,
  useComparisonMode,
  useSegmentedComparisonMode,
  withdrawalSegments,
  onWithdrawalSegmentsChange,
  formValue,
  comparisonStrategies,
  onFormValueUpdate,
  onComparisonStrategyUpdate,
  onComparisonStrategyAdd,
  onComparisonStrategyRemove,
  segmentedComparisonStrategies,
  onSegmentedComparisonStrategyAdd,
  onSegmentedComparisonStrategyUpdate,
  onSegmentedComparisonStrategyRemove,
  withdrawalReturnMode,
  withdrawalAverageReturn,
  withdrawalStandardDeviation,
  withdrawalRandomSeed,
  withdrawalVariableReturns,
  withdrawalMultiAssetConfig,
  onWithdrawalMultiAssetConfigChange,
  onConfigUpdate,
  dispatchEnd,
  startOfIndependence,
  globalEndOfLife,
  planningMode,
  birthYear,
  spouseBirthYear,
  currentWithdrawalAmount,
  onHealthCareInsuranceChange,
}: WithdrawalVariablesCardProps) {
  return (
    <CollapsibleCard>
      <CollapsibleCardHeader>Variablen</CollapsibleCardHeader>
      <CollapsibleCardContent>
        {/* Other Income Sources Configuration */}
        <OtherIncomeConfigurationComponent
          config={otherIncomeConfig || { enabled: false, sources: [] }}
          onChange={onOtherIncomeConfigChange}
        />

        {/* Toggle between single, segmented, and comparison withdrawal */}
        <WithdrawalModeSelector
          useSegmentedWithdrawal={useSegmentedWithdrawal}
          useComparisonMode={useComparisonMode}
          useSegmentedComparisonMode={useSegmentedComparisonMode}
          onModeChange={mode =>
            handleWithdrawalModeChange({
              mode,
              withdrawalSegments,
              startOfIndependence,
              globalEndOfLife,
              updateConfig: onConfigUpdate,
            })}
        />

        {useSegmentedWithdrawal ? (
          <WithdrawalSegmentForm
            segments={withdrawalSegments}
            onSegmentsChange={onWithdrawalSegmentsChange}
            withdrawalStartYear={startOfIndependence + 1}
            withdrawalEndYear={globalEndOfLife}
          />
        ) : useComparisonMode ? (
          <ComparisonStrategyConfiguration
            formValue={formValue}
            comparisonStrategies={comparisonStrategies}
            onUpdateFormValue={onFormValueUpdate}
            onUpdateComparisonStrategy={onComparisonStrategyUpdate}
            onAddComparisonStrategy={onComparisonStrategyAdd}
            onRemoveComparisonStrategy={onComparisonStrategyRemove}
          />
        ) : useSegmentedComparisonMode ? (
          <SegmentedComparisonConfiguration
            segmentedComparisonStrategies={segmentedComparisonStrategies}
            withdrawalStartYear={startOfIndependence + 1}
            withdrawalEndYear={globalEndOfLife}
            onAddStrategy={onSegmentedComparisonStrategyAdd}
            onUpdateStrategy={onSegmentedComparisonStrategyUpdate}
            onRemoveStrategy={onSegmentedComparisonStrategyRemove}
          />
        ) : (
          <SingleStrategyConfigSection
            formValue={formValue}
            startOfIndependence={startOfIndependence}
            globalEndOfLife={globalEndOfLife}
            withdrawalReturnMode={withdrawalReturnMode}
            withdrawalAverageReturn={withdrawalAverageReturn}
            withdrawalStandardDeviation={withdrawalStandardDeviation}
            withdrawalRandomSeed={withdrawalRandomSeed}
            withdrawalVariableReturns={withdrawalVariableReturns}
            withdrawalMultiAssetConfig={withdrawalMultiAssetConfig!}
            onConfigUpdate={onConfigUpdate}
            onFormValueUpdate={onFormValueUpdate}
            onStrategyChange={() => {}}
            onWithdrawalMultiAssetConfigChange={onWithdrawalMultiAssetConfigChange}
            dispatchEnd={dispatchEnd}
          />
        )}

        {/* Health Care Insurance Configuration - Available in all withdrawal modes */}
        <div className="mb-6">
          <HealthCareInsuranceConfiguration
            {...buildHealthCareInsuranceValues({
              formValue,
              planningMode,
              startOfIndependence,
              birthYear,
              spouseBirthYear,
            })}
            onChange={onHealthCareInsuranceChange}
            currentWithdrawalAmount={currentWithdrawalAmount}
          />
        </div>

      </CollapsibleCardContent>
    </CollapsibleCard>
  )
}
