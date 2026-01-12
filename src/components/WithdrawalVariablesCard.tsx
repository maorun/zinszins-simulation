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
import {
  type PartTimeRetirementWorkConfig,
  createDefaultPartTimeRetirementWorkConfig,
} from '../../helpers/part-time-retirement-work'
import { OtherIncomeConfigurationComponent } from './OtherIncomeConfiguration'
import { WithdrawalModeSelector } from './WithdrawalModeSelector'
import { WithdrawalModeContent } from './WithdrawalModeContent'
import { HealthCareInsuranceContent } from './HealthCareInsuranceContent'
import type { HealthCareInsuranceChangeHandlers } from './HealthCareInsuranceConfiguration'
import { CollapsibleCard, CollapsibleCardContent, CollapsibleCardHeader } from './ui/collapsible-card'
import { CoupleStatutoryPensionConfiguration } from './StatutoryPensionConfiguration'
import { PartTimeRetirementWorkConfiguration } from './PartTimeRetirementWorkConfiguration'
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

  // Part-time retirement work
  partTimeRetirementWorkConfig: PartTimeRetirementWorkConfig | undefined
  onPartTimeRetirementWorkConfigChange: (config: PartTimeRetirementWorkConfig) => void
}

/**
 * Income configuration sections (other income, pension, part-time work)
 */
function IncomeConfigurationSections({
  otherIncomeConfig,
  onOtherIncomeConfigChange,
  coupleStatutoryPensionConfig,
  onCoupleStatutoryPensionConfigChange,
  partTimeRetirementWorkConfig,
  onPartTimeRetirementWorkConfigChange,
  planningMode,
  birthYear,
  spouseBirthYear,
  startOfIndependence,
  globalEndOfLife,
}: {
  otherIncomeConfig: OtherIncomeConfiguration | undefined
  onOtherIncomeConfigChange: (config: OtherIncomeConfiguration) => void
  coupleStatutoryPensionConfig: CoupleStatutoryPensionConfig | null
  onCoupleStatutoryPensionConfigChange: (config: CoupleStatutoryPensionConfig | null) => void
  partTimeRetirementWorkConfig: PartTimeRetirementWorkConfig | undefined
  onPartTimeRetirementWorkConfigChange: (config: PartTimeRetirementWorkConfig) => void
  planningMode: 'individual' | 'couple'
  birthYear: number | undefined
  spouseBirthYear: number | undefined
  startOfIndependence: number
  globalEndOfLife: number
}) {
  return (
    <>
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
      <PartTimeRetirementWorkConfiguration
        config={partTimeRetirementWorkConfig || createDefaultPartTimeRetirementWorkConfig()}
        onConfigChange={onPartTimeRetirementWorkConfigChange}
        startYear={startOfIndependence}
        endYear={globalEndOfLife}
      />
    </>
  )
}

/**
 * Withdrawal configuration variables card
 * Displays all configurable withdrawal parameters including modes, strategies, health insurance, and statutory pension
 */
export function WithdrawalVariablesCard(props: WithdrawalVariablesCardProps) {
  const handleModeChange = useWithdrawalModeChange({
    withdrawalSegments: props.withdrawalSegments,
    startOfIndependence: props.startOfIndependence,
    globalEndOfLife: props.globalEndOfLife,
    onConfigUpdate: props.onConfigUpdate,
  })

  return (
    <CollapsibleCard>
      <CollapsibleCardHeader>Variablen</CollapsibleCardHeader>
      <CollapsibleCardContent>
        <IncomeConfigurationSections
          otherIncomeConfig={props.otherIncomeConfig}
          onOtherIncomeConfigChange={props.onOtherIncomeConfigChange}
          coupleStatutoryPensionConfig={props.coupleStatutoryPensionConfig}
          onCoupleStatutoryPensionConfigChange={props.onCoupleStatutoryPensionConfigChange}
          partTimeRetirementWorkConfig={props.partTimeRetirementWorkConfig}
          onPartTimeRetirementWorkConfigChange={props.onPartTimeRetirementWorkConfigChange}
          planningMode={props.planningMode}
          birthYear={props.birthYear}
          spouseBirthYear={props.spouseBirthYear}
          startOfIndependence={props.startOfIndependence}
          globalEndOfLife={props.globalEndOfLife}
        />
        <WithdrawalModeSelector
          useSegmentedWithdrawal={props.useSegmentedWithdrawal}
          useComparisonMode={props.useComparisonMode}
          useSegmentedComparisonMode={props.useSegmentedComparisonMode}
          onModeChange={handleModeChange}
        />
        <WithdrawalModeContent {...props} />
        <HealthCareInsuranceContent {...props} />
      </CollapsibleCardContent>
    </CollapsibleCard>
  )
}
