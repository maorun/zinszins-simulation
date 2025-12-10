import type {
  WithdrawalFormValue,
  ComparisonStrategy,
  SegmentedComparisonStrategy,
  WithdrawalReturnMode,
} from '../utils/config-storage'
import type { WithdrawalSegment } from '../utils/segmented-withdrawal'
import type { MultiAssetPortfolioConfig } from '../../helpers/multi-asset-portfolio'
import type { OtherIncomeConfiguration } from '../../helpers/other-income'
import type { CoupleStatutoryPensionConfig } from '../../helpers/statutory-pension'
import { OtherIncomeConfigurationComponent } from './OtherIncomeConfiguration'
import { WithdrawalModeSelector } from './WithdrawalModeSelector'
import { WithdrawalModeContent } from './WithdrawalModeContent'
import { HealthCareInsuranceContent } from './HealthCareInsuranceContent'
import type { HealthCareInsuranceChangeHandlers } from './HealthCareInsuranceConfiguration'
import { CollapsibleCard, CollapsibleCardContent, CollapsibleCardHeader } from './ui/collapsible-card'
import { CoupleStatutoryPensionConfiguration } from './StatutoryPensionConfiguration'
import { useWithdrawalModeChange } from './useWithdrawalModeChange'

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

  // Statutory pension
  coupleStatutoryPensionConfig: CoupleStatutoryPensionConfig | null
  onCoupleStatutoryPensionConfigChange: (config: CoupleStatutoryPensionConfig | null) => void
}

/**
 * Withdrawal configuration variables card
 * Displays all configurable withdrawal parameters including modes, strategies, health insurance, and statutory pension
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
    planningMode,
    birthYear,
    spouseBirthYear,
    coupleStatutoryPensionConfig,
    onCoupleStatutoryPensionConfigChange,
  } = props

  const handleModeChange = useWithdrawalModeChange({
    withdrawalSegments,
    startOfIndependence,
    globalEndOfLife,
    onConfigUpdate,
  })

  return (
    <CollapsibleCard>
      <CollapsibleCardHeader>Variablen</CollapsibleCardHeader>
      <CollapsibleCardContent>
        <OtherIncomeConfigurationComponent
          config={otherIncomeConfig || { enabled: false, sources: [] }}
          onChange={onOtherIncomeConfigChange}
        />
        <CoupleStatutoryPensionConfiguration
          config={coupleStatutoryPensionConfig}
          onChange={onCoupleStatutoryPensionConfigChange}
          planningMode={planningMode}
          birthYear={birthYear}
          spouseBirthYear={spouseBirthYear}
        />
        <WithdrawalModeSelector
          useSegmentedWithdrawal={useSegmentedWithdrawal}
          useComparisonMode={useComparisonMode}
          useSegmentedComparisonMode={useSegmentedComparisonMode}
          onModeChange={handleModeChange}
        />
        <WithdrawalModeContent {...props} />
        <HealthCareInsuranceContent {...props} />
      </CollapsibleCardContent>
    </CollapsibleCard>
  )
}
