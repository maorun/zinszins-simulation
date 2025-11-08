import type {
  WithdrawalFormValue,
  ComparisonStrategy,
  SegmentedComparisonStrategy,
  WithdrawalReturnMode,
} from '../utils/config-storage'
import type { WithdrawalSegment } from '../utils/segmented-withdrawal'
import type { MultiAssetPortfolioConfig } from '../../helpers/multi-asset-portfolio'
import type { OtherIncomeConfiguration } from '../../helpers/other-income'
import { OtherIncomeConfigurationComponent } from './OtherIncomeConfiguration'
import { WithdrawalModeSelector } from './WithdrawalModeSelector'
import { WithdrawalModeContent } from './WithdrawalModeContent'
import { HealthCareInsuranceContent } from './HealthCareInsuranceContent'
import type { HealthCareInsuranceChangeHandlers } from './HealthCareInsuranceConfiguration'
import { CollapsibleCard, CollapsibleCardContent, CollapsibleCardHeader } from './ui/collapsible-card'
import { handleWithdrawalModeChange } from './withdrawal-mode-helpers'

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
export function WithdrawalVariablesCard(props: WithdrawalVariablesCardProps) {
  const {
    otherIncomeConfig,
    onOtherIncomeConfigChange,
    useSegmentedWithdrawal,
    useComparisonMode,
    useSegmentedComparisonMode,
    withdrawalSegments,
    onConfigUpdate,
    startOfIndependence,
    globalEndOfLife,
  } = props

  return (
    <CollapsibleCard defaultOpen={true}>
      <CollapsibleCardHeader>Variablen</CollapsibleCardHeader>
      <CollapsibleCardContent>
        <OtherIncomeConfigurationComponent
          config={otherIncomeConfig || { enabled: false, sources: [] }}
          onChange={onOtherIncomeConfigChange}
        />

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
            })
          }
        />

        <WithdrawalModeContent {...props} />

        <HealthCareInsuranceContent {...props} />
      </CollapsibleCardContent>
    </CollapsibleCard>
  )
}
