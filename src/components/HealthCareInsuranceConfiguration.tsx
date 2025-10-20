import { useEffect } from 'react'
import { calculateRetirementStartYear } from '../../helpers/statutory-pension'
import { CollapsibleCard, CollapsibleCardContent, CollapsibleCardHeader } from './ui/collapsible-card'
import { InsuranceTypeSelection } from './health-insurance/InsuranceTypeSelection'
import { RetirementStartYearDisplay } from './health-insurance/RetirementStartYearDisplay'
import { useHealthInsurancePreviewCalculation } from '../hooks/useHealthInsurancePreviewCalculation'
import { CouplePreviewDisplay } from './health-insurance/CouplePreviewDisplay'
import { IndividualPreviewDisplay } from './health-insurance/IndividualPreviewDisplay'
import { EnabledToggle } from './health-insurance/EnabledToggle'
import { DisabledStateView } from './health-insurance/DisabledStateView'
import { CoupleModeBanner } from './health-insurance/CoupleModeBanner'
import { ConfigurationSections } from './health-insurance/ConfigurationSections'
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
  useEffect(() => {
    const calculatedStartYear = calculateRetirementStartYear(
      planningMode,
      birthYear,
      spouseBirthYear,
      67, // Default retirement age
      67, // Default retirement age for spouse
    )

    if (calculatedStartYear && calculatedStartYear !== values.retirementStartYear) {
      onChange.onRetirementStartYearChange(calculatedStartYear)
    }
  }, [birthYear, spouseBirthYear, planningMode, values.retirementStartYear, onChange])

  if (!values.enabled) {
    return <DisabledStateView onEnabledChange={onChange.onEnabledChange} />
  }

  return (
    <CollapsibleCard>
      <CollapsibleCardHeader>
        🏥 Kranken- und Pflegeversicherung
        <span className="text-sm font-normal text-muted-foreground">
          (
          {values.insuranceType === 'statutory' ? 'Gesetzlich' : 'Privat'}
          )
        </span>
      </CollapsibleCardHeader>
      <CollapsibleCardContent>
        <EnabledToggle enabled={values.enabled} onEnabledChange={onChange.onEnabledChange} idPrefix="health-care-insurance-enabled-full" />

        <CoupleModeBanner planningMode={planningMode} />

        <InsuranceTypeSelection
          insuranceType={values.insuranceType}
          onInsuranceTypeChange={onChange.onInsuranceTypeChange}
        />

        <RetirementStartYearDisplay
          planningMode={planningMode}
          birthYear={birthYear}
          spouseBirthYear={spouseBirthYear}
          retirementStartYear={values.retirementStartYear}
        />

        <ConfigurationSections
          planningMode={planningMode}
          insuranceType={values.insuranceType}
          includeEmployerContribution={values.includeEmployerContribution}
          statutoryHealthInsuranceRate={values.statutoryHealthInsuranceRate}
          statutoryCareInsuranceRate={values.statutoryCareInsuranceRate}
          statutoryMinimumIncomeBase={values.statutoryMinimumIncomeBase}
          statutoryMaximumIncomeBase={values.statutoryMaximumIncomeBase}
          onIncludeEmployerContributionChange={onChange.onIncludeEmployerContributionChange}
          onStatutoryMinimumIncomeBaseChange={onChange.onStatutoryMinimumIncomeBaseChange}
          onStatutoryMaximumIncomeBaseChange={onChange.onStatutoryMaximumIncomeBaseChange}
          privateHealthInsuranceMonthly={values.privateHealthInsuranceMonthly}
          privateCareInsuranceMonthly={values.privateCareInsuranceMonthly}
          privateInsuranceInflationRate={values.privateInsuranceInflationRate}
          onPrivateHealthInsuranceMonthlyChange={onChange.onPrivateHealthInsuranceMonthlyChange}
          onPrivateCareInsuranceMonthlyChange={onChange.onPrivateCareInsuranceMonthlyChange}
          onPrivateInsuranceInflationRateChange={onChange.onPrivateInsuranceInflationRateChange}
          coupleStrategy={values.coupleStrategy}
          familyInsuranceThresholdRegular={values.familyInsuranceThresholdRegular}
          familyInsuranceThresholdMiniJob={values.familyInsuranceThresholdMiniJob}
          person1Name={values.person1Name}
          person1WithdrawalShare={values.person1WithdrawalShare}
          person1OtherIncomeAnnual={values.person1OtherIncomeAnnual}
          person1AdditionalCareInsuranceForChildless={values.person1AdditionalCareInsuranceForChildless}
          person2Name={values.person2Name}
          person2WithdrawalShare={values.person2WithdrawalShare}
          person2OtherIncomeAnnual={values.person2OtherIncomeAnnual}
          person2AdditionalCareInsuranceForChildless={values.person2AdditionalCareInsuranceForChildless}
          onCoupleStrategyChange={onChange.onCoupleStrategyChange}
          onFamilyInsuranceThresholdRegularChange={onChange.onFamilyInsuranceThresholdRegularChange}
          onFamilyInsuranceThresholdMiniJobChange={onChange.onFamilyInsuranceThresholdMiniJobChange}
          onPerson1NameChange={onChange.onPerson1NameChange}
          onPerson1WithdrawalShareChange={onChange.onPerson1WithdrawalShareChange}
          onPerson1OtherIncomeAnnualChange={onChange.onPerson1OtherIncomeAnnualChange}
          onPerson1AdditionalCareInsuranceForChildlessChange={
            onChange.onPerson1AdditionalCareInsuranceForChildlessChange
          }
          onPerson2NameChange={onChange.onPerson2NameChange}
          onPerson2WithdrawalShareChange={onChange.onPerson2WithdrawalShareChange}
          onPerson2OtherIncomeAnnualChange={onChange.onPerson2OtherIncomeAnnualChange}
          onPerson2AdditionalCareInsuranceForChildlessChange={
            onChange.onPerson2AdditionalCareInsuranceForChildlessChange
          }
          additionalCareInsuranceForChildless={values.additionalCareInsuranceForChildless}
          additionalCareInsuranceAge={values.additionalCareInsuranceAge}
          onAdditionalCareInsuranceForChildlessChange={onChange.onAdditionalCareInsuranceForChildlessChange}
          onAdditionalCareInsuranceAgeChange={onChange.onAdditionalCareInsuranceAgeChange}
        />

        <HealthInsuranceCostPreview
          values={values}
          planningMode={planningMode}
          birthYear={birthYear}
          spouseBirthYear={spouseBirthYear}
          currentWithdrawalAmount={currentWithdrawalAmount}
        />
      </CollapsibleCardContent>
    </CollapsibleCard>
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
