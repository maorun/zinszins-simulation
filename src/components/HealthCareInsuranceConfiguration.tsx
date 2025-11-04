import { useHealthInsurancePreviewCalculation } from '../hooks/useHealthInsurancePreviewCalculation'
import { useRetirementStartYearAutoCalculation } from '../hooks/useRetirementStartYearAutoCalculation'
import { CouplePreviewDisplay } from './health-insurance/CouplePreviewDisplay'
import { IndividualPreviewDisplay } from './health-insurance/IndividualPreviewDisplay'
import { DisabledStateView } from './health-insurance/DisabledStateView'
import { HealthCareInsuranceCard } from './health-insurance/HealthCareInsuranceCard'
import type { HealthCareInsuranceYearResult } from '../../helpers/health-care-insurance'

interface HealthCareInsuranceFormValues {
  enabled: boolean
  planningMode: 'individual' | 'couple'
  insuranceType: 'statutory' | 'private'
  includeEmployerContribution: boolean
  statutoryHealthInsuranceRate: number
  statutoryCareInsuranceRate: number
  statutoryMinimumIncomeBase: number
  statutoryMaximumIncomeBase: number
  privateHealthInsuranceMonthly: number
  privateCareInsuranceMonthly: number
  privateInsuranceInflationRate: number
  retirementStartYear: number
  additionalCareInsuranceForChildless: boolean
  additionalCareInsuranceAge: number
  // Couple-specific fields
  coupleStrategy?: 'individual' | 'family' | 'optimize'
  familyInsuranceThresholdRegular?: number
  familyInsuranceThresholdMiniJob?: number
  person1Name?: string
  person1WithdrawalShare?: number
  person1OtherIncomeAnnual?: number
  person1AdditionalCareInsuranceForChildless?: boolean
  person2Name?: string
  person2WithdrawalShare?: number
  person2OtherIncomeAnnual?: number
  person2AdditionalCareInsuranceForChildless?: boolean
}

export interface HealthCareInsuranceChangeHandlers {
  onEnabledChange: (enabled: boolean) => void
  onInsuranceTypeChange: (type: 'statutory' | 'private') => void
  onIncludeEmployerContributionChange: (include: boolean) => void
  onStatutoryHealthInsuranceRateChange: (rate: number) => void
  onStatutoryCareInsuranceRateChange: (rate: number) => void
  onStatutoryMinimumIncomeBaseChange: (amount: number) => void
  onStatutoryMaximumIncomeBaseChange: (amount: number) => void
  onPrivateHealthInsuranceMonthlyChange: (amount: number) => void
  onPrivateCareInsuranceMonthlyChange: (amount: number) => void
  onPrivateInsuranceInflationRateChange: (rate: number) => void
  onRetirementStartYearChange: (year: number) => void
  onAdditionalCareInsuranceForChildlessChange: (enabled: boolean) => void
  onAdditionalCareInsuranceAgeChange: (age: number) => void
  // Couple-specific handlers
  onCoupleStrategyChange?: (strategy: 'individual' | 'family' | 'optimize') => void
  onFamilyInsuranceThresholdRegularChange?: (amount: number) => void
  onFamilyInsuranceThresholdMiniJobChange?: (amount: number) => void
  onPerson1NameChange?: (name: string) => void
  onPerson1WithdrawalShareChange?: (share: number) => void
  onPerson1OtherIncomeAnnualChange?: (amount: number) => void
  onPerson1AdditionalCareInsuranceForChildlessChange?: (enabled: boolean) => void
  onPerson2NameChange?: (name: string) => void
  onPerson2WithdrawalShareChange?: (share: number) => void
  onPerson2OtherIncomeAnnualChange?: (amount: number) => void
  onPerson2AdditionalCareInsuranceForChildlessChange?: (enabled: boolean) => void
}

interface HealthCareInsuranceConfigurationProps {
  values: HealthCareInsuranceFormValues
  onChange: HealthCareInsuranceChangeHandlers
  currentYear?: number
  // Birth year information for automatic retirement calculation
  birthYear?: number
  spouseBirthYear?: number
  planningMode: 'individual' | 'couple'
  // Current withdrawal amount from simulation for cost preview
  currentWithdrawalAmount?: number
}

export function HealthCareInsuranceConfiguration({
  values,
  onChange,
  currentYear: _currentYear = new Date().getFullYear(),
  birthYear,
  spouseBirthYear,
  planningMode,
  currentWithdrawalAmount,
}: HealthCareInsuranceConfigurationProps) {
  // Auto-calculate retirement start year when birth year changes
  useRetirementStartYearAutoCalculation({
    planningMode,
    birthYear,
    spouseBirthYear,
    currentRetirementStartYear: values.retirementStartYear,
    onRetirementStartYearChange: onChange.onRetirementStartYearChange,
  })

  if (!values.enabled) {
    return <DisabledStateView onEnabledChange={onChange.onEnabledChange} />
  }

  const costPreviewElement = (
    <HealthInsuranceCostPreview
      values={values}
      planningMode={planningMode}
      birthYear={birthYear}
      spouseBirthYear={spouseBirthYear}
      currentWithdrawalAmount={currentWithdrawalAmount}
    />
  )

  return (
    <HealthCareInsuranceCard
      values={values}
      onChange={onChange}
      planningMode={planningMode}
      birthYear={birthYear}
      spouseBirthYear={spouseBirthYear}
      costPreviewElement={costPreviewElement}
    />
  )
}

function HealthInsuranceCostPreview({
  values,
  planningMode,
  birthYear,
  spouseBirthYear,
  currentWithdrawalAmount,
}: {
  values: HealthCareInsuranceFormValues
  planningMode: 'individual' | 'couple'
  birthYear?: number
  spouseBirthYear?: number
  currentWithdrawalAmount?: number
}) {
  const { previewResults, withdrawalAmount } = useHealthInsurancePreviewCalculation({
    values,
    planningMode,
    birthYear,
    spouseBirthYear,
    currentWithdrawalAmount,
  })

  if (!previewResults) return null

  const isCouple = planningMode === 'couple' && 'person1' in previewResults

  if (isCouple) {
    return <CouplePreviewDisplay coupleResults={previewResults} withdrawalAmount={withdrawalAmount} />
  }

  const individualResults = previewResults as HealthCareInsuranceYearResult
  return <IndividualPreviewDisplay individualResults={individualResults} withdrawalAmount={withdrawalAmount} />
}
